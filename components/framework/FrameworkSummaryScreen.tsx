/**
 * FrameworkSummaryScreen
 * Framework-compatible version of SummaryScreen for game results.
 * Uses GameShell for consistent layout and proper responsive design.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { Button } from '../core/Button';
import { RotateCcw, Trophy, Users, Star, Crown } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import GameShell from './GameShell';

const FrameworkSummaryScreen: React.FC = () => {
  const { dispatch, config } = useFrameworkRouter();
  const { t } = useTranslation();
  
  // Mock data for now - in a full implementation, this would come from the module store
  const mockResults = {
    questionsAnswered: 10,
    activePlayersCount: 4,
    blameLog: [
      { from: 'Alice', to: 'Bob', question: 'Wer würde am ehesten...?' },
      { from: 'Bob', to: 'Charlie', question: 'Wer würde niemals...?' },
      { from: 'Charlie', to: 'Diana', question: 'Wer würde als erstes...?' },
      // More entries...
    ],
    blameStats: {
      'Bob': 3,
      'Charlie': 2,
      'Diana': 2,
      'Alice': 1
    }
  };

  const handleRestart = () => {
    dispatch(GameAction.RESTART);
  };

  const getMostBlamedPlayer = () => {
    const entries = Object.entries(mockResults.blameStats);
    if (!entries.length) return null;
    return entries.reduce((max, current) => current[1] > max[1] ? current : max);
  };

  const mostBlamed = getMostBlamedPlayer();
  const theme = config.ui?.theme || {};
  const accentColor = theme.accentColor || 'purple';

  return (
    <GameShell>
      <div className="flex flex-col items-center justify-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-${accentColor}-500 to-pink-500 rounded-full mb-4 shadow-lg`}
            >
              <Trophy size={36} className="text-white drop-shadow-sm" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`text-3xl md:text-4xl font-bold text-${accentColor}-800 dark:text-${accentColor}-200 mb-2`}
            >
              {t('summary.game_over')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-gray-600 dark:text-gray-300 text-lg"
            >
              {t('summary.title')}
            </motion.p>
          </div>

          {/* Game Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div className={`bg-${accentColor}-50 dark:bg-${accentColor}-900/30 rounded-xl p-4 text-center border border-${accentColor}-100 dark:border-${accentColor}-800`}>
              <div className={`text-2xl md:text-3xl font-bold text-${accentColor}-600 dark:text-${accentColor}-400 mb-1`}>
                {mockResults.questionsAnswered}
              </div>
              <div className={`text-xs md:text-sm text-${accentColor}-700 dark:text-${accentColor}-300 font-medium`}>
                {t('questions.counter', { current: mockResults.questionsAnswered, total: mockResults.questionsAnswered })}
              </div>
            </div>
            
            <div className="bg-pink-50 dark:bg-pink-900/30 rounded-xl p-4 text-center border border-pink-100 dark:border-pink-800">
              <div className="flex items-center justify-center mb-1">
                <Users size={20} className="text-pink-600 dark:text-pink-400 mr-1" />
                <span className="text-2xl md:text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {mockResults.activePlayersCount}
                </span>
              </div>
              <div className="text-xs md:text-sm text-pink-700 dark:text-pink-300 font-medium">
                {t('summary.team_message', { activePlayersCount: mockResults.activePlayersCount })}
              </div>
            </div>
          </motion.div>

          {/* Most Blamed Player */}
          {mostBlamed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-6 mb-6 text-center shadow-md"
            >
              <div className="flex items-center justify-center mb-2">
                <Crown size={24} className="text-yellow-600 dark:text-yellow-400 mr-2" />
                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                  {t('summary.most_blamed')}
                </h3>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {mostBlamed[0]}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {t('summary.blame_count', { count: mostBlamed[1], s: mostBlamed[1] !== 1 ? t('summary.plural_suffix') : '' })}
              </p>
            </motion.div>
          )}

          {/* Blame Statistics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
              {t('summary.blame_stats')}
            </h3>
            <div className="space-y-3">
              {Object.entries(mockResults.blameStats)
                .sort(([,a], [,b]) => b - a)
                .map(([player, count], index) => (
                  <motion.div
                    key={player}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index + 0.6 }}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : `bg-${accentColor}-500`} text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-md`}>
                        {index === 0 ? '👑' : index + 1}
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{player}</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`bg-${accentColor}-100 dark:bg-${accentColor}-900/40 text-${accentColor}-700 dark:text-${accentColor}-300 px-4 py-2 rounded-full text-sm font-bold shadow-sm`}>
                        {count}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>

          {/* Recent Blame Log Preview */}
          {mockResults.blameLog.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mb-8"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
                Recent Activity
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {mockResults.blameLog.slice(-3).map((entry, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 shadow-sm">
                    <span className={`font-semibold text-${accentColor}-600 dark:text-${accentColor}-400`}>{entry.from}</span>
                    <span className="mx-2">→</span>
                    <span className="font-semibold text-pink-600 dark:text-pink-400">{entry.to}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Play Again Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          >
            <Button
              onClick={handleRestart}
              className={`w-full bg-gradient-to-r from-${accentColor}-500 to-pink-500 hover:from-${accentColor}-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg text-lg border-0`}
            >
              <RotateCcw size={20} className="mr-2" />
              {t('summary.play_again')}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </GameShell>
  );
};

export default FrameworkSummaryScreen;