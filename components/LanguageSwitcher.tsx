import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, type SupportedLang } from '../i18n';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage as SupportedLang) || 'he';

  const change = (lng: SupportedLang) => {
    if (lng === current) return;
    void i18n.changeLanguage(lng);
  };

  return (
    <div
      role="group"
      aria-label={t('lang.switchTo')}
      className={`inline-flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5 text-[11px] md:text-xs font-bold ${className}`}
    >
      {SUPPORTED_LANGS.map((lng) => (
        <button
          key={lng}
          type="button"
          aria-pressed={current === lng}
          onClick={() => change(lng)}
          className={`px-2 py-1 rounded-full transition-colors ${
            current === lng
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t(`lang.${lng}`)}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
