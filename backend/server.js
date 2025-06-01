const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
require('dotenv').config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 3000;
const isTest = process.env.NODE_ENV === 'test';

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL.split(','),
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
console.log(corsOptions);
app.use(express.json());

// Create a router for API routes
const apiRouter = express.Router();

// Swagger UI
apiRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Function to get test data
async function getTestData() {
    const testDataPath = path.join(__dirname, 'test-data.json');
    const testData = await fs.readFile(testDataPath, 'utf8');
    return JSON.parse(testData);
}

// Function to fetch and parse Google Sheet data
async function fetchSheetData(sheetId) {
    return new Promise((resolve, reject) => {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            followRedirect: true
        };

        https.get(url, options, (res) => {
            // Handle redirects
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
                const redirectUrl = res.headers.location;
                https.get(redirectUrl, options, (redirectRes) => {
                    if (redirectRes.statusCode !== 200) {
                        reject(new Error(`Failed to fetch sheet: ${redirectRes.statusCode}`));
                        return;
                    }
                    processResponse(redirectRes, resolve, reject);
                }).on('error', reject);
                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch sheet: ${res.statusCode}`));
                return;
            }

            processResponse(res, resolve, reject);
        }).on('error', reject);
    });
}

// Helper function to process the response data
function processResponse(res, resolve, reject) {
    let data = '';
    const lastModified = res.headers['last-modified'] || new Date().toISOString();
    
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            // Parse CSV data and clean it up
            const rows = data.split('\n')
                .map(row => {
                    // Handle quoted values properly
                    const result = [];
                    let current = '';
                    let inQuotes = false;
                    
                    for (let i = 0; i < row.length; i++) {
                        const char = row[i];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            result.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current.trim());
                    return result;
                })
                .filter(row => row.length > 1) // Skip empty rows
                .map(row => row.map(cell => cell.trim().replace(/^"|"$/g, ''))); // Clean up cells

            // Find the index where the nation summary starts
            const nationIndex = rows.findIndex(row => row[0] === 'Nation');
            
            // Split data into teams and nations
            const teamRows = rows.slice(0, nationIndex > -1 ? nationIndex : rows.length)
                .filter(row => row[0] && row[0] !== 'Team'); // Filter out header row
            
            const nationRows = nationIndex > -1 ? rows.slice(nationIndex + 1) : [];

            // Transform data into structured objects
            const teams = transformTeamData(teamRows);
            const nations = transformNationData(nationRows);

            resolve({ teams, nations, lastModified });
        } catch (error) {
            reject(error);
        }
    });
}

// Helper function to parse decimal value
function parseDecimal(value) {
    if (!value) return null;
    return parseFloat(value.replace(',', '.'));
}

// Helper function to parse integer value
function parseInteger(value) {
    if (!value) return null;
    return parseInt(value.split(',')[0], 10);
}

// Helper function to transform team data
function transformTeamData(rows) {
    return rows.map(row => ({
        teamName: row[0] || '', // Team (kolom A)
        numberOfMembers: parseInteger(row[1]), // # of member (kolom B)
        kmPerPerson: parseDecimal(row[2]), // per Person (kolom C)
        totalKm: parseDecimal(row[3]), // Total (kolom D)
        place: parseInteger(row[4]) // Place (kolom E)
    }));
}

// Helper function to transform nation data
function transformNationData(rows) {
    return rows.map(row => ({
        nation: row[0] || '', // Nation (kolom A)
        numberOfMembers: parseInteger(row[1]), // # of member (kolom B)
        kmPerPerson: parseDecimal(row[2]), // per Person (kolom C)
        totalKm: parseDecimal(row[4]), // Total (kolom E)
        place: parseInteger(row[5]), // Place (kolom F)
        points: parseDecimal(row[6]) // Points (kolom G)
    }));
}

/**
 * @swagger
 * /api/competition-data:
 *   get:
 *     summary: Haalt team rankings data op
 *     description: Retourneert alle team data inclusief posities en tijden
 *     responses:
 *       200:
 *         description: Succesvol team data opgehaald
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   teamName:
 *                     type: string
 *                     description: Naam van het team
 *                   numberOfMembers:
 *                     type: number
 *                     description: Aantal teamleden
 *                   kmPerPerson:
 *                     type: number
 *                     description: Kilometers per persoon
 *                   totalKm:
 *                     type: number
 *                     description: Totale kilometers
 *                   place:
 *                     type: number
 *                     description: Plaats in de ranking
 *       404:
 *         description: Geen team data gevonden
 *       500:
 *         description: Server error
 */
apiRouter.get('/competition-data', async (req, res) => {
    try {
        let data;
        
        if (isTest) {
            // Use test data
            data = await getTestData();
            data.lastModified = new Date().toISOString();
        } else {
            // Fetch from Google Sheet
            const sheetId = process.env.GOOGLE_SHEET_ID;
            if (!sheetId) {
                throw new Error('GOOGLE_SHEET_ID not configured');
            }
            data = await fetchSheetData(sheetId);
        }

        if (!data || !data.teams || data.teams.length === 0) {
            return res.status(404).json({ error: 'No team data found' });
        }

        res.json({
            teams: data.teams,
            lastUpdated: data.lastModified
        });
    } catch (error) {
        console.error('Error fetching team data:', error);
        res.status(500).json({ error: 'Failed to fetch team data' });
    }
});

/**
 * @swagger
 * /api/nation-summary:
 *   get:
 *     summary: Haalt nation rankings data op
 *     description: Retourneert alle nation data inclusief posities en tijden
 *     responses:
 *       200:
 *         description: Succesvol nation data opgehaald
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nation:
 *                     type: string
 *                     description: Naam van de natie
 *                   numberOfMembers:
 *                     type: number
 *                     description: Aantal leden
 *                   kmPerPerson:
 *                     type: number
 *                     description: Kilometers per persoon
 *                   totalKm:
 *                     type: number
 *                     description: Totale kilometers
 *                   place:
 *                     type: number
 *                     description: Plaats in de ranking
 *                   points:
 *                     type: number
 *                     description: Punten
 *       404:
 *         description: Geen nation data gevonden
 *       500:
 *         description: Server error
 */
apiRouter.get('/nation-summary', async (req, res) => {
    try {
        let data;
        
        if (isTest) {
            // Use test data
            data = await getTestData();
            data.lastModified = new Date().toISOString();
        } else {
            // Fetch from Google Sheet
            const sheetId = process.env.GOOGLE_SHEET_ID;
            if (!sheetId) {
                throw new Error('GOOGLE_SHEET_ID not configured');
            }
            data = await fetchSheetData(sheetId);
        }

        if (!data || !data.nations || data.nations.length === 0) {
            return res.status(404).json({ error: 'No nation data found' });
        }

        res.json({
            nations: data.nations,
            lastUpdated: data.lastModified
        });
    } catch (error) {
        console.error('Error fetching nation data:', error);
        res.status(500).json({ error: 'Failed to fetch nation data' });
    }
});

// Mount the API router under /api
app.use('/api', apiRouter);

// Add a catch-all route to return 404 for non-API routes
app.use((req, res) => {
    res.status(404).send('Not found');
});

// Start the server
app.listen(PORT, '0.0.0.0', 'IPv4', () => {
    console.log(`Server runt op port ${PORT} in ${process.env.NODE_ENV || 'DEVELOPMENT'} mode`);
    console.log('\nAvailable endpoints:');
    console.log(`- GET Team data: http://localhost:${PORT}/api/competition-data`);
    console.log(`- GET Nation summary: http://localhost:${PORT}/api/nation-summary`);
});

// Export the app for testing
module.exports = { app, transformTeamData, transformNationData }; 