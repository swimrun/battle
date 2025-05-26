const request = require('supertest');
const app = require('../src/app');
const { getCompetitionData } = require('../src/competition');

// Mock the Google Sheets API
jest.mock('../src/sheets', () => ({
    getSheetData: jest.fn().mockResolvedValue([
        ['Position', 'Team', 'Total Time', 'Time Per Person', 'Place'],
        ['1', 'Team A', '10:00', '5:00', '1'],
        ['2', 'Team B', '10:30', '5:15', '2'],
        ['3', 'Team C', '11:00', '5:30', '3'],
        ['4', 'Team D', '11:30', '5:45', '4'],
        ['5', 'Team E', '12:00', '6:00', '5']
    ])
}));

describe('Competition API', () => {
    test('GET /api/competition-data should return formatted competition data', async () => {
        const response = await request(app).get('/api/competition-data');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            { position: 1, team: 'Team A', totalTime: '10:00', timePerPerson: '5:00' },
            { position: 2, team: 'Team B', totalTime: '10:30', timePerPerson: '5:15' },
            { position: 3, team: 'Team C', totalTime: '11:00', timePerPerson: '5:30' },
            { position: 4, team: 'Team D', totalTime: '11:30', timePerPerson: '5:45' },
            { position: 5, team: 'Team E', totalTime: '12:00', timePerPerson: '6:00' }
        ]);
    });

    test('GET /api/competition-data should handle empty data', async () => {
        // Mock empty data
        const { getSheetData } = require('../src/sheets');
        getSheetData.mockResolvedValueOnce([['Position', 'Team', 'Total Time', 'Time Per Person', 'Place']]);

        const response = await request(app).get('/api/competition-data');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('GET /api/competition-data should handle malformed data', async () => {
        // Mock malformed data
        const { getSheetData } = require('../src/sheets');
        getSheetData.mockResolvedValueOnce([
            ['Position', 'Team', 'Total Time', 'Time Per Person', 'Place'],
            ['1', 'Team A'], // Missing some fields
            ['2', 'Team B', '10:30', '5:15', '2']
        ]);

        const response = await request(app).get('/api/competition-data');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            { position: 2, team: 'Team B', totalTime: '10:30', timePerPerson: '5:15' }
        ]);
    });

    test('GET /api/competition-data should include last-modified header', async () => {
        const response = await request(app).get('/api/competition-data');
        
        expect(response.status).toBe(200);
        expect(response.headers['last-modified']).toBeDefined();
    });
}); 