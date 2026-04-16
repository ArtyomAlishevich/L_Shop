import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { ru } from '../locales/ru';
import { en } from '../locales/en';
import { Translations } from '../locales/ru';
import apiClient from '../api/client';

type Locale = 'ru' | 'en';

interface LocaleContextType {
    locale: Locale;
    t: Translations;
    setLocale: (locale: Locale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>('ru');

    useEffect(() => {
        apiClient.get('/locale').then(res => {
            const l = res.data?.data;
            if (l === 'ru' || l === 'en') setLocaleState(l);
        }).catch(() => {});
    }, []);

    const setLocale = async (newLocale: Locale) => {
        try {
            await apiClient.post('/locale', { locale: newLocale });
        } catch {}
        setLocaleState(newLocale);
    };

    const t = locale === 'ru' ? ru : en;

    return (
        <LocaleContext.Provider value={{ locale, t, setLocale }}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = () => {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
    return ctx;
};