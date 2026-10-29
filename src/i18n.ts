import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en.json';
import nl from './locales/nl.json';

export type Lang = 'en' | 'nl';

export function deviceLanguage(): Lang {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return code === 'nl' ? 'nl' : 'en';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, nl: { translation: nl } },
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
