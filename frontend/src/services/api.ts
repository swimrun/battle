import { Team, Nation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchTeamData(): Promise<Team[]> {
    try {
        console.log('Fetching team data from:', `${API_URL}/api/competition-data`);
        const response = await fetch(`${API_URL}/api/competition-data`);
        
        console.log('Response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch team data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        return data;
    } catch (error) {
        console.error('Error in fetchTeamData:', error);
        throw error;
    }
}

export async function fetchNationData(): Promise<Nation[]> {
    try {
        console.log('Fetching nation data from:', `${API_URL}/api/nation-summary`);
        const response = await fetch(`${API_URL}/api/nation-summary`);
        
        console.log('Response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch nation data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        return data;
    } catch (error) {
        console.error('Error in fetchNationData:', error);
        throw error;
    }
} 