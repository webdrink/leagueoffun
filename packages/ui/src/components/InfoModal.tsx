import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  onResetAppData?: () => void;
  resetLabel?: string;
  resetConfirmLabel?: string;
  resetConfirmPhrase?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title = 'Information',
  children,
  onResetAppData,
  resetLabel = 'Reset all local data',
  resetConfirmLabel = 'Type RESET to confirm',
  resetConfirmPhrase = 'RESET'
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleResetConfirm = () => {
    if (resetConfirmText !== resetConfirmPhrase || !onResetAppData) {
      return;
    }
    onResetAppData();
    setShowResetConfirm(false);
    setResetConfirmText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>

            {children && <div className="mb-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">{children}</div>}

            {onResetAppData && (
              <div className="mb-6 rounded-lg border-2 border-red-500/40 bg-red-50 p-4 dark:bg-red-900/20">
                <h3 className="mb-2 flex items-center text-lg font-semibold text-red-700 dark:text-red-400">
                  <AlertTriangle size={20} className="mr-2" />
                  Danger Zone
                </h3>
                <Button className="w-full bg-red-600 text-white hover:bg-red-700" onClick={() => setShowResetConfirm(true)}>
                  {resetLabel}
                </Button>
              </div>
            )}

            <AnimatePresence>
              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmText('');
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <h3 className="mb-4 flex items-center text-xl font-bold text-red-600 dark:text-red-400">
                      <AlertTriangle size={24} className="mr-2" />
                      Confirm reset
                    </h3>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {resetConfirmLabel}
                    </label>
                    <input
                      autoFocus
                      className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      onChange={(event) => setResetConfirmText(event.target.value)}
                      placeholder={resetConfirmPhrase}
                      type="text"
                      value={resetConfirmText}
                    />
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setShowResetConfirm(false);
                          setResetConfirmText('');
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-red-600 text-white hover:bg-red-700"
                        disabled={resetConfirmText !== resetConfirmPhrase}
                        onClick={handleResetConfirm}
                      >
                        Confirm
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end">
              <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
