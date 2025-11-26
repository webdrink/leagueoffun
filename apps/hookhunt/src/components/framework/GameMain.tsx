/**
 * GameMain Component
 * 
 * Purpose: Framework-core layout component that provides a consistent structure
 * for any game type. Supports header, main content area, and footer composition
 * with game-type aware styling and animations.
 * 
 * Props:
 * - header: Optional header component (progress, player info)
 * - children: Main content area (questions, setup, etc.)
 * - footer: Optional footer component (actions, navigation)
 * - gameType: Game type identifier for styling
 * - className: Additional CSS classes
 * 
 * Dependencies:
 * - react, framer-motion
 * - Zustand stores for state-driven updates
 * 
 * Integration:
 * - Used by all game screens (QuestionScreen, PlayerSetupScreen, etc.)
 * - Subscribes to gameStep changes for layout transitions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStateStore, selectGameStep, selectIsLoading } from '../../store';

interface GameMainProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  gameType?: 'blame' | 'trivia' | 'custom';
  className?: string;
  showTransitions?: boolean;
}

/**
 * GameMain provides a framework-standard layout for game content with optional
 * header and footer composition. Includes state-aware styling and smooth transitions.
 * 
 * @component
 * @param {GameMainProps} props - The props for the GameMain component
 * @param {React.ReactNode} [props.header] - Optional header content (progress, player info)
 * @param {React.ReactNode} props.children - Main content area
 * @param {React.ReactNode} [props.footer] - Optional footer content (actions, navigation)
 * @param {'blame' | 'trivia' | 'custom'} [props.gameType='blame'] - Game type for styling
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.showTransitions=true] - Whether to show layout transitions
 * 
 * @returns {JSX.Element} The rendered GameMain layout component
 */
const GameMain: React.FC<GameMainProps> = ({
  header,
  children,
  footer,
  gameType = 'blame',
  className = '',
  showTransitions = true
}) => {
  // Subscribe to framework state
  const gameStep = useGameStateStore(selectGameStep);
  const isLoading = useGameStateStore(selectIsLoading);
  
  // Game-type specific styling
  const getGameTypeClasses = () => {
    switch (gameType) {
      case 'blame':
        return 'bg-gradient-to-br from-purple-400 to-pink-400';
      case 'trivia':
        return 'bg-gradient-to-br from-blue-400 to-green-400';
      case 'custom':
        return 'bg-gradient-to-br from-gray-400 to-slate-400';
      default:
        return 'bg-gradient-to-br from-purple-400 to-pink-400';
    }
  };
  
  // Layout variants for different game steps
  const layoutVariants = {
    initial: { opacity: 0, scale: 0.95 },
    enter: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };
  
  // Loading overlay variants
  const loadingVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <motion.div
      key={`game-main-${gameStep}`}
      variants={showTransitions ? layoutVariants : undefined}
      initial={showTransitions ? 'initial' : undefined}
      animate={showTransitions ? 'enter' : undefined}
      exit={showTransitions ? 'exit' : undefined}
      className={`
        relative min-h-screen w-full flex flex-col
        ${getGameTypeClasses()}
        ${className}
      `}
    >
      {/* Header Area */}
      {header && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="w-full flex-shrink-0 z-10"
        >
          {header}
        </motion.header>
      )}
      
      {/* Main Content Area */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex-1 w-full flex items-center justify-center p-4 relative"
      >
        {children}
        
        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            variants={loadingVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white/90 rounded-lg p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="text-purple-700 font-medium">Loading...</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.main>
      
      {/* Footer Area */}
      {footer && (
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="w-full flex-shrink-0 z-10"
        >
          {footer}
        </motion.footer>
      )}
    </motion.div>
  );
};

export default GameMain;