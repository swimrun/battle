import React, { useState } from 'react';
import { TeamTable } from './components/TeamTable';
import { NationTable } from './components/NationTable';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState<'teams' | 'nations'>('teams');

    return (
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

            <div className="tab-content">
                {activeTab === 'teams' ? <TeamTable /> : <NationTable />}
            </div>
        </div>
    );
}

export default App; 