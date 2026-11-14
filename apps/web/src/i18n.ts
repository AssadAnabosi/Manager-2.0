import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(Backend)
  .init({
    fallbackLng: "en",
    // ar-PS, en-US, ... resolve to ar / en without fetching their own files
    supportedLngs: ["en", "ar"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
    debug: import.meta.env.DEV,
  });

export default i18n;
