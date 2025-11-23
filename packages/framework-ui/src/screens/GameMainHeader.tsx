/**
 * GameMainHeader Component
 * 
 * Purpose: Framework-core header component that displays game progress,
 * player information, and state indicators. Reusable across all game types
 * with support for custom game-specific indicators.
 * 
 * Props:
 * - showProgress: Whether to display question progress
 * - showPlayerInfo: Whether to display current player information
 * - showBlameIndicator: Whether to show blame phase indicators
 * - customIndicators: Additional game-specific status indicators
 * - className: Additional CSS classes
 * 
 * Dependencies:
 * - react, framer-motion
 * - Zustand stores for game state
 * - useTranslation for i18n
 * 
 * Integration:
 * - Used in QuestionScreen, GameScreen layouts
 * - Subscribes to GameStateStore and BlameGameStore
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStateStore, useBlameGameStore, selectGameProgress, selectCurrentPlayer, selectBlamePhase, selectCurrentBlameContext } from '../../../store';
import useTranslation from '../../../hooks/useTranslation';

interface GameMainHeaderProps {
  showProgress?: boolean;
  showPlayerInfo?: boolean;
  showBlameIndicator?: boolean;
  customIndicators?: React.ReactNode;
  className?: string;
}

/**
 * GameMainHeader displays contextual game information including progress,
 * current player, and blame state indicators. Adapts to different game modes.
 * 
 * @component
 * @param {GameMainHeaderProps} props - The props for the GameMainHeader component
 * @param {boolean} [props.showProgress=true] - Whether to show question progress
 * @param {boolean} [props.showPlayerInfo=true] - Whether to show current player info
 * @param {boolean} [props.showBlameIndicator=false] - Whether to show blame indicators
 * @param {React.ReactNode} [props.customIndicators] - Additional custom indicators
 * @param {string} [props.className] - Additional CSS classes
 * 
 * @returns {JSX.Element} The rendered GameMainHeader component
 */
const GameMainHeader: React.FC<GameMainHeaderProps> = ({
  showProgress = true,
  showPlayerInfo = true,
  showBlameIndicator = false,
  customIndicators,
  className = ''
}) => {
  const { t } = useTranslation();
  
  // Subscribe to framework state
  const gameProgress = useGameStateStore(selectGameProgress);
  const currentPlayer = useGameStateStore(selectCurrentPlayer);
  const gameMode = useGameStateStore(state => state.gameMode);
  
  // Subscribe to blame state if needed
  const blamePhase = useBlameGameStore(selectBlamePhase);
  const blameContext = useBlameGameStore(selectCurrentBlameContext);
  
  const isNameBlameMode = gameMode === 'nameBlame';
  const shouldShowBlameIndicator = showBlameIndicator && isNameBlameMode;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        w-full bg-white/10 backdrop-blur-md border-b border-white/20
        px-4 py-3 ${className}
      `}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left Section: Progress */}
        <div className="flex-1">
          {showProgress && gameProgress.total > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-white/20 rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">
                  {t('questions.counter', { 
                    current: gameProgress.current, 
                    total: gameProgress.total 
                  })}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="hidden sm:block w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gameProgress.percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-white/80 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Center Section: Custom Indicators */}
        {customIndicators && (
          <div className="flex-shrink-0 mx-4">
            {customIndicators}
          </div>
        )}
        
        {/* Right Section: Player Info & Blame Indicators */}
        <div className="flex-1 flex justify-end">
          <div className="flex items-center space-x-3">
            {/* Blame Phase Indicator */}
            {shouldShowBlameIndicator && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${blamePhase === 'reveal' 
                    ? 'bg-rust-500/80 text-white' 
                    : 'bg-white/20 text-white'
                  }
                `}
              >
                {blamePhase === 'reveal' ? (
                  <span>
                    {t('questions.blamed_you_for', { 
                      name: blameContext.blamer || ''
                    })}
                  </span>
                ) : (
                  <span>{t('questions.who_blame')}</span>
                )}
              </motion.div>
            )}
            
            {/* Current Player Info */}
            {showPlayerInfo && currentPlayer && isNameBlameMode && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/20 rounded-full px-4 py-2"
              >
                <div className="flex items-center space-x-2">
                  {/* Keep a subtle pulse dot but remove the textual label per request */}
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true"></div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameMainHeader;