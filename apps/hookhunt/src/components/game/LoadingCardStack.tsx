import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A custom comparator for memoization
const arePropsEqual = (prevProps: LoadingCardStackProps, nextProps: LoadingCardStackProps) => {
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
  
  // Compare settings
  return (
    prevProps.settings.cardFallDistance === nextProps.settings.cardFallDistance &&
    prevProps.settings.cardFallStaggerDelaySec === nextProps.settings.cardFallStaggerDelaySec &&
    prevProps.settings.cardStackOffsetY === nextProps.settings.cardStackOffsetY
  );
};

interface CategoryInfo {
  name: string;
  emoji: string;
}

interface LoadingCardStackProps {
  categoriesWithEmojis: CategoryInfo[];
  settings: {
    cardFallDistance: number;
    cardFallStaggerDelaySec: number;
    cardStackOffsetY: number;
  };
}

/**
 * A React functional component that renders a stack of animated loading cards.
 * Each card represents a category and is displayed with an emoji and a name.
 * The cards are animated using Framer Motion, with configurable settings for
 * animation behavior such as fall distance, stagger delay, and stack offset.
 *
 * @component
 * @param {LoadingCardStackProps} props - The props for the component.
 * @param {CategoryInfo[]} props.categoriesWithEmojis - An array of objects containing category name and emoji.
 * @param {Object} props.settings - Configuration settings for the card animations.
 * @param {number} props.settings.cardFallDistance - The initial vertical distance the cards fall from.
 * @param {number} props.settings.cardStackOffsetY - The vertical offset between stacked cards.
 * @param {number} props.settings.cardFallStaggerDelaySec - The delay in seconds between the animations of consecutive cards.
 *
 * @returns {JSX.Element} A JSX element representing the animated stack of loading cards.
 */
const LoadingCardStack: React.FC<LoadingCardStackProps> = ({
  categoriesWithEmojis,
  settings
}) => {
  // Only log this in development
  const isDevelopment = import.meta.env.DEV;
  if (isDevelopment) {
    console.log('LoadingCardStack received categoriesWithEmojis:', categoriesWithEmojis);
  }
  return (
    <div className="relative w-full h-[300px] sm:h-[400px] flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {categoriesWithEmojis.map((category, i) => (
          <motion.div
            key={category.name + i}
            className={`category-card absolute bg-white dark:bg-gray-800 p-3 rounded-lg w-36 h-48 sm:w-40 sm:h-52 flex flex-col items-center justify-center text-center ${
              i === 0 ? 'shadow-lg' : 
              i === 1 ? 'shadow-xl' : 
              i === 2 ? 'shadow-2xl' : 
              'shadow-2xl'
            } dark:shadow-gray-900/50`}
            style={{ zIndex: i + 1 }}
            initial={{ opacity: 0, y: settings.cardFallDistance, scale: 0.8 }}
            animate={{ opacity: 1, y: (categoriesWithEmojis.length - 1 - i) * settings.cardStackOffsetY, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.7 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 14,
              delay: i * settings.cardFallStaggerDelaySec,
            }}
          >
            <div className="text-5xl sm:text-6xl mb-2">{category.emoji}</div>
            <div className="w-full overflow-hidden flex-grow flex items-center justify-center">
              <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 leading-tight line-clamp-3 break-words text-center">
                {category.name}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(LoadingCardStack, arePropsEqual);
