/**
 * HookHunt Game Store
 * 
 * Zustand store for managing HookHunt game state including authentication,
 * playlists, players, game session, and audio playback state.
 */

import { create } from 'zustand';
import { 
  HookHuntGameState, 
  HookHuntActions, 
  Player, 
  Playlist, 
  Track, 
  SpotifyUser, 
  HookSegment,
  HookHuntScreen,
  GameMode,
  GameDifficulty,
  GameSession,
  GameRound,
  PlayerGuess,
  MatchResult
} from '../hookHuntTypes';

// Default configuration values
const DEFAULT_CONFIG = {
  hookDuration: 10, // seconds
  matchingThreshold: 0.7, // 70% match confidence
  defaultVolume: 0.7,
  maxPlayers: 8,
  minPlayers: 2,
} as const;

// Initial state
const initialState: HookHuntGameState = {
  // Authentication
  isAuthenticated: false,
  user: null,
  tokenExpiry: null,
  
  // Game Setup
  selectedPlaylist: null,
  gameMode: 'lite',
  difficulty: 'medium',
  hookDuration: DEFAULT_CONFIG.hookDuration,
  matchingThreshold: DEFAULT_CONFIG.matchingThreshold,
  
  // Players
  players: [],
  currentPlayerIndex: 0,
  
  // Game Session
  currentSession: null,
  currentTrack: null,
  currentRound: null,
  
  // Audio Playback
  isPlaying: false,
  currentTime: 0,
  volume: DEFAULT_CONFIG.defaultVolume,
  hookSegment: null,
  
  // UI State
  currentScreen: 'intro',
  isLoading: false,
  error: null,
  notification: null,
};

// Store type combining state and actions
type HookHuntStore = HookHuntGameState & HookHuntActions;

export const useHookHuntStore = create<HookHuntStore>((set, get) => ({
  ...initialState,
  
  // ===== Authentication Actions =====
  
  setUser: (user: SpotifyUser | null) => {
    set({ 
      user, 
      isAuthenticated: user !== null,
      error: null 
    });
  },
  
  setTokenExpiry: (expiry: number | null) => {
    set({ tokenExpiry: expiry });
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      tokenExpiry: null,
      selectedPlaylist: null,
      currentSession: null,
      currentTrack: null,
      currentRound: null,
      currentScreen: 'intro',
      error: null,
    });
  },
  
  // ===== Playlist Management Actions =====
  
  setPlaylists: (_playlists: Playlist[]) => {
    set({ error: null });
    // Store playlists in a separate state if needed for caching
  },
  
  selectPlaylist: (playlist: Playlist) => {
    set({ 
      selectedPlaylist: playlist,
      error: null 
    });
  },
  
  // ===== Game Setup Actions =====
  
  setGameMode: (mode: GameMode) => {
    set({ gameMode: mode });
  },
  
  setDifficulty: (difficulty: GameDifficulty) => {
    set({ difficulty });
  },
  
  setHookDuration: (duration: number) => {
    const clampedDuration = Math.min(Math.max(duration, 5), 15);
    set({ hookDuration: clampedDuration });
  },
  
  setMatchingThreshold: (threshold: number) => {
    const clampedThreshold = Math.min(Math.max(threshold, 0.5), 0.95);
    set({ matchingThreshold: clampedThreshold });
  },
  
  // ===== Player Management Actions =====
  
  addPlayer: (playerData: Omit<Player, 'id'>) => {
    const state = get();
    if (state.players.length >= DEFAULT_CONFIG.maxPlayers) {
      set({ error: `Maximum ${DEFAULT_CONFIG.maxPlayers} players allowed` });
      return;
    }
    
    const newPlayer: Player = {
      ...playerData,
      id: `player_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      score: 0,
      streak: 0,
      correctGuesses: 0,
      totalGuesses: 0,
    };
    
    set({ 
      players: [...state.players, newPlayer],
      error: null 
    });
  },
  
  removePlayer: (playerId: string) => {
    const state = get();
    const newPlayers = state.players.filter(p => p.id !== playerId);
    const newCurrentIndex = state.currentPlayerIndex >= newPlayers.length 
      ? 0 
      : state.currentPlayerIndex;
      
    set({ 
      players: newPlayers,
      currentPlayerIndex: newCurrentIndex 
    });
  },
  
  updatePlayer: (playerId: string, updates: Partial<Player>) => {
    const state = get();
    const newPlayers = state.players.map(p => 
      p.id === playerId ? { ...p, ...updates } : p
    );
    set({ players: newPlayers });
  },
  
  nextPlayer: () => {
    const state = get();
    if (state.players.length === 0) return;
    
    const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
    set({ currentPlayerIndex: nextIndex });
  },
  
  // ===== Game Flow Actions =====
  
  startGame: (tracks: Track[]) => {
    const state = get();
    
    if (state.players.length < DEFAULT_CONFIG.minPlayers) {
      set({ error: `Minimum ${DEFAULT_CONFIG.minPlayers} players required` });
      return;
    }
    
    if (tracks.length === 0) {
      set({ error: 'No valid tracks found in playlist' });
      return;
    }
    
    const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
    
    const newSession: GameSession = {
      id: `session_${Date.now()}`,
      playlistId: state.selectedPlaylist?.id || '',
      players: state.players.map(p => ({ ...p, score: 0, streak: 0 })),
      currentPlayerIndex: 0,
      currentTrackIndex: 0,
      tracks: shuffledTracks,
      playedTracks: [],
      gameMode: state.gameMode,
      difficulty: state.difficulty,
      hookDuration: state.hookDuration,
      matchingThreshold: state.matchingThreshold,
      startTime: Date.now(),
      rounds: [],
    };
    
    set({
      currentSession: newSession,
      currentTrack: shuffledTracks[0],
      currentPlayerIndex: 0,
      currentScreen: 'game',
      error: null,
    });
  },
  
  nextRound: () => {
    const state = get();
    if (!state.currentSession) return;
    
    const nextTrackIndex = state.currentSession.currentTrackIndex + 1;
    if (nextTrackIndex >= state.currentSession.tracks.length) {
      // End game
      set({
        currentSession: {
          ...state.currentSession,
          endTime: Date.now(),
        },
        currentScreen: 'summary',
      });
      return;
    }
    
    const nextTrack = state.currentSession.tracks[nextTrackIndex];
    set({
      currentSession: {
        ...state.currentSession,
        currentTrackIndex: nextTrackIndex,
      },
      currentTrack: nextTrack,
      hookSegment: null,
      isPlaying: false,
      currentTime: 0,
    });
  },
  
  submitGuess: (guess: Omit<PlayerGuess, 'timestamp' | 'matchResults' | 'pointsEarned'>) => {
    const state = get();
    if (!state.currentSession || !state.currentTrack || !state.currentRound) {
      return;
    }
    
    // This would be implemented with actual fuzzy matching logic
    const mockMatchResult: MatchResult = {
      songMatch: false,
      artistMatch: false,
      songConfidence: 0.5,
      artistConfidence: 0.5,
      pointsAwarded: 0,
      bonusPoints: 0,
    };
    
    const fullGuess: PlayerGuess = {
      ...guess,
      timestamp: Date.now(),
      matchResults: mockMatchResult,
      pointsEarned: mockMatchResult.pointsAwarded,
      timeToAnswer: Date.now() - state.currentRound.startTime,
    };
    
    // Update current round with the guess
    const updatedRound: GameRound = {
      ...state.currentRound,
      playerGuesses: [...state.currentRound.playerGuesses, fullGuess],
    };
    
    set({
      currentRound: updatedRound,
      currentSession: {
        ...state.currentSession,
        rounds: state.currentSession.rounds.map(r => 
          r.roundNumber === updatedRound.roundNumber ? updatedRound : r
        ),
      },
    });
  },
  
  endGame: () => {
    const state = get();
    if (!state.currentSession) return;
    
    set({
      currentSession: {
        ...state.currentSession,
        endTime: Date.now(),
      },
      currentScreen: 'summary',
      isPlaying: false,
      currentTime: 0,
    });
  },
  
  // ===== Audio Control Actions =====
  
  setCurrentTrack: (track: Track | null) => {
    set({ 
      currentTrack: track,
      hookSegment: null,
      currentTime: 0,
      isPlaying: false,
    });
  },
  
  setIsPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },
  
  setVolume: (volume: number) => {
    const clampedVolume = Math.min(Math.max(volume, 0), 1);
    set({ volume: clampedVolume });
  },
  
  setHookSegment: (segment: HookSegment | null) => {
    set({ hookSegment: segment });
  },
  
  // ===== UI Control Actions =====
  
  setCurrentScreen: (screen: HookHuntScreen) => {
    set({ currentScreen: screen });
  },
  
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  setNotification: (notification: string | null) => {
    set({ notification });
  },
  
  // ===== Utility Actions =====
  
  reset: () => {
    set(initialState);
  },
}));

// Selector hooks for specific parts of the state
export const useHookHuntAuth = () => useHookHuntStore(state => ({
  isAuthenticated: state.isAuthenticated,
  user: state.user,
  tokenExpiry: state.tokenExpiry,
  setUser: state.setUser,
  setTokenExpiry: state.setTokenExpiry,
  logout: state.logout,
}));

export const useHookHuntPlayers = () => useHookHuntStore(state => ({
  players: state.players,
  currentPlayerIndex: state.currentPlayerIndex,
  addPlayer: state.addPlayer,
  removePlayer: state.removePlayer,
  updatePlayer: state.updatePlayer,
  nextPlayer: state.nextPlayer,
}));

export const useHookHuntGame = () => useHookHuntStore(state => ({
  currentSession: state.currentSession,
  currentTrack: state.currentTrack,
  currentRound: state.currentRound,
  selectedPlaylist: state.selectedPlaylist,
  gameMode: state.gameMode,
  difficulty: state.difficulty,
  startGame: state.startGame,
  nextRound: state.nextRound,
  submitGuess: state.submitGuess,
  endGame: state.endGame,
}));

export const useHookHuntAudio = () => useHookHuntStore(state => ({
  isPlaying: state.isPlaying,
  currentTime: state.currentTime,
  volume: state.volume,
  hookSegment: state.hookSegment,
  setIsPlaying: state.setIsPlaying,
  setVolume: state.setVolume,
  setHookSegment: state.setHookSegment,
}));

export const useHookHuntUI = () => useHookHuntStore(state => ({
  currentScreen: state.currentScreen,
  isLoading: state.isLoading,
  error: state.error,
  notification: state.notification,
  setCurrentScreen: state.setCurrentScreen,
  setIsLoading: state.setIsLoading,
  setError: state.setError,
  setNotification: state.setNotification,
}));
