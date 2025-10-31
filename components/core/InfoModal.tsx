import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import useTranslation from '../../hooks/useTranslation';
import { clearAllCustomCategories } from '../../lib/customCategories/storage';
import { clearAllCategoryModifications } from '../../lib/customCategories/builtInModifications';

interface FAQItem {
  question: string;
  answer: string;
}

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetAppData: () => void;
  title?: string;
  children?: React.ReactNode;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'faq.how_to_play',
    answer: 'faq.how_to_play_answer',
  },
  {
    question: 'faq.what_is_nameblame',
    answer: 'faq.what_is_nameblame_answer',
  },
  {
    question: 'faq.how_to_change_language',
    answer: 'faq.how_to_change_language_answer',
  },
  {
    question: 'faq.how_to_change_theme',
    answer: 'faq.how_to_change_theme_answer',
  },
  {
    question: 'faq.reset_data',
    answer: 'faq.reset_data_answer',
  },
];

const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {t('faq.title') || 'Frequently Asked Questions'}
      </h3>
      {FAQ_ITEMS.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
          >
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {t(item.question)}
            </span>
            <ChevronDown
              size={20}
              className={`text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                openIndex === index ? 'transform rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm">
                  {t(item.answer)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetAppData: () => void;
  title?: string;
  children?: React.ReactNode;
}

/**
 * InfoModal is a reusable modal component that displays informational content to the user.
 * It supports internationalization, animated transitions, and provides actions for closing
 * the modal or resetting application data.
 *
 * @param {InfoModalProps} props - The props for the InfoModal component.
 * @param {boolean} props.isOpen - Determines whether the modal is visible.
 * @param {() => void} props.onClose - Callback function invoked when the modal is closed.
 * @param {() => void} props.onResetAppData - Callback function invoked to reset application data.
 * @param {string} [props.title="Information"] - Optional title for the modal.
 * @param {React.ReactNode} [props.children] - Optional custom content to display inside the modal.
 *
 * @returns {JSX.Element | null} The rendered modal component if open, otherwise null.
 */
const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, onResetAppData, title = "Information", children }) => {
  const { t } = useTranslation();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    if (resetConfirmText === 'RESET') {
      // Clear all custom data
      clearAllCustomCategories();
      clearAllCategoryModifications();
      
      // Call the onResetAppData callback for any additional cleanup
      onResetAppData();
      
      // Close modal
      setShowResetConfirm(false);
      setResetConfirmText('');
      onClose();
    }
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
    setResetConfirmText('');
  };
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose} // Close when clicking the overlay
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{title || t('modal.info_title')}</h2>
            
            {/* FAQ Section */}
            <div className="mb-6">
              <FAQSection />
            </div>
            
            {children && (
              <div className="mb-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {children}
              </div>
            )}

            {/* Danger Zone - Reset Section */}
            <div className="mb-6 p-4 border-2 border-red-500/50 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center">
                <AlertTriangle size={20} className="mr-2" />
                {t('reset.danger_zone')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {t('reset.reset_description')}
              </p>
              <Button 
                onClick={handleResetClick}
                className="bg-red-600 hover:bg-red-700 text-white w-full"
              >
                {t('reset.reset_all_data')}
              </Button>
            </div>

            {/* Reset Confirmation Dialog */}
            <AnimatePresence>
              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                  onClick={handleResetCancel}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center">
                      <AlertTriangle size={24} className="mr-2" />
                      {t('reset.confirm_title')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                      {t('reset.confirm_message')}
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('reset.type_confirm')}
                      </label>
                      <input
                        type="text"
                        value={resetConfirmText}
                        onChange={(e) => setResetConfirmText(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-gray-200"
                        placeholder="RESET"
                        autoFocus
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleResetCancel}
                        variant="outline"
                        className="flex-1"
                      >
                        {t('reset.cancel')}
                      </Button>
                      <Button
                        onClick={handleResetConfirm}
                        disabled={resetConfirmText !== 'RESET'}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('reset.confirm_button')}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
                {t('modal.close')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
