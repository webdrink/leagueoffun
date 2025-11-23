/**
 * HookHunt Game Types
 * 
 * Type definitions for the HookHunt music quiz game including Spotify integration,
 * audio processing, game state management, and player scoring.
 */

// ===== Spotify API Types =====

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  preview_url: string | null;
  duration_ms: number;
  popularity: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
  owner: {
    id: string;
    display_name: string | null;
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  email?: string;
  images: SpotifyImage[];
  country?: string;
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SpotifyAudioAnalysis {
  sections: SpotifySection[];
  segments: SpotifySegment[];
  track: SpotifyAudioTrackInfo;
}

export interface SpotifySection {
  start: number;
  duration: number;
  confidence: number;
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
}

export interface SpotifySegment {
  start: number;
  duration: number;
  confidence: number;
  loudness_start: number;
  loudness_max: number;
  loudness_max_time: number;
  loudness_end: number;
  pitches: number[];
  timbre: number[];
}

export interface SpotifyAudioTrackInfo {
  duration: number;
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
}

// ===== HookHunt Game Types =====

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  previewUrl: string | null;
  duration: number;
  popularity: number;
  albumArt?: string;
  spotifyUrl: string;
  // Processed data
  cleanTitle?: string;
  cleanArtist?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackCount: number;
  imageUrl?: string;
  tracks?: Track[];
  spotifyUrl: string;
  owner: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  correctGuesses: number;
  totalGuesses: number;
  averageTime?: number;
  lastAnswerTime?: number;
}

export interface GameSession {
  id: string;
  playlistId: string;
  players: Player[];
  currentPlayerIndex: number;
  currentTrackIndex: number;
  tracks: Track[];
  playedTracks: string[];
  gameMode: 'lite' | 'pro';
  difficulty: 'easy' | 'medium' | 'hard';
  hookDuration: number;
  matchingThreshold: number;
  startTime: number;
  endTime?: number;
  rounds: GameRound[];
}

export interface GameRound {
  roundNumber: number;
  track: Track;
  playerGuesses: PlayerGuess[];
  correctAnswers: {
    song?: string;
    artist?: string;
  };
  hookSegment: HookSegment;
  startTime: number;
  endTime?: number;
}

export interface PlayerGuess {
  playerId: string;
  playerName: string;
  songGuess?: string;
  artistGuess?: string;
  timestamp: number;
  matchResults: MatchResult;
  pointsEarned: number;
  timeToAnswer: number;
}

export interface MatchResult {
  songMatch: boolean;
  artistMatch: boolean;
  songConfidence: number;
  artistConfidence: number;
  pointsAwarded: number;
  bonusPoints: number;
}

// ===== Hook Detection Types =====

export interface HookCandidate {
  startTime: number;
  endTime: number;
  duration: number;
  confidence: number;
  loudness: number;
  spectralFlux: number;
  energyVariance: number;
  isChorus?: boolean;
}

export interface HookDetectionResult {
  hookSegment: HookSegment | null;
  candidates: HookCandidate[];
  detectionMethod: 'lite' | 'pro' | 'fallback';
  confidence: number;
  processingTime: number;
  error?: string;
}

export interface HookSegment {
  startTime: number;
  endTime: number;
  duration: number;
  confidence: number;
  reason: string;
}

export interface AudioAnalysisData {
  rms: number[];
  spectralFlux: number[];
  mfcc?: number[][];
  chroma?: number[][];
  tempo?: number;
  onset?: number[];
}

// ===== Game State Types =====

export interface HookHuntGameState {
  // Authentication
  isAuthenticated: boolean;
  user: SpotifyUser | null;
  tokenExpiry: number | null;
  
  // Game Setup
  selectedPlaylist: Playlist | null;
  gameMode: 'lite' | 'pro';
  difficulty: 'easy' | 'medium' | 'hard';
  hookDuration: number;
  matchingThreshold: number;
  
  // Players
  players: Player[];
  currentPlayerIndex: number;
  
  // Game Session
  currentSession: GameSession | null;
  currentTrack: Track | null;
  currentRound: GameRound | null;
  
  // Audio Playback
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  hookSegment: HookSegment | null;
  
  // UI State
  currentScreen: HookHuntScreen;
  isLoading: boolean;
  error: string | null;
  notification: string | null;
}

export interface PlaylistSelectionState {
  playlists: Playlist[];
  isLoading: boolean;
  selectedPlaylist: Playlist | null;
  searchQuery: string;
  filteredPlaylists: Playlist[];
  error: string | null;
}

export interface AudioPlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  hookSegment: HookSegment | null;
  isHookPlaying: boolean;
  bufferProgress: number;
  error: string | null;
}

export interface ScoringState {
  scores: Record<string, number>;
  streaks: Record<string, number>;
  roundScores: Record<string, number[]>;
  bonusMultiplier: number;
  timeBonus: boolean;
  perfectGameBonus: boolean;
}

// ===== Screen and Phase Types =====

export type HookHuntScreen = 
  | 'intro' 
  | 'playlist-selection' 
  | 'player-setup' 
  | 'game' 
  | 'summary';

export type HookHuntPhase = 
  | 'auth'
  | 'playlist'
  | 'setup'
  | 'playing'
  | 'summary';

// ===== Configuration Types =====

export interface HookHuntConfig {
  spotify: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
  };
  audio: {
    defaultHookDuration: number;
    minHookDuration: number;
    maxHookDuration: number;
    defaultVolume: number;
    fadeInDuration: number;
    fadeOutDuration: number;
  };
  matching: {
    defaultThreshold: number;
    minThreshold: number;
    maxThreshold: number;
    cleaningRules: {
      removeFeaturingPattern: boolean;
      normalizeWhitespace: boolean;
      removePunctuation: boolean;
      toLowerCase: boolean;
    };
  };
  scoring: {
    songPoints: number;
    artistPoints: number;
    timeBonus: {
      enabled: boolean;
      maxBonus: number;
      timeThreshold: number;
    };
    streakBonus: {
      enabled: boolean;
      multiplier: number;
      minStreak: number;
    };
  };
  gameplay: {
    maxPlayers: number;
    minPlayers: number;
    defaultDifficulty: 'easy' | 'medium' | 'hard';
    skipPenalty: number;
    maxSkips: number;
  };
}

// ===== Error Types =====

export interface SpotifyAPIError {
  error: {
    status: number;
    message: string;
  };
}

export interface HookHuntError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
}

// ===== Event Types =====

export interface GameEvent {
  type: 'round_start' | 'round_end' | 'guess_submitted' | 'hook_detected' | 'game_end';
  timestamp: number;
  data: unknown;
}

export interface AudioEvent {
  type: 'play' | 'pause' | 'seek' | 'volume_change' | 'hook_start' | 'hook_end';
  timestamp: number;
  data: unknown;
}

// ===== Utility Types =====

export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'lite' | 'pro';
export type MatchType = 'song' | 'artist' | 'both';
export type DetectionMethod = 'lite' | 'pro' | 'fallback' | 'manual';

// ===== Store Action Types =====

export interface HookHuntActions {
  // Authentication
  setUser: (user: SpotifyUser | null) => void;
  setTokenExpiry: (expiry: number | null) => void;
  logout: () => void;
  
  // Playlist Management
  setPlaylists: (playlists: Playlist[]) => void;
  selectPlaylist: (playlist: Playlist) => void;
  
  // Game Setup
  setGameMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  setHookDuration: (duration: number) => void;
  setMatchingThreshold: (threshold: number) => void;
  
  // Player Management
  addPlayer: (player: Omit<Player, 'id'>) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  nextPlayer: () => void;
  
  // Game Flow
  startGame: (tracks: Track[]) => void;
  nextRound: () => void;
  submitGuess: (guess: Omit<PlayerGuess, 'timestamp' | 'matchResults' | 'pointsEarned'>) => void;
  endGame: () => void;
  
  // Audio Control
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setHookSegment: (segment: HookSegment | null) => void;
  
  // UI Control
  setCurrentScreen: (screen: HookHuntScreen) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNotification: (notification: string | null) => void;
  
  // Utility
  reset: () => void;
}