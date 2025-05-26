// Storage interface for managing user preferences
class StorageInterface {
    constructor(storage = localStorage) {
        this.storage = storage;
    }

    getFavoriteTeam() {
        return this.storage.getItem('favoriteTeam') || 'The Dutch SwimRunners';
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
    constructor() {
        this.backendUrl = 'http://localhost:3000';
        this.teamData = [];
        this.nationData = [];
        this.selectedTeam = localStorage.getItem('selectedTeam') || 'The Dutch SwimRunners';
        this.showAllTeams = localStorage.getItem('showAllTeams') === 'true';
        
        this.initializeElements();
        this.loadData();
        this.setupEventListeners();
    }

    initializeElements() {
        this.teamSelect = document.getElementById('teamSelect');
        this.showAllTeamsCheckbox = document.getElementById('showAllTeams');
        this.resultsTable = document.getElementById('resultsTable');
        this.nationTable = document.getElementById('nationTable');
    }

    async loadData() {
        try {
            // Load team data
            const teamResponse = await fetch(`${this.backendUrl}/api/competition-data`);
            if (!teamResponse.ok) throw new Error('Failed to fetch team data');
            this.teamData = await teamResponse.json();
            
            // Load nation data
            const nationResponse = await fetch(`${this.backendUrl}/api/nation-summary`);
            if (!nationResponse.ok) throw new Error('Failed to fetch nation data');
            this.nationData = await nationResponse.json();

            this.updateUI();
        } catch (error) {
            console.error('Error loading data:', error);
            this.resultsTable.innerHTML = '<p class="error">Fout bij laden van resultaten</p>';
            this.nationTable.innerHTML = '<p class="error">Fout bij laden van nation samenvatting</p>';
        }
    }

    updateUI() {
        this.updateTeamSelector();
        this.updateResultsTable();
        this.updateNationTable();
    }

    updateTeamSelector() {
        this.teamSelect.innerHTML = this.teamData
            .map(team => `<option value="${team.teamName}" ${team.teamName === this.selectedTeam ? 'selected' : ''}>${team.teamName}</option>`)
            .join('');
    }

    updateResultsTable() {
        const selectedTeamIndex = this.teamData.findIndex(team => team.teamName === this.selectedTeam);
        if (selectedTeamIndex === -1) return;

        const selectedTeamPlace = parseInt(this.teamData[selectedTeamIndex].place);
        const filteredTeams = this.teamData.filter(team => {
            if (this.showAllTeams) return true;
            const place = parseInt(team.place);
            return place <= 3 || Math.abs(place - selectedTeamPlace) <= 3;
        });

        // Sort data by place
        const sortedData = [...filteredTeams].sort((a, b) => {
            const placeA = parseInt(a.place) || 999; // Use high number for null/undefined places
            const placeB = parseInt(b.place) || 999;
            return placeA - placeB;
        });

        const rows = sortedData.map(team => `
            <tr>
                <td>${team.place || ''}</td>
                <td>${team.teamName}</td>
                <td>${team.numberOfMembers || ''}</td>
                <td>${team.kmPerPerson || ''}</td>
                <td>${team.totalKm || ''}</td>
            </tr>
        `).join('');

        this.resultsTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Plaats</th>
                        <th>Team</th>
                        <th>Aantal Leden</th>
                        <th>KM per Persoon</th>
                        <th>Totale KM</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    updateNationTable() {
        const rows = this.nationData.map(nation => `
            <tr>
                <td>${nation.place}</td>
                <td>${nation.nation}</td>
                <td>${nation.numberOfMembers}</td>
                <td>${nation.kmPerPerson}</td>
                <td>${nation.totalKm}</td>
                <td>${nation.points}</td>
            </tr>
        `).join('');

        this.nationTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Plaats</th>
                        <th>Natie</th>
                        <th>Aantal Leden</th>
                        <th>KM per Persoon</th>
                        <th>Totale KM</th>
                        <th>Punten</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    setupEventListeners() {
        this.teamSelect.addEventListener('change', (e) => {
            this.selectedTeam = e.target.value;
            localStorage.setItem('selectedTeam', this.selectedTeam);
            this.updateUI();
        });

        this.showAllTeamsCheckbox.addEventListener('change', (e) => {
            this.showAllTeams = e.target.checked;
            localStorage.setItem('showAllTeams', this.showAllTeams);
            this.updateUI();
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CompetitionDataManager();
}); 