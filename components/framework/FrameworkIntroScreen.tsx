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
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-4">
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
          className={`${theme.cardBackground || 'bg-white dark:bg-gray-800'} rounded-3xl shadow-2xl p-6 md:p-8 w-full backdrop-blur-sm bg-white/95 dark:bg-gray-800/95`}
        >

          {/* Main Question */}
          {branding.mainQuestion && (
            <div className="text-center mb-8">
              <h2 className={`text-2xl lg:text-3xl font-bold text-${accentColor}-800 dark:text-${accentColor}-200 mb-2`}>
                {t(branding.mainQuestion)}
              </h2>
              {branding.subtitle && (
                <p className="text-gray-700 dark:text-gray-200 text-sm lg:text-base">
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

          {/* Game-specific Options - Only category selection stays here */}
          {features.categorySelection && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleToggleCategorySelection(!selectCategories)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 shadow-sm ${
                    selectCategories 
                      ? `bg-${accentColor}-50 dark:bg-${accentColor}-900/30 border-${accentColor}-300 dark:border-${accentColor}-600 text-${accentColor}-800 dark:text-${accentColor}-200 ring-2 ring-${colors.primary}/20` 
                      : `border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-${accentColor}-300 dark:hover:border-${accentColor}-500 hover:bg-${accentColor}-50 dark:hover:bg-${accentColor}-900/20`
                  }`}
                >
                  <motion.span 
                    className="text-sm font-medium"
                    animate={selectCategories ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    {t('intro.select_categories')}
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Game Mode Toggle - detailed option */}
          {features.gameMode && (
            <motion.div 
              className={`bg-${accentColor}-50 dark:bg-${accentColor}-900/30 rounded-xl p-4 mb-4 border-2 border-${accentColor}-100 dark:border-${accentColor}-800 hover:border-${colors.primary}/30 dark:hover:border-${colors.primary}/50 transition-all duration-200 shadow-sm`}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="gameModeToggle" className="flex items-center cursor-pointer select-none">
                  <Switch
                    id="gameModeToggle"
                    checked={gameMode}
                    onCheckedChange={handleToggleGameMode}
                    className={`data-[state=checked]:bg-${accentColor}-500`}
                  />
                  <span className={`ml-3 font-medium text-${accentColor}-800 dark:text-${accentColor}-200`}>
                    {t('intro.name_blame_mode')}
                  </span>
                </Label>
              </div>
              {gameMode && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-xs text-${accentColor}-700 dark:text-${accentColor}-300 leading-relaxed`}
                >
                  {t('intro.name_blame_explanation')}
                </motion.p>
              )}
            </motion.div>
          )}


        </motion.div>
      </div>
  );
};

export default FrameworkIntroScreen;