// Storage interface for managing user preferences
class StorageInterface {
    constructor(storage = localStorage) {
        this.storage = storage;
    }

    getFavoriteTeam() {
        return this.storage.getItem('favoriteTeam') || 'Dutch Swimrunners';
    }

    setFavoriteTeam(team) {
        this.storage.setItem('favoriteTeam', team);
    }

    getShowAllResults() {
        return this.storage.getItem('showAllResults') === 'true';
    }

    setShowAllResults(show) {
        this.storage.setItem('showAllResults', show);
    }
}

// Competition data manager
class CompetitionDataManager {
    constructor(storageInterface) {
        this.storageInterface = storageInterface;
        this.competitionData = null;
        this.backendUrl = 'http://localhost:3000';
        this.sheetUrl = 'https://docs.google.com/spreadsheets/d/12x2eCsVncoIHADVXxEpDAzDU4ZlnG10HK2RmWx0wCBQ/edit?gid=0#gid=0';
    }

    async loadData() {
        try {
            console.log('Start loading data...');
            const response = await fetch(`${this.backendUrl}/api/competition-data`);
            console.log('Response status:', response.status);
            if (!response.ok) throw new Error('Kon de uitslagen niet ophalen');
            
            const rawData = await response.json();
            console.log('Raw data received:', rawData);
            
            // Transform the data to match the expected structure
            this.competitionData = rawData.map(row => {
                console.log('Processing row:', row);
                return {
                    position: row[0],
                    team: row[1],
                    totalTime: row[2],
                    timePerPerson: row[3]
                };
            });
            console.log('Transformed data:', this.competitionData);
            
            this.updateUI();
            document.getElementById('sheetLink').href = this.sheetUrl;
        } catch (error) {
            console.error('Fout bij het laden van de uitslagen:', error);
            console.error('Error details:', error.stack);
            document.getElementById('resultsTable').innerHTML = '<tr><td colspan="4">Fout bij het laden van de uitslagen</td></tr>';
        }
    }

    getFilteredResults() {
        if (!this.competitionData) return [];
        
        const showAll = this.storageInterface.getShowAllResults();
        if (showAll) return this.competitionData;

        const favoriteTeam = this.storageInterface.getFavoriteTeam();
        const favoriteIndex = this.competitionData.findIndex(team => team.team === favoriteTeam);
        
        if (favoriteIndex === -1) return this.competitionData.slice(0, 3);

        const topThree = this.competitionData.slice(0, 3);
        const surroundingTeams = this.competitionData.slice(
            Math.max(0, favoriteIndex - 3),
            Math.min(this.competitionData.length, favoriteIndex + 4)
        );

        const result = [...new Set([...topThree, ...surroundingTeams])];
        result.sort((a, b) => a.position - b.position);

        // Add ellipsis if there are gaps
        const finalResult = [];
        for (let i = 0; i < result.length; i++) {
            if (i > 0 && result[i].position - result[i-1].position > 1) {
                finalResult.push({ isEllipsis: true });
            }
            finalResult.push(result[i]);
        }

        return finalResult;
    }

    updateUI() {
        console.log('Updating UI with data:', this.competitionData);
        const results = this.getFilteredResults();
        console.log('Filtered results:', results);
        const tbody = document.getElementById('resultsTable');
        console.log('Table body element:', tbody);
        tbody.innerHTML = '';

        results.forEach(team => {
            if (team.isEllipsis) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 4;
                cell.textContent = '...';
                cell.style.textAlign = 'center';
                return;
            }

            const row = tbody.insertRow();
            row.insertCell().textContent = team.position;
            row.insertCell().textContent = team.team;
            row.insertCell().textContent = team.totalTime;
            row.insertCell().textContent = team.timePerPerson;
        });

        // Update team selector
        const teamSelector = document.getElementById('teamSelect');
        console.log('Team selector element:', teamSelector);
        teamSelector.innerHTML = '';
        this.competitionData.forEach(team => {
            const option = document.createElement('option');
            option.value = team.team;
            option.textContent = team.team;
            option.selected = team.team === this.storageInterface.getFavoriteTeam();
            teamSelector.appendChild(option);
        });

        // Update show all toggle
        document.getElementById('showAllToggle').checked = this.storageInterface.getShowAllResults();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const storageInterface = new StorageInterface();
    const competitionManager = new CompetitionDataManager(storageInterface);

    // Event listeners
    document.getElementById('teamSelect').addEventListener('change', (e) => {
        storageInterface.setFavoriteTeam(e.target.value);
        competitionManager.updateUI();
    });

    document.getElementById('showAllToggle').addEventListener('change', (e) => {
        storageInterface.setShowAllResults(e.target.checked);
        competitionManager.updateUI();
    });

    // Load initial data
    competitionManager.loadData();
}); 