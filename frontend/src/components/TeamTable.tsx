import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { fetchTeamData, downloadData, API_URL, getEnvironment, fetchBackendStatus } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export function TeamTable() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [favoriteTeam, setFavoriteTeam] = useState<string>(() => {
        // Initialize from localStorage or default to empty string
        return localStorage.getItem('favoriteTeam') || 'The Dutch SwimRunners';
    });
    const [showAllTeams, setShowAllTeams] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [dataSource, setDataSource] = useState<'backend' | 'cache' | 'fallback'>('backend');
    const [backendAvailable, setBackendAvailable] = useState(true);
    const [backendStatus, setBackendStatus] = useState<any>(null);
    const { t } = useLanguage();
    const [selectedNation, setSelectedNation] = useState<string>('all');

    const environment = getEnvironment();
    const environmentColors = {
        development: '#28a745',
        test: '#ffc107',
        acceptance: '#17a2b8',
        production: '#dc3545'
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data, source, backendAvailable } = await fetchTeamData();
                setTeams(data.teams);
                setLastUpdated(data.lastUpdated);
                setDataSource(source);
                setBackendAvailable(backendAvailable);

                // Fetch backend status
                try {
                    const status = await fetchBackendStatus();
                    setBackendStatus(status);
                } catch (error) {
                    console.error('Error fetching backend status:', error);
                }
            } catch (err) {
                setError('Fout bij laden van team samenvatting');
                console.error(err);
            }
        };
        loadData();
    }, []);

    // Update localStorage when favorite team changes
    useEffect(() => {
        localStorage.setItem('favoriteTeam', favoriteTeam);
    }, [favoriteTeam]);

    const filteredTeams = teams.filter(team => {
        if (showAllTeams) return true;
        const favoriteTeamPlace = teams.find(t => t.teamName === favoriteTeam)?.place;
        if (!favoriteTeamPlace) return true;
        const place = team.place || 999;
        return place <= 3 || Math.abs(place - favoriteTeamPlace) <= 3;
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
    const displayTeams = Object.entries(teamsByPlace).flatMap(([place, teams], index, array) => {
        const teamsAtPlace = teams.map(team => ({
            ...team,
            displayPlace: parseInt(place)
        }));

        const favoriteTeamPlace = teams.find(t => t.teamName === favoriteTeam)?.place;
        if (!favoriteTeamPlace) return teamsAtPlace;

        const currentPlace = parseInt(place);
        
        // Add ellipsis after top 3 if there's a gap to the favorite team section
        if (currentPlace === 3 && favoriteTeamPlace > 6) {
            return [...teamsAtPlace, { 
                teamName: '...', 
                displayPlace: 3,
                numberOfMembers: null,
                kmPerPerson: null,
                totalKm: null,
                place: null
            } as Team];
        }

        // Add ellipsis before favorite team section if there's a gap
        if (currentPlace === favoriteTeamPlace - 3 && favoriteTeamPlace > 6) {
            return [{ 
                teamName: '...', 
                displayPlace: currentPlace,
                numberOfMembers: null,
                kmPerPerson: null,
                totalKm: null,
                place: null
            } as Team, ...teamsAtPlace];
        }

        // Add ellipsis after favorite team section if there are more teams after
        const lastPlace = Math.max(...Object.keys(teamsByPlace).map(Number));
        if (currentPlace === favoriteTeamPlace + 3 && lastPlace > favoriteTeamPlace + 3) {
            return [...teamsAtPlace, { 
                teamName: '...', 
                displayPlace: currentPlace,
                numberOfMembers: null,
                kmPerPerson: null,
                totalKm: null,
                place: null
            } as Team];
        }

        return teamsAtPlace;
    });

    // Add ellipsis rows where needed
    const finalDisplayTeams = displayTeams.reduce((acc, team, index) => {
        acc.push(team);
        
        // Add ellipsis after top 3 if next team is not in favorite team section
        if (team.displayPlace === 3 && index < displayTeams.length - 1) {
            const nextTeam = displayTeams[index + 1];
            if (nextTeam.displayPlace && nextTeam.displayPlace > 6) {
                acc.push({ 
                    teamName: '...', 
                    displayPlace: 3,
                    numberOfMembers: null,
                    kmPerPerson: null,
                    totalKm: null,
                    place: null
                } as Team);
            }
        }

        // Add ellipsis after favorite team section if there are more teams
        if (team.teamName === favoriteTeam && index < displayTeams.length - 1) {
            const nextTeam = displayTeams[index + 1];
            if (nextTeam.displayPlace && team.displayPlace && nextTeam.displayPlace > team.displayPlace + 3) {
                acc.push({ 
                    teamName: '...', 
                    displayPlace: team.displayPlace + 3,
                    numberOfMembers: null,
                    kmPerPerson: null,
                    totalKm: null,
                    place: null
                } as Team);
            }
        }

        return acc;
    }, [] as Team[]);

    const getPlaceDisplay = (place: number | undefined) => {
        if (!place) return '';
        if (place === 1) return '🥇';
        if (place === 2) return '🥈';
        if (place === 3) return '🥉';
        return place.toString();
    };

    const getRowClassName = (team: Team) => {
        const classes: string[] = [];
        if (team.teamName === favoriteTeam) classes.push('selected-team');
        if (team.place === 1) classes.push('first-place');
        if (team.place === 2) classes.push('second-place');
        if (team.place === 3) classes.push('third-place');
        if (team.teamName === '...') classes.push('ellipsis-row');
        return classes.join(' ');
    };

    const handleDownload = () => {
        try {
            downloadData();
        } catch (error) {
            setError('Fout bij downloaden van data');
            console.error(error);
        }
    };

    if (error) return <p className="error">{t('common.error')}</p>;

    return (
        <div>
            <div className="status-bar">
                <div 
                    className={`status-indicator ${backendAvailable ? 'online' : 'offline'}`}
                    title={`Backend URL: ${API_URL}\nEnvironment: ${backendStatus?.environment || 'unknown'}\nVersion: ${backendStatus?.version || 'unknown'}\nLast check: ${backendStatus?.timestamp || 'unknown'}`}
                >
                    {backendAvailable ? t('common.status.backendAvailable') : t('common.status.backendUnavailable')}
                </div>
                <div 
                    className="data-source"
                    title={`Backend URL: ${API_URL}\nCORS allowed origins: ${backendStatus?.cors?.allowedOrigins?.join(', ') || 'unknown'}`}
                >
                    {t(`common.status.${dataSource}`)}
                </div>
                <div 
                    className="environment-indicator"
                    style={{ backgroundColor: environmentColors[environment] }}
                    title={`Environment: ${environment}\nBackend URL: ${API_URL}\nBackend Environment: ${backendStatus?.environment || 'unknown'}`}
                >
                    {environment.charAt(0).toUpperCase()}
                </div>
            </div>

            <div className="controls">
                <div className="select-group">
                    <label htmlFor="favorite-team">{t('common.favoriteTeam')}:</label>
                    <select 
                        id="favorite-team"
                        value={favoriteTeam} 
                        onChange={(e) => setFavoriteTeam(e.target.value)}
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
                    {t('common.showAllTeams')}
                </label>
                <button onClick={handleDownload} className="download-button">
                    {t('common.downloadData')}
                </button>
                <a 
                    href="https://docs.google.com/spreadsheets/d/12x2eCsVncoIHADVXxEpDAzDU4ZlnG10HK2RmWx0wCBQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sheet-link"
                >
                    {t('common.viewGoogleSheet')}
                </a>
                <LanguageSelector />
            </div>

            {lastUpdated && (
                <div className="last-updated">
                    {t('common.lastUpdated')}: {new Date(lastUpdated).toLocaleString()}
                </div>
            )}

            <table>
                <thead>
                    <tr>
                        <th>{t('common.place')}</th>
                        <th>{t('common.team')}</th>
                        <th>{t('common.members')}</th>
                        <th>{t('common.kmPerPerson')}</th>
                        <th>{t('common.totalKm')}</th>
                        <th>{t('common.points')}</th>
                    </tr>
                </thead>
                <tbody>
                    {finalDisplayTeams.map((team, index) => (
                        <tr key={team.teamName} className={getRowClassName(team)}>
                            <td>{team.teamName === '...' ? '' : getPlaceDisplay(team.displayPlace)}</td>
                            <td>{team.teamName}</td>
                            <td>{team.numberOfMembers || ''}</td>
                            <td>{team.kmPerPerson || ''}</td>
                            <td>{team.totalKm || ''}</td>
                            <td>{team.points || ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 