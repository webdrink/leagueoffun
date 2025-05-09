/**
 * App Component
 *
 * Purpose: Main application component for BlameGame. It handles game state, 
 *          navigation between screens, loading game data (categories and questions),
 *          and managing global settings like language and sound.
 *
 * Child Components:
 *  - IntroScreen
 *  - QuestionScreen
 *  - PlayerSetupScreen
 *  - LoadingContainer
 *  - InfoModal
 *  - GameContainer
 *  - LanguageChangeFeedback
 *  - DebugPanel
 *
 * Hooks Used:
 *  - useSound
 *  - useGameSettings
 *  - useQuestions
 *  - useNameBlameSetup
 *  - useTranslation (from react-i18next)
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
import DebugPanel from './components/debug/DebugPanel';

import { SUPPORTED_LANGUAGES } from './hooks/utils/languageSupport';
import { LOADING_QUOTES, initialGameSettings } from './constants';

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

  // State for debug panel
  const [showDebug, setShowDebug] = useState(false);
  

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
    
    // Start loading animation immediately to provide visual feedback
    setGameStep('loading');
    setQuoteIndex(0);
    
    // Set up the cycling of quotes during loading
    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % (LOADING_QUOTES.length || 1));
    }, gameSettings.loadingQuoteIntervalMs || 2000);
    
    try {
      // Prepare questions for the round - this might take a moment
      console.log('Preparing round questions...');
      const success = await prepareRoundQuestions(gameSettings);
      
      // Handle the case where prepareRoundQuestions fails
      if (!success || (currentRoundQuestions && currentRoundQuestions.length === 0)) {
        clearInterval(quoteTimer);
        setGameStep('intro');
        setErrorLoadingQuestions(t('error.noQuestionsForRound'));
        return;
      }
      
      // Ensure we show the loading animation for at least the minimum time
      const minLoadingDuration = gameSettings.rouletteDurationMs || 3000;
      setTimeout(() => {
        clearInterval(quoteTimer);
        setGameStep('game');
        setCurrentPlayerIndex(0);
        playSound('game_start');
      }, minLoadingDuration);
    } catch (error) {
      console.error('Error preparing round:', error);
      clearInterval(quoteTimer);
      setGameStep('intro');
      setErrorLoadingQuestions(t('error.failedToLoadQuestions'));
    }
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
        )}        {gameStep === 'loading' && (
          <LoadingContainer
            key="loading"
            categories={allQuestions
              .filter(q => currentRoundQuestions.some(cq => cq.categoryId === q.categoryId))
              .reduce((acc, q) => {
                // Find matching category object
                const existingIndex = acc.findIndex(c => c.id === q.categoryId);
                if (existingIndex === -1 && q.categoryName) { // Ensure categoryName is present
                  // If category doesn't exist yet, create it
                  acc.push({
                    id: q.categoryId,
                    emoji: q.categoryEmoji,
                    name: q.categoryName // Store the name directly
                  });
                }
                return acc;
              }, [] as { id: string; emoji: string; name: string }[])
              .slice(0, gameSettings.categoryCount)
              .map(c => c.name) // Extract category name
            }
            getEmoji={getEmoji} // Pass down getEmoji
            currentQuote={LOADING_QUOTES.length > 0 ? LOADING_QUOTES[quoteIndex % LOADING_QUOTES.length] : ""}
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
      
      {/* Debug tools */}
      <div onClick={() => setShowDebug(!showDebug)} className="fixed bottom-4 right-4 z-50">
        <button 
          className={`rounded-full w-10 h-10 flex items-center justify-center text-sm ${
            showDebug ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
          } text-white`}
          aria-label={showDebug ? 'Hide Debug Panel' : 'Show Debug Panel'}
        >
          D
        </button>
      </div>
      
      {showDebug && (
        <DebugPanel
          gameSettings={gameSettings}
          setGameSettings={setGameSettings => updateGameSettings(
            typeof setGameSettings === 'function' 
              ? setGameSettings(gameSettings) 
              : setGameSettings
          )}
          defaultGameSettings={initialGameSettings}
          onClose={() => setShowDebug(false)}
          onResetAppData={() => {
            localStorage.clear();
            window.location.reload();
          }}
          questionStats={{
            totalQuestions: allQuestions.length,
            playedQuestions: 0, // Add this if tracking played questions
            availableQuestions: currentRoundQuestions.length,
            categories: questionStats.categories
          }}
        />
      )}
    </GameContainer>
  );
}

export default App;
