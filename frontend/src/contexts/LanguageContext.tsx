import React, { createContext, useContext, useState, useEffect } from 'react';
import { nl } from '../translations/nl';
import { en } from '../translations/en';
import { fr } from '../translations/fr';

type Language = 'nl' | 'en' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = { nl, en, fr };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved as Language) || 'nl';  // Default to Dutch
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key: string) => {
        const keys = key.split('.');
        let value: any = translations[language];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
} 