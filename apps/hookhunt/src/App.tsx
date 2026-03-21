import React, { useCallback, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Settings, Moon, Sun } from 'lucide-react';
import {
  createRunId,
  resolvePlayerSession,
  saveCompletedGameRun,
  stripSessionParamsFromUrl,
  useAnimations,
} from '@game-core';
import { useTranslation } from 'react-i18next';
import './i18n/config';

import IntroScreen from './screens/Intro';
import PlayerSetupScreen from './screens/PlayerSetup';
import PlaylistSelectScreen from './screens/PlaylistSelect';
import GameplayScreen from './screens/Gameplay';
import SummaryScreen from './screens/Summary';
import SettingsModal from './components/SettingsModal';
import { getValidAccessToken, handleSpotifyCallback } from './utils/spotifyAuth';

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
    className={`flex items-center justify-center w-11 h-11 rounded-2xl border shadow-[0_14px_28px_-18px_rgba(15,23,42,0.65)] transition-all duration-200 ${
      disabled
        ? 'bg-slate-500/30 border-slate-500/40 text-slate-500 cursor-not-allowed'
        : 'bg-white/80 border-white/90 text-slate-700 hover:-translate-y-0.5 hover:bg-white hover:border-orange-200 dark:bg-slate-800/75 dark:border-slate-600/80 dark:text-white dark:hover:bg-slate-700/85 dark:hover:border-orange-400/70'
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
        ? 'bg-gradient-to-br from-slate-950 via-amber-950 to-rose-950'
        : 'bg-gradient-to-br from-amber-200 via-orange-300 to-rose-200';
    case 'winter':
      return isDark
        ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950'
        : 'bg-gradient-to-br from-cyan-100 via-sky-200 to-indigo-200';
    case 'spring':
      return isDark
        ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950'
        : 'bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-100';
    case 'summer':
      return isDark
        ? 'bg-gradient-to-br from-slate-950 via-orange-950 to-pink-950'
        : 'bg-gradient-to-br from-amber-100 via-orange-200 to-pink-100';
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
  heardMs: number;
}

interface HookHuntSessionSnapshot {
  gameStep: GameStep;
  gameSettings: GameSettings;
  playerScores: PlayerScore[];
  updatedAt: string;
}

interface SpotifyProfileCache {
  id?: string;
  display_name?: string;
  email?: string;
}

interface ActiveHookHuntRun {
  id: string;
  startedAt: string;
  playlistId: string;
  mode: GameMode;
}

const SPOTIFY_PROFILE_CACHE_KEY = 'hookhunt.spotify.profile';
const HOOKHUNT_SESSION_KEY_LEGACY = 'hookhunt.app.session.v1';
const HOOKHUNT_SESSION_KEY_PREFIX = 'hookhunt.app.session.v2';
const HOOKHUNT_LOGO_SRC = '/assets/hookhunt-logo.svg';

const DEFAULT_GAME_SETTINGS: GameSettings = {
  gameMode: 'singleplayer',
  playerNames: [],
  currentPlayerIndex: 0,
  pointsToWin: 10,
  matchThreshold: 70,
  pointsForPartial: 1,
  pointsForFull: 2,
};

function sanitizeSettings(input: unknown): GameSettings {
  if (!input || typeof input !== 'object') return { ...DEFAULT_GAME_SETTINGS };
  const maybe = input as Partial<GameSettings>;
  const gameMode: GameMode = maybe.gameMode === 'hotSeat' ? 'hotSeat' : 'singleplayer';
  const playerNames = Array.isArray(maybe.playerNames)
    ? maybe.playerNames.filter((value): value is string => typeof value === 'string')
    : [];

  return {
    ...DEFAULT_GAME_SETTINGS,
    ...maybe,
    gameMode,
    playerNames,
    currentPlayerIndex:
      typeof maybe.currentPlayerIndex === 'number' && maybe.currentPlayerIndex >= 0
        ? maybe.currentPlayerIndex
        : 0,
    playlistId:
      typeof maybe.playlistId === 'string' && maybe.playlistId.trim().length > 0
        ? maybe.playlistId
        : undefined,
  };
}

function sanitizeScores(input: unknown): PlayerScore[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((entry): entry is PlayerScore => Boolean(entry && typeof entry === 'object'))
    .map((entry) => ({
      name: typeof entry.name === 'string' ? entry.name : 'Player',
      score: typeof entry.score === 'number' ? entry.score : 0,
      heardMs: typeof entry.heardMs === 'number' ? entry.heardMs : 0,
    }));
}

function sanitizeStep(input: unknown): GameStep {
  if (input === 'intro' || input === 'playerSetup' || input === 'playlistSelect' || input === 'game' || input === 'summary') {
    return input;
  }
  return 'intro';
}

function getPlayerScopedSessionKey(playerId: string): string {
  return `${HOOKHUNT_SESSION_KEY_PREFIX}.${playerId}`;
}

function safeStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseSessionSnapshot(raw: string | null): HookHuntSessionSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<HookHuntSessionSnapshot> | null;
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      gameStep: sanitizeStep(parsed.gameStep),
      gameSettings: sanitizeSettings(parsed.gameSettings),
      playerScores: sanitizeScores(parsed.playerScores),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function readPersistedSession(playerId: string): HookHuntSessionSnapshot | null {
  const scopedSnapshot = parseSessionSnapshot(safeStorageGet(getPlayerScopedSessionKey(playerId)));
  if (scopedSnapshot) return scopedSnapshot;

  // Migrate from old global session key for existing players.
  const legacySnapshot = parseSessionSnapshot(safeStorageGet(HOOKHUNT_SESSION_KEY_LEGACY));
  if (legacySnapshot) {
    try {
      localStorage.setItem(getPlayerScopedSessionKey(playerId), JSON.stringify(legacySnapshot));
    } catch {
      // Ignore storage access failures.
    }
  }
  return legacySnapshot;
}

function persistSession(playerId: string, snapshot: HookHuntSessionSnapshot) {
  try {
    localStorage.setItem(getPlayerScopedSessionKey(playerId), JSON.stringify(snapshot));
  } catch {
    // Ignore quota and storage access errors.
  }
}

function readCachedSpotifyDisplayName(): string | null {
  try {
    const raw = safeStorageGet(SPOTIFY_PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SpotifyProfileCache;
    return parsed.display_name || parsed.email || parsed.id || null;
  } catch {
    return null;
  }
}

function App() {
  const { t } = useTranslation();
  const [playerId, setPlayerId] = useState<string>(() => localStorage.getItem('leagueoffun.playerId') || localStorage.getItem('hookhunt.playerId') || '');
  const [returnUrl, setReturnUrl] = useState<string>(() => localStorage.getItem('hookhunt.returnUrl') || localStorage.getItem('leagueoffun.returnUrl') || '');
  const { animationsEnabled, toggleAnimations } = useAnimations();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const [gameStep, setGameStep] = useState<GameStep>('intro');
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>({ ...DEFAULT_GAME_SETTINGS });
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [isHandlingAuth, setIsHandlingAuth] = useState(true);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyDisplayName, setSpotifyDisplayName] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<ActiveHookHuntRun | null>(null);
  
  // Get season from localStorage or auto-detect (doesn't need to be stateful as it rarely changes)
  const season: Season = (() => {
    const saved = localStorage.getItem('lof.v1.theme.season') as Season | null;
    return saved || getCurrentSeason();
  })();

  const refreshSpotifyState = useCallback(async () => {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setSpotifyConnected(false);
        setSpotifyDisplayName(null);
        return;
      }
      setSpotifyConnected(true);
      setSpotifyDisplayName(readCachedSpotifyDisplayName());
    } catch {
      setSpotifyConnected(false);
      setSpotifyDisplayName(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await handleSpotifyCallback();
      } catch (error) {
        console.error('Spotify callback handling failed:', error);
      }

      const session = resolvePlayerSession('hookhunt');
      setPlayerId(session.playerId);
      if (session.returnUrl) {
        setReturnUrl(session.returnUrl);
      }

      const restoredSession = readPersistedSession(session.playerId);
      if (restoredSession) {
        setGameStep(restoredSession.gameStep);
        setGameSettings(restoredSession.gameSettings);
        setPlayerScores(restoredSession.playerScores);
      }

      stripSessionParamsFromUrl();
      await refreshSpotifyState();

      setSessionHydrated(true);
      setIsHandlingAuth(false);
    };

    init().catch(() => {
      setSessionHydrated(true);
      setIsHandlingAuth(false);
    });
  }, [refreshSpotifyState]);

  useEffect(() => {
    if (gameStep !== 'playlistSelect') return;
    refreshSpotifyState().catch(() => undefined);
  }, [gameStep, refreshSpotifyState]);

  useEffect(() => {
    if (gameStep === 'game' && !gameSettings.playlistId) {
      setGameStep('playlistSelect');
      return;
    }
    if (gameStep === 'summary' && playerScores.length === 0) {
      setGameStep('intro');
    }
  }, [gameStep, gameSettings.playlistId, playerScores.length]);

  useEffect(() => {
    if (!sessionHydrated || !playerId) return;
    persistSession(playerId, {
      gameStep,
      gameSettings,
      playerScores,
      updatedAt: new Date().toISOString(),
    });
  }, [gameStep, gameSettings, playerId, playerScores, sessionHydrated]);

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
      } catch (e) {
        console.error('Failed to return to hub with provided returnUrl', e);
      }
    }
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    window.location.href = isLocalDev ? 'http://localhost:9990/' : 'https://www.leagueoffun.com';
  };

  const startGame = (mode: GameMode) => {
    setGameSettings(prev => ({ ...prev, gameMode: mode }));
    setGameStep('playerSetup');
  };

  const submitPlayers = (names: string[]) => {
    const validNames = names.filter(n => n.trim().length > 0);
    setGameSettings(prev => ({ ...prev, playerNames: validNames, currentPlayerIndex: 0 }));
    setPlayerScores(validNames.map(n => ({ name: n, score: 0, heardMs: 0 })));
    setGameStep('playlistSelect');
  };

  const selectPlaylist = (playlistId: string) => {
    const modeForRun = gameSettings.gameMode;
    setActiveRun({
      id: createRunId(),
      startedAt: new Date().toISOString(),
      playlistId,
      mode: modeForRun,
    });
    setGameSettings(prev => ({ ...prev, playlistId }));
    setGameStep('game');
  };

  const finishGame = (scores: PlayerScore[]) => {
    const completedAt = new Date().toISOString();
    const runToPersist = activeRun;
    const topScore = scores.length > 0 ? Math.max(...scores.map((entry) => entry.score)) : 0;
    const totalHeardMs = scores.reduce((total, entry) => total + entry.heardMs, 0);

    if (runToPersist) {
      void saveCompletedGameRun({
        id: runToPersist.id,
        gameId: 'hookhunt',
        playerId,
        startedAt: runToPersist.startedAt,
        endedAt: completedAt,
        score: topScore,
        metadata: {
          mode: runToPersist.mode,
          playlistId: runToPersist.playlistId,
          playerCount: scores.length,
          totalHeardMs,
          pointsToWin: gameSettings.pointsToWin,
          players: scores.map((entry) => ({
            name: entry.name,
            score: entry.score,
            heardMs: entry.heardMs,
          })),
        },
      }).catch((error) => {
        console.error('Failed to persist HookHunt run history:', error);
      });
    }

    setActiveRun(null);
    setPlayerScores(scores);
    setGameStep('summary');
  };

  const resetGame = () => {
    setActiveRun(null);
    setGameStep('intro');
    setGameSettings({ ...DEFAULT_GAME_SETTINGS });
    setPlayerScores([]);
  };

  const handleTitleClick = () => {
    resetGame();
  };

  const backgroundGradient = getSeasonalGradient(season, isDark);

  return (
    <div className={`min-h-screen ${backgroundGradient} animate-gentle-shift overflow-hidden relative`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(255,255,255,0.34),transparent_36%),radial-gradient(circle_at_82%_8%,rgba(251,146,60,0.28),transparent_30%),radial-gradient(circle_at_42%_92%,rgba(15,23,42,0.26),transparent_45%)] dark:bg-[radial-gradient(circle_at_16%_14%,rgba(148,163,184,0.18),transparent_36%),radial-gradient(circle_at_82%_8%,rgba(249,115,22,0.24),transparent_30%),radial-gradient(circle_at_42%_92%,rgba(2,6,23,0.5),transparent_45%)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-white/45 via-orange-200/20 to-transparent blur-3xl dark:from-orange-300/10 dark:via-slate-900/0 dark:to-transparent" />
      <div className="pointer-events-none absolute bottom-20 right-[-6rem] h-[18rem] w-[18rem] rounded-full bg-gradient-to-br from-emerald-200/35 via-cyan-200/15 to-transparent blur-3xl dark:from-cyan-400/10 dark:via-teal-500/10 dark:to-transparent" />
      {/* Fixed Layout Container matching BlameGame structure */}
      <div className="h-screen flex flex-col bg-transparent overflow-hidden relative z-10">
        {/* Main Viewport-Responsive Container */}
        <div className="flex flex-col h-full max-w-sm sm:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto w-full px-3 sm:px-5 lg:px-8 bg-transparent">
          
          {/* Top Padding */}
          <div className="h-4 sm:h-5 flex-shrink-0"></div>
          
          {/* Header Card - Matching BlameGame style */}
          <header className="py-2 sm:py-3 flex-shrink-0 flex justify-center items-center">
            <div className="hh-surface-card px-5 sm:px-7 py-3 sm:py-4 w-full flex items-center justify-center min-h-[74px]">
              <div className="hh-shimmer absolute inset-0 opacity-30" />
              <div className="text-center w-full max-w-full hh-content">
                <motion.h1
                  initial={animationsEnabled ? { opacity: 0, y: -10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center gap-3 cursor-pointer"
                  onClick={handleTitleClick}
                  title={t('summary.backToHub')}
                >
                  <img
                    src={HOOKHUNT_LOGO_SRC}
                    alt="HookHunt logo"
                    className="h-10 w-auto sm:h-12 md:h-14"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-500 to-rose-500 dark:from-orange-300 dark:via-amber-300 dark:to-rose-300 drop-shadow-sm leading-tight text-center text-3xl sm:text-4xl md:text-5xl">
                    HookHunt
                  </span>
                </motion.h1>
                <motion.p
                  initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-orange-700 dark:text-orange-200/95 font-semibold text-sm sm:text-base md:text-lg"
                >
                  {t('game.subtitle')}
                </motion.p>
                <div className="mt-2">
                  <span className={`hh-chip !text-[10px] sm:!text-xs ${
                    spotifyConnected
                      ? '!border-emerald-300/80 dark:!border-emerald-500/70 !text-emerald-800 dark:!text-emerald-200'
                      : '!border-slate-300/80 dark:!border-slate-600 !text-slate-700 dark:!text-slate-200'
                  }`}>
                    {spotifyConnected
                      ? t('game.spotifyConnectedAs', { name: spotifyDisplayName || t('game.spotifyConnectedFallback') })
                      : t('game.spotifyNotConnected')}
                  </span>
                </div>
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
                  initialPlayers={gameSettings.playerNames}
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
                  disabled={isHandlingAuth}
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
                  onBackToPlaylist={() => setGameStep('playlistSelect')}
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
            <div className="hh-surface-card p-4 sm:p-5 mx-auto w-full">
              {/* Top Row: Main Controls */}
              <div className="hh-content flex justify-center items-center gap-3 text-slate-700 dark:text-slate-200 mb-3">
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
              <div className="hh-content border-t border-slate-300/60 dark:border-white/10 pt-3">
                <p className="text-sm text-center text-slate-700 dark:text-slate-100 font-semibold">
                  🎵 {t('footer.support_message')}
                  <span className="block text-slate-600 dark:text-slate-200/90 text-xs mt-1">
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
