const request = require('supertest');
const express = require('express');
const { transformTeamData, transformNationData } = require('./server');

// Set test environment
process.env.NODE_ENV = 'test';

// Mock data
const mockSheetData = [
    ["Position", "Team Name", "Total Time", "Time Per Person", "Place"],
    ["1", "Team Alpha", "10:30:00", "5:15:00", "1"],
    ["2", "Team Beta", "11:00:00", "5:30:00", "2"],
    ["3", "Team Gamma", "11:30:00", "5:45:00", "3"],
    ["10", "Team Kappa", "15:00:00", "7:30:00", "10"]
];

// Mock the Google Sheets API
jest.mock('googleapis', () => ({
    google: {
        sheets: jest.fn().mockReturnValue({
            spreadsheets: {
                values: {
                    get: jest.fn().mockResolvedValue({
                        data: {
                            values: mockSheetData
                        }
                    })
                }
            }
        })
    }
}));

// Import after mocks
const server = require('./server');
const app = server.app;

// Debug logging
console.log('Test environment:', process.env.NODE_ENV);
console.log('App routes:', app._router.stack.map(r => r.route?.path).filter(Boolean));
console.log('Server port:', process.env.PORT || 3000);

describe('API Endpoints', () => {
    test('GET /api/competition-data returns competition data', async () => {
        console.log('Making request to /api/competition-data');
        const response = await request(app)
            .get('/api/competition-data')
            .expect('Content-Type', /json/)
            .expect(200);

        console.log('Response status:', response.status);
        console.log('Response body:', response.body);

        const data = response.body;
        
        // Test data structure
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
        
        // Test first team
        expect(data[0]).toMatchObject({
            teamName: expect.any(String),
            numberOfMembers: expect.any(Number),
            kmPerPerson: expect.any(Number),
            totalKm: expect.any(Number),
            place: expect.any(Number)
        });
    });

    test('GET /api/competition-data handles errors gracefully', async () => {
        // Mock an error in the Google Sheets API
        const { google } = require('googleapis');
        google.sheets().spreadsheets.values.get.mockImplementationOnce(() => {
            throw new Error('API Error');
        });

        const response = await request(app)
            .get('/api/competition-data')
            .expect('Content-Type', /json/)
            .expect(500);

        console.log('Error response status:', response.status);
        console.log('Error response body:', response.body);

        expect(response.body).toHaveProperty('error');
    });
});

describe('Data Transformation Tests', () => {
    test('should correctly transform team data', () => {
        const input = [
            ['Backwaterman Knights', '5', '8,0', '40', '14']
        ];
        
        const expected = [{
            teamName: 'Backwaterman Knights',
            numberOfMembers: 5,
            kmPerPerson: 8.0,
            totalKm: 40,
            place: 14
        }];

        const result = transformTeamData(input);
        expect(result).toEqual(expected);
    });

    test('should handle empty values correctly', () => {
        const input = [
            ['Team Name', '', '0,0', '0', '']
        ];
        
        const expected = [{
            teamName: 'Team Name',
            numberOfMembers: null,
            kmPerPerson: 0,
            totalKm: 0,
            place: null
        }];

        const result = transformTeamData(input);
        expect(result).toEqual(expected);
    });
});

describe('Server', () => {
    it('should start without errors', () => {
        expect(app).toBeDefined();
    });
}); 