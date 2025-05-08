import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { Button } from '../core/Button';
import { GameSettings, SupportedLanguage } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../hooks/utils/languageSupport';

interface SettingsScreenProps {
  gameSettings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onBack: () => void;
}

/**
 * Settings screen component that allows users to configure app settings
 * including language preferences
 */
const SettingsScreen: React.FC<SettingsScreenProps> = ({
  gameSettings,
  onUpdateSettings,
  onBack
}) => {
  const { t } = useTranslation();
  
  // Update language setting
  const handleLanguageChange = (language: SupportedLanguage) => {
    onUpdateSettings({
      ...gameSettings,
      language
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl"
    >
      <div className="flex items-center mb-6">
        <Button 
          onClick={onBack}
          className="p-2 mr-2 bg-gray-100 hover:bg-gray-200 rounded-full"
        >
          <ChevronLeftIcon size={20} />
        </Button>
        <h2 className="text-2xl font-bold text-purple-700">{t('settings.title')}</h2>
      </div>
      
      {/* Language Settings */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-purple-600 mb-3">
          {t('settings.language')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code as SupportedLanguage)}
              className={`p-3 rounded-lg border transition-colors ${
                gameSettings.language === code
                  ? 'bg-purple-100 border-purple-400 text-purple-700 font-medium'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {getLangFlagEmoji(code)}
                </span>
                <span>{String(name)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button
          onClick={onBack}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          {t('settings.save')}
        </Button>
      </div>
    </motion.div>
  );
};

// Helper function to get flag emoji for language
const getLangFlagEmoji = (langCode: string): string => {
  const flagEmojis: Record<string, string> = {
    en: '🇬🇧',
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷'
  };
  
  return flagEmojis[langCode] || '🌐';
};

export default SettingsScreen;