import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './Button'; // Assuming Button is in the same core directory
import useTranslation from '../../hooks/useTranslation';

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
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >            <h2 className="text-xl font-semibold mb-4">{title || t('modal.info_title')}</h2>
            <div className="mb-6 space-y-3 text-sm text-gray-700">
              {children ? children : (
                <>
                  <p>{t('modal.info_description')}</p>
                  <p>{t('modal.reset_data_description')}</p>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <Button onClick={onClose} variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                {t('modal.close')}
              </Button>
              <Button onClick={() => { onResetAppData(); onClose(); }} className="bg-red-500 hover:bg-red-600 text-white">
                {t('modal.reset_app_data')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
