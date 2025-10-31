import React, { useState, useEffect } from 'react';
import useTranslation from '../../hooks/useTranslation';
import { SUPPORTED_LANGUAGES } from '../../hooks/utils/languageSupport';
import { SupportedLanguage } from '../../types';
import { useGameSettings } from '../../hooks/useGameSettings';

const LanguageTester: React.FC = () => {
  const { gameSettings: _gameSettings, updateGameSettings } = useGameSettings();
  const { t, currentLanguage } = useTranslation();
  const [testCount, setTestCount] = useState(5);
  const [categoryData, setCategoryData] = useState<Array<{ id: string; name: string; emoji?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Change language handler
  const handleLanguageChange = (language: SupportedLanguage) => {
    updateGameSettings({ language });
  };
  
  // Load categories for the current language
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
        try {
        const langFile = currentLanguage !== 'de'
          ? `index.${currentLanguage}.json`
          : 'index.json';
        
        const response = await fetch(`categories/${langFile}`);
        
        if (response.ok) {
          const data = await response.json();
          setCategoryData(data);
        } else {
          console.error('Failed to load categories:', response.statusText);
          setCategoryData([]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategoryData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategories();
  }, [currentLanguage]);
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-autumn-800 mb-6">
          {t('common.app_name')} - {t('settings.language')} Tester
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-autumn-600">
            {t('settings.language')} {t('settings.title')}
          </h2>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as SupportedLanguage)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  currentLanguage === code
                    ? 'bg-autumn-600 border-autumn-500 text-white shadow-sm'
                    : 'bg-white border-autumn-200 text-autumn-600 hover:bg-autumn-50 hover:border-autumn-300'
                }`}
              >
                {String(name)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-autumn-600">
            {t('debug.translation_test')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-autumn-50 p-4 rounded-lg border border-autumn-100">
              <h3 className="font-medium mb-2 text-autumn-600">
                {t('intro.title')}
              </h3>
              <p>{t('intro.tagline')}</p>
            </div>
            
            <div className="bg-autumn-50 p-4 rounded-lg border border-autumn-100">
              <h3 className="font-medium mb-2 text-autumn-600">
                {t('settings.title')}
              </h3>
              <p>
                {t('settings.sound')}: {t('settings.sound_on')}
              </p>
            </div>
            
            <div className="bg-autumn-50 p-4 rounded-lg border border-autumn-100">
              <h3 className="font-medium mb-2 text-autumn-600">
                {t('summary.game_over')}
              </h3>
              <p>
                {t('summary.questions_completed', { count: testCount })}
              </p>
              <label htmlFor="test-count-slider" className="sr-only">
                Test count for questions completed
              </label>
              <input
                id="test-count-slider"
                type="range"
                min="0"
                max="20"
                value={testCount}
                onChange={(e) => setTestCount(parseInt(e.target.value))}
                className="w-full mt-2"
                aria-label="Test count for questions completed"
              />
            </div>
            
            <div className="bg-autumn-50 p-4 rounded-lg border border-autumn-100">
              <h3 className="font-medium mb-2 text-autumn-600">
                {t('player.setup_title')}
              </h3>
              <p>
                {t('player.min_players_warning')}
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 text-autumn-600">
            {t('settings.categories')}
          </h2>
          
          {isLoading ? (
            <p>{t('common.loading')}</p>
          ) : categoryData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categoryData.slice(0, 12).map((category) => (
                <div key={category.id} className="bg-autumn-50 p-3 rounded-lg border border-autumn-200">
                  <div className="text-xl mb-1">{category.emoji || '❓'}</div>
                  <div className="text-sm font-medium text-autumn-700 truncate">
                    {category.name}
                  </div>
                  <div className="text-xs text-autumn-600 mt-1">
                    ID: {category.id}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-500">
              {t('debug.no_categories_found')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageTester;