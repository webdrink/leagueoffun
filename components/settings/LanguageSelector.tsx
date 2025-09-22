import React from 'react';
import { useGameSettings } from '../../hooks/useGameSettings';
import { SUPPORTED_LANGUAGES } from '../../hooks/utils/languageSupport';
import { SupportedLanguage } from '../../types';
import useTranslation from '../../hooks/useTranslation';
import { GameAction } from '../../framework/core/actions';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';

interface LanguageSelectorProps {
  className?: string;
  compact?: boolean;
}

/**
 * LanguageSelector component allows users to select their preferred language from a dropdown menu.
 *
 * @param {LanguageSelectorProps} props - The props for the component.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the root element.
 *
 * @returns {JSX.Element} The rendered language selector component.
 *
 * @remarks
 * - Uses `useGameSettings` to access and update the current language in game settings.
 * - Uses `useTranslation` for localized label text.
 * - Renders a `<select>` element populated with supported languages from `SUPPORTED_LANGUAGES`.
 * - On language change, updates the game settings with the new language.
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '', compact = false }) => {
  const { gameSettings, updateGameSettings } = useGameSettings();
  const { t, i18n } = useTranslation();
  
  // Try to get framework router dispatch (may not be available in all contexts)
  let dispatch: ((action: GameAction) => void) | undefined;
  try {
    const router = useFrameworkRouter();
    dispatch = router.dispatch;
  } catch {
    // Not in framework context, continue without dispatch
    dispatch = undefined;
  }
  
  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as SupportedLanguage;
    
    try {
      // Update game settings first
      updateGameSettings({ language: newLanguage });
      
      // Change i18n language
      await i18n.changeLanguage(newLanguage);
      
      console.log(`Language changed to: ${newLanguage}`);
      
      // If we're in framework context, restart to reload questions in new language
      if (dispatch) {
        console.log('Triggering framework restart for language change');
        // Small delay to ensure settings are persisted
        setTimeout(() => {
          dispatch!(GameAction.RESTART);
        }, 100);
      } else {
        console.log('Not in framework context, language change applied without restart');
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };
  
  if (compact) {
    return (
      <div className="relative">
        <select
          id="language-select-compact"
          value={gameSettings.language}
          onChange={handleLanguageChange}
          className={`bg-transparent border-none rounded-lg px-3 py-1.5 text-white dark:text-gray-100 text-sm font-medium cursor-pointer hover:bg-white/10 dark:hover:bg-gray-600/20 focus:outline-none focus:bg-white/10 dark:focus:bg-gray-600/20 transition-all duration-200 appearance-none pr-8 ${className}`}
          title={t('settings.language')}
          aria-label="Language Selection"
        >
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <option key={code} value={code} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2">
              {name}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-4 h-4 text-white/90 dark:text-gray-200/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor="language-select" className="mb-2 font-medium text-gray-700 dark:text-gray-300">
        {t('settings.language')}
      </label>
      <div className="relative">
        <select
          id="language-select"
          value={gameSettings.language}
          onChange={handleLanguageChange}
          className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200 appearance-none"
        >
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <option key={code} value={code} className="py-2">
              {name}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
