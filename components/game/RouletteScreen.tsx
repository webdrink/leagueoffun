import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEmoji } from '../../utils'; // Path should be correct
// Card is not used in the provided snippet for RouletteScreen itself.
// If individual cards were meant to use the Card component, that would be inside the map.
// import { Card } from '../core/Card'; 
import LoadingQuote from './LoadingQuote'; // Assuming LoadingQuote is in the same 'game' directory

interface RouletteScreenProps {
  selectedCategories: string[];
  quoteIndex: number; // To pick a quote from loadingQuotes
  loadingQuotes: string[];
  gameSettings: {
    loadingQuoteSpringStiffness: number;
    loadingQuoteSpringDamping: number;
    loadingQuoteTransitionDurationSec: number; // For quote transition
    rouletteCardBaseDurationSec: number;
    rouletteCardStaggerDelaySec: number;
    rouletteCardStaggerDurationIncrementSec: number; // Not directly used in this spring animation
    rouletteCardSpringStiffness: number;
    rouletteCardSpringDamping: number;
    rouletteCardSpreadFactor: number; // Controls how far cards spread horizontally
    rouletteCardRotationAngle: number; // Initial rotation for effect
  };
}

const RouletteScreen: React.FC<RouletteScreenProps> = ({
  selectedCategories,
  quoteIndex,
  loadingQuotes,
  gameSettings
}) => {
  const numCategories = selectedCategories.length;
  const middleIndex = Math.floor(numCategories / 2);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full mt-12 sm:mt-16 overflow-hidden">
      {loadingQuotes.length > 0 && (
        <LoadingQuote
          quote={loadingQuotes[quoteIndex % loadingQuotes.length]} // Ensure quoteIndex wraps around
          settings={{
            stiffness: gameSettings.loadingQuoteSpringStiffness,
            damping: gameSettings.loadingQuoteSpringDamping,
            duration: gameSettings.loadingQuoteTransitionDurationSec,
          }}
          className="mb-8 sm:mb-12 px-4"
        />
      )}

      <div 
        className="relative w-full h-[300px] sm:h-[400px] flex items-center justify-center"
        style={{ perspective: '1000px' }} // For 3D effect if desired
      >
        <AnimatePresence>
          {selectedCategories.map((cat, i) => (
            <motion.div
              key={cat + i} // Unique key for each card
              className="category-card absolute bg-white p-3 rounded-lg shadow-xl w-36 h-48 sm:w-40 sm:h-52 flex flex-col items-center justify-center text-center transform-gpu"
              initial={{ 
                opacity: 0, 
                y: 150, // Start further down
                scale: 0.7, 
                rotate: (Math.random() - 0.5) * gameSettings.rouletteCardRotationAngle * 2, // More random initial rotation
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: (i - middleIndex) * (gameSettings.rouletteCardRotationAngle / (numCategories > 1 ? numCategories/2 : 1) ), // Fan out
                x: (i - middleIndex) * gameSettings.rouletteCardSpreadFactor,
                zIndex: numCategories - Math.abs(i - middleIndex), // Center cards on top
              }}
              exit={{ 
                opacity: 0, 
                y: -100, // Exit upwards
                scale: 0.6,
                rotate: (Math.random() - 0.5) * gameSettings.rouletteCardRotationAngle,
              }}
              transition={{
                type: 'spring',
                stiffness: gameSettings.rouletteCardSpringStiffness,
                damping: gameSettings.rouletteCardSpringDamping,
                delay: i * gameSettings.rouletteCardStaggerDelaySec,
                // duration is implicitly handled by spring physics
              }}
            >
              <div className="text-5xl sm:text-6xl mb-2">{getEmoji(cat)}</div>
              <div className="w-full overflow-hidden flex-grow flex items-center justify-center">
                <p
                  className="text-sm sm:text-base font-semibold text-gray-700 leading-tight"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                    maxHeight: 'calc(1.2em * 3)',
                  }}
                >
                  {cat}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RouletteScreen;
