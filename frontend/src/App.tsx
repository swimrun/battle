import React, { useState } from 'react';
import { TeamTable } from './components/TeamTable';
import { NationTable } from './components/NationTable';
import { LanguageProvider } from './contexts/LanguageContext';
import { useLanguage } from './contexts/LanguageContext';
import './App.css';
import packageJson from '../package.json';

function AppContent() {
    const [activeTab, setActiveTab] = useState<'teams' | 'nations'>('teams');
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const { t } = useLanguage();

    return (
        <div className="app">
            <h1>My Swimrun Friendship Battle 2025</h1>
            <div className="meta-info">
                <span className="version">v{packageJson.version}</span>
                <span className="separator">|</span>
                <span className="author">Auteur: Bart van der Wal & ChatGPT</span>
                <button className="disclaimer-link" onClick={() => setShowDisclaimer(true)}>
                    Disclaimer
                </button>
            </div>
            
            {showDisclaimer && (
                <div className="disclaimer-modal">
                    <div className="disclaimer-content">
                        <h3>Disclaimer</h3>
                        <p>{t('common.disclaimer')}</p>
                        <a 
                            href="https://github.com/swimrun/battle/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="github-link"
                        >
                            GitHub Issues
                        </a>
                        <button onClick={() => setShowDisclaimer(false)}>Sluiten</button>
                    </div>
                </div>
            )}
            
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
    );
}

function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}

export default App; 