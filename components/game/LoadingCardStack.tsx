import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Assuming Card is not used here based on the provided snippet. If it is, it should be imported from ../core/Card
// import { Card } from '../core/Card'; 

interface LoadingCardStackProps {
  categories: string[];
  getEmoji: (category: string) => string;
  settings: {
    cardFallDistance: number;
    cardFallStaggerDelaySec: number;
    cardStackOffsetY: number;
  };
}

const LoadingCardStack: React.FC<LoadingCardStackProps> = ({
  categories,
  getEmoji,
  settings
}) => {
  return (
    <div className="relative w-full h-[300px] sm:h-[400px] flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {categories.map((cat, i) => (
          <motion.div
            key={cat + i}
            className="category-card absolute bg-white p-3 rounded-lg shadow-xl w-36 h-48 sm:w-40 sm:h-52 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: settings.cardFallDistance, scale: 0.8 }}
            animate={{ opacity: 1, y: i * settings.cardStackOffsetY, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.7 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 14,
              delay: i * settings.cardFallStaggerDelaySec,
            }}
            style={{ zIndex: categories.length - i }} // Ensure cards stack correctly
          >
            <div className="text-5xl sm:text-6xl mb-2">{getEmoji(cat)}</div>
            <div className="w-full overflow-hidden flex-grow flex items-center justify-center">
              <p
                className="text-base sm:text-lg font-semibold text-gray-700 leading-tight"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3, // Max 3 lines for category name
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                  maxHeight: 'calc(1.2em * 3)', // Corresponds to WebkitLineClamp
                }}
              >
                {cat}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LoadingCardStack;
