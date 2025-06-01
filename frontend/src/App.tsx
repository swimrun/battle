import React, { useState } from 'react';
import { TeamTable } from './components/TeamTable';
import { NationTable } from './components/NationTable';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState<'teams' | 'nations'>('teams');

    return (
        <LanguageProvider>
            <div className="app">
                <h1>My Swimrun Friendship Battle 2025</h1>
                
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'teams' ? 'active' : ''}`}
                        onClick={() => setActiveTab('teams')}
                    >
                        Teams
                    </button>
                    <button 
                        className={`tab ${activeTab === 'nations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('nations')}
                    >
                        Nations
                    </button>
                </div>

                {activeTab === 'nations' && (
                    <div className="warning-message">
                        Work in progress! Plaatsen landen kloppen o.a. nog niet
                    </div>
                )}

                <div className="tab-content">
                    {activeTab === 'teams' ? <TeamTable /> : <NationTable />}
                </div>
            </div>
        </LanguageProvider>
    );
}

export default App; 