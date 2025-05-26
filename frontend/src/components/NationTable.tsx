import React, { useState, useEffect } from 'react';
import { Nation } from '../types';
import { fetchNationData } from '../services/api';

export function NationTable() {
    const [nations, setNations] = useState<Nation[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchNationData();
                setNations(data);
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

    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <h2>Nation Samenvatting</h2>
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