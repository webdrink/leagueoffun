/**
 * FrameworkQuestionScreen
 * Framework-compatible version of QuestionScreen for the play phase.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { Button } from '../core/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { getProvider } from '../../games/nameblame/NameBlameModule';

const FrameworkQuestionScreen: React.FC = () => {
  const { dispatch } = useFrameworkRouter();
  const { t } = useTranslation();
  
  // Mock players for now - in a full implementation, this would come from a store or context
  const [mockPlayers] = useState([
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
    { id: '4', name: 'Diana' }
  ]);
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  
  // Get current question from provider
  const provider = getProvider();
  const currentQuestion = provider?.current();
  const progress = provider?.progress();
  
  const handlePlayerSelect = (playerName: string) => {
    setSelectedPlayer(playerName);
    dispatch(GameAction.SELECT_TARGET, { target: playerName });
    setIsRevealing(true);
  };

  const handleNextQuestion = () => {
    dispatch(GameAction.ADVANCE);
    setSelectedPlayer(null);
    setIsRevealing(false);
  };

  const handlePrevious = () => {
    dispatch(GameAction.BACK);
  };

  if (!currentQuestion || !progress) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
        <div className="text-white text-center">
          <p className="text-xl">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="p-2"
            disabled={progress.index === 0}
          >
            <ArrowLeft size={20} />
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t('question.progress', { current: progress.index + 1, total: progress.total })}
            </p>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
              {(() => {
                const percent = Math.round(((progress.index + 1) / progress.total) * 100);
                // Use Tailwind arbitrary value syntax for width
                return (
                  <div
                    className={`bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 w-[${percent}%]`}
                  />
                );
              })()}
            </div>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <motion.h1
            key={currentQuestion.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-purple-800 mb-4"
          >
            {currentQuestion.text}
          </motion.h1>
          
          {currentQuestion.category && (
            <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              {currentQuestion.category}
            </div>
          )}
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

        {/* Player Selection */}
        {!isRevealing && (
          <div className="mb-6">
            <h3 className="text-center text-lg font-medium text-gray-700 mb-4">
              {t('question.select_player')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {mockPlayers.map((player) => (
                <Button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player.name)}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800 border border-purple-200 py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  {player.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Next Question Button */}
        {isRevealing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={handleNextQuestion}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
            >
              {progress.index + 1 < progress.total 
                ? t('question.next_question') 
                : t('question.view_results')
              }
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FrameworkQuestionScreen;