import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import useSound from './useSound';
import useQuestions from './useQuestions';
import useNameBlameSetup from './useNameBlameSetup';
import { SOUND_PATHS } from '../constants';
import { GameSettings, GameStep } from '../types';

interface UseGameStateOutput {
  step: GameStep;
  gameSettings: GameSettings;
  debugMode: boolean;
  isInfoModalOpen: boolean;
  setStep: (step: GameStep) => void;
  setGameSettings: (settings: GameSettings | ((prev: GameSettings) => GameSettings)) => void;
  setDebugMode: (value: boolean) => void;
  setIsInfoModalOpen: (value: boolean) => void;
  startRoulette: () => void;
  handleNextQuestion: () => void;
  handleBlame: (blamedPlayerName: string) => void;
  restart: () => void;
  resetAppData: () => void;
}

/**
 * Main game state management hook
 */
const useGameState = (initialGameSettings: GameSettings): UseGameStateOutput => {
  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>('blamegame-settings', initialGameSettings);
  const [step, setStep] = useState<GameStep>('intro');
  const [debugMode, setDebugMode] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  const { soundEnabled, playSound } = useSound();
  
  const {
    allQuestions,
    currentRoundQuestions,
    currentQuestion,
    isLoading,
    csvError,
    playedQuestions,
    selectedCategories,
    index,
    prepareRoundQuestions,
    advanceToNextQuestion,
    goToPreviousQuestion,
    setPlayedQuestions,
    resetQuestions
  } = useQuestions(gameSettings);
  
  const {
    players,
    nameBlameMode,
    currentPlayerIndex,
    nameBlameLog,
    advancePlayer,
    recordNameBlame,
    hasValidPlayerSetup,
    resetPlayers,
    resetNameBlameLog,
    getActivePlayers
  } = useNameBlameSetup();

  // Start the roulette animation and prepare the game
  const startRoulette = useCallback(async () => {
    if (isLoading) {
      return;
    }
    
    if (nameBlameMode && !hasValidPlayerSetup()) {
      setStep('playerSetup');
      return;
    }

    playSound(SOUND_PATHS.ROUND_START);
    setStep('roulette');
    
    // Start quote rotation
    setQuoteIndex(0);
    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % 25); // Number of quotes
    }, gameSettings.loadingQuoteIntervalMs);

    // Prepare questions and transition to game after animation
    setTimeout(async () => {
      clearInterval(quoteTimer);
      const success = await prepareRoundQuestions(gameSettings);
      if (success) {
        setStep('game');
      } else {
        setStep('intro');
      }
    }, gameSettings.rouletteDurationMs);
  }, [
    isLoading, 
    nameBlameMode, 
    hasValidPlayerSetup, 
    playSound, 
    gameSettings, 
    prepareRoundQuestions
  ]);

  // Handle advancing to the next question
  const handleNextQuestion = useCallback(() => {
    if (index < currentRoundQuestions.length - 1) {
      advanceToNextQuestion();
      playSound(SOUND_PATHS.NEW_QUESTION);
      if (nameBlameMode) {
        advancePlayer();
      }
    } else {
      // End of round
      const newlyPlayedQuestions = currentRoundQuestions.map(q => q.text);
      setPlayedQuestions(prevPlayed => {
        const updatedPlayed = [...new Set([...prevPlayed, ...newlyPlayedQuestions])];
        return updatedPlayed;
      });
      playSound(SOUND_PATHS.SUMMARY_FUN);
      setStep('summary');
    }
  }, [
    index, 
    currentRoundQuestions, 
    advanceToNextQuestion, 
    playSound, 
    nameBlameMode, 
    advancePlayer, 
    setPlayedQuestions
  ]);

  // Handle blaming a player in NameBlame mode
  const handleBlame = useCallback((blamedPlayerName: string) => {
    if (!currentQuestion || !nameBlameMode) return;

    const activePlayers = getActivePlayers();
    const blamingPlayer = activePlayers[currentPlayerIndex];
    if (!blamingPlayer || !blamingPlayer.name) return;

    recordNameBlame(blamingPlayer.name, blamedPlayerName, currentQuestion.text);
    handleNextQuestion();
  }, [
    currentQuestion, 
    nameBlameMode, 
    getActivePlayers, 
    currentPlayerIndex, 
    recordNameBlame, 
    handleNextQuestion
  ]);

  // Restart the game
  const restart = useCallback(() => {
    resetQuestions();
    setStep('intro');
  }, [resetQuestions]);

  // Reset all app data
  const resetAppData = useCallback(() => {
    setPlayedQuestions([]);
    resetPlayers();
    resetNameBlameLog();
    setGameSettings(initialGameSettings);
    setStep('intro');
    alert('App-Daten wurden zurückgesetzt.');
  }, [
    setPlayedQuestions, 
    resetPlayers, 
    resetNameBlameLog, 
    setGameSettings, 
    initialGameSettings
  ]);

  return {
    step,
    gameSettings,
    debugMode,
    isInfoModalOpen,
    setStep,
    setGameSettings,
    setDebugMode,
    setIsInfoModalOpen,
    startRoulette,
    handleNextQuestion,
    handleBlame,
    restart,
    resetAppData
  };
};

export default useGameState;
