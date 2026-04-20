"use client";

import { createContext, useContext, useState } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en"); // Default: English (for all Indian farmers)

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
    }
  };

  const toggleLanguage = () => {
    // Cycles through: mr -> en -> hi -> mr
    setLang((prev) => {
      if (prev === "mr") return "en";
      if (prev === "en") return "hi";
      return "mr";
    });
  };

  const t = (key) => {
    return translations[lang][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);