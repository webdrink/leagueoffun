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
    <div className="flex-1 flex items-start justify-center bg-transparent py-2 sm:py-3 px-0 min-h-0">
      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hh-surface-card p-6 md:p-8 w-full"
      >
        <div className="hh-content text-center mb-5">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">{t('screens.summary.title')}</h2>
          {winner && (
            <p className="text-orange-600 dark:text-orange-300 font-semibold mt-1">{t('screens.summary.winner', { name: winner.name })}</p>
          )}
        </div>

        <div className="hh-content space-y-2 mb-6">
          {scores.map(s => (
            <div key={s.name} className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-4 py-3">
              <div className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</div>
              <div className="hh-chip">{s.score}</div>
            </div>
          ))}
        </div>

        <div className="hh-content flex gap-2">
          <button onClick={onPlayAgain} className="hh-btn-primary flex-1 !py-3">
            {t('screens.summary.playAgain')}
          </button>
          <button onClick={onBackToHub} className="hh-btn-muted flex-1 !py-3">
            {t('screens.summary.backToHub')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
