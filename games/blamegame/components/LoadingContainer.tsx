import React, { useState, useEffect } from 'react';
import LoadingCardStack from './LoadingCardStack.tsx';
import { motion } from 'framer-motion';
import LoadingQuote from './LoadingQuote.tsx'; // Import the new component

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
        {/* Use the new LoadingQuote component */}
        {loadingQuotes.length > 0 && (
          <LoadingQuote
            quote={loadingQuotes[quoteIndex]}
            settings={{
              stiffness: settings.loadingQuoteSpringStiffness,
              damping: settings.loadingQuoteSpringDamping,
              duration: settings.loadingQuoteTransitionDurationSec,
            }}
            className="mb-10" // Added margin bottom for spacing
          />
        )}
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
