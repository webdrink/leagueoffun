/**
 * GameMainScreen Component
 * 
 * Purpose: Framework-core content wrapper that provides standardized
 * animations, sizing, and responsive behavior for any game content.
 * Includes game-type aware styling and transition patterns.
 * 
 * Props:
 * - children: Content to be displayed
 * - animationType: Type of transition animation
 * - gameType: Game type for styling context
 * - className: Additional CSS classes
 * 
 * Dependencies:
 * - react, framer-motion
 * - Zustand stores for animation preferences
 * 
 * Integration:
 * - Wraps QuestionCard, PlayerSetup, IntroScreen content
 * - Provides consistent responsive behavior
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStateStore } from '../../store';

interface GameMainScreenProps {
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'scale' | 'none';
  gameType?: 'blame' | 'trivia' | 'custom';
  className?: string;
  contentKey?: string | number; // For triggering re-animations
}

/**
 * GameMainScreen wraps game content with consistent animations and responsive behavior.
 * Provides framework-standard transitions and sizing for any game content.
 * 
 * @component
 * @param {GameMainScreenProps} props - The props for the GameMainScreen component
 * @param {React.ReactNode} props.children - Content to be wrapped and animated
 * @param {'slide' | 'fade' | 'scale' | 'none'} [props.animationType='fade'] - Animation style
 * @param {'blame' | 'trivia' | 'custom'} [props.gameType='blame'] - Game type for styling
 * @param {string} [props.className] - Additional CSS classes
 * @param {string | number} [props.contentKey] - Key for triggering content transitions
 * 
 * @returns {JSX.Element} The rendered GameMainScreen wrapper component
 */
const GameMainScreen: React.FC<GameMainScreenProps> = ({
  children,
  animationType = 'fade',
  gameType = 'blame',
  className = '',
  contentKey
}) => {
  // Subscribe to game state for responsive behavior
  const isLoading = useGameStateStore(state => state.isLoading);
  
  // Animation variants based on type
  const getAnimationVariants = () => {
    switch (animationType) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 },
          transition: { duration: 0.4, ease: 'easeInOut' }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
          transition: { duration: 0.3, ease: 'easeOut' }
        };
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 }
        };
      case 'none':
      default:
        return {
          initial: {},
          animate: {},
          exit: {},
          transition: {}
        };
    }
  };
  
  const variants = getAnimationVariants();
  
  // Game-type specific content styling
  const getContentClasses = () => {
    const baseClasses = 'w-full max-w-2xl mx-auto';
    
    switch (gameType) {
      case 'blame':
        return `${baseClasses} p-4 sm:p-6`;
      case 'trivia':
        return `${baseClasses} p-3 sm:p-5`;
      case 'custom':
        return `${baseClasses} p-4`;
      default:
        return `${baseClasses} p-4 sm:p-6`;
    }
  };
  
  return (
    <div className={`
      w-full h-full flex items-center justify-center
      relative overflow-hidden
      ${className}
    `}>
      <AnimatePresence mode="wait">
        <motion.div
          key={contentKey || 'game-screen-content'}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={variants.transition}
          className={`
            ${getContentClasses()}
            ${isLoading ? 'pointer-events-none' : ''}
          `}
        >
          {/* Content Container */}
          <div className="relative">
            {children}
            
            {/* Subtle loading indication overlay */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/5 rounded-lg backdrop-blur-[1px]"
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle floating shapes for visual interest */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/10 rounded-full blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute bottom-1/3 right-1/5 w-6 h-6 bg-white/5 rounded-full blur-sm"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-1/2 right-1/3 w-3 h-3 bg-white/8 rounded-full blur-sm"
        />
      </div>
    </div>
  );
};

export default GameMainScreen;