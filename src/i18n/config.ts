import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';
import zh from './locales/zh.json';

// Fonction pour détecter la langue du navigateur
const detectBrowserLanguage = (): string => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'fr';
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Vérifier si la langue détectée est supportée
  const supportedLanguages = ['fr', 'en', 'zh'];
  return supportedLanguages.includes(langCode) ? langCode : 'fr';
};

// Récupérer la langue: localStorage > navigateur > défaut
const getInitialLanguage = (): string => {
  const storedLang = localStorage.getItem('language');
  if (storedLang) return storedLang;
  
  const detectedLang = detectBrowserLanguage();
  localStorage.setItem('language', detectedLang);
  return detectedLang;
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      zh: { translation: zh }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
