import React, { useState, useEffect } from 'react';
import LoadingCardStack from './LoadingCardStack'; // Adjusted path
import { motion } from 'framer-motion';
import LoadingQuote from './LoadingQuote'; // Adjusted path

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
    cardStackOffsetY: number; // This is used by LoadingCardStack
    loadingQuoteIntervalMs: number; // Added missing property
  };
}

const LoadingContainer: React.FC<LoadingContainerProps> = ({
  categories,
  getEmoji,
  loadingQuotes,
  settings
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  // revealedCount and resetTrigger logic seems to be internal to LoadingCardStack in the provided snippet
  // If they are meant to be controlled here, they should be passed as props to LoadingCardStack

  useEffect(() => {
    if (loadingQuotes.length === 0) return;
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % loadingQuotes.length);
    }, settings.loadingQuoteIntervalMs || 3000); // Use setting or default
    return () => clearInterval(quoteInterval);
  }, [loadingQuotes, settings.loadingQuoteIntervalMs]);


  return (
    <div className="flex flex-col items-center justify-center w-full h-full mt-8 sm:mt-16 relative">
      {loadingQuotes.length > 0 && (
        <LoadingQuote
          quote={loadingQuotes[quoteIndex]}
          settings={{
            stiffness: settings.loadingQuoteSpringStiffness,
            damping: settings.loadingQuoteSpringDamping,
            duration: settings.loadingQuoteTransitionDurationSec,
          }}
          className="mb-8 sm:mb-10" 
        />
      )}
      <LoadingCardStack
        categories={categories} // Pass all categories, stack reveals them
        getEmoji={getEmoji}
        settings={settings} // Pass relevant parts of settings
      />
    </div>
  );
};

export default LoadingContainer;
