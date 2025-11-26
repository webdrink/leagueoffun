/**
 * GameMenu (temporary placeholder)
 * Renders discovered games; until modules exist shows informational message.
 */
import React from 'react';
import { discoverGameConfigs } from '../config/discovery/discover';

export interface GameMenuProps {
  onSelect: (id: string) => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ onSelect }) => {
  const configs = discoverGameConfigs();
  if (!configs.length) {
    return <div className="p-4 text-sm text-gray-500">No modular games discovered yet. Legacy BlameGame running.</div>;
  }
  return (
    <div className="grid gap-4 p-4">
      {configs.map(cfg => (
        <button key={cfg.id} className="rounded border p-4 text-left hover:bg-gray-50" onClick={() => onSelect(cfg.id)}>
          <div className="font-semibold">{cfg.title}</div>
          <div className="text-xs mt-1 text-gray-600">{cfg.description}</div>
          <div className="text-[10px] mt-2 uppercase tracking-wide text-gray-400">{cfg.minPlayers}-{cfg.maxPlayers} players</div>
        </button>
      ))}
    </div>
  );
};

export default GameMenu;
