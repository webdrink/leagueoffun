/**
 * App Component
 *
 * Purpose: Main application component for BlameGame. It handles game state, 
 *          navigation between screens, loading game data (categories and questions),
 *          and managing global settings like language and sound.
 *
 * Props: None
 *
 * Expected Behavior: 
 *  - Initializes game settings and sound preferences.
 *  - Loads categories and questions based on the selected language, with fallbacks.
 *  - Manages the current game step (Intro, Playing, Results).
 *  - Provides necessary data and callbacks to child screen components.
 *  - Handles language changes and reloads data accordingly.
 *
 * Dependencies: 
 *  - react, react-i18next
 *  - ./types.ts (various type definitions)
 *  - ./types/questions.ts (for Category type) // This comment might be outdated if Category is from ./types
 *  - ./hooks/* (useGameSettings, useSound)
 *  - ./components/* (IntroScreen, InfoModal)
 *  - CSS files for styling.
 *
 * Notes: 
 *  - Assumes App.tsx is in the project root, and other primary source directories
 *    (components, hooks, types.ts, lib) are also in the project root.
 *  - Error handling for data loading is included, displaying messages to the user.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GameSettings, Question, GameStep, QuestionStats, Category } from './types';
import useSound from './hooks/useSound'; 
import { useGameSettings } from './hooks/useGameSettings';
import IntroScreen from './components/game/IntroScreen';
import InfoModal from './components/core/InfoModal';
import GameContainer from './components/core/GameContainer'; 
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './hooks/utils/languageSupport';

// Import styles already handled by index.tsx

function App() {
  const { soundEnabled, toggleSound, playSound, volume, setVolume } = useSound();
  const { t, i18n } = useTranslation();
  const { gameSettings, updateGameSettings } = useGameSettings();

  const [gameStep, setGameStep] = useState<GameStep>('intro'); // GameStep used as type, value is string literal
  const [questions, setQuestions] = useState<Question[]>([]);
  const [playedQuestions, setPlayedQuestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // Simplified QuestionStats
  const [questionStats, setQuestionStats] = useState<Pick<QuestionStats, 'totalQuestions' | 'categories'>>({ totalQuestions: 0, categories: {} });
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState<string | null>(null);

  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const loadGameData = useCallback(async (language: string) => {
    setIsLoadingQuestions(true);
    setErrorLoadingQuestions(null);
    setQuestions([]);
    setCategories([]);
    
    try {
      // Use relative paths that work for both dev and production
      const categoriesResponse = await fetch('questions/categories.json');
      
      if (!categoriesResponse.ok) {
        console.error('Failed to load categories.json, status:', categoriesResponse.status);
        throw new Error(t('error.loadQuestions'));
      }
      
      const allCategoriesData: any[] = await categoriesResponse.json();

      const shuffledCategories = [...allCategoriesData].sort(() => 0.5 - Math.random());
      const selectedCategorySource = shuffledCategories.slice(0, 10);

      const translatedCategories: Category[] = selectedCategorySource.map(catData => {
        if (!catData || !catData.id) return null;
        let name = catData[language as string];
        if (!name) name = catData['en']; // Using string literal for language
        if (!name) name = catData['de']; // Using string literal for language
        if (!name) name = catData.id;

        return {
          id: catData.id,
          name: name || 'Unnamed Category',
          emoji: catData.emoji || ''
        };
      }).filter(cat => cat !== null) as Category[];
      
      setCategories(translatedCategories);

      let allLoadedQuestions: Question[] = [];
      
      for (const category of translatedCategories) {
        const categoryId = category.id;
        let categoryQuestions: Question[] = [];
        let found = false;
        const languagesToTry = [language, 'en', 'de']; // Using string literals for languages
        
        for (const lang of languagesToTry) {
          try {
            const questionsResponse = await fetch(`questions/${lang}/${categoryId}.json`);
            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json();
              categoryQuestions = questionsData.map((q: any) => ({ 
                ...q, 
                category: categoryId, 
                questionId: q.questionId || `gen_${categoryId}_${Math.random().toString(36).substring(7)}` 
              }));
              allLoadedQuestions = allLoadedQuestions.concat(categoryQuestions);
              found = true;
              break;
            }
          } catch (e) { 
            /* ignore individual fetch error, try next lang */ 
          }
        }
        
        if (!found) { 
          /* handle category with no questions if needed */ 
        }
      }
      
      setQuestions(allLoadedQuestions);

      // Updated QuestionStats setting
      setQuestionStats({
        totalQuestions: allLoadedQuestions.length,
        categories: translatedCategories.reduce((acc: Record<string, number>, cat: Category) => {
          acc[cat.name] = allLoadedQuestions.filter((q: Question) => q.category === cat.id).length;
          return acc;
        }, {} as Record<string, number>)
      });

      if (allLoadedQuestions.length === 0 && translatedCategories.length > 0) {
        console.warn("No questions loaded despite having selected categories.");
      }

    } catch (error: any) {
      console.error("Error loading game data:", error);
      setErrorLoadingQuestions(error.message || t('error.loadQuestions'));
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [t]);

  useEffect(() => {
    if (gameSettings.language) {
      loadGameData(gameSettings.language);
    }
  }, [gameSettings.language, loadGameData]);
  
  useEffect(() => {
    if (gameSettings.language && i18n.language !== gameSettings.language) {
      // Make sure i18n is properly initialized before calling changeLanguage
      if (i18n && typeof i18n.changeLanguage === 'function') {
        i18n.changeLanguage(gameSettings.language);
      } else {
        console.warn('i18n is not properly initialized or changeLanguage is not available');
      }
    }
  }, [gameSettings.language, i18n]);

  const handleStartGame = () => {
    if (questions.length > 0) {
      setGameStep('game'); // GameStep value is string literal
      playSound('game_start');
    } else {
      if (!errorLoadingQuestions) {
        setErrorLoadingQuestions(t('error.noQuestionsLoaded'));
      }
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    if (Object.keys(SUPPORTED_LANGUAGES).includes(newLanguage)) {
      updateGameSettings({ language: newLanguage as keyof typeof SUPPORTED_LANGUAGES }); // SupportedLanguage used as type
    } else {
      console.warn(`Attempted to change to unsupported language: ${newLanguage}`);
      updateGameSettings({ language: 'en' }); // Using string literal for language
    }
  };
  
  return (
    <GameContainer>
      {gameStep === 'intro' && ( // GameStep value is string literal
        <IntroScreen
          onStartGame={handleStartGame}
          gameSettings={gameSettings}
          onToggleSound={toggleSound}
          soundEnabled={soundEnabled}
          volume={volume}
          onVolumeChange={setVolume}
          isLoading={isLoadingQuestions}
          csvError={errorLoadingQuestions}
          nameBlameMode={false} 
          onToggleNameBlame={(checked) => console.log('Name blame toggled:', checked)}
          onOpenDebugPanel={() => console.log('Open debug panel')} 
          onOpenInfoModal={() => setShowInfoModal(true)} 
          mainButtonLabel={isLoadingQuestions ? t('intro.loading_questions') : t('intro.start_game')}
        />
      )}
      
      {showInfoModal && (
        <InfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          onResetAppData={() => console.log('Reset App Data triggered from InfoModal')}
        />
      )}
    </GameContainer>
  );
}

export default App;
