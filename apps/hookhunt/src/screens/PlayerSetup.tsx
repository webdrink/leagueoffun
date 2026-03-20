import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserPlus } from 'lucide-react';

type GameMode = 'singleplayer' | 'hotSeat';

interface PlayerSetupProps {
  mode: GameMode;
  onSubmit: (names: string[]) => void;
  onBack: () => void;
  animationsEnabled: boolean;
}

export default function PlayerSetupScreen({ mode, onSubmit, onBack, animationsEnabled }: PlayerSetupProps) {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<string[]>(mode === 'singleplayer' ? ['Player 1'] : ['Player 1', 'Player 2']);

  const addPlayer = () => setPlayers(prev => [...prev, `Player ${prev.length + 1}`]);
  const updatePlayer = (idx: number, value: string) => setPlayers(prev => prev.map((p, i) => (i === idx ? value : p)));
  const removePlayer = (idx: number) => setPlayers(prev => prev.filter((_, i) => i !== idx));

  const canContinue = players.filter(p => p.trim().length > 0).length >= (mode === 'singleplayer' ? 1 : 2);

  return (
    <div className="flex-1 flex items-center justify-center bg-transparent py-2 sm:py-4 px-0 min-h-0">
      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-2xl p-6 md:p-8 w-full backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <ArrowLeft size={18} /> {t('screens.playerSetup.back')}
          </button>
          <h2 className="text-lg font-bold">{t('screens.playerSetup.title')}</h2>
          <div />
        </div>

        <div className="space-y-3">
          {players.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={p}
                onChange={e => updatePlayer(i, e.target.value)}
                placeholder={t('screens.playerSetup.placeholder', { number: i + 1 })}
                className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
              {mode === 'hotSeat' && players.length > 2 && (
                <button onClick={() => removePlayer(i)} className="rounded-xl px-3 py-2 bg-red-500 text-white">×</button>
              )}
            </div>
          ))}

          {mode === 'hotSeat' && (
            <button onClick={addPlayer} className="flex items-center gap-2 rounded-xl px-3 py-2 bg-amber-500 text-white">
              <UserPlus size={18} /> {t('screens.playerSetup.addPlayer')}
            </button>
          )}
        </div>

        <div className="mt-6">
          <button
            disabled={!canContinue}
            onClick={() => onSubmit(players)}
            className={`w-full font-bold py-3 rounded-xl transition ${
              canContinue ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('screens.playerSetup.continue')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
