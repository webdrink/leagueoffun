/**
 * BlameNotification Component
 * 
 * Purpose: Displays a notification when a player has been blamed in NameBlame mode.
 * Shows clear feedback about who blamed whom for which question, with optional auto-dismiss.
 * 
 * Props:
 * - blamer: Name of the player who made the blame
 * - blamed: Name of the player who was blamed
 * - question: The question text that was blamed for
 * - isVisible: Whether the notification should be shown
 * - onDismiss: Optional callback when notification is dismissed
 * - autoHide: Whether to automatically hide after delay
 * - autoHideDelay: Delay in milliseconds before auto-hide (default: 3000)
 * 
 * Dependencies:
 * - react, react-i18next, framer-motion, lucide-react
 * - useTranslation for localization
 * - Framer Motion for entrance/exit animations
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { BlameNotificationProps } from '../../types';

/**
 * Displays a blame notification with smooth animations and auto-dismiss functionality.
 * 
 * @param props - BlameNotificationProps containing blamer, blamed, question, etc.
 * @returns JSX.Element - The rendered blame notification component
 */
const BlameNotification: React.FC<BlameNotificationProps> = ({
  blamer,
  blamed,
  question,
  isVisible,
  onDismiss,
  autoHide = true,
  autoHideDelay = 3000,
}) => {
  const { t } = useTranslation();
  const [showNotification, setShowNotification] = useState(isVisible);

  useEffect(() => {
    setShowNotification(isVisible);
  }, [isVisible]);

  const handleDismiss = React.useCallback(() => {
    setShowNotification(false);
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (showNotification && autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [showNotification, autoHide, autoHideDelay, handleDismiss]);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-xl shadow-xl border-2 border-pink-300">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg mb-2">
                    {t('blame.notification_title')}
                  </h3>
                  <p className="text-pink-100 mb-2">
                    <span className="font-semibold text-white">{blamer}</span>{' '}
                    {t('blame.blamed_player_for')}{' '}
                    <span className="font-semibold text-white">{blamed}</span>
                  </p>
                  <div className="bg-white/20 rounded-lg p-2 mt-2">
                    <p className="text-sm text-pink-50 italic">
                      &ldquo;{question}&rdquo;
                    </p>
                  </div>
                  {blamed && (
                    <p className="text-yellow-200 text-sm mt-2 font-medium">
                      {t('blame.notification_for_blamed', { blamer })}
                    </p>
                  )}
                </div>
              </div>
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 ml-2 text-pink-200 hover:text-white transition-colors"
                  aria-label={t('common.close')}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {autoHide && (
              <div className="mt-3">
                <motion.div
                  className="h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: autoHideDelay / 1000, ease: "linear" }}
                  />
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlameNotification;