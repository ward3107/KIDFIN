import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import he from './locales/he.json';
import ar from './locales/ar.json';

export const SUPPORTED_LANGS = ['he', 'ar'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = 'he';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      he: { translation: he },
      ar: { translation: ar },
    },
    fallbackLng: DEFAULT_LANG,
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    nonExplicitSupportedLngs: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'save4dream.lang',
      caches: ['localStorage'],
    },
    returnNull: false,
  });

const applyHtmlAttrs = (lng: string) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('lang', lng);
  document.documentElement.setAttribute('dir', 'rtl');
};

applyHtmlAttrs(i18n.resolvedLanguage || DEFAULT_LANG);
i18n.on('languageChanged', applyHtmlAttrs);

export default i18n;
