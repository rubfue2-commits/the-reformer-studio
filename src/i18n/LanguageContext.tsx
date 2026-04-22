import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (fr: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("cr_language");
      return (stored === "fr" || stored === "en") ? stored : "fr";
    } catch {
      return "fr";
    }
  });

  const setLanguage = (lang: Language) => {
    setLang(lang);
    try { localStorage.setItem("cr_language", lang); } catch {}
    document.documentElement.lang = lang;
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

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
