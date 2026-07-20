import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enRes from './locales/en.json';
import viRes from './locales/vi.json';
import jaRes from './locales/ja.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enRes },
      vi: { translation: viRes },
      ja: { translation: jaRes }
    },
    fallbackLng: 'vi',
    debug: false,
    interpolation: {
      escapeValue: false, // React đã tự động escape
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;
