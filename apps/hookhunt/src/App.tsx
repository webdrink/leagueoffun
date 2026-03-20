import React, { useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ArrowLeft, Zap, Settings, Moon, Sun } from 'lucide-react';
import { useAnimations } from '@game-core';
import { useTranslation } from 'react-i18next';
import './i18n/config';

import IntroScreen from './screens/Intro';
import PlayerSetupScreen from './screens/PlayerSetup';
import PlaylistSelectScreen from './screens/PlaylistSelect';
import GameplayScreen from './screens/Gameplay';
import SummaryScreen from './screens/Summary';
import SettingsModal from './components/SettingsModal';
import { readTokenFromHash, storeAccessToken } from './utils/spotifyAuth';

// Reusable FooterButton component matching BlameGame style
interface FooterButtonProps {
  onClick?: () => void;
  title: string;
  children: ReactNode;
  disabled?: boolean;
}

const FooterButton: React.FC<FooterButtonProps> = ({ onClick, title, children, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center w-11 h-11 rounded-xl backdrop-blur-md border-2 shadow-xl transition-all duration-200 transform hover:scale-105 ${
      disabled
        ? 'bg-gray-400/40 border-gray-400/50 text-gray-600 cursor-not-allowed'
        : 'bg-orange-600/60 border-orange-500/80 hover:bg-orange-500/70 hover:border-orange-400'
    }`}
    title={title}
  >
    {children}
  </button>
);

// Seasonal theme hook (matches BlameGame)
type Season = 'fall' | 'winter' | 'spring' | 'summer';

const getCurrentSeason = (): Season => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

const getSeasonalGradient = (season: Season, isDark: boolean): string => {
  switch (season) {
    case 'fall':
      return isDark 
        ? 'bg-gradient-to-br from-amber-900 via-orange-900 to-red-900'
        : 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500';
    case 'winter':
      return isDark
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
        : 'bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500';
    case 'spring':
      return isDark
        ? 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900'
        : 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500';
    case 'summer':
      return isDark
        ? 'bg-gradient-to-br from-yellow-900 via-orange-900 to-pink-900'
        : 'bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500';
  }
};

// Game types
type GameStep = 'intro' | 'playerSetup' | 'playlistSelect' | 'game' | 'summary';
type GameMode = 'singleplayer' | 'hotSeat';

// Dark mode hook
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lof.v1.darkMode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('lof.v1.darkMode', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(prev => !prev) };
}

interface GameSettings {
  gameMode: GameMode;
  playerNames: string[];
  currentPlayerIndex: number;
  playlistId?: string;
  pointsToWin: number;
  matchThreshold: number; // percentage 0..100
  pointsForPartial: number;
  pointsForFull: number;
}

interface PlayerScore {
  name: string;
  score: number;
}

function App() {
  const { t } = useTranslation();
  const [playerId, setPlayerId] = useState<string>('');
  const [returnUrl, setReturnUrl] = useState<string>('');
  const { animationsEnabled, toggleAnimations } = useAnimations();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const [gameStep, setGameStep] = useState<GameStep>('intro');
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    gameMode: 'singleplayer',
    playerNames: [],
    currentPlayerIndex: 0,
    pointsToWin: 10,
    matchThreshold: 70,
    pointsForPartial: 1,
    pointsForFull: 2,
  });
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  
  // Get season from localStorage or auto-detect (doesn't need to be stateful as it rarely changes)
  const season: Season = (() => {
    const saved = localStorage.getItem('lof.v1.theme.season') as Season | null;
    return saved || getCurrentSeason();
  })();

  useEffect(() => {
    const tokenFromHash = readTokenFromHash();
    if (tokenFromHash) {
      storeAccessToken(tokenFromHash);
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }

    const params = new URLSearchParams(window.location.search);
    const pid = params.get('playerId');
    const rurl = params.get('returnUrl');
    
    if (pid) {
      setPlayerId(pid);
      localStorage.setItem('hookhunt.playerId', pid);
    }
    
    if (rurl) {
      setReturnUrl(rurl);
    }
  }, []);

  const handleReturnToHub = () => {
    if (returnUrl) {
      try {
        const url = new URL(decodeURIComponent(returnUrl));
        url.searchParams.set('playerId', playerId);
        url.searchParams.set('gameId', 'hookhunt');
        url.searchParams.set('score', String(playerScores[0]?.score || 0));
        url.searchParams.set('playedAt', new Date().toISOString());
        window.location.href = url.toString();
        return;
      } catch (e) {}
    }
    // Fallback to League of Fun hub if no returnUrl
    window.location.href = 'https://www.leagueoffun.com';
  };

  const startGame = (mode: GameMode) => {
    setGameSettings(prev => ({ ...prev, gameMode: mode }));
    setGameStep('playerSetup');
  };

  const submitPlayers = (names: string[]) => {
    const validNames = names.filter(n => n.trim().length > 0);
    setGameSettings(prev => ({ ...prev, playerNames: validNames, currentPlayerIndex: 0 }));
    setPlayerScores(validNames.map(n => ({ name: n, score: 0 })));
    setGameStep('playlistSelect');
  };

  const selectPlaylist = (playlistId: string) => {
    setGameSettings(prev => ({ ...prev, playlistId }));
    setGameStep('game');
  };

  const finishGame = (scores: PlayerScore[]) => {
    setPlayerScores(scores);
    setGameStep('summary');
  };

  const resetGame = () => {
    setGameStep('intro');
    setGameSettings({
      gameMode: 'singleplayer',
      playerNames: [],
      currentPlayerIndex: 0,
      pointsToWin: 10,
      matchThreshold: 70,
      pointsForPartial: 1,
      pointsForFull: 2,
    });
    setPlayerScores([]);
  };

  const backgroundGradient = getSeasonalGradient(season, isDark);

  return (
    <div className={`min-h-screen ${backgroundGradient} animate-gentle-shift overflow-hidden`}>
      {/* Fixed Layout Container matching BlameGame structure */}
      <div className="h-screen flex flex-col bg-transparent overflow-hidden">
        {/* Main Viewport-Responsive Container */}
        <div className="flex flex-col h-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto w-full px-3 sm:px-4 lg:px-6 bg-transparent">
          
          {/* Top Padding */}
          <div className="h-4 sm:h-6 flex-shrink-0"></div>
          
          {/* Header Card - Matching BlameGame style */}
          <header className="py-3 sm:py-4 flex-shrink-0 flex justify-center items-center">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-4 w-full backdrop-blur-sm flex items-center justify-center min-h-[64px]">
              <div className="text-center w-full max-w-full">
                <motion.h1
                  initial={animationsEnabled ? { opacity: 0, y: -10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 dark:from-orange-400 dark:via-orange-500 dark:to-red-500 drop-shadow-sm leading-tight text-center w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                >
                  HookHunt
                </motion.h1>
                <motion.p
                  initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-orange-600 dark:text-orange-400 font-medium text-sm sm:text-base md:text-lg"
                >
                  {t('game.subtitle')}
                </motion.p>
              </div>
            </div>
          </header>

          {/* Padding after header */}
          <div className="h-3 sm:h-4 flex-shrink-0"></div>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col bg-transparent min-h-0 overflow-auto">
            <AnimatePresence mode="wait">
              {gameStep === 'intro' && (
                <IntroScreen key="intro" onStart={startGame} animationsEnabled={animationsEnabled} />
              )}
              {gameStep === 'playerSetup' && (
                <PlayerSetupScreen
                  key="playerSetup"
                  mode={gameSettings.gameMode}
                  onSubmit={submitPlayers}
                  onBack={() => setGameStep('intro')}
                  animationsEnabled={animationsEnabled}
                />
              )}
              {gameStep === 'playlistSelect' && (
                <PlaylistSelectScreen
                  key="playlistSelect"
                  onSelect={selectPlaylist}
                  onBack={() => setGameStep('playerSetup')}
                  animationsEnabled={animationsEnabled}
                />
              )}
              {gameStep === 'game' && gameSettings.playlistId && (
                <GameplayScreen
                  key="game"
                  playlistId={gameSettings.playlistId}
                  playerNames={gameSettings.playerNames}
                  mode={gameSettings.gameMode}
                  settings={gameSettings}
                  onFinish={finishGame}
                  animationsEnabled={animationsEnabled}
                />
              )}
              {gameStep === 'summary' && (
                <SummaryScreen
                  key="summary"
                  scores={playerScores}
                  mode={gameSettings.gameMode}
                  onPlayAgain={resetGame}
                  onBackToHub={handleReturnToHub}
                  animationsEnabled={animationsEnabled}
                />
              )}
            </AnimatePresence>
          </main>

          {/* Padding before footer */}
          <div className="h-3 sm:h-4 flex-shrink-0"></div>

          {/* Footer - Matching BlameGame style */}
          <footer className="flex-shrink-0 flex flex-col items-center justify-center pb-3 sm:pb-4">
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 mx-auto w-full max-w-2xl border border-white/20 shadow-2xl">
              {/* Top Row: Main Controls */}
              <div className="flex justify-center items-center gap-3 text-white dark:text-gray-200 mb-3">
                {/* Animation toggle */}
                <FooterButton
                  onClick={toggleAnimations}
                  title={animationsEnabled ? t('footer.disable_animations') : t('footer.enable_animations')}
                >
                  <Zap size={18} className={animationsEnabled ? '' : 'opacity-50'} />
                </FooterButton>
                
                {/* Settings */}
                <FooterButton
                  onClick={() => setShowSettings(true)}
                  title={t('footer.settings')}
                >
                  <Settings size={18} />
                </FooterButton>
                
                {/* Dark Mode Toggle */}
                <FooterButton
                  onClick={toggleDarkMode}
                  title={isDark ? t('footer.light_mode') : t('footer.dark_mode')}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </FooterButton>
              </div>
              
              {/* Bottom Row: Support message */}
              <div className="border-t border-white/30 pt-3">
                <p className="text-sm text-center text-white font-medium">
                  🎵 {t('footer.support_message')}
                  <span className="block text-white/90 text-xs mt-1">
                    {t('footer.donation_message')}
                  </span>
                </p>
              </div>
            </div>
          </footer>

          {/* Bottom Padding */}
          <div className="h-4 sm:h-6 flex-shrink-0"></div>
        </div>
      </div>
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={gameSettings}
        onChange={setGameSettings}
      />
    </div>
  );
}

export default App;
