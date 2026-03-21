import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Music, Play, Users } from 'lucide-react';

type GameMode = 'singleplayer' | 'hotSeat';

interface IntroProps {
  onStart: (mode: GameMode) => void;
  animationsEnabled: boolean;
}

export default function IntroScreen({ onStart, animationsEnabled }: IntroProps) {
  const { t } = useTranslation();

  const variants = animationsEnabled
    ? { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }
    : { initial: {}, animate: {} };

  return (
    <div className="flex-1 flex items-start justify-center bg-transparent py-2 sm:py-3 px-0 min-h-0">
      <motion.div
        initial={variants.initial}
        animate={variants.animate}
        transition={{ duration: 0.5 }}
        className="hh-surface-card p-6 md:p-8 w-full"
      >
        <div className="hh-content flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/40 dark:ring-slate-800/70">
              <Music size={40} className="text-white" />
            </div>
          </div>
        </div>
        <div className="hh-content text-center mb-6">
          <p className="hh-label mb-2">{t('game.subtitle')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mb-2">{t('screens.intro.title')}</h2>
          <p className="hh-subtitle max-w-xl mx-auto">{t('screens.intro.description')}</p>
        </div>

        <div className="hh-content space-y-3">
          <button
            onClick={() => onStart('singleplayer')}
            className="hh-btn-primary"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Play size={20} />
              {t('screens.intro.singleplayer')}
            </span>
          </button>

          <button
            onClick={() => onStart('hotSeat')}
            className="hh-btn-secondary"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Users size={20} />
              {t('screens.intro.hotSeat')}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
