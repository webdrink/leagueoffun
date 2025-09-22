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
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl flex flex-col ${
          isNameBlameMode ? 'h-[55vh] min-h-[420px]' : 'h-[42vh] min-h-[300px]'
        }`}
      >
        {/* Progress Only Header (no back arrow) - Fixed height */}
        <div className="flex flex-col items-center mb-3 flex-shrink-0 h-14" data-testid="question-header">
          <p className="text-sm text-gray-600 dark:text-gray-400" data-debug-progress data-testid="progress-fallback">
            Frage {progress.index + 1} von {progress.total}
          </p>
          <ProgressBar percent={((progress.index + 1) / progress.total) * 100} />
        </div>

        {/* Question Content: emoji -> badge -> text (flex-1 to fill available space) */}
        <div className="text-center flex-1 flex flex-col items-center justify-center min-h-0" data-testid="question-container">
          {currentQuestion.categoryEmoji && (
            <div className="mb-3 text-4xl sm:text-5xl md:text-6xl select-none leading-none flex-shrink-0" aria-hidden="true" data-testid="question-emoji">
              {currentQuestion.categoryEmoji}
            </div>
          )}
          {(currentQuestion.categoryName || currentQuestion.categoryEmoji) && (
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-3 py-1 rounded-full text-xs font-medium mb-2 flex-shrink-0" data-testid="category-badge">
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
              ${currentQuestion.text.length > 150 ? 'text-lg sm:text-xl md:text-2xl' : 
                currentQuestion.text.length > 100 ? 'text-xl sm:text-2xl md:text-3xl' :
                currentQuestion.text.length > 50 ? 'text-2xl sm:text-3xl md:text-4xl' :
                'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'}
            `} 
                data-testid="question-text">
              {currentQuestion.text}
            </h1>
          </motion.div>
        </div>

        {/* Blame Reveal - Fixed height, always allocated in NameBlame mode */}
        {isNameBlameMode ? (
          isRevealing && selectedPlayer ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 mb-3 text-center border-2 border-purple-200 dark:border-purple-700 flex-shrink-0 h-20 flex flex-col justify-center"
            >
              <h3 className="text-sm font-bold text-purple-800 dark:text-purple-200 mb-1">
                {t('question.blame_revealed')}
              </h3>
              <p className="text-purple-600 dark:text-purple-300 text-xs">
                <span className="font-bold text-pink-600 dark:text-pink-400">{selectedPlayer}</span> {t('question.was_blamed')}
              </p>
            </motion.div>
          ) : (
            // Empty placeholder to maintain consistent height
            <div className="flex-shrink-0 mb-3 h-20"></div>
          )
        ) : null}

        {/* Player Selection - only in NameBlame mode - Fixed height */}
        {isNameBlameMode ? (
          !isRevealing ? (
            <div className="flex-shrink-0 mb-3 h-28">
              <div className="text-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('question.select_player') || 'Select Player'}
                </h3>
                {currentPlayer && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    👑 Current Player: <span className="font-semibold">{currentPlayer.name}</span>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2" data-testid="player-selection">
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
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-700 dark:hover:to-pink-700 text-purple-800 dark:text-purple-200 hover:scale-105'
                        }
                        border border-purple-200 dark:border-purple-600 py-1.5 px-2 rounded-lg transition-all duration-200 transform text-xs font-medium
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
          ) : (
            // Empty placeholder to maintain consistent height when revealing in NameBlame mode
            <div className="flex-shrink-0 mb-3 h-28"></div>
          )
        ) : null}

        {/* Navigation / Advancement Controls - Fixed height */}
        <div className="flex-shrink-0 mt-4 h-12 flex items-center">
          {isNameBlameMode ? (
            // NameBlame: show NEXT only when revealing (after selection), or empty space to maintain height
            isRevealing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                <Button
                  onClick={handleAdvance}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg h-12"
                  data-testid="next-button"
                >
                  {progress.index + 1 < progress.total 
                    ? (t('question.next_question') || 'Next') 
                    : (t('question.view_results') || 'Results')}
                </Button>
              </motion.div>
            ) : (
              // Empty placeholder to maintain consistent height
              <div className="w-full h-12"></div>
            )
          ) : (
            // Classic Mode: Always show next/back inline (back: 1/3, forward: 2/3 width)
            <div className="flex items-stretch gap-4 w-full" data-testid="classic-controls">
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="w-1/3 h-12 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                disabled={progress.index === 0}
                data-testid="classic-back"
              >
                {t('common.back') || 'Back'}
              </Button>
              <Button
                onClick={handleAdvance}
                className="w-2/3 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                data-testid="classic-next"
              >
                {progress.index + 1 < progress.total 
                  ? (t('question.next_question') || 'Next') 
                  : (t('question.view_results') || 'Results')}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FrameworkQuestionScreen;