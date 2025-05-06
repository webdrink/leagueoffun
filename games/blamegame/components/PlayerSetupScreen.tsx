import React from 'react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Player } from '../types';

interface PlayerSetupScreenProps {
  players: Player[];
  tempPlayerName: string;
  nameInputError: string | null;
  onPlayerNameChange: (id: string, name: string) => void;
  onRemovePlayer: (id: string) => void;
  onTempPlayerNameChange: (name: string) => void;
  onAddPlayer: () => void;
  onStartGame: () => void;
  onBackToIntro: () => void;
}

const PlayerSetupScreen: React.FC<PlayerSetupScreenProps> = ({
  players,
  tempPlayerName,
  nameInputError,
  onPlayerNameChange,
  onRemovePlayer,
  onTempPlayerNameChange,
  onAddPlayer,
  onStartGame,
  onBackToIntro
}) => {
  return (
    <motion.div
      key="playerSetup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-lg w-full"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">Spielernamen eingeben</h2>
      
      {/* Existing players list */}
      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
        {players.map((player, idx) => (
          <div key={player.id} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder={`Spieler ${idx + 1}`}
              value={player.name}
              onChange={(e) => onPlayerNameChange(player.id, e.target.value)}
              className="flex-grow"
            />
            {players.length > 2 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemovePlayer(player.id)} 
                className="text-red-500 hover:text-red-700"
                aria-label="Spieler entfernen"
              >
                X
              </Button>
            )}
          </div>
        ))}
      </div>
      
      {/* Add new player section */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Neuer Spielername"
            value={tempPlayerName}
            onChange={(e) => onTempPlayerNameChange(e.target.value)}
            className="flex-grow"
            onKeyDown={(e) => e.key === 'Enter' && onAddPlayer()}
          />
          <Button 
            onClick={onAddPlayer} 
            disabled={players.length >= 10} 
            variant="outline" 
            className="bg-green-100 hover:bg-green-200 text-green-800"
          >
            +
          </Button>
        </div>
        {nameInputError && (
          <p className="text-red-600 text-sm mt-2">{nameInputError}</p>
        )}
        <div className="flex justify-end mt-2">
          <span className="text-xs text-gray-500">{players.length} / 10 Spieler</span>
        </div>
      </div>
      
      <Button 
        onClick={onStartGame} 
        size="lg" 
        className="w-full transition-transform hover:scale-105 duration-300 bg-green-500 hover:bg-green-600 text-white"
        disabled={players.filter(p => p.name.trim() !== '').length < 2}
      >
        Spiel starten
      </Button>
      <Button variant="link" onClick={onBackToIntro} className="mt-3 text-sm text-gray-600 w-full">
        Zurück zum Hauptmenü
      </Button>
    </motion.div>
  );
};

export default PlayerSetupScreen;
