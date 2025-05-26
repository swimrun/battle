// Mock storage for testing
class MockStorage {
    constructor() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = value;
    }
}

// Test data
const mockCompetitionData = [
    { position: 1, team: "Team A", totalTime: "10:00", timePerPerson: "5:00" },
    { position: 2, team: "Team B", totalTime: "10:30", timePerPerson: "5:15" },
    { position: 3, team: "Team C", totalTime: "11:00", timePerPerson: "5:30" },
    { position: 4, team: "Team D", totalTime: "11:30", timePerPerson: "5:45" },
    { position: 5, team: "Team E", totalTime: "12:00", timePerPerson: "6:00" },
    { position: 6, team: "Team F", totalTime: "12:30", timePerPerson: "6:15" },
    { position: 7, team: "Team G", totalTime: "13:00", timePerPerson: "6:30" },
    { position: 8, team: "Team H", totalTime: "13:30", timePerPerson: "6:45" },
    { position: 9, team: "Team I", totalTime: "14:00", timePerPerson: "7:00" },
    { position: 10, team: "Team J", totalTime: "14:30", timePerPerson: "7:15" }
];

describe('CompetitionDataManager', () => {
    let storageInterface;
    let competitionManager;

    beforeEach(() => {
        storageInterface = new StorageInterface(new MockStorage());
        competitionManager = new CompetitionDataManager(storageInterface);
        competitionManager.competitionData = mockCompetitionData;
    });

    test('should show all results when showAllResults is true', () => {
        storageInterface.setShowAllResults(true);
        const results = competitionManager.getFilteredResults();
        expect(results).toEqual(mockCompetitionData);
    });

    test('should show top 3 and surrounding teams when showAllResults is false', () => {
        storageInterface.setShowAllResults(false);
        storageInterface.setFavoriteTeam('Team G');
        
        const results = competitionManager.getFilteredResults();
        
        // Should include top 3
        expect(results[0].team).toBe('Team A');
        expect(results[1].team).toBe('Team B');
        expect(results[2].team).toBe('Team C');
        
        // Should include ellipsis
        expect(results[3].isEllipsis).toBe(true);
        
        // Should include surrounding teams
        expect(results[4].team).toBe('Team E');
        expect(results[5].team).toBe('Team F');
        expect(results[6].team).toBe('Team G');
        expect(results[7].team).toBe('Team H');
    });

    test('should show only top 3 when favorite team is not found', () => {
        storageInterface.setShowAllResults(false);
        storageInterface.setFavoriteTeam('NonExistentTeam');
        
        const results = competitionManager.getFilteredResults();
        expect(results.length).toBe(3);
        expect(results[0].team).toBe('Team A');
        expect(results[1].team).toBe('Team B');
        expect(results[2].team).toBe('Team C');
    });

    test('should handle favorite team in top 3 correctly', () => {
        storageInterface.setShowAllResults(false);
        storageInterface.setFavoriteTeam('Team B');
        
        const results = competitionManager.getFilteredResults();
        
        // Should include top 3
        expect(results[0].team).toBe('Team A');
        expect(results[1].team).toBe('Team B');
        expect(results[2].team).toBe('Team C');
        
        // Should include surrounding teams
        expect(results[3].team).toBe('Team D');
        expect(results[4].team).toBe('Team E');
    });
}); 