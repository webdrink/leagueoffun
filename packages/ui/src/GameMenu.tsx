/**
 * GameMenu
 * Renders discovered games with a consistent, framework-owned menu UI.
 */
import React from 'react';
import { discoverGameConfigs, GameConfig } from '@leagueoffun/game-core';

export interface GameMenuProps {
  onSelect: (id: string) => void;
  configs?: GameConfig[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const GameMenu: React.FC<GameMenuProps> = ({
  onSelect,
  configs,
  title = 'Choose a Game',
  subtitle = 'Select one of the registered modules to continue.',
  className = ''
}) => {
  const discoveredConfigs = discoverGameConfigs();
  const activeConfigs = configs ?? discoveredConfigs;

  if (!activeConfigs.length) {
    return (
      <div className={`mx-auto max-w-3xl p-6 ${className}`}>
        <div className="rounded-2xl border border-amber-300/40 bg-white/80 p-6 text-center shadow-lg backdrop-blur dark:border-amber-500/30 dark:bg-gray-900/70">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">No modular games discovered</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Register a game module and expose a valid `game.json` to show it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {activeConfigs.map((cfg) => (
          <button
            key={cfg.id}
            className="group rounded-2xl border border-white/60 bg-white/85 p-5 text-left shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900/75"
            onClick={() => onSelect(cfg.id)}
            type="button"
          >
            <div className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-amber-700 dark:text-gray-100 dark:group-hover:text-amber-300">
              {cfg.title}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{cfg.description}</p>
            <div className="mt-4 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {cfg.minPlayers}-{cfg.maxPlayers} players
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameMenu;
