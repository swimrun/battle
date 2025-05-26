const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const isTest = process.env.NODE_ENV === 'test';

// Middleware
app.use(cors());
app.use(express.json());

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
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            // Parse CSV data and clean it up
            const rows = data.split('\n')
                .map(row => row.split(','))
                .filter(row => row.length > 1) // Skip empty rows
                .map(row => row.map(cell => cell.trim().replace(/^"|"$/g, ''))); // Clean up cells

            console.log('\nRaw CSV data for first few rows:');
            rows.slice(0, 5).forEach((row, index) => {
                console.log(`Row ${index}:`, row);
            });

            // Find the index where the nation summary starts
            const nationIndex = rows.findIndex(row => row[0] === 'Nation');
            
            // Split data into teams and nations
            const teamRows = rows.slice(0, nationIndex > -1 ? nationIndex : rows.length)
                .filter(row => row[0] && row[0] !== 'Team'); // Filter out header row
            
            const nationRows = nationIndex > -1 ? rows.slice(nationIndex + 1) : [];

            // Transform data into structured objects
            const teams = transformTeamData(teamRows);
            const nations = transformNationData(nationRows);

            resolve({ teams, nations });
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
        totalKm: parseDecimal(row[4]), // Total (kolom E)
        place: parseInteger(row[5]) // Place (kolom F)
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

// Routes
app.get('/api/competition-data', async (req, res) => {
    try {
        let data;
        
        if (isTest) {
            // Use test data
            data = await getTestData();
        } else {
            // Validate required environment variables
            if (!process.env.GOOGLE_SHEET_ID) {
                throw new Error('GOOGLE_SHEET_ID is not set in environment variables');
            }

            // Fetch public sheet data
            data = await fetchSheetData(process.env.GOOGLE_SHEET_ID);
        }

        if (!data.teams || data.teams.length === 0) {
            return res.status(404).json({ error: 'No team data found.' });
        }

        res.json(data.teams);
    } catch (error) {
        console.error('Error fetching team data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch team data',
            details: error.message 
        });
    }
});

// New endpoint for nation summary data
app.get('/api/nation-summary', async (req, res) => {
    try {
        let data;
        
        if (isTest) {
            // Use test data
            data = await getTestData();
        } else {
            // Validate required environment variables
            if (!process.env.GOOGLE_SHEET_ID) {
                throw new Error('GOOGLE_SHEET_ID is not set in environment variables');
            }

            // Fetch public sheet data
            data = await fetchSheetData(process.env.GOOGLE_SHEET_ID);
        }

        if (!data.nations || data.nations.length === 0) {
            return res.status(404).json({ error: 'No nation summary data found.' });
        }

        res.json(data.nations);
    } catch (error) {
        console.error('Error fetching nation summary data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch nation summary data',
            details: error.message 
        });
    }
});

// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(port, () => {
        const baseUrl = `http://localhost:${port}`;
        const teamApiUrl = `${baseUrl}/api/competition-data`;
        const nationApiUrl = `${baseUrl}/api/nation-summary`;
        console.log(`\nServer runt op port ${port} in ${isTest ? 'TEST' : 'PRODUCTION'} mode`);
        console.log('\nAvailable endpoints:');
        console.log(`- GET Team data: ${teamApiUrl}`);
        console.log(`- GET Nation summary: ${nationApiUrl}`);
    });
}

// Export functions for testing
module.exports = {
    app,
    transformTeamData,
    transformNationData
}; 