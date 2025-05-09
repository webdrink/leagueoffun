import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from './index'; // Assuming this exports your translations map

// Configure i18next with required plugins
i18n
  .use(LanguageDetector) // Detect language from browser
  .use(initReactI18next) // Initialize react-i18next
  .init({
    resources: translations,
    fallbackLng: 'de', // Default to German if translation is missing
    supportedLngs: ['de', 'en', 'es', 'fr'],
    debug: false, // Set to false as default
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Keys or cookies to lookup language from
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false, // Disable suspense to avoid issues
    }
  });

export default i18n;