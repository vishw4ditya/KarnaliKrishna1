import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggler = () => {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-sm font-medium"
      title="Toggle Language / भाषा परिवर्तन"
      id="lang-toggler"
    >
      <Globe className="w-4 h-4 text-primary-500" />
      <span>{lang === 'en' ? 'EN' : 'ने'}</span>
    </button>
  );
};

export default LanguageToggler;
