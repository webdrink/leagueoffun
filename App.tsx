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
import QuestionScreen from './components/game/QuestionScreen'; // Use the original QuestionScreen component
import InfoModal from './components/core/InfoModal';
import GameContainer from './components/game/GameContainer'; 
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './hooks/utils/languageSupport';
import LanguageChangeFeedback from './components/language/LanguageChangeFeedback';

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
  
  // State for question display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const loadGameData = useCallback(async (language: string) => {
    setIsLoadingQuestions(true);
    setErrorLoadingQuestions(null);
    setQuestions([]);
    setCategories([]);

    try {      // Load categories from categories.json
      const categoriesResponse = await fetch('/questions/categories.json', {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!categoriesResponse.ok) {
        throw new Error(`Failed to load categories.json: HTTP ${categoriesResponse.status}`);
      }
      const allCategoriesData: Category[] = await categoriesResponse.json();

      // Shuffle and select 10 categories
      const shuffledCategories = [...allCategoriesData].sort(() => 0.5 - Math.random());
      const selectedCategories: Category[] = [];
      const loadedCategoryIds = new Set<string>();
      const allLoadedQuestions: Question[] = [];
      
      // Track attempted category IDs to avoid infinite loops
      const attemptedCategoryIds = new Set<string>();
      // Maximum number of category attempts to avoid infinite loops
      const MAX_CATEGORY_ATTEMPTS = 20;
      let totalAttempts = 0;

      // First pass: try to load 10 categories with valid question files
      while (selectedCategories.length < 10 && shuffledCategories.length > 0 && totalAttempts < MAX_CATEGORY_ATTEMPTS) {
        totalAttempts++;
        const category = shuffledCategories.pop();
        if (!category || loadedCategoryIds.has(category.id) || attemptedCategoryIds.has(category.id)) continue;
        
        // Mark this category as attempted regardless of outcome
        attemptedCategoryIds.add(category.id);

        try {          // Try to fetch questions for the category
          const questionsResponse = await fetch(`/questions/${language}/${category.id}.json`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          if (!questionsResponse.ok) {
            console.warn(`Category ${category.id} returned HTTP ${questionsResponse.status}`);
            // Don't try to parse the response body if status is not OK
            throw new Error(`Failed to load questions for category: ${category.id}`);
          }          // Parse the JSON only after checking response.ok
          let questionsData: Question[];
          try {
            // Clone the response before reading it to avoid "body already used" errors
            const responseClone = questionsResponse.clone();
            try {
              questionsData = await questionsResponse.json();
            } catch (e) {
              console.warn(`First JSON parse attempt failed, trying with clone for ${category.id}`);
              questionsData = await responseClone.json();
            }
          } catch (jsonError) {
            console.error(`Invalid JSON in ${category.id}.json:`, jsonError);
            throw new Error(`Invalid JSON format in ${category.id}.json`);
          }

          // Validate that we have at least 1 valid question
          if (!Array.isArray(questionsData) || questionsData.length === 0) {
            throw new Error(`No valid questions found in ${category.id}.json`);
          }

          // Add category and questions if successful
          selectedCategories.push(category);
          loadedCategoryIds.add(category.id);

          // Get the correct localized category name based on current language
          const categoryName = category[language as keyof typeof category] || category.id;

          allLoadedQuestions.push(...questionsData.map(q => ({ 
            ...q, 
            categoryId: category.id,
            categoryName: categoryName, // Use the localized category name
            categoryEmoji: category.emoji || '❓' // Populate categoryEmoji, with a fallback
          })));
        } catch (error) {
          console.warn(`Error loading questions for category ${category?.id}:`, error);
          // Continue to next category
        }
      }

      // Second pass: if we don't have 10 categories yet, try remaining categories, with a limit
      if (selectedCategories.length < 10) {
        console.log(`Only loaded ${selectedCategories.length} categories in first pass, trying remaining categories...`);
        
        // Get categories we haven't tried yet
        const remainingCategories = allCategoriesData.filter(
          cat => !loadedCategoryIds.has(cat.id) && !attemptedCategoryIds.has(cat.id)
        );
        
        let fallbackAttempts = 0;
        const MAX_FALLBACK_ATTEMPTS = 10;
        
        for (const fallbackCategory of remainingCategories) {
          if (selectedCategories.length >= 10 || fallbackAttempts >= MAX_FALLBACK_ATTEMPTS) break;
          
          fallbackAttempts++;
          attemptedCategoryIds.add(fallbackCategory.id);
          
          try {            const fallbackResponse = await fetch(`/questions/${language}/${fallbackCategory.id}.json`, {
              headers: {
                'Accept': 'application/json'
              }
            });
            if (!fallbackResponse.ok) {
              console.warn(`Fallback category ${fallbackCategory.id} returned HTTP ${fallbackResponse.status}`);
              continue;
            }
              let fallbackQuestions: Question[];
            try {
              // Clone the response before reading it to avoid "body already used" errors
              const responseClone = fallbackResponse.clone();
              try {
                fallbackQuestions = await fallbackResponse.json();
              } catch (e) {
                console.warn(`First JSON parse attempt failed, trying with clone for ${fallbackCategory.id}`);
                fallbackQuestions = await responseClone.json();
              }
            } catch (jsonError) {
              console.error(`Invalid JSON in fallback ${fallbackCategory.id}.json:`, jsonError);
              continue;
            }
            
            // Validate that we have valid questions
            if (!Array.isArray(fallbackQuestions) || fallbackQuestions.length === 0) {
              console.warn(`No valid questions found in fallback ${fallbackCategory.id}.json`);
              continue;
            }

            selectedCategories.push(fallbackCategory);
            loadedCategoryIds.add(fallbackCategory.id);

            // Get the correct localized category name based on current language
            const categoryName = fallbackCategory[language as keyof typeof fallbackCategory] || fallbackCategory.id;

            allLoadedQuestions.push(...fallbackQuestions.map(q => ({ 
              ...q, 
              categoryId: fallbackCategory.id,
              categoryName: categoryName, // Use the localized category name
              categoryEmoji: fallbackCategory.emoji || '❓' // Populate categoryEmoji
            })));
          } catch (error) {
            console.warn(`Error loading fallback questions for category ${fallbackCategory.id}:`, error);
          }
        }
      }

      // Log summary of what we loaded
      console.log(`Loaded ${selectedCategories.length} categories with ${allLoadedQuestions.length} total questions`);
      selectedCategories.forEach(cat => {
        const questionCount = allLoadedQuestions.filter(q => q.categoryId === cat.id).length;
        console.log(`- ${cat.id} (${cat.name}): ${questionCount} questions`);
      });

      setCategories(selectedCategories);
      setQuestions(allLoadedQuestions);

      // Update QuestionStats
      setQuestionStats({
        totalQuestions: allLoadedQuestions.length,
        categories: selectedCategories.reduce((acc, cat) => {
          acc[cat.name] = allLoadedQuestions.filter(q => q.categoryId === cat.id).length;
          return acc;
        }, {} as Record<string, number>),
      });

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
        i18n.changeLanguage(gameSettings.language)
          .then(() => {
            // Force UI update after language change
            // Reload game data for the new language
            loadGameData(gameSettings.language);
          })
          .catch((err: unknown) => {
            console.error('Error changing language:', err);
          });
      } else {
        console.warn('i18n is not properly initialized or changeLanguage is not available');
      }
    }
  }, [gameSettings.language, i18n, loadGameData]);

  const handleStartGame = () => {
    if (questions.length > 0) {
      // Shuffle questions for the game session
      const randomizedQuestions = [...questions].sort(() => 0.5 - Math.random());
      setShuffledQuestions(randomizedQuestions);
      setCurrentQuestionIndex(0);
      setGameStep('game'); // GameStep value is string literal
      playSound('game_start');
    } else {
      if (!errorLoadingQuestions) {
        setErrorLoadingQuestions(t('error.noQuestionsLoaded'));
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      playSound('new_question');
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // End of questions, show summary or loop back
      setGameStep('intro'); // For now, just go back to intro
      playSound('summary_fun');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
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

  const handleTitleClick = () => {
    setGameStep('intro'); // Navigate to intro screen
  };

    return (
    <GameContainer onTitleClick={handleTitleClick}> {/* Pass handleTitleClick to GameContainer */}
      {gameStep === 'intro' && ( // GameStep value is string literal
        <IntroScreen
          onStartGame={handleStartGame}
          gameSettings={gameSettings}
          onToggleSound={toggleSound}
          soundEnabled={soundEnabled}
          volume={volume}
          onVolumeChange={setVolume}
          isLoading={isLoadingQuestions}
          nameBlameMode={false} 
          onToggleNameBlame={(checked: boolean) => console.log('Name blame toggled:', checked)}
          onOpenDebugPanel={() => console.log('Open debug panel')} 
          onOpenInfoModal={() => setShowInfoModal(true)} 
          mainButtonLabel={isLoadingQuestions ? t('intro.loading_questions') : t('intro.start_game')}
        />
      )}
      
      {gameStep === 'game' && shuffledQuestions.length > 0 && (
        <QuestionScreen
          question={shuffledQuestions[currentQuestionIndex]}
          index={currentQuestionIndex}
          totalQuestions={shuffledQuestions.length}
          gameSettings={gameSettings}
          nameBlameMode={false}
          activePlayers={[]}
          currentPlayerIndex={0}
          onBlame={() => {}}
          onNext={handleNextQuestion}
          onBack={handlePreviousQuestion}
        />
      )}
      
      {showInfoModal && (
        <InfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          onResetAppData={() => console.log('Reset App Data triggered from InfoModal')}
        />
      )}
      
      <LanguageChangeFeedback 
        language={gameSettings.language} 
        languageName={SUPPORTED_LANGUAGES[gameSettings.language]} 
      />
    </GameContainer>
  );
}

export default App;
