const request = require('supertest');
const { app } = require('../server');

// Set test environment
process.env.NODE_ENV = 'test';

describe('API Endpoints', () => {
    describe('GET /api/competition-data', () => {
        it('should return team data', async () => {
            const res = await request('http://localhost:3000')
                .get('/api/competition-data')
                .expect('Content-Type', /json/)
                .expect(200);
            
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
            
            // Check first team record structure
            expect(res.body[0]).toMatchObject({
                teamName: expect.any(String),
                numberOfMembers: expect.any(Number),
                kmPerPerson: expect.any(Number),
                totalKm: expect.any(Number),
                place: expect.any(Number)
            });
        });
    });

    describe('GET /api/nation-summary', () => {
        it('should return nation summary data', async () => {
            const res = await request('http://localhost:3000')
                .get('/api/nation-summary')
                .expect('Content-Type', /json/)
                .expect(200);
            
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
            
            // Check first nation record structure
            expect(res.body[0]).toMatchObject({
                nation: expect.any(String),
                numberOfMembers: expect.any(Number),
                kmPerPerson: expect.any(Number),
                totalKm: expect.any(Number),
                place: expect.any(Number),
                points: expect.any(Number)
            });
        });
    });
}); 