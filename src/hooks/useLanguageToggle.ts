import { useTranslation } from "react-i18next";

export const useLanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "zh" : "en";
    i18n.changeLanguage(newLang);
  };

  return { toggleLanguage, currentLanguage: i18n.language };
};
