import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserPlus } from 'lucide-react';

type GameMode = 'singleplayer' | 'hotSeat';

interface PlayerSetupProps {
  mode: GameMode;
  initialPlayers?: string[];
  onSubmit: (names: string[]) => void;
  onBack: () => void;
  animationsEnabled: boolean;
}

function getInitialPlayers(mode: GameMode, initialPlayers?: string[]): string[] {
  if (initialPlayers && initialPlayers.length > 0) {
    return initialPlayers;
  }
  return mode === 'singleplayer' ? ['Player 1'] : ['Player 1', 'Player 2'];
}

export default function PlayerSetupScreen({ mode, initialPlayers, onSubmit, onBack, animationsEnabled }: PlayerSetupProps) {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<string[]>(() => getInitialPlayers(mode, initialPlayers));

  useEffect(() => {
    setPlayers(getInitialPlayers(mode, initialPlayers));
  }, [mode, initialPlayers]);

  const addPlayer = () => setPlayers(prev => [...prev, `Player ${prev.length + 1}`]);
  const updatePlayer = (idx: number, value: string) => setPlayers(prev => prev.map((p, i) => (i === idx ? value : p)));
  const removePlayer = (idx: number) => setPlayers(prev => prev.filter((_, i) => i !== idx));

  const canContinue = players.filter(p => p.trim().length > 0).length >= (mode === 'singleplayer' ? 1 : 2);

  return (
    <div className="flex-1 flex items-start justify-center bg-transparent py-2 sm:py-3 px-0 min-h-0">
      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hh-surface-card p-6 md:p-8 w-full"
      >
        <div className="hh-content flex items-center justify-between mb-2">
          <button onClick={onBack} className="hh-btn-muted !w-auto !px-3 !py-2">
            <ArrowLeft size={18} /> {t('screens.playerSetup.back')}
          </button>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('screens.playerSetup.title')}</h2>
          <div />
        </div>

        <div className="hh-content mb-3">
          <p className="hh-subtitle">
            {mode === 'singleplayer' ? 'Solo mode enabled. Add your player name to continue.' : 'Add all players for your Hot Seat round.'}
          </p>
        </div>

        <div className="hh-content space-y-3">
          {players.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={p}
                onChange={e => updatePlayer(i, e.target.value)}
                placeholder={t('screens.playerSetup.placeholder', { number: i + 1 })}
                className="hh-input"
              />
              {mode === 'hotSeat' && players.length > 2 && (
                <button onClick={() => removePlayer(i)} className="rounded-2xl px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors">×</button>
              )}
            </div>
          ))}

          {mode === 'hotSeat' && (
            <button onClick={addPlayer} className="hh-btn-muted !w-auto">
              <UserPlus size={18} /> {t('screens.playerSetup.addPlayer')}
            </button>
          )}
        </div>

        <div className="hh-content mt-6">
          <button
            disabled={!canContinue}
            onClick={() => onSubmit(players)}
            className={`hh-btn-primary ${!canContinue ? '!bg-slate-300 dark:!bg-slate-700 !text-slate-500 !cursor-not-allowed !shadow-none hover:!from-orange-500 hover:!to-rose-500' : ''}`}
          >
            {t('screens.playerSetup.continue')}
          </button>
          {!canContinue && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'singleplayer' ? 'Please enter at least one name.' : 'Please enter at least two players.'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
