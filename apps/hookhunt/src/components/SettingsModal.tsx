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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-4">
        <h3 className="text-lg font-bold mb-3">Settings</h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Points to win</span>
            <input
              type="number"
              min={1}
              value={settings.pointsToWin}
              onChange={e => onChange({ ...settings, pointsToWin: parseInt(e.target.value || '10') })}
              className="w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Match threshold (%)</span>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.matchThreshold}
              onChange={e => onChange({ ...settings, matchThreshold: parseInt(e.target.value || '70') })}
              className="w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Points (partial)</span>
            <input
              type="number"
              min={0}
              value={settings.pointsForPartial}
              onChange={e => onChange({ ...settings, pointsForPartial: parseInt(e.target.value || '1') })}
              className="w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Points (full)</span>
            <input
              type="number"
              min={0}
              value={settings.pointsForFull}
              onChange={e => onChange({ ...settings, pointsForFull: parseInt(e.target.value || '2') })}
              className="w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
}
