import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {categories.map((cat, i) => (
          <motion.div
            key={cat + i}
            className="category-card absolute bg-white p-3 rounded-lg shadow-xl w-40 h-52 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: settings.cardFallDistance, scale: 0.8 }}
            animate={{ opacity: 1, y: i * settings.cardStackOffsetY, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.7 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 14,
              delay: i * settings.cardFallStaggerDelaySec,
            }}
            style={{ zIndex: i + 1 }}
          >
            <div className="text-6xl mb-2">{getEmoji(cat)}</div>
            <div className="w-full overflow-hidden flex-grow flex items-center justify-center">
              <p
                className="text-xl font-semibold text-gray-1000 leading-tight"
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
  );
};

export default LoadingCardStack;
