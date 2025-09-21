/**
 * FrameworkPlayerSetupScreen
 * Framework-compatible version of PlayerSetupScreen for NameBlame mode.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { Button } from '../core/Button';
import { ArrowLeft, Plus, X } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import GameShell from './GameShell';

interface Player {
  id: string;
  name: string;
}

const FrameworkPlayerSetupScreen: React.FC = () => {
  const { dispatch } = useFrameworkRouter();
  const { t } = useTranslation();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [nameInputError, setNameInputError] = useState('');

  const handleAddPlayer = () => {
    if (!tempPlayerName.trim()) {
      setNameInputError(t('playerSetup.name_required'));
      return;
    }
    
    if (players.some(p => p.name.toLowerCase() === tempPlayerName.toLowerCase())) {
      setNameInputError(t('playerSetup.name_duplicate'));
      return;
    }
    
    if (players.length >= 12) {
      setNameInputError(t('playerSetup.max_players'));
      return;
    }

    const newPlayer: Player = {
      id: `player-${Date.now()}-${Math.random()}`,
      name: tempPlayerName.trim()
    };
    
    setPlayers([...players, newPlayer]);
    setTempPlayerName('');
    setNameInputError('');
  };

  const handleRemovePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const handleStartGame = () => {
    if (players.length < 3) {
      setNameInputError(t('playerSetup.min_players_nameblame'));
      return;
    }
    dispatch(GameAction.ADVANCE);
  };

  const handleBack = () => {
    dispatch(GameAction.BACK);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  return (
    <GameShell>
      <div className="flex flex-col items-center justify-start py-4 px-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl shadow-2xl p-6 md:p-8 w-full backdrop-blur-sm bg-white/95 dark:bg-gray-800/95"
        >
          {/* Header Row (secondary inside card) */}
          <div className="flex items-center mb-6">
            <Button
              onClick={handleBack}
              variant="outline"
              className="mr-3 p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {t('playerSetup.title')}
            </h1>
          </div>

          {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 text-center">
              {t('playerSetup.nameblame_description')}
            </p>

          {/* Add Player Input */}
          <div className="mb-6">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tempPlayerName}
                onChange={(e) => {
                  setTempPlayerName(e.target.value);
                  if (nameInputError) setNameInputError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder={t('playerSetup.enter_name')}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                maxLength={20}
              />
              <Button
                onClick={handleAddPlayer}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4"
                disabled={!tempPlayerName.trim() || players.length >= 12}
              >
                <Plus size={16} />
              </Button>
            </div>
            {nameInputError && (
              <p className="text-red-500 text-xs">{nameInputError}</p>
            )}
          </div>

          {/* Players List */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-3">
              {t('playerSetup.players')} ({players.length}/12)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <span className="font-medium text-purple-800 dark:text-purple-200">{player.name}</span>
                  </div>
                  <Button
                    onClick={() => handleRemovePlayer(player.id)}
                    variant="outline"
                    className="text-red-500 hover:text-red-700 p-1 border-red-200 dark:border-red-400/40 hover:border-red-300 dark:hover:border-red-300"
                  >
                    <X size={16} />
                  </Button>
                </motion.div>
              ))}
            </div>
            
            {players.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">{t('playerSetup.no_players')}</p>
              </div>
            )}
          </div>

          {/* Min Players Warning */}
          {players.length > 0 && players.length < 3 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-600/40 rounded-lg p-3 mb-6">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                {t('playerSetup.need_more_players', { count: 3 - players.length })}
              </p>
            </div>
          )}

          {/* Start Game Button */}
          <Button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
            disabled={players.length < 3}
          >
            {players.length >= 3 ? t('playerSetup.start_game') : t('playerSetup.add_players')}
          </Button>
        </motion.div>
      </div>
    </GameShell>
  );
};

export default FrameworkPlayerSetupScreen;