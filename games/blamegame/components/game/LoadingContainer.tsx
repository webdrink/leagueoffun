import React from 'react';
import { motion } from 'framer-motion'; // Added for integrated quote animation
import LoadingCardStack from './LoadingCardStack';

// A custom comparator for memoization without external dependencies
const arePropsEqual = (prevProps: LoadingContainerProps, nextProps: LoadingContainerProps) => {
  // Compare currentQuote directly (string comparison)
  if (prevProps.currentQuote !== nextProps.currentQuote) {
    return false;
  }
  
  // Compare categoriesWithEmojis array length
  if (prevProps.categoriesWithEmojis.length !== nextProps.categoriesWithEmojis.length) {
    return false;
  }
  
  // Compare each category object
  for (let i = 0; i < prevProps.categoriesWithEmojis.length; i++) {
    if (
      prevProps.categoriesWithEmojis[i].name !== nextProps.categoriesWithEmojis[i].name ||
      prevProps.categoriesWithEmojis[i].emoji !== nextProps.categoriesWithEmojis[i].emoji
    ) {
      return false;
    }
  }
  
  // Compare important settings
  return (
    prevProps.settings.loadingQuoteSpringStiffness === nextProps.settings.loadingQuoteSpringStiffness &&
    prevProps.settings.loadingQuoteSpringDamping === nextProps.settings.loadingQuoteSpringDamping &&
    prevProps.settings.cardFallDistance === nextProps.settings.cardFallDistance &&
    prevProps.settings.cardFallStaggerDelaySec === nextProps.settings.cardFallStaggerDelaySec &&
    prevProps.settings.cardStackOffsetY === nextProps.settings.cardStackOffsetY
  );
};

interface CategoryInfo {
  name: string;
  emoji: string;
}

interface LoadingContainerProps {
  categoriesWithEmojis: CategoryInfo[]; // Changed from categories and getEmoji
  currentQuote: string;
  settings: {
    loadingQuoteSpringStiffness: number;
    loadingQuoteSpringDamping: number;
    loadingQuoteTransitionDurationSec: number; // Used for quote animation
    cardFallDistance: number;
    cardFallStaggerDelaySec: number;
    cardStackOffsetY: number;
    loadingQuoteIntervalMs: number;
  };
}

/**
 * LoadingContainer is a React functional component that displays a loading UI
 * consisting of a rotating quote and a stack of loading cards representing categories.
 *
 * @param {LoadingContainerProps} props - The props for the component.
 * @param {CategoryInfo[]} props.categoriesWithEmojis - An array of objects, each containing category name and emoji.
 * @param {string} props.currentQuote - A string representing the currently displayed quote.
 * @param {object} props.settings - An object containing configuration options for animations.
 *
 * Child Components:
 *  - LoadingCardStack
 *
 * Referenced by:
 *  - App.tsx
 */
const LoadingContainer: React.FC<LoadingContainerProps> = ({
  categoriesWithEmojis, // Updated prop name
  currentQuote,
  settings
}) => {
  // Only log this in development
  const isDevelopment = import.meta.env.DEV;
  if (isDevelopment) {
    console.log('LoadingContainer received currentQuote:', currentQuote);
  }

  return (
    // REMOVED: fixed inset-0 and specific background gradient
    // ADDED: w-full flex flex-col items-center justify-center p-4 space-y-8 to allow GameContainer to control layout
    <div className="w-full flex flex-col items-center justify-center p-4 space-y-8">
      {/* Integrated LoadingQuote Logic */}
      <motion.div
        key={currentQuote} // Ensure re-animation when quote changes
        className="text-2xl sm:text-3xl font-semibold text-center text-white text-opacity-90 px-4"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: settings.loadingQuoteSpringStiffness,
          damping: settings.loadingQuoteSpringDamping,
          // duration for spring is influenced by stiffness/damping, not set directly like tween
        }}
      >
        &ldquo;{currentQuote}&rdquo;
      </motion.div>

      <LoadingCardStack
        categoriesWithEmojis={categoriesWithEmojis} // Pass the new prop
        settings={{
          cardFallDistance: settings.cardFallDistance,
          cardFallStaggerDelaySec: settings.cardFallStaggerDelaySec,
          cardStackOffsetY: settings.cardStackOffsetY,
        }}
      />
    </div>
  );
};

export default React.memo(LoadingContainer, arePropsEqual); // Use our custom comparator for more precise memoization
