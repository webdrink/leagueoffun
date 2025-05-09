import React from 'react';
import LoadingCardStack from './LoadingCardStack'; // Adjusted path
import { motion } from 'framer-motion';
import LoadingQuote from './LoadingQuote'; // Adjusted path

interface LoadingContainerProps {
  categories: string[];
  getEmoji: (category: string) => string;
  currentQuote: string; // Prop for the current quote to display
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
 * @param currentQuote - A string representing the currently displayed quote.
 * @param settings - An object containing configuration options for loading quote intervals,
 *   spring animation parameters, and transition durations.
 *
 * The component displays the provided currentQuote with animation settings derived from the settings prop.
 * It also renders a LoadingCardStack component to visually represent the loading state for categories.
 */
const LoadingContainer: React.FC<LoadingContainerProps> = ({
  categories,
  getEmoji,
  currentQuote, // Use the passed currentQuote
  settings
}) => {
  // Internal state and useEffect for cycling quotes are removed.
  // App.tsx now manages the currentQuote.

  return (
    <div className="flex flex-col items-center justify-center w-full h-full mt-8 sm:mt-16 relative">
      {currentQuote && ( // Display LoadingQuote only if currentQuote is non-empty
        <LoadingQuote
          quote={currentQuote}
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
