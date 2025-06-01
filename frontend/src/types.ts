export interface Team {
    teamName: string;
    numberOfMembers: number | null;
    kmPerPerson: number | null;
    totalKm: number | null;
    place: number | null;
    displayPlace?: number;
    points?: number | null;
}

export interface Nation {
    nation: string;
    numberOfMembers: number | null;
    kmPerPerson: number | null;
    totalKm: number | null;
    place: number | null;
    points: number | null;
}

export interface TeamResponse {
    teams: Team[];
    lastUpdated: string;
}

export interface NationResponse {
    nations: Nation[];
    lastUpdated: string;
} 