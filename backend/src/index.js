import express from 'express';
import cors from 'cors';
import { fetchAndProcessData } from './services/sheets.js';
import { config } from './config.js';

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Local development
        'https://battle.swimrun.group',  // Production
        'https://test.battle.swimrun.group',  // Test
        'https://acc.battle.swimrun.group',   // Acceptance
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Test endpoint for status information
app.get('/api/test', (req, res) => {
    const status = {
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        cors: {
            allowedOrigins: corsOptions.origin,
            methods: corsOptions.methods,
            headers: corsOptions.allowedHeaders
        },
        config: {
            sheetsId: config.sheetsId,
            apiKey: config.apiKey ? 'configured' : 'not configured',
            updateInterval: config.updateInterval
        }
    };
    res.json(status);
});

// ... rest of the endpoints ...

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS allowed origins: ${corsOptions.origin.join(', ')}`);
}); 