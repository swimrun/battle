import { Team, Nation } from '../types';

const API_URL = 'http://localhost:3000';

export async function fetchTeamData(): Promise<Team[]> {
    const response = await fetch(`${API_URL}/api/competition-data`);
    if (!response.ok) throw new Error('Failed to fetch team data');
    return response.json();
}

export async function fetchNationData(): Promise<Nation[]> {
    const response = await fetch(`${API_URL}/api/nation-summary`);
    if (!response.ok) throw new Error('Failed to fetch nation data');
    return response.json();
} 