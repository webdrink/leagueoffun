import React, { useState, useEffect } from 'react';
import LoadingCardStack from './LoadingCardStack.tsx';
import { motion } from 'framer-motion';

interface LoadingContainerProps {
  categories: string[];
  getEmoji: (category: string) => string;
  loadingQuotes: string[];
  settings: {
    loadingQuoteSpringStiffness: number;
    loadingQuoteSpringDamping: number;
    loadingQuoteTransitionDurationSec: number;
    cardFallDistance: number;
    cardFallStaggerDelaySec: number;
    cardStackOffsetY: number;
  };
}

const LoadingContainer: React.FC<LoadingContainerProps> = ({
  categories,
  getEmoji,
  loadingQuotes,
  settings
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % loadingQuotes.length);
    }, 1000);
    return () => clearInterval(quoteInterval);
  }, [resetTrigger, loadingQuotes.length]);

  useEffect(() => {
    if (revealedCount < categories.length) {
      const revealTimeout = setTimeout(() => {
        setRevealedCount(revealedCount + 1);
      }, settings.cardFallStaggerDelaySec * 1000);
      return () => clearTimeout(revealTimeout);
    }
  }, [revealedCount, resetTrigger, categories.length, settings.cardFallStaggerDelaySec]);

  const restart = () => {
    setRevealedCount(0);
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full mt-16 relative">
      <div className="flex flex-col items-center justify-center w-full h-full mt-16">
        <motion.div
          className="mb-10 text-6xl font-semibold text-center text-white text-opacity-90"
          key={quoteIndex}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: settings.loadingQuoteSpringStiffness,
            damping: settings.loadingQuoteSpringDamping,
            duration: settings.loadingQuoteTransitionDurationSec,
          }}
        >
          {loadingQuotes[quoteIndex]}
        </motion.div>
        <LoadingCardStack
          categories={categories.slice(0, revealedCount)}
          getEmoji={getEmoji}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default LoadingContainer;
