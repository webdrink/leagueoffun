/**
 * GameMainFooter Component
 * 
 * Purpose: Framework-core footer component that provides standardized
 * action button patterns for different game interactions. Supports
 * multiple interaction patterns and state-aware button states.
 * 
 * Props:
 * - actionType: Type of action interface to display
 * - primaryAction: Primary action button configuration
 * - secondaryAction: Secondary action button configuration
 * - selectionOptions: For player/option selection interfaces
 * - loading: Loading state
 * - className: Additional CSS classes
 * 
 * Dependencies:
 * - react, framer-motion
 * - Button component
 * - Zustand stores for game state
 * - useTranslation for i18n
 * 
 * Integration:
 * - Used in QuestionScreen, PlayerSetupScreen, etc.
 * - Adapts to classic vs NameBlame modes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import FooterButton from '../core/FooterButton';
import { useGameStateStore, useBlameGameStore, selectCurrentPlayer, selectIsInBlamedPhase } from '../../store';
import useTranslation from '../../hooks/useTranslation';

interface ActionButton {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  className?: string;
}

interface SelectionOption {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

interface GameMainFooterProps {
  actionType?: 'navigation' | 'selection' | 'blame' | 'custom';
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  selectionOptions?: SelectionOption[];
  blameOptions?: SelectionOption[];
  nextBlameAction?: ActionButton;
  loading?: boolean;
  className?: string;
}

/**
 * GameMainFooter provides framework-standard action interfaces with support
 * for navigation, selection, and blame-specific interactions.
 * 
 * @component
 * @param {GameMainFooterProps} props - The props for the GameMainFooter component
 * @param {'navigation' | 'selection' | 'blame' | 'custom'} [props.actionType='navigation'] - Type of action interface
 * @param {ActionButton} [props.primaryAction] - Primary action button config
 * @param {ActionButton} [props.secondaryAction] - Secondary action button config
 * @param {SelectionOption[]} [props.selectionOptions] - Options for selection interface
 * @param {SelectionOption[]} [props.blameOptions] - Player options for blame interface
 * @param {ActionButton} [props.nextBlameAction] - Next blame action for blamed phase
 * @param {boolean} [props.loading=false] - Loading state
 * @param {string} [props.className] - Additional CSS classes
 * 
 * @returns {JSX.Element} The rendered GameMainFooter component
 */
const GameMainFooter: React.FC<GameMainFooterProps> = ({
  actionType = 'navigation',
  primaryAction,
  secondaryAction,
  selectionOptions = [],
  blameOptions = [],
  nextBlameAction,
  loading = false,
  className = ''
}) => {
  const { t } = useTranslation();
  
  // Subscribe to framework state
  const currentPlayer = useGameStateStore(selectCurrentPlayer);
  const isInBlamedPhase = useBlameGameStore(selectIsInBlamedPhase);
  
  // Animation variants for different action types
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  };
  
  // Render navigation interface (classic mode)
  const renderNavigation = () => (
    <div className="flex justify-between items-center space-x-4 w-full max-w-md mx-auto">
      {secondaryAction && (
        <motion.div variants={itemVariants}>
          <FooterButton
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled || loading}
            className={`${secondaryAction.className || ''} px-4 py-2`}
          >
            {secondaryAction.label}
          </FooterButton>
        </motion.div>
      )}
      
      {primaryAction && (
        <motion.div variants={itemVariants} className="flex-1">
          <Button
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || loading}
            variant={primaryAction.variant || 'default'}
            className={`${primaryAction.className || ''} w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
          >
            {primaryAction.label}
          </Button>
        </motion.div>
      )}
    </div>
  );
  
  // Render selection interface (for setup screens)
  const renderSelection = () => (
    <div className="w-full max-w-md mx-auto space-y-4">
      {selectionOptions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {selectionOptions.map((option, index) => (
            <motion.div 
              key={option.id}
              variants={itemVariants}
              transition={{ delay: index * 0.05 }}
            >
              <FooterButton
                onClick={option.onClick}
                disabled={option.disabled || loading}
                className={`${option.className || ''} w-full py-3 text-sm`}
              >
                {option.label}
              </FooterButton>
            </motion.div>
          ))}
        </div>
      )}
      
      {primaryAction && (
        <motion.div variants={itemVariants}>
          <Button
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || loading}
            variant={primaryAction.variant || 'default'}
            className={`${primaryAction.className || ''} w-full py-3`}
          >
            {primaryAction.label}
          </Button>
        </motion.div>
      )}
    </div>
  );
  
  // Render blame interface (NameBlame mode)
  const renderBlame = () => (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Blame context display when in blamed phase */}
      {isInBlamedPhase && nextBlameAction && (
        <motion.div 
          variants={itemVariants}
          className="text-center"
        >
          <Button
            onClick={nextBlameAction.onClick}
            disabled={nextBlameAction.disabled || loading}
            variant="default"
            className={`${nextBlameAction.className || ''} px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
          >
            {nextBlameAction.label}
          </Button>
        </motion.div>
      )}
      
      {/* Player selection when in selecting phase */}
      {!isInBlamedPhase && blameOptions.length > 0 && (
        <>
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-white text-sm mb-3">
              {t('questions.who_blame')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {blameOptions.map((option, index) => {
              // Check if this player is the current player (can't blame self)
              const isSelf = currentPlayer && option.label === currentPlayer.name;
              
              return (
                <motion.div 
                  key={option.id}
                  variants={itemVariants}
                  transition={{ delay: index * 0.05 }}
                >
                  <FooterButton
                    onClick={option.onClick}
                    disabled={option.disabled || isSelf || loading}
                    className={`
                      ${option.className || ''} 
                      w-full py-3 text-sm font-semibold
                      ${isSelf ? 'opacity-60 cursor-not-allowed !bg-gray-700/60 !text-gray-400 !border-gray-600/80' : ''}
                    `}
                    title={isSelf ? t('questions.cannot_blame_self') : t('questions.blame_player', { name: option.label })}
                  >
                    {option.label}
                  </FooterButton>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
  
  // Render custom interface
  const renderCustom = () => (
    <div className="w-full max-w-md mx-auto">
      {/* Custom content can be passed via children or action configs */}
      {primaryAction && (
        <motion.div variants={itemVariants}>
          <Button
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || loading}
            variant={primaryAction.variant || 'default'}
            className={`${primaryAction.className || ''} w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
          >
            {primaryAction.label}
          </Button>
        </motion.div>
      )}
    </div>
  );
  
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`
        w-full bg-white/5 backdrop-blur-md border-t border-white/20
        px-4 py-4 ${className}
      `}
    >
      {actionType === 'navigation' && renderNavigation()}
      {actionType === 'selection' && renderSelection()}
      {actionType === 'blame' && renderBlame()}
      {actionType === 'custom' && renderCustom()}
    </motion.div>
  );
};

export default GameMainFooter;