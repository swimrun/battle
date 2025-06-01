import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { fetchTeamData } from '../services/api';

export function TeamTable() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<string>('The Dutch SwimRunners');
    const [showAllTeams, setShowAllTeams] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchTeamData();
                setTeams(data);
            } catch (err) {
                setError('Fout bij laden van resultaten');
                console.error(err);
            }
        };
        loadData();
    }, []);

    const filteredTeams = teams.filter(team => {
        if (showAllTeams) return true;
        const selectedTeamPlace = teams.find(t => t.teamName === selectedTeam)?.place;
        if (!selectedTeamPlace) return true;
        const place = team.place || 999;
        return place <= 3 || Math.abs(place - selectedTeamPlace) <= 3;
    });

    const sortedTeams = [...filteredTeams].sort((a, b) => {
        const placeA = a.place || 999;
        const placeB = b.place || 999;
        return placeA - placeB;
    });

    // Group teams by place
    const teamsByPlace = sortedTeams.reduce((acc, team) => {
        const place = team.place || 999;
        if (!acc[place]) acc[place] = [];
        acc[place].push(team);
        return acc;
    }, {} as Record<number, Team[]>);

    // Create final display array with ellipsis
    const displayTeams = Object.entries(teamsByPlace).flatMap(([place, teams]) => {
        const teamsAtPlace = teams.map(team => ({
            ...team,
            displayPlace: parseInt(place)
        }));
        return teamsAtPlace;
    });

    const getPlaceDisplay = (place: number) => {
        if (place === 1) return '🥇';
        if (place === 2) return '🥈';
        if (place === 3) return '🥉';
        return place.toString();
    };

    const getRowClassName = (team: Team) => {
        const classes = [];
        if (team.teamName === selectedTeam) classes.push('selected-team');
        if (team.place === 1) classes.push('first-place');
        if (team.place === 2) classes.push('second-place');
        if (team.place === 3) classes.push('third-place');
        return classes.join(' ');
    };

    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <div className="controls">
                <div className="select-group">
                    <label htmlFor="favorite-team">Favoriete team:</label>
                    <select 
                        id="favorite-team"
                        value={selectedTeam} 
                        onChange={(e) => setSelectedTeam(e.target.value)}
                    >
                        {teams.map(team => (
                            <option key={team.teamName} value={team.teamName}>
                                {team.teamName}
                            </option>
                        ))}
                    </select>
                </div>
                <label>
                    <input
                        type="checkbox"
                        checked={showAllTeams}
                        onChange={(e) => setShowAllTeams(e.target.checked)}
                    />
                    Toon alle teams
                </label>
            </div>

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
                <tbody>
                    {displayTeams.map((team, index) => (
                        <React.Fragment key={team.teamName}>
                            <tr className={getRowClassName(team)}>
                                <td>{getPlaceDisplay(team.displayPlace)}</td>
                                <td>{team.teamName}</td>
                                <td>{team.numberOfMembers || ''}</td>
                                <td>{team.kmPerPerson || ''}</td>
                                <td>{team.totalKm || ''}</td>
                            </tr>
                            {!showAllTeams && index === displayTeams.length - 1 && (
                                <tr className="ellipsis-row">
                                    <td colSpan={5}>...</td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 