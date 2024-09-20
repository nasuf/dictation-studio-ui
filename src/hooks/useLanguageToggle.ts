import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";

export const useLanguageToggle = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const toggleLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
    },
    [i18n]
  );

  return { toggleLanguage, currentLanguage };
};
