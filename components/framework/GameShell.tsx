/**
 * GameShell
 * Configurable layout wrapper that provides header/main/footer structure
 * based on game.json UI configuration. Handles persistent UI elements.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Info, Volume2, VolumeX, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../core/Button';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import InfoModal from '../core/InfoModal';
import LanguageSelector from '../settings/LanguageSelector';
import GameSettingsPanel from './GameSettingsPanel';
import useTranslation from '../../hooks/useTranslation';
import useDarkMode from '../../hooks/useDarkMode';
import { GameSettings } from '../../framework/config/game.schema';

interface GameShellProps {
  children: React.ReactNode;
  className?: string;
}

const GameShell: React.FC<GameShellProps> = ({ children, className = '' }) => {
  const { config } = useFrameworkRouter();
  const { t } = useTranslation();
  
  // UI configuration from game.json
  const ui = config.ui;
  const layout = ui?.layout || {};
  const features = ui?.features || {};
  const branding = ui?.branding || {};
  const theme = ui?.theme || {};
  
  // Local state for modals and settings
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Dark mode support
  const { isDark, preference, toggle: toggleDarkMode } = useDarkMode();

  // Dynamic styling based on config
  const gradientBg = `bg-gradient-to-br ${theme.primaryGradient || 'from-pink-400 via-purple-500 to-indigo-600'}`;
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
    <div className={`min-h-screen ${gradientBg} dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}>
      {/* Fixed Layout Container */}
      <div className="min-h-screen flex flex-col">
        {/* Main Viewport-Responsive Container */}
        <div className="flex flex-col min-h-screen max-w-md lg:max-w-lg xl:max-w-xl mx-auto w-full px-4 sm:px-6">
          
          {/* Header with animated title card */}
          {layout.showHeader && (
            <header className={`flex-shrink-0 flex justify-center pt-6 pb-4 ${layout.headerStyle === 'compact' ? 'pt-3 pb-2' : 'pt-6 pb-4'}`}> 
              <div className={`${theme.cardBackground || 'bg-white dark:bg-gray-800'} rounded-3xl shadow-2xl p-4 md:p-6 w-full backdrop-blur-sm bg-white/90 dark:bg-gray-800/90`}>
                <div className="text-center">
                  <motion.h1 
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: 0.1
                    }}
                    className={`text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-${colors.primary} to-${colors.secondary} dark:from-${colors.primary.replace('-500', '-400')} dark:to-${colors.secondary.replace('-500', '-400')} mb-2 break-words drop-shadow-sm`}
                  >
                    {branding.gameName || config.title}
                  </motion.h1>
                  {branding.tagline && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className={`text-${accentColor}-600 dark:text-${accentColor}-400 font-medium text-sm md:text-base`}
                    >
                      {t(branding.tagline)}
                    </motion.p>
                  )}
                </div>
              </div>
            </header>
          )}

          {/* Main Content Area - scrollable */}
          <main className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </main>

          {/* Fixed Footer at bottom */}
          {layout.showFooter && (
            <footer className="flex-shrink-0 pb-6 pt-4 safe-area-inset-bottom">
              <div className="bg-black/20 dark:bg-black/40 backdrop-blur-md rounded-2xl p-3 mx-auto max-w-fit">
                <div className="flex flex-wrap justify-center items-center gap-3 text-white dark:text-gray-200">
                  {/* Main control buttons */}
                  {features.soundControl && (
                    <Button
                      variant="outline"
                      className="text-white dark:text-gray-100 border-white/50 dark:border-gray-400/50 hover:bg-white/30 dark:hover:bg-gray-600/60 hover:border-white/70 dark:hover:border-gray-300/70 bg-black/20 dark:bg-gray-700/40 p-2.5 min-w-[44px] min-h-[44px] transition-all duration-200 rounded-xl backdrop-blur-sm shadow-lg"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      title={soundEnabled ? t('settings.sound_off') : t('settings.sound_on')}
                    >
                      {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </Button>
                  )}
                  {features.settingsPanel && (
                    <Button
                      variant="outline"
                      className="text-white dark:text-gray-100 border-white/50 dark:border-gray-400/50 hover:bg-white/30 dark:hover:bg-gray-600/60 hover:border-white/70 dark:hover:border-gray-300/70 bg-black/20 dark:bg-gray-700/40 p-2.5 min-w-[44px] min-h-[44px] transition-all duration-200 rounded-xl backdrop-blur-sm shadow-lg"
                      onClick={() => setShowSettingsPanel(true)}
                      title={t('settings.title')}
                    >
                      <Settings size={18} />
                    </Button>
                  )}
                  {features.infoModal && (
                    <Button
                      variant="outline"
                      className="text-white dark:text-gray-100 border-white/50 dark:border-gray-400/50 hover:bg-white/30 dark:hover:bg-gray-600/60 hover:border-white/70 dark:hover:border-gray-300/70 bg-black/20 dark:bg-gray-700/40 p-2.5 min-w-[44px] min-h-[44px] transition-all duration-200 rounded-xl backdrop-blur-sm shadow-lg"
                      onClick={() => setShowInfoModal(true)}
                      title={t('info.title')}
                    >
                      <Info size={18} />
                    </Button>
                  )}
                  
                  {/* Dark Mode Toggle */}
                  {features.darkModeToggle && (
                    <Button
                      variant="outline"
                      className="text-white dark:text-gray-100 border-white/50 dark:border-gray-400/50 hover:bg-white/30 dark:hover:bg-gray-600/60 hover:border-white/70 dark:hover:border-gray-300/70 bg-black/20 dark:bg-gray-700/40 p-2.5 min-w-[44px] min-h-[44px] transition-all duration-200 rounded-xl backdrop-blur-sm shadow-lg"
                      onClick={toggleDarkMode}
                      title={isDark ? t('settings.light_mode') : t('settings.dark_mode')}
                    >
                      {preference === 'system' ? (
                        <Monitor size={18} />
                      ) : isDark ? (
                        <Sun size={18} />
                      ) : (
                        <Moon size={18} />
                      )}
                    </Button>
                  )}
                  
                  {/* Language Selector */}
                  {features.languageSelector && (
                    <div className="flex items-center bg-black/20 dark:bg-gray-700/40 rounded-xl px-1 py-1 backdrop-blur-sm border border-white/30 dark:border-gray-400/30 shadow-lg">
                      <LanguageSelector compact />
                    </div>
                  )}
                  
                  {/* Version Display */}
                  {features.versionDisplay && (
                    <span className="text-xs text-white/90 dark:text-gray-200/90 px-3 py-1.5 bg-black/20 dark:bg-gray-700/40 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-400/20 font-medium shadow-lg">
                      v{config.version}
                    </span>
                  )}
                </div>
              </div>
            </footer>
          )}
          
        </div>
      </div>

      {/* Modals */}
      {showInfoModal && (
        <InfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          onResetAppData={() => {
            localStorage.clear();
            window.location.reload();
          }}
        />
      )}

      {/* Game Settings Panel */}
      {showSettingsPanel && (
        <GameSettingsPanel
          isOpen={showSettingsPanel}
          onClose={() => setShowSettingsPanel(false)}
          gameSettings={config.gameSettings || {
            categoriesPerGame: 5,
            questionsPerCategory: 8,
            maxQuestionsTotal: 40,
            allowRepeatQuestions: false,
            shuffleQuestions: true,
            shuffleCategories: true,
            gameTimeLimit: 0,
            autoAdvanceTime: 0,
            allowSkipQuestions: true,
            showProgress: true,
            enableSounds: true,
            enableAnimations: true
          }}
          onSave={(settings: GameSettings) => {
            // TODO: Implement settings persistence via EventBus or local storage
            console.log('Game settings updated:', settings);
            // For now, just log the settings
          }}
          onReset={() => {
            console.log('Game settings reset to defaults');
          }}
        />
      )}
    </div>
  );
};

export default GameShell;