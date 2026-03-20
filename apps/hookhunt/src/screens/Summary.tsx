import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type GameMode = 'singleplayer' | 'hotSeat';

interface SummaryProps {
  scores: { name: string; score: number }[];
  mode: GameMode;
  onPlayAgain: () => void;
  onBackToHub: () => void;
  animationsEnabled: boolean;
}

export default function SummaryScreen({ scores, onPlayAgain, onBackToHub, animationsEnabled }: SummaryProps) {
  const { t } = useTranslation();
  const winner = [...scores].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="flex-1 flex items-center justify-center bg-transparent py-2 sm:py-4 px-0 min-h-0">
      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-2xl p-6 md:p-8 w-full backdrop-blur-sm"
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">{t('screens.summary.title')}</h2>
          {winner && (
            <p className="text-orange-600 font-semibold">{t('screens.summary.winner', { name: winner.name })}</p>
          )}
        </div>

        <div className="space-y-2 mb-6">
          {scores.map(s => (
            <div key={s.name} className="flex items-center justify-between rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2">
              <div className="font-medium">{s.name}</div>
              <div className="text-sm">{s.score}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onPlayAgain} className="flex-1 rounded-xl px-4 py-3 bg-orange-500 text-white font-semibold">
            {t('screens.summary.playAgain')}
          </button>
          <button onClick={onBackToHub} className="flex-1 rounded-xl px-4 py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold">
            {t('screens.summary.backToHub')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
