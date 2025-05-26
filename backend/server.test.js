const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { transformTeamData, transformNationData } = require('./server');

// Mock the Google Sheets API
jest.mock('googleapis', () => ({
    google: {
        auth: {
            GoogleAuth: jest.fn().mockImplementation(() => ({
                getClient: jest.fn()
            }))
        },
        sheets: jest.fn().mockReturnValue({
            spreadsheets: {
                values: {
                    get: jest.fn().mockImplementation(async () => ({
                        data: {
                            values: JSON.parse(await fs.readFile(path.join(__dirname, 'test-data.json'), 'utf8'))
                        }
                    }))
                }
            }
        })
    }
}));

// Import the server
const app = require('./server');

describe('API Endpoints', () => {
    test('GET /api/competition-data returns competition data', async () => {
        const response = await request(app)
            .get('/api/competition-data')
            .expect('Content-Type', /json/)
            .expect(200);

        const data = response.body;
        
        // Test data structure
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
        
        // Test first row (header)
        expect(data[0]).toEqual([
            "Position",
            "Team Name",
            "Total Time",
            "Time Per Person",
            "Place"
        ]);

        // Test some team data
        expect(data[1]).toEqual([
            "1",
            "Team Alpha",
            "10:30:00",
            "5:15:00",
            "1"
        ]);

        // Test last team
        expect(data[data.length - 1]).toEqual([
            "10",
            "Team Kappa",
            "15:00:00",
            "7:30:00",
            "10"
        ]);
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