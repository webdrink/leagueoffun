/**
 * QuestionProgress Component
 *
 * Purpose: Displays the current question number, total questions, and a visual progress bar.
 *
 * Props:
 *  - currentQuestion: The current question number (1-indexed).
 *  - totalQuestions: The total number of questions.
 *
 * Dependencies:
 *  - React
 *  - framer-motion (for animated progress bar)
 *  - react-i18next (for translations)
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface QuestionProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

/**
 * Displays the current question progress in a quiz or game.
 *
 * @component
 * @param {QuestionProgressProps} props - The component props.
 * @param {number} props.currentQuestion - The current question number (1-based).
 * @param {number} props.totalQuestions - The total number of questions.
 * @returns {JSX.Element} The rendered progress bar and question counter.
 *
 * @remarks
 * Uses `framer-motion` for animated progress bar transitions and `useTranslation` for localization.
 */
const QuestionProgress: React.FC<QuestionProgressProps> = ({ currentQuestion, totalQuestions }) => {
  const { t } = useTranslation();
  const progressPercentage = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className="w-full px-4 py-2">
      <div className="text-center mb-2">
        <p className="text-sm font-medium text-white">
          {t('questions.counter', { current: currentQuestion, total: totalQuestions })}
        </p>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <motion.div
          className="bg-green-500 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default QuestionProgress;
