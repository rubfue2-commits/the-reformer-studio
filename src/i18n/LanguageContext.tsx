import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (fr: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "fr",
  setLanguage: () => {},
  t: (fr: string, _en: string) => fr,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    try {
      const s = localStorage.getItem("cr_language");
      return s === "en" ? "en" : "fr";
    } catch {
      return "fr";
    }
  });

  const setLanguage = (lang: Language) => {
    setLang(lang);
    try {
      localStorage.setItem("cr_language", lang);
    } catch {
      // ignore
    }
  };

  const t = (fr: string, en: string): string => {
    return language === "fr" ? fr : en;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}
