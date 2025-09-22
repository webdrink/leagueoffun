/**
 * FrameworkQuestionScreen
 * Framework-compatible version of QuestionScreen for the play phase.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { Button } from '../core/Button';
import { ArrowRight } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { useProviderState } from '../../hooks/useProviderState';
import { useGameSettings } from '../../hooks/useGameSettings';

const FrameworkQuestionScreen: React.FC = () => {
  const { dispatch } = useFrameworkRouter();
  const { t } = useTranslation();
  
  const { gameSettings } = useGameSettings();
  const isNameBlameMode = gameSettings.gameMode === 'nameBlame';

  // TODO: Replace mock players with actual stored players via a future player store integration
  const [mockPlayers] = useState(
    () => [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
      { id: '4', name: 'Diana' }
    ]
  );
  
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
    setSelectedPlayer(playerName);
    dispatch(GameAction.SELECT_TARGET, { target: playerName });
    setIsRevealing(true);
  };

  const handleAdvance = () => {
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
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl flex flex-col"
      >
        {/* Progress Only Header (no back arrow) */}
        <div className="flex flex-col items-center mb-4" data-testid="question-header">
          <p className="text-sm text-gray-600" data-debug-progress data-testid="progress-fallback">
            Frage {progress.index + 1} von {progress.total}
          </p>
          <div className="w-40 bg-gray-200 rounded-full h-2 mt-2">
            {(() => {
              const percent = Math.round(((progress.index + 1) / progress.total) * 100);
              return (
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              );
            })()}
          </div>
        </div>

        {/* Question Content: emoji -> badge -> text */}
        <div className="text-center mb-6 flex flex-col items-center" data-testid="question-container">
          {currentQuestion.categoryEmoji && (
            <div className="mb-3 text-5xl sm:text-6xl select-none leading-none" aria-hidden="true" data-testid="question-emoji">
              {currentQuestion.categoryEmoji}
            </div>
          )}
          {(currentQuestion.categoryName || currentQuestion.categoryEmoji) && (
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium mb-4" data-testid="category-badge">
              {currentQuestion.categoryEmoji && <span>{currentQuestion.categoryEmoji}</span>}
              <span>{currentQuestion.categoryName}</span>
            </div>
          )}
          <motion.h1
            key={currentQuestion.text}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="text-2xl md:text-3xl font-bold text-purple-800 mb-2 leading-snug" 
            data-testid="question-text"
          >
            {currentQuestion.text}
          </motion.h1>
        </div>

        {/* Blame Reveal */}
        {isRevealing && selectedPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 text-center border-2 border-purple-200"
          >
            <h3 className="text-lg font-bold text-purple-800 mb-2">
              {t('question.blame_revealed')}
            </h3>
            <p className="text-purple-600">
              <span className="font-bold text-pink-600">{selectedPlayer}</span> {t('question.was_blamed')}
            </p>
          </motion.div>
        )}

        {/* Player Selection - only in NameBlame mode */}
        {isNameBlameMode && !isRevealing && (
          <div className="mb-6">
            <h3 className="text-center text-lg font-medium text-gray-700 mb-4">
              {t('question.select_player') || 'Select Player'}
            </h3>
            <div className="grid grid-cols-2 gap-3" data-testid="player-selection">
              {mockPlayers.map((player) => (
                <Button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player.name)}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800 border border-purple-200 py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                  data-testid={`player-btn-${player.name.toLowerCase()}`}
                >
                  {player.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation / Advancement Controls */}
        {isNameBlameMode ? (
          // NameBlame: show NEXT only when revealing (after selection)
          isRevealing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
              <Button
                onClick={handleAdvance}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                data-testid="next-button"
              >
                {progress.index + 1 < progress.total 
                  ? (t('question.next_question') || 'Next') 
                  : (t('question.view_results') || 'Results')}
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </motion.div>
          )
        ) : (
          // Classic Mode: Always show next/back inline (simple browsing)
          <div className="mt-2 flex items-center justify-between gap-4" data-testid="classic-controls">
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="flex-1"
              disabled={progress.index === 0}
              data-testid="classic-back"
            >
              {t('common.back') || 'Back'}
            </Button>
            <Button
              onClick={handleAdvance}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
              data-testid="classic-next"
            >
              {progress.index + 1 < progress.total 
                ? (t('question.next_question') || 'Next') 
                : (t('question.view_results') || 'Results')}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FrameworkQuestionScreen;