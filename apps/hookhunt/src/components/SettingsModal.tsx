import React from 'react';

type GameMode = 'singleplayer' | 'hotSeat';

interface Settings {
  gameMode: GameMode;
  playerNames: string[];
  currentPlayerIndex: number;
  pointsToWin: number;
  matchThreshold: number;
  pointsForPartial: number;
  pointsForFull: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (s: Settings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onChange }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="hh-surface-card w-full max-w-md p-5">
        <div className="hh-content">
          <p className="hh-label mb-1">Game Config</p>
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-4">Settings</h3>
        </div>

        <div className="hh-content space-y-3">
          <label className="flex items-center justify-between gap-3">
            <span className="text-slate-700 dark:text-slate-200 font-medium">Points to win</span>
            <input
              type="number"
              min={1}
              value={settings.pointsToWin}
              onChange={e => onChange({ ...settings, pointsToWin: parseInt(e.target.value || '10') })}
              className="hh-input w-24 text-sm py-1.5 px-2.5"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-slate-700 dark:text-slate-200 font-medium">Match threshold (%)</span>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.matchThreshold}
              onChange={e => onChange({ ...settings, matchThreshold: parseInt(e.target.value || '70') })}
              className="hh-input w-24 text-sm py-1.5 px-2.5"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-slate-700 dark:text-slate-200 font-medium">Points (partial)</span>
            <input
              type="number"
              min={0}
              value={settings.pointsForPartial}
              onChange={e => onChange({ ...settings, pointsForPartial: parseInt(e.target.value || '1') })}
              className="hh-input w-24 text-sm py-1.5 px-2.5"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-slate-700 dark:text-slate-200 font-medium">Points (full)</span>
            <input
              type="number"
              min={0}
              value={settings.pointsForFull}
              onChange={e => onChange({ ...settings, pointsForFull: parseInt(e.target.value || '2') })}
              className="hh-input w-24 text-sm py-1.5 px-2.5"
            />
          </label>
        </div>

        <div className="hh-content mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="hh-btn-muted !w-auto">Close</button>
        </div>
      </div>
    </div>
  );
}
