import { resources } from '@shared/localization';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(LanguageDetector).init({
  resources,
  fallbackLng: 'en',
  // Resources are bundled, so translations must be ready for the first render.
  initAsync: false,

  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
});

export default i18n;
