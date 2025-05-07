// filepath: c:\Users\pbziu\OneDrive\Dokumente\Development\leagueoffun-1\games\blamegame\components\LoadingQuote.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingQuoteProps {
  quote: string;
  settings: {
    stiffness: number;
    damping: number;
    duration: number;
  };
  className?: string;
}

const LoadingQuote: React.FC<LoadingQuoteProps> = ({ quote, settings, className }) => {
  return (
    <motion.div
      key={quote} // Use quote as key to trigger re-animation on change
      className={`w-full text-center text-white text-opacity-90 font-semibold px-4 ${className || ''}`}
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: settings.stiffness,
        damping: settings.damping,
        duration: settings.duration,
      }}
    >
      {/* Responsive text sizing */}
      <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">{quote}</span>
    </motion.div>
  );
};

export default LoadingQuote;
