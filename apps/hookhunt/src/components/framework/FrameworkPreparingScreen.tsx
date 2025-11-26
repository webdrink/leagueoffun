/**
 * FrameworkPreparingScreen
 * Shows the animated loading card stack between intro and game phases
 * Compatible with the framework architecture
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LoadingContainer from '../game/LoadingContainer';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { CATEGORY_EMOJIS } from '../../constants';
import useTranslation from '../../hooks/useTranslation';

// Loading quotes for the animation
const LOADING_QUOTES = [
  'Wer ist hier wohl der Schuldige?',
  'Gleich wird es spannend...',
  'Bereit für etwas Spaß?',
  'Die Karten werden gemischt...',
  'Wer wird heute beschuldigt?'
];

interface FrameworkPreparingScreenProps {
  className?: string;
}

const FrameworkPreparingScreen: React.FC<FrameworkPreparingScreenProps> = ({ className = '' }) => {
  const { dispatch } = useFrameworkRouter();
  const { t } = useTranslation();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Auto-advance to play phase after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(GameAction.ADVANCE);
    }, 4000); // 4 seconds for the animation to complete

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Rotate quotes during loading
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % LOADING_QUOTES.length);
    }, 1500);

    return () => clearInterval(quoteInterval);
  }, []);

  // Prepare categories with emojis for the card stack
  const categoriesWithEmojis = Object.entries(CATEGORY_EMOJIS).map(([name, emoji]) => ({
    name: t(`categories.${name}`) || name,
    emoji
  })).slice(0, 5); // Show max 5 categories for better visual effect

  // Animation settings optimized for the loading screen
  const animationSettings = {
    loadingQuoteSpringStiffness: 120,
    loadingQuoteSpringDamping: 20,
    loadingQuoteTransitionDurationSec: 0.8,
    cardFallDistance: -200,
    cardFallStaggerDelaySec: 0.3,
    cardStackOffsetY: -15,
    loadingQuoteIntervalMs: 1500
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full p-4 ${className}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <LoadingContainer
            categoriesWithEmojis={categoriesWithEmojis}
            currentQuote={LOADING_QUOTES[currentQuoteIndex]}
            settings={animationSettings}
          />
        </motion.div>

        {/* Optional: Loading indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0ms]"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:150ms]"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:300ms]"></div>
          </div>
          <p className="text-white/80 text-sm mt-3 font-medium">
            {t('loading.preparing_game') || 'Spiel wird vorbereitet...'}
          </p>
        </motion.div>
      </div>
  );
};

export default FrameworkPreparingScreen;