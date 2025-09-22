/**
 * GameShell
 * Configurable layout wrapper that provides header/main/footer structure
 * based on game.json UI configuration. Handles persistent UI elements.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Info, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../core/Button';
import SplitText from '../core/SplitText';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import InfoModal from '../core/InfoModal';
import LanguageSelector from '../settings/LanguageSelector';
import GameSettingsPanel from './GameSettingsPanel';
import DarkModeToggle from './DarkModeToggle';
import useTranslation from '../../hooks/useTranslation';
import useDarkMode from '../../hooks/useDarkMode';
import { GameSettings } from '../../framework/config/game.schema';
import { FOOTER_BUTTON_CLASSES } from '../../lib/constants/uiConstants';

interface GameShellProps {
  children: React.ReactNode;
  className?: string;
}

const GameShell: React.FC<GameShellProps> = ({ children, className = '' }) => {
  const { config, dispatch } = useFrameworkRouter();
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

  // Get gradient from theme config with animation
  const primaryGradient = theme.primaryGradient || 'from-pink-400 via-purple-500 to-indigo-600';
  const backgroundClasses = `min-h-screen bg-gradient-to-br ${primaryGradient} dark:from-pink-900 dark:via-purple-900 dark:to-indigo-900 animate-gentle-shift bg-[length:400%_400%]`;

  return (
    <div className={`${backgroundClasses} ${className} overflow-hidden`}> 
      {/* Fixed Layout Container (full viewport, no page scroll) */}
      <div className="min-h-screen flex flex-col overflow-hidden bg-transparent">
        {/* Main Viewport-Responsive Container (flex column, full height) */}
        <div className="flex flex-col h-screen max-w-md lg:max-w-lg xl:max-w-xl mx-auto w-full px-4 sm:px-6 overflow-hidden bg-transparent">
          
          {/* Top Padding: Consistent spacing */}
          <div className="h-[2.5vh] min-h-[4px] flex-shrink-0"></div>
          
          {/* Header with animated title card: 3/20 = 15% */}
          {layout.showHeader && (
            <header className="h-[15vh] min-h-[80px] flex-shrink-0 flex justify-center items-center"> 
              <div className={`${theme.cardBackground || 'bg-white dark:bg-gray-800'} rounded-3xl shadow-2xl p-4 md:p-6 w-full backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 h-full max-h-full flex items-center justify-center`}>
                <div className="text-center">
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
                      className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-${colors.primary} to-${colors.secondary} dark:from-${colors.primary.replace('-500', '-400')} dark:to-${colors.secondary.replace('-500', '-400')} mb-1 drop-shadow-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full text-center max-w-full`}
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
                      className={`text-${accentColor}-600 dark:text-${accentColor}-400 font-medium text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl`}
                    >
                      {t(branding.tagline)}
                    </motion.p>
                  )}
                </div>
              </div>
            </header>
          )}

          {/* Padding after header: Reduced to 2.5% */}
          <div className="h-[2.5vh] min-h-[4px] flex-shrink-0"></div>

          {/* Main Content Area: Flexible grow to fill available space */}
          <main className="flex-1 flex flex-col overflow-hidden bg-transparent min-h-0">
            <div className="h-full flex items-center justify-center overflow-hidden bg-transparent">
              {children}
            </div>
          </main>

          {/* Footer: Always at bottom with consistent padding above */}
          {layout.showFooter && (
            <>
              <div className="h-[2.5vh] min-h-[4px] flex-shrink-0"></div>
              <footer className="flex-shrink-0 flex flex-col items-center justify-center pb-4" data-testid="game-shell-footer">
              <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 mx-auto w-full max-w-2xl border border-white/20 shadow-2xl">
                {/* Top Row: Main Controls */}
                <div className="flex justify-center items-center gap-3 text-white dark:text-gray-200 mb-3">
                  {/* Main control buttons - all with consistent styling */}
                  {features.soundControl && (
                    <Button
                      variant="outline"
                      className={FOOTER_BUTTON_CLASSES}
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      title={soundEnabled ? t('settings.sound_off') : t('settings.sound_on')}
                    >
                      {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </Button>
                  )}
                  {features.settingsPanel && (
                    <Button
                      variant="outline"
                      className={FOOTER_BUTTON_CLASSES}
                      onClick={() => setShowSettingsPanel(true)}
                      title={t('settings.title')}
                    >
                      <Settings size={18} />
                    </Button>
                  )}
                  {features.infoModal && (
                    <Button
                      variant="outline"
                      className={FOOTER_BUTTON_CLASSES}
                      onClick={() => setShowInfoModal(true)}
                      title={t('info.title')}
                    >
                      <Info size={18} />
                    </Button>
                  )}
                  
                  {/* Dark Mode Toggle - matching footer button style */}
                  {features.darkModeToggle && (
                    <DarkModeToggle variant="outlined" size="md" className={FOOTER_BUTTON_CLASSES} />
                  )}
                  
                  {/* Language Selector - styled to match footer buttons */}
                  {features.languageSelector && (
                    <div className={`flex items-center bg-purple-600/60 rounded-xl px-3 py-1.5 backdrop-blur-md border-2 border-purple-500/80 shadow-xl hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-200 transform hover:scale-105 min-h-[44px]`} data-testid="language-selector">
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

          {/* Bottom Padding: Match top padding */}
          <div className="h-[2.5vh] min-h-[4px] flex-shrink-0"></div>
          
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