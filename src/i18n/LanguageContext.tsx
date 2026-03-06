import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import en from "./locales/en.json";
import ar from "./locales/ar.json";
import hi from "./locales/hi.json";
import ur from "./locales/ur.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

export type Locale = "en" | "ar" | "hi" | "ur" | "es" | "fr";

const RTL_LOCALES: Locale[] = ["ar", "ur"];

const localeMap: Record<Locale, Record<string, string>> = { en, ar, hi, ur, es, fr };

export const LANGUAGE_OPTIONS: { value: Locale; label: string; nativeLabel: string; flag: string }[] = [
  { value: "en", label: "English", nativeLabel: "English", flag: "🇺🇸" },
  { value: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇸🇦" },
  { value: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { value: "ur", label: "Urdu", nativeLabel: "اردو", flag: "🇵🇰" },
  { value: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { value: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
];

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("livemed-locale");
    return (saved as Locale) || "en";
  });

  const isRTL = RTL_LOCALES.includes(locale);

  useEffect(() => {
    localStorage.setItem("livemed-locale", locale);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale, isRTL]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const dict = localeMap[locale];
    return dict?.[key] || localeMap.en[key] || fallback || key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
};
