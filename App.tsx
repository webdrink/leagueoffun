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
 *  - ./hooks/* (useGameSettings, useSound, useQuestions)
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
import { GameSettings, GameStep, QuestionStats } from './types';
import useSound from './hooks/useSound'; 
import { useGameSettings } from './hooks/useGameSettings';
import useQuestions from './hooks/useQuestions';
import IntroScreen from './components/game/IntroScreen';
import QuestionScreen from './components/game/QuestionScreen';
import InfoModal from './components/core/InfoModal';
import GameContainer from './components/game/GameContainer'; 
import { SUPPORTED_LANGUAGES } from './hooks/utils/languageSupport';
import LanguageChangeFeedback from './components/language/LanguageChangeFeedback';

// Import styles already handled by index.tsx

function App() {
  const { soundEnabled, toggleSound, playSound, volume, setVolume } = useSound();
  const { t, i18n } = useTranslation();
  const { gameSettings, updateGameSettings } = useGameSettings();

  const {
    allQuestions,
    currentRoundQuestions,
    currentQuestion,
    isLoading: isLoadingQuestionsFromHook,
    playedQuestions,
    index: currentQuestionIndexFromHook,
    loadQuestions: loadQuestionsFromHook,
    prepareRoundQuestions,
    advanceToNextQuestion,
    goToPreviousQuestion,
    setPlayedQuestions: setPlayedQuestionsFromHook,
    resetQuestions: resetQuestionsFromHook
  } = useQuestions(gameSettings);

  const [gameStep, setGameStep] = useState<GameStep>('intro');
  const [questionStats, setQuestionStats] = useState<Pick<QuestionStats, 'totalQuestions' | 'categories'>>({ totalQuestions: 0, categories: {} });
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

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
    } else {
      setQuestionStats({ totalQuestions: 0, categories: {} });
    }
  }, [currentRoundQuestions]);

  useEffect(() => {
    if (!isLoadingQuestionsFromHook && allQuestions.length === 0 && gameStep !== 'intro') {
      setErrorLoadingQuestions(t('error.noQuestionsLoaded'));
    } else {
      setErrorLoadingQuestions(null);
    }
  }, [isLoadingQuestionsFromHook, allQuestions, gameStep, t]);

  useEffect(() => {
    if (gameSettings.language && i18n.language !== gameSettings.language) {
      i18n.changeLanguage(gameSettings.language)
        .catch((err: unknown) => {
          console.error('Error changing language:', err);
        });
    }
  }, [gameSettings.language, i18n]);

  const handleStartGame = async () => {
    const success = await prepareRoundQuestions(gameSettings);
    if (success) {
      setGameStep('game');
      playSound('game_start');
    } else {
      setErrorLoadingQuestions(t('error.noQuestionsForRound'));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndexFromHook < currentRoundQuestions.length - 1) {
      advanceToNextQuestion();
      playSound('new_question');
    } else {
      setGameStep('intro');
      playSound('summary_fun');
    }
  };

  const handlePreviousQuestion = () => {
    goToPreviousQuestion();
  };

  const handleLanguageChange = (newLanguage: string) => {
    if (Object.keys(SUPPORTED_LANGUAGES).includes(newLanguage)) {
      updateGameSettings({ language: newLanguage as keyof typeof SUPPORTED_LANGUAGES });
    } else {
      console.warn(`Attempted to change to unsupported language: ${newLanguage}`);
      updateGameSettings({ language: 'en' });
    }
  };

  const handleTitleClick = () => {
    setGameStep('intro');
  };

  return (
    <GameContainer onTitleClick={handleTitleClick}>
      {gameStep === 'intro' && (
        <IntroScreen
          onStartGame={handleStartGame}
          gameSettings={gameSettings}
          onToggleSound={toggleSound}
          soundEnabled={soundEnabled}
          volume={volume}
          onVolumeChange={setVolume}
          isLoading={isLoadingQuestionsFromHook}
          nameBlameMode={false} 
          onToggleNameBlame={(checked: boolean) => console.log('Name blame toggled:', checked)}
          onOpenDebugPanel={() => console.log('Open debug panel')} 
          onOpenInfoModal={() => setShowInfoModal(true)} 
          mainButtonLabel={t('intro.start_game')}
        />
      )}
      
      {gameStep === 'game' && currentQuestion && (
        <QuestionScreen
          question={currentQuestion}
          totalQuestions={currentRoundQuestions.length}
          index={currentQuestionIndexFromHook}
          onNext={handleNextQuestion} // Corrected prop name
          onBack={handlePreviousQuestion} // Corrected prop name
          gameSettings={gameSettings}
          // Props from QuestionScreenProps that need to be supplied or handled:
          nameBlameMode={false} // Placeholder - this state needs to be managed in App.tsx or a new hook
          activePlayers={[]} // Placeholder - player state needs management
          currentPlayerIndex={0} // Placeholder - player state needs management
          onBlame={() => console.log("Blame action triggered")} // Placeholder - blame logic needed
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
