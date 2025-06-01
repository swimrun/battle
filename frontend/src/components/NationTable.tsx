import React, { useState, useEffect } from 'react';
import { Nation } from '../types';
import { fetchNationData, API_URL, getEnvironment, fetchBackendStatus } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export function NationTable() {
    const [nations, setNations] = useState<Nation[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [dataSource, setDataSource] = useState<'backend' | 'cache' | 'fallback'>('backend');
    const [backendAvailable, setBackendAvailable] = useState(true);
    const [backendStatus, setBackendStatus] = useState<any>(null);
    const { t } = useLanguage();

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
                const { data, source, backendAvailable } = await fetchNationData();
                setNations(data.nations);
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
                setError('Fout bij laden van nation samenvatting');
                console.error(err);
            }
        };
        loadData();
    }, []);

    const sortedNations = [...nations].sort((a, b) => {
        const placeA = a.place || 999;
        const placeB = b.place || 999;
        return placeA - placeB;
    });

    if (error) return <p className="error">{t('common.error')}</p>;

    return (
        <div>
            <h2>{t('common.nationSummary')}</h2>
            
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

            {lastUpdated && (
                <div className="last-updated">
                    {t('common.lastUpdated')}: {new Date(lastUpdated).toLocaleString()}
                </div>
            )}

            <div className="controls">
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

            <table>
                <thead>
                    <tr>
                        <th>{t('common.place')}</th>
                        <th>{t('common.nation')}</th>
                        <th>{t('common.members')}</th>
                        <th>{t('common.kmPerPerson')}</th>
                        <th>{t('common.totalKm')}</th>
                        <th>{t('common.points')}</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedNations.map(nation => (
                        <tr key={nation.nation}>
                            <td>{nation.place || ''}</td>
                            <td>{nation.nation}</td>
                            <td>{nation.numberOfMembers || ''}</td>
                            <td>{nation.kmPerPerson || ''}</td>
                            <td>{nation.totalKm || ''}</td>
                            <td>{nation.points || ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 