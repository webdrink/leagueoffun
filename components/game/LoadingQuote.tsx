import React from 'react';
import { motion } from 'framer-motion';

interface LoadingQuoteProps {
  quote: string;
  settings: {
    stiffness: number;
    damping: number;
    duration: number; // This seems to be transition duration
  };
  className?: string;
}

const LoadingQuote: React.FC<LoadingQuoteProps> = ({ quote, settings, className }) => {
  return (
    <motion.div
      key={quote} // Ensure re-animation when quote changes
      className={`text-2xl sm:text-3xl font-semibold text-center text-white text-opacity-90 px-4 ${className || ''}`}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }} // Exit animation for smoother transitions
      transition={{
        type: "spring",
        stiffness: settings.stiffness,
        damping: settings.damping,
        // duration is part of spring, not a direct property here, but influences behavior
      }}    >
      &ldquo;{quote}&rdquo;
    </motion.div>
  );
};

export default LoadingQuote;
