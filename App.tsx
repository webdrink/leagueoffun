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
 *  - react, react-i18next, framer-motion
 *  - ./types.ts (various type definitions)
 *  - ./hooks/* (useGameSettings, useSound, useQuestions, useNameBlameSetup)
 *  - ./components/* (IntroScreen, QuestionScreen, PlayerSetupScreen, LoadingContainer, InfoModal, GameContainer, LanguageChangeFeedback)
 *  - ./lib/constants (LOADING_QUOTES)
 *  - ./lib/formatters (getEmoji) - Assuming this exists or will be created
 *
 * Notes: 
 *  - Assumes App.tsx is in the project root, and other primary source directories
 *    (components, hooks, types.ts, lib) are also in the project root.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';

import { GameSettings, Question, GameStep, QuestionStats, Player, SupportedLanguage } from './types';
import useSound from './hooks/useSound';
import { useGameSettings } from './hooks/useGameSettings';
import useQuestions from './hooks/useQuestions';
import useNameBlameSetup from './hooks/useNameBlameSetup';

import IntroScreen from './components/game/IntroScreen';
import QuestionScreen from './components/game/QuestionScreen';
import PlayerSetupScreen from './components/game/PlayerSetupScreen';
import LoadingContainer from './components/game/LoadingContainer';
import InfoModal from './components/core/InfoModal';
import GameContainer from './components/game/GameContainer';
import LanguageChangeFeedback from './components/language/LanguageChangeFeedback';

import { SUPPORTED_LANGUAGES } from './hooks/utils/languageSupport';
import { LOADING_QUOTES } from './lib/constants'; 

function App() {
  const { soundEnabled, toggleSound, playSound, volume, setVolume } = useSound();
  const { t, i18n } = useTranslation();
  const { gameSettings, updateGameSettings } = useGameSettings();

  const {
    allQuestions,
    currentRoundQuestions,
    currentQuestion,
    isLoading: isLoadingQuestions,
    isPreparingRound, // Get the new round preparation state
    index: currentQuestionIndexFromHook,
    prepareRoundQuestions,
    advanceToNextQuestion,
    goToPreviousQuestion,
  } = useQuestions(gameSettings);

  const {
    players, // Player[]
    tempPlayerName,
    nameInputError,
    setTempPlayerName,
    addPlayer,
    removePlayer,
    handlePlayerNameChange, // Added for completeness, if PlayerSetupScreen needs it
  } = useNameBlameSetup();

  const [gameStep, setGameStep] = useState<GameStep>('intro');
  const [questionStats, setQuestionStats] = useState<Pick<QuestionStats, 'totalQuestions' | 'categories'>>({ totalQuestions: 0, categories: {} });
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0); // For NameBlame mode

  useEffect(() => {
    if (currentRoundQuestions && currentRoundQuestions.length > 0) {
      const stats: Pick<QuestionStats, 'totalQuestions' | 'categories'> = {
        totalQuestions: currentRoundQuestions.length,
        categories: {},
      };
      const categoryMap: Record<string, number> = {};
      currentRoundQuestions.forEach(q => {
        if (q.categoryName) {
          categoryMap[q.categoryName] = (categoryMap[q.categoryName] || 0) + 1;
        }
      });
      stats.categories = categoryMap;
      setQuestionStats(stats);
      setErrorLoadingQuestions(null);
    } else {
      setQuestionStats({ totalQuestions: 0, categories: {} });
    }
  }, [currentRoundQuestions]);

  useEffect(() => {
    if (!isLoadingQuestions && allQuestions.length === 0 && gameStep !== 'intro' && gameStep !== 'loading') {
      setErrorLoadingQuestions(t('error.noQuestionsLoaded'));
    } else if (allQuestions.length > 0 && errorLoadingQuestions === t('error.noQuestionsLoaded')) {
      setErrorLoadingQuestions(null);
    }
  }, [isLoadingQuestions, allQuestions, gameStep, t, errorLoadingQuestions]);

  useEffect(() => {
    if (gameSettings.language && i18n.language !== gameSettings.language) {
      i18n.changeLanguage(gameSettings.language)
        .catch((err: unknown) => {
          console.error('Error changing language:', err);
        });
    }
  }, [gameSettings.language, i18n]);

  const handleStartGameFlow = async () => {
    // Check first if we're in "nameBlame" mode but don't have enough players
    if (gameSettings.gameMode === 'nameBlame' && players.filter(p => p.name.trim() !== '').length < 2) {
      setGameStep('playerSetup');
      return;
    }
    
    // Check for ongoing data loading
    if (isLoadingQuestions) {
      setErrorLoadingQuestions(t('error.questionsStillLoading'));
      return; // Don't proceed if initial questions are still loading
    }
    
    // If we have no questions available at all (even after loading completed)
    if (!isLoadingQuestions && allQuestions.length === 0) {
      setErrorLoadingQuestions(t('error.noQuestionsAvailable'));
      return;
    }
    
    setErrorLoadingQuestions(null); // Clear any previous errors
    
    // Prepare questions for the round
    const success = await prepareRoundQuestions(gameSettings);
    
    // Handle the case where prepareRoundQuestions fails
    if (!success || currentRoundQuestions.length === 0) {
      setErrorLoadingQuestions(t('error.noQuestionsForRound'));
      return; // Stay on current screen
    }
    
    // If successful, proceed to loading animation
    setGameStep('loading');
    setQuoteIndex(0);
    
    // Set up the cycling of quotes during loading
    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % (LOADING_QUOTES.length || 1));
    }, gameSettings.loadingQuoteIntervalMs || 2000);
    
    // After loading animation duration, move to game
    setTimeout(() => {
      clearInterval(quoteTimer);
      setGameStep('game');
      setCurrentPlayerIndex(0);
      playSound('game_start');
    }, gameSettings.rouletteDurationMs || 3000);
  };
  
  const handlePlayerSetupComplete = async () => {
    if (players.filter(p => p.name.trim() !== '').length < 2 && gameSettings.gameMode === 'nameBlame') {
      return;
    }
    handleStartGameFlow();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndexFromHook < currentRoundQuestions.length - 1) {
      advanceToNextQuestion();
      if (gameSettings.gameMode === 'nameBlame') {
        setCurrentPlayerIndex(prev => (prev + 1) % players.filter(p => p.name.trim() !== '').length);
      }
      playSound('new_question');
    } else {
      setGameStep('intro'); 
      playSound('summary_fun');
    }
  };

  const handlePreviousQuestion = () => {
    goToPreviousQuestion();
    if (gameSettings.gameMode === 'nameBlame' && currentPlayerIndex > 0) {
      setCurrentPlayerIndex(prev => prev -1);
    }
  };

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    updateGameSettings({ language: newLanguage });
  };

  const handleTitleClick = () => {
    setGameStep('intro');
  };
  
  const getEmoji = (categoryName: string): string => {
    // Find in current round first, then all questions as fallback
    let questionWithCategory = currentRoundQuestions.find(q => q.categoryName === categoryName);
    if (!questionWithCategory) {
      questionWithCategory = allQuestions.find(q => q.categoryName === categoryName);
    }
    return questionWithCategory?.categoryEmoji || '❓';
  };

  const handleBlame = (blamedPlayerName: string) => {
    console.log(`${blamedPlayerName} was blamed for question: ${currentQuestion?.text}`);
    handleNextQuestion(); 
  };

  const LOADING_QUOTES = t('loading.quotes', { returnObjects: true }) as string[] || [];

  return (
    <GameContainer onTitleClick={handleTitleClick}>
      <AnimatePresence mode="wait">
        {gameStep === 'intro' && (
          <IntroScreen
            key="intro"
            onStartGame={handleStartGameFlow}
            gameSettings={gameSettings}
            onUpdateGameSettings={updateGameSettings} 
            onToggleSound={toggleSound}
            soundEnabled={soundEnabled}
            volume={volume}
            onVolumeChange={setVolume}
            isLoading={isLoadingQuestions || isPreparingRound} // Disable button during initial loading OR round prep
            nameBlameMode={gameSettings.gameMode === 'nameBlame'}
            onToggleNameBlame={(checked) => {
              updateGameSettings({ gameMode: checked ? 'nameBlame' : 'classic' });
            }}
            onOpenDebugPanel={() => { /* TODO: Implement debug panel toggle */ }}
            onOpenInfoModal={() => setShowInfoModal(true)}
            mainButtonLabel={isLoadingQuestions ? t('intro.loading_questions') : t('intro.start_game')}
            errorLoadingQuestions={errorLoadingQuestions}
            supportedLanguages={SUPPORTED_LANGUAGES} 
            currentLanguage={gameSettings.language}
            onLanguageChange={handleLanguageChange}
            questionStats={questionStats}
          />
        )}

        {gameStep === 'playerSetup' && (
          <PlayerSetupScreen
            key="playerSetup"
            players={players} 
            tempPlayerName={tempPlayerName}
            nameInputError={nameInputError}
            onTempPlayerNameChange={setTempPlayerName}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer} 
            onStartGame={handlePlayerSetupComplete}
            onBackToIntro={() => setGameStep('intro')}
            onPlayerNameChange={handlePlayerNameChange} 
          />
        )}

        {gameStep === 'loading' && (
          <LoadingContainer
            key="loading"
            categories={currentRoundQuestions
              .map(q => q.categoryName)
              .filter((value, index, self) => value && self.indexOf(value) === index) 
              .slice(0, gameSettings.categoryCount) // Use gameSettings.categoryCount
            }
            getEmoji={getEmoji}
            currentQuote={LOADING_QUOTES.length > 0 ? LOADING_QUOTES[quoteIndex % LOADING_QUOTES.length] : ""} // Ensure currentQuote is empty if no quotes
            settings={{
              loadingQuoteSpringStiffness: gameSettings.loadingQuoteSpringStiffness,
              loadingQuoteSpringDamping: gameSettings.loadingQuoteSpringDamping,
              loadingQuoteTransitionDurationSec: gameSettings.loadingQuoteTransitionDurationSec,
              cardFallDistance: gameSettings.cardFallDistance,
              cardFallStaggerDelaySec: gameSettings.cardFallStaggerDelaySec,
              cardStackOffsetY: gameSettings.cardStackOffsetY,
              loadingQuoteIntervalMs: gameSettings.loadingQuoteIntervalMs,
            }}
          />
        )}

        {gameStep === 'game' && currentQuestion && (
          <QuestionScreen
            key="game"
            question={currentQuestion}
            index={currentQuestionIndexFromHook}
            totalQuestions={currentRoundQuestions.length}
            gameSettings={gameSettings}
            nameBlameMode={gameSettings.gameMode === 'nameBlame'}
            activePlayers={players.filter(p => p.name.trim() !== '')} 
            currentPlayerIndex={currentPlayerIndex} 
            onBlame={handleBlame} 
            onNext={handleNextQuestion}
            onBack={handlePreviousQuestion}
          />
        )}
      </AnimatePresence>

      {showInfoModal && (
        <InfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          onResetAppData={() => {
            console.log('Reset App Data triggered');
            localStorage.clear();
            window.location.reload();
          }}
        />
      )}
      
      <LanguageChangeFeedback
        language={gameSettings.language}
        languageName={SUPPORTED_LANGUAGES[gameSettings.language] || gameSettings.language}
      />
    </GameContainer>
  );
}

export default App;
