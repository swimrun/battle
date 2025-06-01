import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="language-selector">
            <button
                className={`lang-btn ${language === 'nl' ? 'active' : ''}`}
                onClick={() => setLanguage('nl')}
            >
                NL
            </button>
            <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
            >
                EN
            </button>
            <button
                className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
                onClick={() => setLanguage('fr')}
            >
                FR
            </button>
        </div>
    );
} 