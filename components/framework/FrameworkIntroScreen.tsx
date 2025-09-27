/**
 * FrameworkIntroScreen
 * Config-driven, modular intro screen with proper header/main/footer layout.
 * Features are enabled/disabled based on game.json UI configuration.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { Button } from '../core/Button';
import { Label } from '../core/Label';
import { Switch } from '../core/Switch';
import useTranslation from '../../hooks/useTranslation';
import { useGameSettings } from '../../hooks/useGameSettings';
import { GameSettings } from '../../types';

const FrameworkIntroScreen: React.FC = () => {
  const { dispatch, config } = useFrameworkRouter();
  const { t } = useTranslation();
  
  // UI configuration from game.json
  const ui = config.ui;
  const features = ui?.features || {};
  const branding = ui?.branding || {};
  const theme = ui?.theme || {};
  
  // Global game settings (persisted)
  const { gameSettings, updateGameSettings } = useGameSettings();
  // gameMode is a union 'classic' | 'nameBlame'; avoid comparing to lowercase variant to satisfy TS
  const isNameBlame = gameSettings.gameMode === 'nameBlame';
  // Local UI state mirrors store for immediate responsiveness if needed
  const [gameMode, setGameMode] = useState(isNameBlame);

  // Keep local mirror in sync if external change happens (future-proofing)
  useEffect(() => {
    if (isNameBlame !== gameMode) {
      setGameMode(isNameBlame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNameBlame]);
  const [selectCategories, setSelectCategories] = useState(gameSettings?.selectCategories || false);

  const handleStartGame = () => {
    dispatch(GameAction.ADVANCE);
  };

  const handleToggleGameMode = (checked: boolean) => {
    // Update local for instant UI response
    setGameMode(checked);
    // Persist to store synchronously so phase transition can read it
    updateGameSettings({ gameMode: checked ? 'nameBlame' : 'classic' } as Partial<GameSettings>);
    console.log('Game mode changed to:', checked ? 'nameBlame' : 'classic');
  };

  const handleToggleCategorySelection = (checked: boolean) => {
    // Update local for instant UI response
    setSelectCategories(checked);
    // Persist to store synchronously so phase transition can read it
    updateGameSettings({ selectCategories: checked } as Partial<GameSettings>);
    console.log('Category selection changed to:', checked);
  };

  // Dynamic styling based on config
  const accentColor = theme.accentColor || 'purple';
  
  // New 5-color system support
  const colors = theme.colors || {
    primary: 'purple-500',
    secondary: 'pink-500',
    accent: 'indigo-500',
    neutral: 'gray-500',
    highlight: 'yellow-400'
  };
  


  return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] py-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            boxShadow: [
              "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
              "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            ]
          }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1,
            boxShadow: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className={`${theme.cardBackground || 'bg-white dark:bg-gray-800'} rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-800/95`}
        >

          {/* Main Question */}
          {branding.mainQuestion && (
            <div className="text-center mb-8">
              <h2 className={`text-2xl lg:text-3xl font-bold text-${accentColor}-800 dark:text-${accentColor}-200 mb-2`}>
                {t(branding.mainQuestion)}
              </h2>
              {branding.subtitle && (
                <p className="
                  text-gray-700 dark:text-gray-200 
                  text-sm sm:text-base lg:text-lg
                  w-full max-w-full
                  break-words hyphens-auto
                  overflow-hidden
                  line-clamp-3
                  leading-relaxed
                  px-2
                ">
                  {t(branding.subtitle)}
                </p>
              )}
            </div>
          )}

          {/* Start Game Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={handleStartGame}
              className={`w-full bg-gradient-to-r from-${colors.primary} to-${colors.secondary} hover:from-${colors.primary.replace('-500', '-600')} hover:to-${colors.secondary.replace('-500', '-600')} text-white font-bold py-4 lg:py-5 px-6 rounded-xl transition-all duration-200 shadow-lg mb-6 text-lg lg:text-xl relative overflow-hidden`}
            >
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-xl"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ type: "tween", duration: 0.6 }}
              />
              <span className="relative z-10">{t('intro.start_game')}</span>
            </Button>
          </motion.div>

          {/* Game-specific Options - Category Selection Toggle */}
          {features.categorySelection && (
            <motion.div 
              className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="categorySelectionToggle" className="flex items-center cursor-pointer select-none">
                  <Switch
                    id="categorySelectionToggle"
                    checked={selectCategories}
                    onCheckedChange={handleToggleCategorySelection}
                    className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
                  />
                  <span className="ml-3 font-medium text-gray-800 dark:text-gray-200">
                    {t('intro.select_categories')}
                  </span>
                </Label>
              </div>
              {selectCategories && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed"
                >
                  Du kannst spezifische Kategorien für das Spiel auswählen.
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Game Mode Toggle - Enhanced NameBlame option */}
          {features.gameMode && (
            <motion.div 
              className={`relative overflow-hidden rounded-xl p-4 mb-4 border-2 transition-all duration-300 shadow-lg ${
                gameMode 
                  ? `bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-purple-300 dark:border-purple-600 ring-2 ring-purple-200 dark:ring-purple-700/50` 
                  : `bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600`
              }`}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {gameMode && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <Label htmlFor="gameModeToggle" className="flex items-center cursor-pointer select-none flex-grow">
                  <Switch
                    id="gameModeToggle"
                    checked={gameMode}
                    onCheckedChange={handleToggleGameMode}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600 shadow-lg"
                  />
                  <div className="ml-3 flex-grow">
                    <span className={`font-semibold text-base ${
                      gameMode 
                        ? 'text-purple-800 dark:text-purple-200' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {t('intro.name_blame_mode')}
                    </span>
                    {gameMode && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center mt-1"
                      >
                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
                          AKTIV
                        </span>
                      </motion.div>
                    )}
                  </div>
                </Label>
              </div>
              {gameMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700"
                >
                  <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                    {t('intro.name_blame_explanation')}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}


        </motion.div>
      </div>
  );
};

export default FrameworkIntroScreen;