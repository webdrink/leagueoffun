import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedLanguage } from '../hooks/utils/languageSupport';

/**
 * Test component for i18n functionality
 * 
 * This component displays UI elements in different languages and
 * allows testing language switching functionality.
 */
const I18nTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<string>(i18n.language || 'de');

  const changeLanguage = (lang: SupportedLanguage) => {
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(lang);
      setCurrentLang(lang);
    } else {
      console.error('i18n is not properly initialized');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>{t('app.title')}</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Current language: {currentLang}</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => changeLanguage('de')}>Deutsch</button>
          <button onClick={() => changeLanguage('en')}>English</button>
          <button onClick={() => changeLanguage('es')}>Español</button>
          <button onClick={() => changeLanguage('fr')}>Français</button>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>UI Elements Test</h3>
        <button>{t('intro.start_game')}</button>
        <p>{t('intro.loading_questions')}</p>
        <p style={{ color: 'red' }}>{t('error.loadQuestions')}</p>
      </div>
      
      <div>
        <h3>Game Screen Labels</h3>
        <button>{t('game.next_question')}</button>
        <button>{t('game.summary')}</button>
        <button>{t('game.play_again')}</button>
      </div>
    </div>
  );
};

export default I18nTest;