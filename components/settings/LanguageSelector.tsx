import React from 'react';
import { useGameSettings } from '../../hooks/useGameSettings';
import { SUPPORTED_LANGUAGES } from '../../hooks/utils/languageSupport';
import { SupportedLanguage } from '../../types';
import useTranslation from '../../hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { gameSettings, updateGameSettings } = useGameSettings();
  const { t } = useTranslation();
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as SupportedLanguage;
    updateGameSettings({ language: newLanguage });
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor="language-select" className="mb-2 font-medium text-gray-700">
        {t('settings.language')}
      </label>
      <select
        id="language-select"
        value={gameSettings.language}
        onChange={handleLanguageChange}
        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
