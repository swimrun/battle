const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const isTest = process.env.NODE_ENV === 'test';

// Debug: Log environment variables
console.log('\nEnvironment variables:');
console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Middleware
app.use(cors());
app.use(express.json());

// Function to get test data
async function getTestData() {
    const testDataPath = path.join(__dirname, 'test-data.json');
    const testData = await fs.readFile(testDataPath, 'utf8');
    return JSON.parse(testData);
}

// Function to fetch public Google Sheet as CSV
function fetchPublicSheet(sheetId) {
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

                    let data = '';
                    redirectRes.on('data', (chunk) => data += chunk);
                    redirectRes.on('end', () => {
                        // Parse CSV data
                        const rows = data.split('\n')
                            .map(row => row.split(','))
                            .filter(row => row.length > 1) // Skip empty rows
                            .map(row => row.map(cell => cell.trim().replace(/^"|"$/g, ''))); // Clean up cells
                        
                        // Filter out the nation summary section and header row
                        const teamRows = rows.filter(row => row[0] && !row[0].includes('Nation') && row[0] !== 'Team');
                        
                        // Format data for our JSON structure
                        const formattedData = teamRows.map(row => [
                            row[4] || '', // Position
                            row[0] || '', // Team Name
                            row[3] || '', // Total Time
                            row[2] || '', // Time Per Person
                        ]);

                        resolve(formattedData);
                    });
                }).on('error', reject);
                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch sheet: ${res.statusCode}`));
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                // Parse CSV data
                const rows = data.split('\n')
                    .map(row => row.split(','))
                    .filter(row => row.length > 1) // Skip empty rows
                    .map(row => row.map(cell => cell.trim().replace(/^"|"$/g, ''))); // Clean up cells
                
                // Filter out the nation summary section and header row
                const teamRows = rows.filter(row => row[0] && !row[0].includes('Nation') && row[0] !== 'Team');
                
                // Format data for our JSON structure
                const formattedData = teamRows.map(row => [
                    row[4] || '', // Position
                    row[0] || '', // Team Name
                    row[3] || '', // Total Time
                    row[2] || '', // Time Per Person
                ]);

                resolve(formattedData);
            });
        }).on('error', reject);
    });
}

// Routes
app.get('/api/competition-data', async (req, res) => {
    try {
        let rows;
        
        if (isTest) {
            // Use test data
            rows = await getTestData();
        } else {
            // Validate required environment variables
            if (!process.env.GOOGLE_SHEET_ID) {
                throw new Error('GOOGLE_SHEET_ID is not set in environment variables');
            }

            // Fetch public sheet data
            rows = await fetchPublicSheet(process.env.GOOGLE_SHEET_ID);
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'No data found.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch competition data',
            details: error.message 
        });
    }
});

// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(port, () => {
        const baseUrl = `http://localhost:${port}`;
        const apiUrl = `${baseUrl}/api/competition-data`;
        console.log(`\nServer runt op port ${port} in ${isTest ? 'TEST' : 'PRODUCTION'} mode`);
        console.log('\nAvailable endpoints:');
        console.log(`- GET API endpoint: ${apiUrl}`);
        console.log('\nClick op de URL hierhoven om het endpoint te testen.');
    });
}

module.exports = app; 