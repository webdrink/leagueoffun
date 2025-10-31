/**
 * GameShell
 * Configurable layout wrapper that provides header/main/footer structure
 * based on game.json UI configuration. Handles persistent UI elements.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Info, Volume2, VolumeX } from 'lucide-react';
import SplitText from '../core/SplitText';
import FooterButton from '../core/FooterButton';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import InfoModal from '../core/InfoModal';
import LanguageSelector from '../settings/LanguageSelector';
import GameSettingsPanel from './GameSettingsPanel';
import DarkModeToggle from './DarkModeToggle';
import useTranslation from '../../hooks/useTranslation';
import useDarkMode from '../../hooks/useDarkMode';
import useTheme from '../../hooks/useTheme';
import { GameSettings, UISettingsField } from '../../framework/config/game.schema';
import { storageGet, storageSet } from '../../framework/persistence/storage';

interface GameShellProps {
  children: React.ReactNode;
  className?: string;
}

const GameShell: React.FC<GameShellProps> = ({ children, className = '' }) => {
  const { config, dispatch, eventBus } = useFrameworkRouter();
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
  // Persisted game settings per game id
  const storageKey = useMemo(() => `game.settings.${config.id}`, [config.id]);
  const defaultGameSettings: GameSettings = {
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
  };
  const initialSettings: GameSettings = { ...defaultGameSettings, ...(config.gameSettings || {}) };
  const [persistedSettings, setPersistedSettings] = useState<GameSettings>(() => {
    const stored = storageGet<GameSettings>(storageKey);
    return stored ? { ...initialSettings, ...stored } : initialSettings;
  });

  // Keep local storage in sync when config defaults change (unlikely) or game switches
  useEffect(() => {
    const stored = storageGet<GameSettings>(storageKey);
    if (!stored) {
      storageSet(storageKey, persistedSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  
  // Dark mode support
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  console.log('🔧 useDarkMode result:', { isDark, hasToggle: !!toggleDarkMode });

  // Debug logging for features and dark mode
  console.log('🔧 GameShell debug:', {
    showFooter: layout.showFooter,
    features: features,
    darkModeToggle: features.darkModeToggle,
    darkModeToggleType: typeof features.darkModeToggle,
    darkModeToggleStrict: features.darkModeToggle === true,
    languageSelector: features.languageSelector,
    isDark: isDark,
    toggleDarkMode: !!toggleDarkMode
  });

  // Get dynamic seasonal theme
  const themeDetails = useTheme();
  const backgroundClasses = `min-h-screen ${themeDetails.gradient} ${themeDetails.animationClass || ''} bg-[length:400%_400%]`;
  
  // Apply season class to document for CSS variables
  useEffect(() => {
    const seasonClass = `season-${themeDetails.season}`;
    document.documentElement.classList.remove('season-fall', 'season-winter', 'season-spring', 'season-summer', 'season-cyber');
    document.documentElement.classList.add(seasonClass);
  }, [themeDetails.season]);

  return (
    <div className={`${backgroundClasses} ${className} overflow-hidden`}> 
      {/* Fixed Layout Container (full viewport, NO scrolling) */}
      <div className="h-screen flex flex-col bg-transparent overflow-hidden">
        {/* Main Viewport-Responsive Container (flex column, responsive width) */}
        <div className="flex flex-col h-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto w-full px-3 sm:px-4 lg:px-6 bg-transparent">
          
          {/* Top Padding: Responsive spacing */}
          <div className="h-4 sm:h-6 flex-shrink-0"></div>
          
          {/* Header with animated title card: Responsive height */}
          {layout.showHeader && (
            <header
              className="py-3 sm:py-4 flex-shrink-0 flex justify-center items-center"
              data-testid="game-header"
            >
              <div
                className={`${theme.cardBackground || 'bg-white dark:bg-gray-800'} rounded-3xl shadow-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-4 w-full backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 flex items-center justify-center min-h-[64px]`}
              >
                <div className="text-center w-full max-w-full">
                  <div
                    className="cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => {
                      // Navigate back to intro/main menu
                      try {
                        dispatch(GameAction.RESTART);
                      } catch (error) {
                        // If framework dispatch fails, try alternative navigation
                        console.log('Navigating to main menu via restart');
                        window.location.hash = '';
                        window.location.reload(); // Fallback: reload to go back to start
                      }
                    }}
                    title="Click to return to main menu"
                  >
                    <SplitText
                      text={branding.gameName || config.title}
                      tag="h1"
                      className={`
                        font-bold text-transparent bg-clip-text bg-gradient-to-r from-autumn-500 to-rust-500
                        dark:from-autumn-400 dark:to-rust-400
                        drop-shadow-sm leading-tight text-center w-full max-w-full break-words hyphens-auto
                        text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-[3.5rem]
                        line-clamp-2
                      `}
                      stagger={0.08}
                      delay={0.2}
                      duration={0.6}
                      autoPlay={true}
                    />
                  </div>
                  {branding.tagline && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className={`text-autumn-600 dark:text-autumn-400 font-medium text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl line-clamp-1`}
                    >
                      {t(branding.tagline)}
                    </motion.p>
                  )}
                </div>
              </div>
            </header>
          )}

          {/* Padding after header: Responsive spacing */}
          <div className="h-3 sm:h-4 flex-shrink-0"></div>

          {/* Main Content Area: Constrained to remaining viewport space */}
          <main className="flex-1 flex flex-col bg-transparent min-h-0 overflow-hidden">
            <div className="flex-1 flex items-center justify-center bg-transparent py-2 sm:py-4 px-0 min-h-0">
              <div className="w-full max-w-full flex flex-col min-h-0 h-full">
                {children}
              </div>
            </div>
          </main>

          {/* Footer: Always at bottom with responsive padding above */}
          {layout.showFooter && (
            <>
              <div className="h-3 sm:h-4 flex-shrink-0"></div>
              <footer className="flex-shrink-0 flex flex-col items-center justify-center pb-3 sm:pb-4" data-testid="game-shell-footer">
              <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 mx-auto w-full max-w-2xl border border-white/20 shadow-2xl">
                {/* Top Row: Main Controls */}
                <div className="flex justify-center items-center gap-3 text-white dark:text-gray-200 mb-3">
                  {/* Main control buttons - all with consistent styling */}
                  {features.soundControl && (
                    <FooterButton
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      title={soundEnabled ? t('settings.sound_off') : t('settings.sound_on')}
                    >
                      {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </FooterButton>
                  )}
                  {features.settingsPanel && (
                    <FooterButton
                      onClick={() => setShowSettingsPanel(true)}
                      title={t('settings.title')}
                    >
                      <Settings size={18} />
                    </FooterButton>
                  )}
                  {features.infoModal && (
                    <FooterButton
                      onClick={() => setShowInfoModal(true)}
                      title={t('info.title')}
                    >
                      <Info size={18} />
                    </FooterButton>
                  )}
                  
                  {/* Dark Mode Toggle - matching footer button style */}
                  {features.darkModeToggle && (
                    <DarkModeToggle variant="footer" />
                  )}
                  
                  {/* Language Selector - styled to match footer buttons */}
                  {features.languageSelector && (
                    <div className={`flex items-center bg-autumn-600/60 rounded-xl px-3 py-1.5 backdrop-blur-md border-2 border-autumn-500/80 shadow-xl hover:bg-autumn-500/20 hover:border-autumn-400 transition-all duration-200 transform hover:scale-105 min-h-[44px]`} data-testid="language-selector">
                      <LanguageSelector compact />
                    </div>
                  )}
                </div>
                
                {/* Bottom Row: Donation Notice */}
                <div className="border-t border-white/30 pt-3">
                  <p className="text-sm text-center text-white font-medium">
                    💜 {t('footer.support_message') || 'Support us to unlock more games!'} 
                    <span className="block text-white/90 text-xs mt-1">
                      {t('footer.donate_message') || 'Your donation helps us create better games.'}
                    </span>
                  </p>
                </div>
              </div>
            </footer>
            </>
          )}

          {/* Bottom Padding: Responsive spacing to match top */}
          <div className="h-4 sm:h-6 flex-shrink-0"></div>
          
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
          gameSettings={persistedSettings}
          fields={Array.isArray((config.ui?.settings as { fields?: UISettingsField[] } | undefined)?.fields)
            ? ((config.ui?.settings as { fields?: UISettingsField[] })?.fields as UISettingsField[])
            : []}
          onSave={(settings: GameSettings) => {
            // Persist and publish settings update
            setPersistedSettings(settings);
            storageSet(storageKey, settings);
            eventBus.publish({ type: 'SETTINGS/UPDATED', gameId: config.id, settings });
          }}
          onReset={() => {
            const reset = { ...initialSettings };
            setPersistedSettings(reset);
            storageSet(storageKey, reset);
            eventBus.publish({ type: 'SETTINGS/UPDATED', gameId: config.id, settings: reset });
          }}
        />
      )}
    </div>
  );
};

export default GameShell;