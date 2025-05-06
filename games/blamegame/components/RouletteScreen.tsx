import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEmoji } from '../utils';

interface RouletteScreenProps {
  selectedCategories: string[];
  quoteIndex: number;
  loadingQuotes: string[];
  gameSettings: {
    loadingQuoteSpringStiffness: number;
    loadingQuoteSpringDamping: number;
    loadingQuoteTransitionDurationSec: number;
    rouletteCardBaseDurationSec: number;
    rouletteCardStaggerDelaySec: number;
    rouletteCardStaggerDurationIncrementSec: number;
    rouletteCardSpringStiffness: number;
    rouletteCardSpringDamping: number;
    rouletteCardSpreadFactor: number;
    rouletteCardRotationAngle: number;
  };
}

const RouletteScreen: React.FC<RouletteScreenProps> = ({
  selectedCategories,
  quoteIndex,
  loadingQuotes,
  gameSettings
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full mt-16">
      <motion.div
        className="mb-10 text-3xl font-semibold text-center text-white text-opacity-90"
        key={quoteIndex}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: gameSettings.loadingQuoteSpringStiffness,
          damping: gameSettings.loadingQuoteSpringDamping,
          duration: gameSettings.loadingQuoteTransitionDurationSec,
        }}
      >
        {loadingQuotes[quoteIndex]}
      </motion.div>

      <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {selectedCategories.map((cat, i) => (
            <motion.div
              key={cat + i}
              className="category-card absolute bg-white p-3 rounded-lg shadow-xl w-40 h-52 flex flex-col items-center justify-center text-center transform-gpu"
              initial={{ opacity: 0, y: 100, scale: 0.8, rotate: (i % 2 === 0 ? -1 : 1) * gameSettings.rouletteCardRotationAngle }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: 0,
                x: (i - Math.floor(selectedCategories.length / 2)) * gameSettings.rouletteCardSpreadFactor,
              }}
              exit={{ opacity: 0, y: 50, scale: 0.7 }}
              transition={{
                type: 'spring',
                stiffness: gameSettings.rouletteCardSpringStiffness,
                damping: gameSettings.rouletteCardSpringDamping,
                delay: i * gameSettings.rouletteCardStaggerDelaySec,
                duration: gameSettings.rouletteCardBaseDurationSec + i * gameSettings.rouletteCardStaggerDurationIncrementSec,
              }}
            >
              <div className="text-3xl mb-2">{getEmoji(cat)}</div>
              <div className="w-full overflow-hidden flex-grow flex items-center justify-center">
                <p
                  className="text-xs font-semibold text-gray-700 leading-tight"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                    maxHeight: 'calc(1.25em * 4)',
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
