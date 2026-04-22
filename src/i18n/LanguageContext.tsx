import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (fr: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem("cr_language");
    return (stored === "fr" || stored === "en") ? stored : "fr";
  });

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem("cr_language", lang);
    document.documentElement.lang = lang;
  };

  const t = useCallback((fr: string, en: string) => {
    return language === "fr" ? fr : en;
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
