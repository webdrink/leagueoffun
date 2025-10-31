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
import { Trophy, Users, Crown } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { useGameSettings } from '../../hooks/useGameSettings';
import { useProviderState } from '../../hooks/useProviderState';
import useNameBlameSetup from '../../hooks/useNameBlameSetup';
import { useBlameGameStore } from '../../store/BlameGameStore';

const FrameworkSummaryScreen: React.FC = () => {
  const { dispatch, config } = useFrameworkRouter();
  const { t } = useTranslation();
  const { gameSettings } = useGameSettings();
  const { progress } = useProviderState();
  
  // Check if we're in Classic Mode or NameBlame Mode
  const isClassicMode = gameSettings.gameMode === 'classic';
  
  // Get real player and blame data
  const { getActivePlayers, nameBlameLog } = useNameBlameSetup();
  const { blameStats, getMostBlamedPlayer } = useBlameGameStore();
  
  // Get actual game progress data
  const activePlayers = getActivePlayers();
  const gameResults = {
    questionsAnswered: progress?.index + 1 || 5, // Use actual progress or fallback
    activePlayersCount: isClassicMode ? 1 : activePlayers.length,
    blameLog: isClassicMode ? [] : nameBlameLog,
    blameStats: isClassicMode ? {} : blameStats
  };

  const handleRestart = () => {
    dispatch(GameAction.RESTART);
  };

  // Get most blamed player from the blame store
  const mostBlamedPlayerData = getMostBlamedPlayer();
  const mostBlamed = mostBlamedPlayerData ? [mostBlamedPlayerData.name, mostBlamedPlayerData.count] : null;
  
  const theme = config.ui?.theme || {};
  const accentColor = theme.accentColor || 'purple';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-2xl min-h-[400px] max-h-[75vh] flex flex-col overflow-y-auto"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.22) 0px 25px 50px -12px' }}
        >
          {/* Header - Compact */}
          <div className="text-center mb-4 flex-shrink-0">
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
              className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-${accentColor}-500 to-rust-500 rounded-full mb-3 shadow-lg`}
            >
              <Trophy size={30} className="text-white drop-shadow-sm" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`text-3xl md:text-4xl lg:text-5xl font-bold text-autumn-800 dark:text-autumn-200 mb-1`}
            >
              {t('summary.game_over')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-gray-600 dark:text-gray-300 text-base"
            >
              {t('summary.title')}
            </motion.p>
          </div>

          {/* Game Stats - Compact */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`${isClassicMode ? 'flex justify-center' : 'grid grid-cols-2 gap-3'} mb-4 flex-shrink-0`}
          >
            <div className={`bg-autumn-50 dark:bg-autumn-900/30 rounded-xl p-3 text-center border border-autumn-100 dark:border-autumn-800 ${isClassicMode ? 'w-40' : ''}`}>
              <div className={`text-xl md:text-2xl font-bold text-autumn-600 dark:text-autumn-400 mb-1`}>
                {gameResults.questionsAnswered}
              </div>
              <div className={`text-xs text-autumn-700 dark:text-autumn-300 font-medium`}>
                {isClassicMode 
                  ? `${gameResults.questionsAnswered} Fragen angeschaut`
                  : t('questions.counter', { current: gameResults.questionsAnswered, total: gameResults.questionsAnswered })
                }
              </div>
            </div>
            
            {/* Only show player count in NameBlame mode */}
            {!isClassicMode && (
              <div className="bg-rust-50 dark:bg-rust-900/30 rounded-xl p-3 text-center border border-rust-100 dark:border-rust-800">
                <div className="flex items-center justify-center mb-1">
                  <Users size={16} className="text-rust-600 dark:text-rust-400 mr-1" />
                  <span className="text-xl md:text-2xl font-bold text-rust-600 dark:text-rust-400">
                    {gameResults.activePlayersCount}
                  </span>
                </div>
                <div className="text-xs text-rust-700 dark:text-rust-300 font-medium">
                  {t('summary.team_message', { activePlayersCount: gameResults.activePlayersCount })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Most Blamed Player - Only in NameBlame Mode - Compact */}
          {!isClassicMode && mostBlamed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-3 mb-3 text-center shadow-sm flex-shrink-0"
            >
              <div className="flex items-center justify-center mb-1">
                <Crown size={18} className="text-yellow-600 dark:text-yellow-400 mr-1" />
                <h3 className="text-base font-bold text-yellow-800 dark:text-yellow-200">
                  {t('summary.most_blamed')}
                </h3>
              </div>
              <p className="text-lg md:text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {mostBlamed[0]}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {t('summary.blame_count', { count: mostBlamed[1], s: mostBlamed[1] !== 1 ? t('summary.plural_suffix') : '' })}
              </p>
            </motion.div>
          )}

          {/* Blame Statistics - Only in NameBlame Mode - Compact */}
          {!isClassicMode && Object.keys(gameResults.blameStats).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-3 flex-shrink-0"
            >
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2 text-center">
                {t('summary.blame_stats')}
              </h3>
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {Object.entries(gameResults.blameStats)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 3) // Show only top 3 to save space
                  .map(([player, count], index) => (
                    <motion.div
                      key={player}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index + 0.6 }}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 shadow-sm"
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'} text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 shadow-sm`}>
                          {index === 0 ? '👑' : index + 1}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{player}</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`bg-autumn-100 dark:bg-autumn-900/40 text-autumn-700 dark:text-autumn-300 px-2 py-1 rounded-full text-xs font-bold`}>
                          {count as number}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}



          {/* Bottom Section - Classic Mode Message and Button */}
          <div className="flex-grow flex flex-col justify-end space-y-4">
            {isClassicMode && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-gradient-to-r from-autumn-50 to-rust-50 dark:from-autumn-900/20 dark:to-rust-900/20 border border-autumn-200 dark:border-autumn-700 rounded-xl p-4 text-center">
                  <p className="text-base font-medium text-autumn-800 dark:text-autumn-200 mb-1">
                    🎯 Classic Mode Abgeschlossen!
                  </p>
                  <p className="text-sm text-autumn-600 dark:text-autumn-300">
                    Du hast {gameResults.questionsAnswered} interessante Fragen durchgeschaut. Möchtest du das NameBlame-Modus mit Freunden ausprobieren?
                  </p>
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
                className={`w-full bg-gradient-to-r from-autumn-500 to-rust-500 hover:from-autumn-600 hover:to-rust-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg text-base border-0`}
              >
                {t('summary.play_again')}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
  );
};

export default FrameworkSummaryScreen;