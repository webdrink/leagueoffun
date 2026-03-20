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
    <div className="flex-1 flex items-center justify-center bg-transparent py-2 sm:py-4 px-0 min-h-0">
      <motion.div
        initial={variants.initial}
        animate={variants.animate}
        transition={{ duration: 0.5 }}
        className="bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-2xl p-6 md:p-8 w-full backdrop-blur-sm"
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl">
              <Music size={40} className="text-white" />
            </div>
          </div>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">{t('screens.intro.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300">{t('screens.intro.description')}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onStart('singleplayer')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center gap-2">
              <Play size={20} />
              {t('screens.intro.singleplayer')}
            </span>
          </button>

          <button
            onClick={() => onStart('hotSeat')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center gap-2">
              <Users size={20} />
              {t('screens.intro.hotSeat')}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
