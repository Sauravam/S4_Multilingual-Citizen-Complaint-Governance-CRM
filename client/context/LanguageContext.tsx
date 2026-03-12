"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LanguageCode, TRANSLATIONS, THEMES, LANGUAGES } from "../utils/translations";

interface LanguageContextType {
    lang: LanguageCode;
    setLang: (lang: LanguageCode) => void;
    t: (key: string) => string;
    languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<LanguageCode>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("govtech_lang") as LanguageCode;
        if (stored && TRANSLATIONS[stored]) {
            setLangState(stored);
        }
        setMounted(true);
    }, []);

    // Effect to apply contextual theme colors based on language chosen
    useEffect(() => {
        if (!mounted) return;
        const theme = THEMES[lang] || THEMES["en"];
        // Override the primary orange/gradient CSS variables dynamically
        document.documentElement.style.setProperty("--accent-orange", theme.accent1);
        document.documentElement.style.setProperty("--accent-gradient-start", theme.accent1);
        document.documentElement.style.setProperty("--accent-gradient-end", theme.accent2);
        document.documentElement.style.setProperty("--bg-highlight", theme.bgHighlight);
        document.documentElement.lang = lang;
    }, [lang, mounted]);

    const setLang = (newLang: LanguageCode) => {
        setLangState(newLang);
        localStorage.setItem("govtech_lang", newLang);
    };

    const t = (key: string): string => {
        if (!mounted) return TRANSLATIONS["en"][key] || key;
        return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
