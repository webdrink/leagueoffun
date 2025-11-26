import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface LanguageChangeFeedbackProps {
  language: string;
  languageName: string; 
}

/**
 * Component that provides visual feedback when the language is changed
 * Shows a temporary notification with animation
 */
const LanguageChangeFeedback: React.FC<LanguageChangeFeedbackProps> = ({ 
  language, 
  languageName 
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [previousLanguage, setPreviousLanguage] = useState(language);
  
  useEffect(() => {
    // Only show feedback if language has actually changed and not on initial render
    if (language !== previousLanguage && previousLanguage !== '') {
      setShowFeedback(true);
      
      // Hide the feedback after 2 seconds
      const timer = setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    setPreviousLanguage(language);
  }, [language, previousLanguage]);
  
  return (
    <AnimatePresence>
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-autumn-700 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          <div className="flex items-center space-x-2">
            <div className="text-lg font-bold">
              {getFlagEmoji(language)}
            </div>
            <div>
              Language changed to <span className="font-semibold">{languageName}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to get flag emoji based on language code
const getFlagEmoji = (langCode: string): string => {
  const flagEmojis: Record<string, string> = {
    en: '🇬🇧',
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷'
  };
  
  return flagEmojis[langCode] || '🌐';
};

export default LanguageChangeFeedback;