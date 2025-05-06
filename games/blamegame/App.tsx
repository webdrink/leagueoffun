import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from './components/ui/button';
import { WrenchIcon, InfoIcon } from 'lucide-react';

// Import custom hooks
import useSound from './hooks/useSound';
import useQuestions from './hooks/useQuestions';
import useNameBlameSetup from './hooks/useNameBlameSetup';
import useLocalStorage from './hooks/useLocalStorage';

// Import components
import DebugPanel from './components/DebugPanel';
import InfoModal from './components/InfoModal';
import IntroScreen from './components/IntroScreen';
import PlayerSetupScreen from './components/PlayerSetupScreen';
import LoadingContainer from './components/LoadingContainer';
import QuestionScreen from './components/QuestionScreen';
import SummaryScreen from './components/SummaryScreen';
import ErrorDisplay from './components/ErrorDisplay';

// Import constants and types
import { LOADING_QUOTES, SOUND_PATHS, initialGameSettings } from './constants';
import { GameStep, QuestionStats } from './types';

// Import utilities
import { getEmoji } from './utils';

// Import CSS
import './index.css';

function App() {
  // Sound management
  const { soundEnabled, toggleSound, playSound, volume, setVolume } = useSound();
  
  // Game state
  const [step, setStep] = useState<GameStep>('intro');
  const [debugMode, setDebugMode] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [gameSettings, setGameSettings] = useLocalStorage('blamegame-settings', initialGameSettings);
  
  // Questions management
  const questionsManager = useQuestions(gameSettings);
  
  // Player management for NameBlame mode
  const playerManager = useNameBlameSetup();
  
  // Local component state
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  
  // Question statistics for the debug panel
  const questionStats: QuestionStats = {
    totalQuestions: questionsManager.allQuestions.length,
    playedQuestions: questionsManager.playedQuestions.length,
    availableQuestions: questionsManager.allQuestions.filter(q => !questionsManager.playedQuestions.includes(q.text)).length,
    categories: questionsManager.allQuestions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  // Start the roulette animation
  const handleStartRoulette = () => {
    if (playerManager.nameBlameMode && !playerManager.hasValidPlayerSetup()) {
      setStep('playerSetup');
      return;
    }
    
    playSound(SOUND_PATHS.ROUND_START);
    setStep('roulette');
    
    // Start the loading quote rotation
    setQuoteIndex(0);
    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % LOADING_QUOTES.length);
    }, gameSettings.loadingQuoteIntervalMs);
    
    // After animation, prepare questions for the game
    setTimeout(async () => {
      clearInterval(quoteTimer);
      const success = await questionsManager.prepareRoundQuestions(gameSettings);
      if (success) {
        setStep('game');
      } else {
        setStep('intro');
      }
    }, gameSettings.rouletteDurationMs);
  };
  
  // Handle advancing to the next question
  const handleNextQuestion = () => {
    if (questionsManager.index < questionsManager.currentRoundQuestions.length - 1) {
      questionsManager.advanceToNextQuestion();
      playSound(SOUND_PATHS.NEW_QUESTION);
      if (playerManager.nameBlameMode) {
        playerManager.advancePlayer();
      }
    } else {
      // End of round, update played questions and show summary
      const newlyPlayedQuestions = questionsManager.currentRoundQuestions.map(q => q.text);
      questionsManager.setPlayedQuestions(prevPlayed => {
        const updatedPlayed = [...new Set([...prevPlayed, ...newlyPlayedQuestions])];
        return updatedPlayed;
      });
      playSound(SOUND_PATHS.SUMMARY_FUN);
      setStep('summary');
    }
  };
  
  // Handle blaming a player in NameBlame mode
  const handleBlame = (blamedPlayerName: string) => {
    if (!questionsManager.currentQuestion || !playerManager.nameBlameMode) return;

    const activePlayers = playerManager.getActivePlayers();
    const blamingPlayer = activePlayers[playerManager.currentPlayerIndex];
    if (!blamingPlayer || !blamingPlayer.name) return;

    playerManager.recordNameBlame(
      blamingPlayer.name, 
      blamedPlayerName, 
      questionsManager.currentQuestion.text
    );
    handleNextQuestion();
  };
  
  // Reset the game for a new round
  const handleRestart = () => {
    questionsManager.resetQuestions();
    setStep('intro');
  };
  
  // Reset all app data
  const handleResetAppData = () => {
    questionsManager.setPlayedQuestions([]);
    playerManager.resetPlayers();
    playerManager.resetNameBlameLog();
    setGameSettings(initialGameSettings);
    setStep('intro');
    alert('App-Daten wurden zurückgesetzt.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-500 to-pink-300 flex flex-col items-center justify-between py-4 px-4">
      {/* Debug/Info buttons moved to IntroScreen */}
      
      {/* Debug Panel */}
      {debugMode && (
        <DebugPanel
          gameSettings={gameSettings}
          setGameSettings={setGameSettings}
          defaultGameSettings={initialGameSettings}
          onClose={() => setDebugMode(false)}
          questionStats={questionStats}
        />
      )}

      {/* Game title */}
      <div className="text-center mb-4">
        <h1 className="text-white text-5xl font-bold shadow-md bg-purple-800 rounded-xl px-6 py-2">
          TheBlameGame
        </h1>
      </div>

      {/* Game screen transitions */}
      <div className="w-full max-w-md flex-grow flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {step === 'intro' && (
            <IntroScreen
              gameSettings={gameSettings}
              isLoading={questionsManager.isLoading}
              csvError={questionsManager.csvError}
              nameBlameMode={playerManager.nameBlameMode}
              soundEnabled={soundEnabled}
              onStartGame={handleStartRoulette}
              onToggleNameBlame={checked => playerManager.setNameBlameMode(checked)}
              onToggleSound={toggleSound}
              onVolumeChange={setVolume}
              volume={volume}
              onOpenDebugPanel={() => setDebugMode(true)}
              onOpenInfoModal={() => setIsInfoModalOpen(true)}
            />
          )}

          {/* Player Setup Screen */}
          {step === 'playerSetup' && playerManager.nameBlameMode && (
            <PlayerSetupScreen
              players={playerManager.players}
              tempPlayerName={playerManager.tempPlayerName}
              nameInputError={playerManager.nameInputError}
              onPlayerNameChange={playerManager.handlePlayerNameChange}
              onRemovePlayer={playerManager.removePlayer}
              onTempPlayerNameChange={playerManager.setTempPlayerName}
              onAddPlayer={playerManager.addPlayer}
              onStartGame={handleStartRoulette}
              onBackToIntro={() => setStep('intro')}
            />
          )}

          {/* Roulette Screen */}
          {step === 'roulette' && (
            <LoadingContainer
              categories={Array.from(new Set(questionsManager.allQuestions.map(q => q.category)))}
              getEmoji={getEmoji}
              loadingQuotes={LOADING_QUOTES}
              settings={{
                loadingQuoteSpringStiffness: 120,
                loadingQuoteSpringDamping: 10,
                loadingQuoteTransitionDurationSec: 0.2,
                cardFallDistance: -200,
                cardFallStaggerDelaySec: 0.2,
                cardStackOffsetY: -8,
              }}
            />
          )}

          {/* Question Screen */}
          {step === 'game' && questionsManager.currentQuestion && (
            <QuestionScreen
              question={questionsManager.currentQuestion}
              index={questionsManager.index}
              totalQuestions={questionsManager.currentRoundQuestions.length}
              gameSettings={gameSettings}
              nameBlameMode={playerManager.nameBlameMode}
              activePlayers={playerManager.getActivePlayers()}
              currentPlayerIndex={playerManager.currentPlayerIndex}
              onBlame={handleBlame}
              onNext={handleNextQuestion}
              onBack={questionsManager.goToPreviousQuestion}
            />
          )}

          {/* Summary Screen */}
          {step === 'summary' && (
            <SummaryScreen
              nameBlameMode={playerManager.nameBlameMode}
              nameBlameLog={playerManager.nameBlameLog}
              questionsAnswered={questionsManager.currentRoundQuestions.length}
              onRestart={handleRestart}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Error display */}
      {questionsManager.csvError && (
        <ErrorDisplay message={questionsManager.csvError} />
      )}
      
      {/* Info modal */}
      <InfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
        onResetAppData={handleResetAppData}
      />
      <footer className="mt-6 text-white text-xs">© 2025 Blame Game</footer>
    </div>
  );
}

export default App;
