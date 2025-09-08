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

import { GameStep, QuestionStats, Player, SupportedLanguage } from './types';
import useSound from './hooks/useSound';
import { useGameSettings } from './hooks/useGameSettings';
import useQuestions from './hooks/useQuestions';
import useNameBlameSetup from './hooks/useNameBlameSetup';
import { preloadEssentialAssets } from './lib/utils/preloadUtils';

import IntroScreen from './components/game/IntroScreen';
import QuestionScreen from './components/game/QuestionScreen';
import PlayerSetupScreen from './components/game/PlayerSetupScreen';
import LoadingContainer from './components/game/LoadingContainer';
import InfoModal from './components/core/InfoModal';
import GameContainer from './components/game/GameContainer';
import LanguageChangeFeedback from './components/language/LanguageChangeFeedback';
import DebugPanel from './components/debug/DebugPanel';
import AssetDebugInfo from './components/debug/AssetDebugInfo';
import CategoryPickScreen from './components/game/CategoryPickScreen';
import SummaryScreen from './components/game/SummaryScreen';

import { SUPPORTED_LANGUAGES } from './hooks/utils/languageSupport';
import { LOADING_QUOTES, initialGameSettings } from './constants';
import { getCategoriesWithCounts } from './lib/utils/arrayUtils';
import { useBlameGameStore } from './store/BlameGameStore';

function App() {
  const { soundEnabled, toggleSound, playSound, volume, setVolume } = useSound();
  const { t, i18n } = useTranslation();
  const { gameSettings, updateGameSettings } = useGameSettings();

  const {
    allQuestions,
    currentRoundQuestions,
    currentQuestion,
    isLoading: isLoadingQuestions,
    isPreparingRound: _isPreparingRound, // Get the new round preparation state (unused)
    index: currentQuestionIndexFromHook,
    prepareRoundQuestions,
    advanceToNextQuestion,
    goToPreviousQuestion,
  } = useQuestions(gameSettings);
  const {
    players, // Player[]
    nameBlameMode, // Add this to access the NameBlame mode
    tempPlayerName,
    nameInputError,
    nameBlameLog, // Add this to access the blame log
    blameState, // Add this to access blame state
    setTempPlayerName,
    addPlayer,
    removePlayer,
    handlePlayerNameChange,
    recordNameBlame, // Add this function to record blames 
    updateBlameState, // Add this function to update blame state
    resetBlameState, // Add this function to reset blame state
  } = useNameBlameSetup();

  // Blame game store for enhanced progression
  const {
    startBlameRound,
  // getRemainingPlayersToBlame, (no longer needed in simplified flow)
  // completeBlameRound, (round concept simplified to single blame per question)
    recordBlame: recordBlameInStore,
    currentBlamed
  } = useBlameGameStore();

  const [gameStep, setGameStep] = useState<GameStep>('intro');
  const [questionStats, setQuestionStats] = useState<Pick<QuestionStats, 'totalQuestions' | 'categories'>>({ totalQuestions: 0, categories: {} });
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentLoadingQuote, setCurrentLoadingQuote] = useState<string>('');
  const [activeLoadingQuotes, setActiveLoadingQuotes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategoriesInfo, setAllCategoriesInfo] = useState<Array<{id: string; emoji: string; name: string; questionCount: number}>>([]);
  const [stablePlayerOrderForRound, setStablePlayerOrderForRound] = useState<Player[]>([]); // For NameBlame mode player turn consistency

  // State for debug panel
  const [showDebug, setShowDebug] = useState(false);

  const getEmoji = useCallback((categoryName: string): string => {
    // Find in current round first, then all questions as fallback
    let questionWithCategory = currentRoundQuestions.find(q => q.categoryName === categoryName);
    if (!questionWithCategory) {
      questionWithCategory = allQuestions.find(q => q.categoryName === categoryName);
    }
    return questionWithCategory?.categoryEmoji || '❓';
  }, [currentRoundQuestions, allQuestions]);
  
  // Memoized categories for the loading screen to prevent unnecessary re-renders
  const categoriesForLoading = React.useMemo(() => {
    if (gameStep !== 'loading') return [];

    // Prefer currentRoundQuestions when they are ready
    let sourceCategoryNames: string[] = [];
    if (currentRoundQuestions.length > 0) {
      sourceCategoryNames = currentRoundQuestions.map(q => q.categoryName || '').filter(Boolean) as string[];
    } else {
      // Fallback while questions are being prepared: use either selected categories (if any) or top categories from allQuestions
      if (selectedCategories.length > 0) {
        sourceCategoryNames = selectedCategories;
      } else if (allCategoriesInfo.length > 0) {
        sourceCategoryNames = allCategoriesInfo.map(c => c.name);
      }
    }

    const uniqueCategoryNames = Array.from(new Set(sourceCategoryNames)).slice(0, gameSettings.categoryCount);
    return uniqueCategoryNames.map(name => ({ name, emoji: getEmoji(name) }));
  }, [gameStep, currentRoundQuestions, selectedCategories, allCategoriesInfo, getEmoji, gameSettings.categoryCount]);

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

  // Preload essential assets on app initialization
  useEffect(() => {
    preloadEssentialAssets()
      .then(() => console.log('Essential assets preloaded'))
      .catch(err => console.error('Asset preloading failed:', err));
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    // When allQuestions are loaded, compile category info for the category picker
    if (allQuestions.length > 0) {
      setAllCategoriesInfo(getCategoriesWithCounts(allQuestions));
    }
  }, [allQuestions]);

  // Debug: Expose questions and categories to window for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Expose all questions for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gameQuestions = allQuestions;
      
      // Create categories array with questions grouped by category for testing
      const categoriesWithQuestions = allCategoriesInfo.map(cat => {
        const categoryQuestions = allQuestions
          .filter(q => q.categoryId === cat.id)
          .map(q => q.text);
        
        return {
          id: cat.id,
          name: cat.name,
          emoji: cat.emoji,
          questionCount: cat.questionCount,
          questions: categoryQuestions
        };
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gameCategories = categoriesWithQuestions;
      
      console.log('Debug: Exposed to window -', {
        gameQuestions: allQuestions.length,
        gameCategories: categoriesWithQuestions.length,
        totalQuestionsInCategories: categoriesWithQuestions.reduce((sum, cat) => sum + cat.questions.length, 0)
      });
    }
  }, [allQuestions, allCategoriesInfo]);

  useEffect(() => {
    if (!isLoadingQuestions && allQuestions.length === 0 && gameStep !== 'intro' && gameStep !== 'loading') {
      setErrorLoadingQuestions(t('error.noQuestionsLoaded'));
    } else if (allQuestions.length > 0 && errorLoadingQuestions === t('error.noQuestionsLoaded')) {
      setErrorLoadingQuestions(null);
    }
  }, [isLoadingQuestions, allQuestions, gameStep, t, errorLoadingQuestions]);

  useEffect(() => {
    if (gameStep === 'game') {
      const currentActivePlayers = players.filter(p => p.name.trim() !== '');
      // Only set if it\'s empty or if the player list/order has actually changed.
      // This prevents resetting the order (and potentially currentPlayerIndex) if this effect re-runs mid-game due to other dependencies.
      if (stablePlayerOrderForRound.length === 0 || JSON.stringify(stablePlayerOrderForRound.map(p=>p.id)) !== JSON.stringify(currentActivePlayers.map(p=>p.id))) {
        setStablePlayerOrderForRound(currentActivePlayers);
        console.log("Stable player order for round set to:", currentActivePlayers.map(p => p.name));
        // setCurrentPlayerIndex(0) is handled in handleStartGameFlow when a new game starts
      }
    } else if (gameStep === 'intro') {
      if (stablePlayerOrderForRound.length > 0) { // Only clear if not already empty
          setStablePlayerOrderForRound([]);
          console.log("Stable player order cleared (gameStep is intro).");
      }
    }
  }, [gameStep, players, stablePlayerOrderForRound]); // players dependency is important if player list can change before game starts

  useEffect(() => {
    if (gameSettings.language && i18n.language !== gameSettings.language) {
      i18n.changeLanguage(gameSettings.language)
        .catch((err: unknown) => {
          console.error('Error changing language:', err);
        });
    }
  }, [gameSettings.language, i18n]);

  useEffect(() => {
    if (activeLoadingQuotes.length > 0) {
      // Ensure we're accessing a valid index in the array
      const safeIndex = quoteIndex % activeLoadingQuotes.length;
      const quote = activeLoadingQuotes[safeIndex];
      // Ensure quote is a string, not a character
      setCurrentLoadingQuote(typeof quote === 'string' ? quote : '');
    } else {
      setCurrentLoadingQuote(''); // Or some default if no quotes are active
    }
  }, [quoteIndex, activeLoadingQuotes]);
  const handleStartGameFlow = async () => {
    // Check first if we're in "nameBlame" mode but don't have enough players
    if (gameSettings.gameMode === 'nameBlame' && players.filter(p => p.name.trim() !== '').length < 3) {
      setGameStep('playerSetup');
      return;
    }
    
    // Check if we should go to the category selection screen
    if (gameSettings.selectCategories && gameStep === 'intro') {
      setGameStep('categoryPick');
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
    
    // Use the predefined loading quotes from constants
    setActiveLoadingQuotes(LOADING_QUOTES);
    setQuoteIndex(0);
    
    // Set up the cycling of quotes during loading
    const quoteTimer = setInterval(() => {
      // Interval will now use activeLoadingQuotes via the useEffect dependency
      setQuoteIndex(prev => prev + 1);
    }, gameSettings.loadingQuoteIntervalMs || 2000);
    
    try {
      // Prepare questions for the round - this might take a moment
      console.log('Preparing round questions...');
      const success = await prepareRoundQuestions(gameSettings);
      
      // Handle the case where prepareRoundQuestions fails
      if (!success) { // Rely solely on the success flag
        clearInterval(quoteTimer);
        setGameStep('intro');
        setErrorLoadingQuestions(t('error.noQuestionsForRound'));
        return;
      }

      // Ensure we show the loading animation for at least the minimum time
      const minLoadingDuration = gameSettings.rouletteDurationMs || 3000;
      setTimeout(() => {
        clearInterval(quoteTimer);
        setGameStep('game'); // This will trigger the useEffect to set stablePlayerOrderForRound
        setCurrentPlayerIndex(0); // Initialize for the new round
        
        // Initialize blame round for NameBlame mode
        if (gameSettings.gameMode === 'nameBlame') {
          // Will be set up in the useEffect when stablePlayerOrderForRound is set
          console.log('🎯 NameBlame mode: Blame round will be initialized after player order is set');
        }
        
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
    const activePlayers = players.filter(p => p.name.trim() !== '');
    const minPlayersNeeded = gameSettings.gameMode === 'nameBlame' ? 3 : 2;
    
    if (activePlayers.length < minPlayersNeeded) {
      return;
    }
    handleStartGameFlow();
  };
  const handleNextQuestion = () => {
    console.log(`🎯 USER ACTION: Next question clicked - Current question: ${currentQuestionIndexFromHook + 1}/${currentRoundQuestions.length}, Mode: ${gameSettings.gameMode}`);
    
    if (currentQuestionIndexFromHook < currentRoundQuestions.length - 1) {
      advanceToNextQuestion();
      if (gameSettings.gameMode === 'nameBlame') {
        if (stablePlayerOrderForRound.length > 0) {
          const previousPlayerIndex = currentPlayerIndex;
          const nextPlayerIndex = (currentPlayerIndex + 1) % stablePlayerOrderForRound.length;
          setCurrentPlayerIndex(nextPlayerIndex);
          console.log(`🔄 PLAYER TURN SWITCH (NameBlame): ${stablePlayerOrderForRound[previousPlayerIndex]?.name} → ${stablePlayerOrderForRound[nextPlayerIndex]?.name} (index ${previousPlayerIndex} → ${nextPlayerIndex})`);
          console.log(`📊 Active players order:`, stablePlayerOrderForRound.map((p, i) => `${i}: ${p.name}`));
        } else {
          console.error("❌ ERROR: stablePlayerOrderForRound is empty in handleNextQuestion (NameBlame). Turn cannot advance correctly.");
          console.error("🔍 DEBUG INFO:", { 
            gameStep, 
            gameMode: gameSettings.gameMode, 
            playersCount: players.length, 
            currentPlayerIndex 
          });
        }
      } else {
        console.log(`➡️ CLASSIC MODE: Advanced to question ${currentQuestionIndexFromHook + 2}/${currentRoundQuestions.length}`);
      }
      playSound('new_question');
    } else {
      console.log(`🏁 GAME END: Reached final question, showing summary`);
      setGameStep('summary'); 
      playSound('summary_fun');
    }
  };

  const handlePreviousQuestion = () => {
    console.log(`🎯 USER ACTION: Previous question clicked - Current question: ${currentQuestionIndexFromHook + 1}/${currentRoundQuestions.length}, Mode: ${gameSettings.gameMode}`);
    
    goToPreviousQuestion();
    if (gameSettings.gameMode === 'nameBlame' && currentPlayerIndex > 0) {
      const previousPlayerIndex = currentPlayerIndex;
      const newPlayerIndex = previousPlayerIndex - 1;
      setCurrentPlayerIndex(newPlayerIndex);
      console.log(`🔄 PLAYER TURN REVERSE (NameBlame): ${stablePlayerOrderForRound[previousPlayerIndex]?.name} → ${stablePlayerOrderForRound[newPlayerIndex]?.name} (index ${previousPlayerIndex} → ${newPlayerIndex})`);
    } else if (gameSettings.gameMode === 'classic') {
      console.log(`⬅️ CLASSIC MODE: Went back to question ${currentQuestionIndexFromHook}/${currentRoundQuestions.length}`);
    }
  };

  const _handleLanguageChange = (newLanguage: SupportedLanguage) => {
    updateGameSettings({ language: newLanguage });
  };

  const handleTitleClick = () => {
    setGameStep('intro');
  };  const handleBlame = (blamedPlayerName: string) => {
    const currentQuestionText = currentQuestion?.text || 'Unknown question';
    console.log(`🎯 USER ACTION: Blame selected - Player blamed: "${blamedPlayerName}" for question: "${currentQuestionText}"`);
    
    // Edge case: Ensure game state is valid
    if (stablePlayerOrderForRound.length === 0) {
      console.error("❌ ERROR: stablePlayerOrderForRound is empty in handleBlame. This indicates a problem with game state setup. Reverting to intro.");
      console.error("🔍 DEBUG INFO:", { 
        gameStep, 
        gameMode: gameSettings.gameMode, 
        playersCount: players.length, 
        currentPlayerIndex 
      });
      setGameStep('intro'); 
      return;
    }

    // Edge case: Ensure sufficient players for NameBlame mode
    if (gameSettings.gameMode === 'nameBlame' && stablePlayerOrderForRound.length < 3) {
      console.error("❌ EDGE CASE: Insufficient players for NameBlame mode in handleBlame");
      setGameStep('playerSetup');
      return;
    }

    // Ensure currentPlayerIndex is valid for stablePlayerOrderForRound.
    const safeCurrentPlayerIndex = currentPlayerIndex % stablePlayerOrderForRound.length;
    const blamingPlayer = stablePlayerOrderForRound[safeCurrentPlayerIndex];

    // Edge case: Ensure blaming player exists
    if (!blamingPlayer) {
      console.error("❌ EDGE CASE: Could not identify blaming player in handleBlame");
      setGameStep('intro');
      return;
    }

    console.log(`👤 BLAME DETAILS: ${blamingPlayer?.name} (index ${safeCurrentPlayerIndex}) blamed ${blamedPlayerName}`);
    console.log(`📊 Current player order:`, stablePlayerOrderForRound.map((p, i) => `${i}${i === safeCurrentPlayerIndex ? '*' : ''}: ${p.name}`));

    if (blamingPlayer && currentQuestion) {
      // Record blame in both stores
      recordNameBlame(blamingPlayer.name, blamedPlayerName, currentQuestion.text);
      recordBlameInStore(blamingPlayer.name, blamedPlayerName, currentQuestion.text);
      
      console.log(`📝 BLAME RECORDED: ${blamingPlayer.name} → ${blamedPlayerName} for "${currentQuestion.text}"`);
      console.log(`🔍 DEBUG: nameBlameMode = ${nameBlameMode}, gameSettings.gameMode = ${gameSettings.gameMode}`);
      
      // Enhanced NameBlame flow - show notification and transition to 'reveal' phase
      if (gameSettings.gameMode === 'nameBlame') {
        // Only start a blame round once per question; detect by empty playersWhoBlamedThisQuestion and matching questionId
        const questionId = `q${currentQuestionIndexFromHook}-${currentQuestion.text.slice(0, 10)}`;
        const activePlayerNames = stablePlayerOrderForRound.map(p => p.name);
        const existingRoundQuestionId = useBlameGameStore.getState().currentQuestionId;
        if (!existingRoundQuestionId || existingRoundQuestionId !== questionId) {
          startBlameRound(questionId, activePlayerNames);
        }

        updateBlameState({
          phase: 'reveal',
          currentBlamer: blamingPlayer.name,
          currentBlamed: blamedPlayerName,
          currentQuestion: currentQuestion.text
        });
        console.log(`🎯 NAMEBLAME: Transitioning to 'reveal' phase - ${blamedPlayerName} was blamed by ${blamingPlayer.name}`);
        console.log(`🔍 DEBUG: Updated blame state to 'reveal' phase`);
        return; // Stay on the current question to show blame context
      } else {
        console.log(`❌ DEBUG: nameBlameMode is false, not transitioning to reveal phase`);
      }
    } else {
      console.error("❌ ERROR: Could not identify blaming player or current question in handleBlame.");
      console.error("🔍 DEBUG INFO:", { 
        blamingPlayer: blamingPlayer?.name, 
        currentQuestion: currentQuestion?.text, 
        safeCurrentPlayerIndex 
      });
    }
    
    // Classic mode behavior - only advance in classic mode
    if (gameSettings.gameMode === 'classic') {
      advanceToNextPlayer();
    }
  };
  
  // New function to handle "Next Blame" button in NameBlame mode
  const handleNextBlame = () => {
    console.log(`🎯 NAMEBLAME: Next Blame pressed (reveal acknowledged)`);
    console.log(`🔍 DEBUG: nameBlameMode = ${nameBlameMode}, gameSettings.gameMode = ${gameSettings.gameMode}`);
    if (stablePlayerOrderForRound.length === 0) {
      console.error('❌ EDGE CASE: No stable player order, returning to intro');
      setGameStep('intro');
      return;
    }
    if (gameSettings.gameMode === 'nameBlame') {
      const nextIndex = stablePlayerOrderForRound.findIndex(p => p.name === currentBlamed);
      if (nextIndex !== -1) {
        setCurrentPlayerIndex(nextIndex);
      }
      // Advance question immediately; blamed player becomes active on next question
      advanceToNextPlayer();
      resetBlameState();
      updateBlameState({ phase: 'selecting', currentBlamer: undefined, currentBlamed: undefined });
    } else {
      advanceToNextPlayer();
    }
  };
  
  // Enhanced player advancement for NameBlame flow
  const advanceToNextPlayer = () => {
    if (currentQuestionIndexFromHook < currentRoundQuestions.length - 1) {
      advanceToNextQuestion();
      
      // Reset blame round for the new question
      if (gameSettings.gameMode === 'nameBlame') {
        const nextQuestionIndex = currentQuestionIndexFromHook + 1;
        const nextQuestion = currentRoundQuestions[nextQuestionIndex];
        if (nextQuestion) {
          const questionId = `q${nextQuestionIndex}-${nextQuestion.text.slice(0, 10)}`;
          const activePlayerNames = stablePlayerOrderForRound.map(p => p.name);
          startBlameRound(questionId, activePlayerNames);
        }
        resetBlameState();
      }
      
      // Use stablePlayerOrderForRound for turn advancement
      const safeCurrentPlayerIndex = currentPlayerIndex % stablePlayerOrderForRound.length;
      const nextPlayerIndex = (safeCurrentPlayerIndex + 1) % stablePlayerOrderForRound.length;
      setCurrentPlayerIndex(nextPlayerIndex);
      
      console.log(`🔄 NEXT TURN: ${stablePlayerOrderForRound[safeCurrentPlayerIndex]?.name} → ${stablePlayerOrderForRound[nextPlayerIndex]?.name} (index ${safeCurrentPlayerIndex} → ${nextPlayerIndex})`);
      playSound('new_question');
    } else {
      console.log(`🏁 GAME END: Final question completed, showing summary`);
      if (gameSettings.gameMode === 'nameBlame') {
        resetBlameState();
      }
      setGameStep('summary');
      playSound('summary_fun');
    }
  };

  useEffect(() => {
    // When gameStep changes to 'game', if stablePlayerOrderForRound is not yet set for this round,
    // or if the players list from the hook has changed significantly (e.g. new game after setup)
    // capture the current active player order.
    // This also handles the initial game start.
    if (gameStep === 'game') {
      const currentActivePlayers = players.filter(p => p.name.trim() !== '');
      // Only update if the list is different to avoid unnecessary re-renders if players haven't changed.
      // A simple length check or stringify might be too naive for deep comparison if player objects change.
      // For now, we'll set it if it's empty or if gameStep just became 'game'.
      // A more robust check might involve comparing player IDs if they are stable.
      // Using JSON.stringify on IDs to check for changes in player list or order.
      const currentActivePlayerIds = JSON.stringify(currentActivePlayers.map(p => p.id));
      const stablePlayerIds = JSON.stringify(stablePlayerOrderForRound.map(p => p.id));
      
      if (currentActivePlayerIds !== stablePlayerIds) {
        setStablePlayerOrderForRound(currentActivePlayers);
        console.log('Stable player order for round set/updated:', currentActivePlayers.map(p => p.name));
        // Reset currentPlayerIndex if the order is being freshly set for a new game,
        // handleStartGameFlow already does this.
      }
    } else if (gameStep === 'intro') {
      // Clear stable order when returning to intro, so it's fresh for the next game.
      if (stablePlayerOrderForRound.length > 0) { // Only clear if not already empty
        setStablePlayerOrderForRound([]);
      }
    }
  }, [gameStep, players, stablePlayerOrderForRound]); // Added stablePlayerOrderForRound to dependencies to avoid stale closures if logic inside depended on it.

  // Initialize blame round when NameBlame game starts
  useEffect(() => {
    if (gameStep === 'game' && gameSettings.gameMode === 'nameBlame' && stablePlayerOrderForRound.length > 0 && currentQuestion) {
      const questionId = `q${currentQuestionIndexFromHook}-${currentQuestion.text.slice(0, 10)}`;
      const activePlayerNames = stablePlayerOrderForRound.map(p => p.name);
      startBlameRound(questionId, activePlayerNames);
      console.log('🎯 NameBlame blame round initialized for question:', questionId);
    }
  }, [gameStep, gameSettings.gameMode, stablePlayerOrderForRound, currentQuestion, currentQuestionIndexFromHook, startBlameRound]);

  return (
    <GameContainer onTitleClick={handleTitleClick}>
      
      <AnimatePresence mode="wait">
        {gameStep === 'intro' && (
          <IntroScreen
            gameSettings={gameSettings}
            isLoading={isLoadingQuestions}
            nameBlameMode={gameSettings.gameMode === 'nameBlame'}
            soundEnabled={soundEnabled}
            onStartGame={handleStartGameFlow}
            onToggleNameBlame={(checked) => updateGameSettings({ gameMode: checked ? 'nameBlame' : 'classic' })}
            onToggleSound={toggleSound}
            onVolumeChange={setVolume}
            volume={volume}
            onOpenDebugPanel={() => setShowDebug(true)}
            onOpenInfoModal={() => setShowInfoModal(true)}
            onUpdateGameSettings={updateGameSettings}
            errorLoadingQuestions={errorLoadingQuestions}
            supportedLanguages={{}}
            currentLanguage={gameSettings.language}
            onLanguageChange={(newLanguage) => updateGameSettings({ language: newLanguage })}
            questionStats={questionStats}
            showCategorySelectToggle={true}
            onToggleCategorySelect={(checked) => updateGameSettings({ selectCategories: checked })}
            onNameBlameModeChange={(enabled) => {
              if (enabled) {
                // Force navigation to setup screen when NameBlame is enabled
                setGameStep('playerSetup');
              }
            }}
          />
        )}

        {gameStep === 'playerSetup' && (
          <PlayerSetupScreen
            key="playerSetup"
            players={players} 
            tempPlayerName={tempPlayerName}
            nameInputError={nameInputError}
            nameBlameMode={gameSettings.gameMode === 'nameBlame'} // Pass nameBlameMode prop
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
            categoriesWithEmojis={categoriesForLoading} // Use the memoized value
            currentQuote={currentLoadingQuote}
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

        {gameStep === 'game' && currentQuestion && (gameSettings.gameMode !== 'nameBlame' || stablePlayerOrderForRound.length > 0) && (
          <QuestionScreen
            key="game"
            question={currentQuestion}
            index={currentQuestionIndexFromHook}
            totalQuestions={currentRoundQuestions.length}
            gameSettings={gameSettings}
            nameBlameMode={gameSettings.gameMode === 'nameBlame'}
            activePlayers={stablePlayerOrderForRound} 
            currentPlayerIndex={currentPlayerIndex} 
            onBlame={handleBlame} 
            onNext={handleNextQuestion}
            onBack={handlePreviousQuestion}
            onNextBlame={handleNextBlame}
            blameState={blameState}
          />
        )}        {gameStep === 'categoryPick' && (
          <CategoryPickScreen 
            allCategories={allCategoriesInfo}
            selectedCategories={selectedCategories}
            onSelectCategory={(categoryIds) => {
              setSelectedCategories(categoryIds);
              updateGameSettings({ selectedCategoryIds: categoryIds });
            }}
            onBack={() => setGameStep('intro')}
            onConfirm={() => {
              if (selectedCategories.length > 0) {
                updateGameSettings({ selectedCategoryIds: selectedCategories });
                handleStartGameFlow();
              }
            }}
            maxSelectable={gameSettings.categoryCount}
          />
        )}
        
        {gameStep === 'summary' && (
          <SummaryScreen 
            key="summary"
            nameBlameMode={gameSettings.gameMode === 'nameBlame'}
            nameBlameLog={nameBlameLog}
            questionsAnswered={currentRoundQuestions.length}
            onRestart={() => {
              setGameStep('intro');
            }}
            activePlayersCount={stablePlayerOrderForRound.length > 0 ? stablePlayerOrderForRound.length : players.filter(p => p.name.trim() !== '').length}
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
            availableQuestions: currentRoundQuestions.length,            categories: questionStats.categories
          }}
        />
      )}
      
      {/* Asset debug information - visible when debug panel is open */}
      <AssetDebugInfo show={showDebug} />
    </GameContainer>
  );
}

export default App;
