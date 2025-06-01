import { Team, Nation, TeamResponse, NationResponse } from '../types';
import fallbackData from '../data/fallback-data.json';

export const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'battle-data';

interface BackendStatus {
    status: string;
    environment: string;
    version: string;
    timestamp: string;
    cors: {
        allowedOrigins: string[];
        methods: string[];
        headers: string[];
    };
    config: {
        sheetsId: string;
        apiKey: string;
        updateInterval: number;
    };
}

// Determine environment based on API URL
export const getEnvironment = () => {
    if (API_URL.includes('localhost')) return 'development';
    if (API_URL.includes('test')) return 'test';
    if (API_URL.includes('acc')) return 'acceptance';
    if (API_URL.includes('battle.swimrun.group')) return 'production';
    return 'development';
};

interface BattleData {
    teams: Team[];
    nations: Nation[];
    lastUpdated: string;
    timestamp: number;
}

interface ApiResponse<T> {
    data: T;
    source: 'backend' | 'cache' | 'fallback';
    backendAvailable: boolean;
}

function saveToLocalStorage(data: Team[] | Nation[], type: 'teams' | 'nations', lastUpdated: string) {
    try {
        const existingData = localStorage.getItem(STORAGE_KEY);
        const parsedData: BattleData = existingData ? JSON.parse(existingData) : { 
            teams: [], 
            nations: [], 
            lastUpdated: '',
            timestamp: 0 
        };
        
        parsedData[type] = data;
        parsedData.lastUpdated = lastUpdated;
        parsedData.timestamp = Date.now();
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getFromLocalStorage(type: 'teams' | 'nations'): { data: Team[] | Nation[] | null, lastUpdated: string } {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return { data: null, lastUpdated: '' };
        
        const parsedData: BattleData = JSON.parse(data);
        return { 
            data: parsedData[type],
            lastUpdated: parsedData.lastUpdated
        };
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return { data: null, lastUpdated: '' };
    }
}

export async function fetchTeamData(): Promise<ApiResponse<{ teams: Team[], lastUpdated: string }>> {
    try {
        console.log('Fetching team data from:', `${API_URL}/api/competition-data`);
        const response = await fetch(`${API_URL}/api/competition-data`);
        
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`Failed to fetch team data: ${response.status} ${response.statusText}`);
        }
        
        const data: TeamResponse = await response.json();
        console.log('Received data:', data);
        
        // Save successful response to localStorage
        saveToLocalStorage(data.teams, 'teams', data.lastUpdated);
        
        return {
            data: {
                teams: data.teams,
                lastUpdated: data.lastUpdated
            },
            source: 'backend',
            backendAvailable: true
        };
    } catch (error) {
        console.error('Error in fetchTeamData:', error);
        
        // Try to get data from localStorage
        const cached = getFromLocalStorage('teams');
        if (cached.data) {
            console.log('Using cached team data from localStorage');
            return { 
                data: {
                    teams: cached.data as Team[],
                    lastUpdated: cached.lastUpdated
                },
                source: 'cache',
                backendAvailable: false
            };
        }
        
        // If no cached data, use fallback
        console.log('Using fallback team data');
        return {
            data: {
                teams: fallbackData.teams,
                lastUpdated: new Date().toISOString()
            },
            source: 'fallback',
            backendAvailable: false
        };
    }
}

export async function fetchNationData(): Promise<ApiResponse<{ nations: Nation[], lastUpdated: string }>> {
    try {
        console.log('Fetching nation data from:', `${API_URL}/api/nation-summary`);
        const response = await fetch(`${API_URL}/api/nation-summary`);
        
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`Failed to fetch nation data: ${response.status} ${response.statusText}`);
        }
        
        const data: NationResponse = await response.json();
        console.log('Received data:', data);
        
        // Save successful response to localStorage
        saveToLocalStorage(data.nations, 'nations', data.lastUpdated);
        
        return {
            data: {
                nations: data.nations,
                lastUpdated: data.lastUpdated
            },
            source: 'backend',
            backendAvailable: true
        };
    } catch (error) {
        console.error('Error in fetchNationData:', error);
        
        // Try to get data from localStorage
        const cached = getFromLocalStorage('nations');
        if (cached.data) {
            console.log('Using cached nation data from localStorage');
            return { 
                data: {
                    nations: cached.data as Nation[],
                    lastUpdated: cached.lastUpdated
                },
                source: 'cache',
                backendAvailable: false
            };
        }
        
        // If no cached data, use fallback
        console.log('Using fallback nation data');
        return {
            data: {
                nations: fallbackData.nations,
                lastUpdated: new Date().toISOString()
            },
            source: 'fallback',
            backendAvailable: false
        };
    }
}

export function downloadData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            throw new Error('No data available to download');
        }

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `battle-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading data:', error);
        throw error;
    }
}

export async function fetchBackendStatus(): Promise<BackendStatus> {
    try {
        const response = await fetch(`${API_URL}/api/test`);
        if (!response.ok) {
            throw new Error(`Failed to fetch backend status: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching backend status:', error);
        throw error;
    }
} 