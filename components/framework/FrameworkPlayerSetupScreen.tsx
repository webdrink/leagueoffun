/**
 * FrameworkPlayerSetupScreen  
 * Framework-compatible version of PlayerSetupScreen for NameBlame mode.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { Button } from '../core/Button';
import { ArrowLeft, Plus, X } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import useNameBlameSetup from '../../hooks/useNameBlameSetup';

const FrameworkPlayerSetupScreen: React.FC = () => {
  const { dispatch } = useFrameworkRouter();
  const { t } = useTranslation();
  
  // Use shared NameBlame hook for player data management with localStorage persistence
  const {
    players,
    tempPlayerName,
    nameInputError,
    setTempPlayerName,
    addPlayer,
    removePlayer
  } = useNameBlameSetup();

  const handleAddPlayer = () => {
    addPlayer();
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId);
  };

  const handleStartGame = () => {
    if (players.length < 3) {
      return; // Error already handled by hook
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-800/95"
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
              {t('players.setup_title')}
            </h1>
          </div>

          {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 text-center">
              {t('players.min_players_nameblame_hint')}
            </p>

          {/* Add Player Input */}
          <div className="mb-6">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tempPlayerName}
                onChange={(e) => {
                  setTempPlayerName(e.target.value);
                  // Error clearing is handled by the hook
                }}
                onKeyPress={handleKeyPress}
                placeholder={t('players.player_name_input')}
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
              {t('players.player_name')} ({players.length}/12)
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
                <p className="text-sm">{t('players.add_players_to_start')}</p>
              </div>
            )}
          </div>

          {/* Min Players Warning */}
          {players.length > 0 && players.length < 3 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-600/40 rounded-lg p-3 mb-6">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                {t('players.min_players')}
              </p>
            </div>
          )}

          {/* Start Game Button */}
          <Button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
            disabled={players.length < 3}
          >
            {players.length >= 3 ? t('players.start_game') : t('players.add_player')}
          </Button>
        </motion.div>
      </div>
  );
};

export default FrameworkPlayerSetupScreen;