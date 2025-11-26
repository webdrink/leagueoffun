import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import { Card, CardContent } from '../core/Card';
import VolumeControl from '../core/VolumeControl';
import { Music, Play, Zap, Settings, LogIn, User } from 'lucide-react';

// HookHunt store and types
import { useHookHuntStore, useHookHuntAuth, useHookHuntUI } from '../../store/hookHuntStore';
import { spotifyAuth, isSpotifyCallback, getCallbackCode, getCallbackError } from '../../lib/integrations/spotify/SpotifyAuth';
import { spotifyAPI } from '../../lib/integrations/spotify/SpotifyAPI';

interface HookHuntIntroScreenProps {
  onStartGame?: () => void;
}

/**
 * HookHunt Intro Screen Component
 * 
 * Purpose: Main entry point for the HookHunt music quiz game. Handles Spotify 
 * authentication, game mode selection, and navigation to playlist selection.
 * 
 * Props: HookHuntIntroScreenProps - Optional callback for starting the game
 * 
 * Expected behavior:
 * - Display game title and description
 * - Show Spotify login button when not authenticated
 * - Show user profile when authenticated
 * - Provide access to game settings
 * - Navigate to playlist selection when ready
 * 
 * Dependencies:
 * - HookHunt store for authentication and UI state
 * - Spotify integration for OAuth flow
 * - Framework core components (Button, Card, etc.)
 *
 * @returns {React.FC} A React functional component rendering the introductory screen.
 */
const IntroScreen: React.FC<IntroScreenProps> = ({
  gameSettings,
  isLoading,
  nameBlameMode,
  soundEnabled,
  onStartGame,
  onToggleNameBlame,
  onToggleSound,
  onVolumeChange,
  volume,
  onOpenDebugPanel,
  onOpenInfoModal,
  mainButtonLabel,
  onUpdateGameSettings: _onUpdateGameSettings,
  errorLoadingQuestions,
  supportedLanguages: _supportedLanguages,
  currentLanguage: _currentLanguage,
  onLanguageChange: _onLanguageChange,
  questionStats: _questionStats,
  showCategorySelectToggle,
  onToggleCategorySelect,
  onNameBlameModeChange
}) => {
  const { t } = useTranslation();
  
  const handleNameBlameModeToggle = (checked: boolean) => {
    console.log(`🎯 IntroScreen: handleNameBlameModeToggle called with checked=${checked}`);
    onToggleNameBlame(checked);
    if (onNameBlameModeChange) {
      console.log(`🎯 IntroScreen: Calling onNameBlameModeChange with enabled=${checked}`);
      onNameBlameModeChange(checked);
    } else {
      console.log(`🎯 IntroScreen: onNameBlameModeChange callback not provided`);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-2 border-pink-100"
    >      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-purple-700">{t('intro.heading')}</h1>
        <p className="text-pink-600 mt-2 text-sm sm:text-base">{t('intro.subheading')}</p>
      </div>      {errorLoadingQuestions && (
        <motion.div 
          initial={{opacity: 0, height: 0}} 
          animate={{opacity:1, height: 'auto'}}
          className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm"
        >
          <p className="font-semibold">{t('intro.error_loading_questions')}</p>
          <p className="mt-1">{t(errorLoadingQuestions)}</p>
        </motion.div>
      )}

      <div className="mt-6 flex flex-col space-y-4">
        <Button
          onClick={() => {
            console.log(`🎯 IntroScreen: Start button clicked - NameBlame: ${nameBlameMode}`);
            onStartGame();
          }}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg rounded-lg shadow-md transition-transform hover:scale-105 duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {mainButtonLabel || (isLoading ? t('intro.loading_questions') : t('intro.start_game'))}
        </Button>
        
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="nameBlameModeToggle" className="flex items-center cursor-pointer select-none">
            <Switch
              id="nameBlameModeToggle"
              checked={nameBlameMode}
              onCheckedChange={handleNameBlameModeToggle}
              className="data-[state=checked]:bg-pink-500"
            />
            <span className="ml-2 text-sm text-purple-700">{t('intro.name_blame_toggle')}</span>
          </Label>
        </div>
        
        {nameBlameMode && (
          <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
            <p className="text-xs text-purple-600 leading-relaxed">
              {t('intro.name_blame_explanation')}
            </p>
          </div>
        )}

        {showCategorySelectToggle && (
          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="categorySelectToggle" className="flex items-center cursor-pointer select-none">
              <Switch
                id="categorySelectToggle"
                checked={gameSettings.selectCategories}
                onCheckedChange={onToggleCategorySelect}
                className="data-[state=checked]:bg-purple-500"
              />
              <span className="ml-2 text-sm text-purple-700">{t('intro.select_categories')}</span>
            </Label>
          </div>
        )}
      </div>
        <div className="mt-4 pt-4 border-t border-pink-200">
        <VolumeControl 
          volume={volume} 
          onChange={onVolumeChange}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-pink-200">
        <LanguageSelector />
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="outline" onClick={onOpenDebugPanel} className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 border-purple-300 p-2">
          <SettingsIcon size={20} />
        </Button>
        <Button variant="outline" onClick={onOpenInfoModal} className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 border-purple-300 p-2">
          <InfoIcon size={20} />
        </Button>
      </div>
    </motion.div>
  );
};

export default IntroScreen;
