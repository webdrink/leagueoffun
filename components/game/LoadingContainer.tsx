import React, { useState, useEffect } from 'react';
import LoadingCardStack from './LoadingCardStack'; // Adjusted path
import { motion } from 'framer-motion';
import LoadingQuote from './LoadingQuote'; // Adjusted path

interface LoadingContainerProps {
  categories: string[];
  getEmoji: (category: string) => string;
  loadingQuotes: string[];
  currentQuote: string; // Added
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

/**
 * LoadingContainer is a React functional component that displays a loading UI
 * consisting of a rotating quote and a stack of loading cards representing categories.
 *
 * @param categories - An array of category objects to be displayed in the loading card stack.
 * @param getEmoji - A function that returns an emoji for a given category.
 * @param loadingQuotes - An array of strings representing quotes to be cycled through during loading.
 * @param currentQuote - A string representing the currently displayed quote.
 * @param settings - An object containing configuration options for loading quote intervals,
 *   spring animation parameters, and transition durations.
 *
 * The component cycles through the provided loadingQuotes at a configurable interval,
 * displaying each quote with animation settings derived from the settings prop.
 * It also renders a LoadingCardStack component to visually represent the loading state for categories.
 */
const LoadingContainer: React.FC<LoadingContainerProps> = ({
  categories,
  getEmoji,
  loadingQuotes,
  currentQuote, // Added
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
          quote={currentQuote} // Use prop here
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
