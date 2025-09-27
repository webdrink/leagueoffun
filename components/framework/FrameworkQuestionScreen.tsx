/**
 * FrameworkQuestionScreen
 * Framework-compatible version of QuestionScreen for the play phase.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { Button } from '../core/Button';
import useTranslation from '../../hooks/useTranslation';
import { useProviderState } from '../../hooks/useProviderState';
import { useGameSettings } from '../../hooks/useGameSettings';
import useNameBlameSetup from '../../hooks/useNameBlameSetup';

const FrameworkQuestionScreen: React.FC = () => {
  // ProgressBar subcomponent to avoid inline style width lint violation
  const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => {
    const fillRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (fillRef.current) {
        fillRef.current.style.width = `${Math.min(100, Math.max(0, Math.round(percent)))}%`;
      }
    }, [percent]);
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2 overflow-hidden" aria-hidden="true">
        <div
          ref={fillRef}
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
        />
      </div>
    );
  };
  const { dispatch } = useFrameworkRouter();
  const { t } = useTranslation();
  
  const { gameSettings } = useGameSettings();
  const isNameBlameMode = gameSettings.gameMode === 'nameBlame';

  // Get actual players from shared NameBlame setup hook
  const { getActivePlayers, currentPlayerIndex, advancePlayer, recordNameBlame } = useNameBlameSetup();
  
  // Get active players (with non-empty names) for blame selection
  const players = useMemo(() => {
    return isNameBlameMode ? getActivePlayers() : [];
  }, [isNameBlameMode, getActivePlayers]);
  
  // Get current active player for self-blame prevention
  const currentPlayer = useMemo(() => {
    if (!isNameBlameMode || players.length === 0) return null;
    return players[currentPlayerIndex % players.length] || null;
  }, [isNameBlameMode, players, currentPlayerIndex]);
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  
  // Reactive provider state
  const { currentQuestion, progress, isLoading, refreshState } = useProviderState();

  // Ensure initial state is loaded (safeguard if hook missed first event)
  useEffect(() => {
    if (!currentQuestion && isLoading) {
      refreshState();
    }
  }, [currentQuestion, isLoading, refreshState]);
  
  const handlePlayerSelect = (playerName: string) => {
    if (!isNameBlameMode) return; // Guard: only valid in NameBlame mode
    
    // Prevent self-blame
    if (currentPlayer && playerName === currentPlayer.name) {
      console.log('Player tried to blame themselves - blocked');
      return;
    }
    
    setSelectedPlayer(playerName);
    dispatch(GameAction.SELECT_TARGET, { target: playerName });
    
    // Record the blame action
    if (currentPlayer && currentQuestion) {
      recordNameBlame(currentPlayer.name, playerName, currentQuestion.text);
    }
    
    setIsRevealing(true);
  };

  const handleAdvance = () => {
    // In NameBlame mode, advance to the blamed player
    if (isNameBlameMode && selectedPlayer) {
      // Find the blamed player's index and set them as current
      const blamedPlayerIndex = players.findIndex(p => p.name === selectedPlayer);
      if (blamedPlayerIndex !== -1) {
        // Update current player to the blamed player for next question
        advancePlayer(); // This will rotate to next player
        console.log(`Advanced to player: ${selectedPlayer}`);
      }
    }
    
    dispatch(GameAction.ADVANCE);
    setSelectedPlayer(null);
    setIsRevealing(false);
  };

  const handlePrevious = () => {
    dispatch(GameAction.BACK);
  };

  if (!currentQuestion || !progress) {
    // Loading state relies on global GameShell background; center content only
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-white text-center drop-shadow-sm">
          <p className="text-xl font-semibold">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl flex flex-col ${
          isNameBlameMode 
            ? 'h-[55vh] min-h-[420px] lg:h-[65vh] lg:min-h-[500px] xl:h-[70vh] xl:min-h-[550px]' 
            : 'h-[42vh] min-h-[300px] lg:h-[50vh] lg:min-h-[350px] xl:h-[55vh] xl:min-h-[400px]'
        }`}
      >
        {/* Progress Only Header (no back arrow) - Fixed height */}
        <div className="flex flex-col items-center mb-3 lg:mb-4 xl:mb-6 flex-shrink-0 h-14 lg:h-16" data-testid="question-header">
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400" data-debug-progress data-testid="progress-fallback">
            Frage {progress.index + 1} von {progress.total}
          </p>
          <ProgressBar percent={((progress.index + 1) / progress.total) * 100} />
        </div>

        {/* Question Content: emoji -> badge -> text (flex-1 to fill available space) */}
        <div className="text-center flex-1 flex flex-col items-center justify-center min-h-0" data-testid="question-container">
          {currentQuestion.categoryEmoji && (
            <div className="mb-3 lg:mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl select-none leading-none flex-shrink-0" aria-hidden="true" data-testid="question-emoji">
              {currentQuestion.categoryEmoji}
            </div>
          )}
          {(currentQuestion.categoryName || currentQuestion.categoryEmoji) && (
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium mb-2 lg:mb-3 flex-shrink-0" data-testid="category-badge">
              {currentQuestion.categoryEmoji && <span>{currentQuestion.categoryEmoji}</span>}
              <span>{currentQuestion.categoryName}</span>
            </div>
          )}
          <motion.div
            key={currentQuestion.text}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex items-center justify-center min-h-0 w-full overflow-hidden"
          >
            <h1 className={`
              font-bold text-purple-800 dark:text-purple-200 leading-tight text-center break-words hyphens-auto
              ${currentQuestion.text.length > 150 ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl' : 
                currentQuestion.text.length > 100 ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl' :
                currentQuestion.text.length > 50 ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl' :
                'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'}
            `} 
                data-testid="question-text">
              {currentQuestion.text}
            </h1>
          </motion.div>
        </div>

        {/* Bottom stack: pin to bottom to maximize space for the question */}
        <div className="mt-auto w-full">
          {/* Blame Reveal */}
          {isNameBlameMode && (
            isRevealing && selectedPlayer ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 mb-3 text-center border-2 border-purple-200 dark:border-purple-700"
              >
                <h3 className="text-sm font-bold text-purple-800 dark:text-purple-200 mb-1">
                  {t('question.blame_revealed')}
                </h3>
                <p className="text-purple-600 dark:text-purple-300 text-xs">
                  <span className="font-bold text-pink-600 dark:text-pink-400">{selectedPlayer}</span> {t('question.was_blamed')}
                </p>
              </motion.div>
            ) : null
          )}

          {/* Navigation / Advancement Controls */}
          <div className="h-12 lg:h-14 flex items-center mb-4 lg:mb-6">
            {isNameBlameMode ? (
              isRevealing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                  <Button
                    onClick={handleAdvance}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg h-12 lg:h-14 text-sm lg:text-base"
                    data-testid="next-button"
                  >
                    {progress.index + 1 < progress.total
                      ? (t('question.next_question') || 'Weiter')
                      : (t('question.view_results') || 'Ergebnisse')}
                  </Button>
                </motion.div>
              ) : (
                <div className="w-full h-12 lg:h-14" />
              )
            ) : (
              <div className="flex items-stretch gap-4 w-full" data-testid="classic-controls">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="w-1/3 h-12 lg:h-14 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-purple-600 dark:text-purple-400 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm lg:text-base"
                  disabled={progress.index === 0}
                  data-testid="classic-back"
                >
                  {t('common.back') || 'Zurück'}
                </Button>
                <Button
                  onClick={handleAdvance}
                  className="w-2/3 h-12 lg:h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
                  data-testid="classic-next"
                >
                  {progress.index + 1 < progress.total
                    ? (t('question.next_question') || 'Weiter')
                    : (t('question.view_results') || 'Ergebnisse')}
                </Button>
              </div>
            )}
          </div>

          {/* Player Selection - moved to bottom, only in NameBlame mode */}
          {isNameBlameMode && !isRevealing && (
            <div className="mb-0">
              <div className="text-center mb-3 lg:mb-4">
                <h3 className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300">
                  {t('question.select_player') || 'Wähle einen Spieler'}
                </h3>
                {/* Removed textual current player label; the crown on the disabled button is the indicator */}
              </div>
              <div className={`grid gap-3 lg:gap-4 ${
                players.length <= 2 ? 'grid-cols-2' : 
                players.length <= 4 ? 'grid-cols-2 lg:grid-cols-4' :
                players.length <= 6 ? 'grid-cols-2 lg:grid-cols-3' :
                'grid-cols-2 lg:grid-cols-4'
              }`} data-testid="player-selection">
                {players.map((player) => {
                  const isCurrentPlayer = currentPlayer && player.name === currentPlayer.name;
                  const isDisabled = !!isCurrentPlayer;

                  return (
                    <Button
                      key={player.id}
                      onClick={() => handlePlayerSelect(player.name)}
                      disabled={isDisabled}
                      className={`
                        ${isCurrentPlayer
                          ? 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                        }
                        border-0 py-2.5 lg:py-3 px-3 lg:px-4 rounded-xl transition-all duration-200 transform text-sm lg:text-base font-semibold min-h-[48px] lg:min-h-[56px]
                      `}
                      data-testid={`player-btn-${player.name.toLowerCase()}`}
                      title={isCurrentPlayer ? `${player.name} (Current Player - Cannot blame self)` : `Blame ${player.name}`}
                    >
                      {isCurrentPlayer ? `👑 ${player.name}` : player.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FrameworkQuestionScreen;