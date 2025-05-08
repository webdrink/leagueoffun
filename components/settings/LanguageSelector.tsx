import React from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { GameSettings } from '../../types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../../hooks/utils/languageSupport';

/**
 * Component for selecting the application language
 */
const LanguageSelector: React.FC = () => {
  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>(
    'blamegame-settings', 
    { language: DEFAULT_LANGUAGE } as any
  );
  
  const currentLanguage = gameSettings.language || DEFAULT_LANGUAGE;
  
  const changeLanguage = (langCode: string) => {
    setGameSettings((prev: GameSettings) => ({
      ...prev,
      language: langCode
    }));
  };
  
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 text-purple-700">Sprache / Language</h3>
      <div className="flex flex-wrap gap-2">
        {SUPPORTED_LANGUAGES.map(lang => (
          <button
            key={lang.code}
            className={`px-3 py-1 rounded-full text-xs ${
              currentLanguage === lang.code
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-700 border border-purple-300'
            }`}
            onClick={() => changeLanguage(lang.code)}
            aria-pressed={currentLanguage === lang.code}
          >
            {lang.displayName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
