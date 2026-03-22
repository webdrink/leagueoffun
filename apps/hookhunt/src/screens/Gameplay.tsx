import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pause, Play } from 'lucide-react';
import {
  getEstimatedHookStartMs,
  getPlaylistTracks,
  SpotifyTrack,
  startPlaybackOnDevice,
  transferPlaybackToDevice,
} from '../utils/spotifyApi';
import { getValidAccessToken } from '../utils/spotifyAuth';
import { evaluateGuess, GuessEvaluation, MatchStatus, releaseYearFromDate } from '../utils/scoring';

type GameMode = 'singleplayer' | 'hotSeat';
type PlaybackSource = 'none' | 'preview' | 'spotify';

type PrepareStatus = 'idle' | 'preparing' | 'ready' | 'failed';

type PlaybackMode = 'spotify_full' | 'spotify_preview' | 'fallback_track' | 'none';

interface PreparedPlayback {
  ready: boolean;
  mode: PlaybackMode;
  source: PlaybackSource;
  startMs: number;
  resolvedTrack: SpotifyTrack | null;
  fallbackReason: string | null;
}

interface RoundState {
  track: SpotifyTrack;
  guesses: {
    title: string;
    artist: string;
    year: string;
  };
  submitted: boolean;
  replayCount: number;
  heardMs: number;
  finalPoints: number;
  feedback: GuessEvaluation | null;
  revealedFields: {
    title: boolean;
    artist: boolean;
    year: boolean;
  };
  prepareStatus: PrepareStatus;
  preparedPlayback: PreparedPlayback | null;
}

interface SessionPlaybackHealth {
  consecutiveFailures: number;
  previewOnlyMode: boolean;
  drmSupported: boolean | null;
}

interface Settings {
  gameMode: GameMode;
  playerNames: string[];
  currentPlayerIndex: number;
  pointsToWin: number;
  matchThreshold: number;
  pointsForPartial: number;
  pointsForFull: number;
}

interface PlayerRoundScore {
  name: string;
  score: number;
  heardMs: number;
}

interface GameplayProps {
  playlistId: string;
  playerNames: string[];
  mode: GameMode;
  settings: Settings;
  onFinish: (scores: PlayerRoundScore[]) => void;
  onBackToPlaylist: () => void;
  animationsEnabled: boolean;
}

const HOOK_CLIP_MS = 30_000;
const REPLAY_PENALTY_PER_REPLAY = 0.15;
const SPOTIFY_READY_WAIT_MS = 6_000;
const SPOTIFY_READY_POLL_MS = 200;
const MAX_PREPARE_FAILURES_BEFORE_PREVIEW_ONLY = 3;

let spotifySdkReadyPromise: Promise<void> | null = null;

function loadSpotifyWebPlaybackSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Spotify SDK is not available in this environment.'));
  }

  if (window.Spotify?.Player) {
    return Promise.resolve();
  }

  if (!spotifySdkReadyPromise) {
    spotifySdkReadyPromise = new Promise<void>((resolve, reject) => {
      const onReady = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = () => {
        if (typeof onReady === 'function') onReady();
        resolve();
      };

      const existingScript = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
      if (existingScript) return;

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load Spotify Web Playback SDK.'));
      document.body.appendChild(script);
    });
  }

  return spotifySdkReadyPromise;
}

function canPlayViaSpotify(track: SpotifyTrack): track is SpotifyTrack & { uri: string } {
  return Boolean(track.uri && !track.is_local);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function stableFractionFromString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash % 10_000) / 10_000;
}

function getFallbackHookStartMs(track: SpotifyTrack): number {
  const durationMs = track.duration_ms || 180_000;
  const minStart = clamp(Math.round(durationMs * 0.18), 10_000, 65_000);
  const maxStart = Math.max(minStart, durationMs - HOOK_CLIP_MS - 6_000);
  if (maxStart <= minStart) {
    return 0;
  }
  const fraction = stableFractionFromString(track.id);
  return Math.round(minStart + fraction * (maxStart - minStart));
}

function formatHookTime(ms: number | null): string {
  if (ms === null) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function confidencePct(confidence: number): number {
  return Math.round(confidence * 100);
}

function normalizeSpotifyError(message: string, t: (key: string) => string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('premium')) return t('screens.gameplay.spotifyPremiumRequired');
  if (normalized.includes('keysystem') || normalized.includes('drm') || normalized.includes('eme')) {
    return t('screens.gameplay.spotifyDrmUnsupported');
  }
  if (normalized.includes('no list was loaded') || normalized.includes('no device') || normalized.includes('cannot perform operation')) {
    return t('screens.gameplay.spotifyPlayerNotReady');
  }
  return message;
}

async function supportsWidevineAudioPlayback(): Promise<boolean> {
  const requester = (navigator as Navigator & {
    requestMediaKeySystemAccess?: (
      keySystem: string,
      supportedConfigurations: MediaKeySystemConfiguration[]
    ) => Promise<MediaKeySystemAccess>;
  }).requestMediaKeySystemAccess;

  if (typeof requester !== 'function') return false;

  try {
    await requester.call(navigator, 'com.widevine.alpha', [{
      initDataTypes: ['cenc'],
      audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
    }]);
    return true;
  } catch {
    return false;
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('timeout')), timeoutMs);
    }),
  ]);
}

function scoreFieldHint(status: MatchStatus, confidence: number, t: (key: string, params?: Record<string, unknown>) => string): string {
  if (status === 'exact') return t('screens.gameplay.hintExact', { pct: confidencePct(confidence) });
  if (status === 'close') return t('screens.gameplay.hintClose', { pct: confidencePct(confidence) });
  if (status === 'partial') return t('screens.gameplay.hintPartial', { pct: confidencePct(confidence) });
  return t('screens.gameplay.hintMiss', { pct: confidencePct(confidence) });
}

function getPlayerForRound(roundIndex: number, mode: GameMode): number {
  if (mode === 'hotSeat') return roundIndex;
  return 0;
}

function buildInitialRound(track: SpotifyTrack): RoundState {
  return {
    track,
    guesses: { title: '', artist: '', year: '' },
    submitted: false,
    replayCount: 0,
    heardMs: 0,
    finalPoints: 0,
    feedback: null,
    revealedFields: { title: false, artist: false, year: false },
    prepareStatus: 'idle',
    preparedPlayback: null,
  };
}

export default function GameplayScreen({
  playlistId,
  playerNames,
  mode,
  settings,
  onFinish,
  onBackToPlaylist,
  animationsEnabled,
}: GameplayProps) {
  const { t } = useTranslation();
  const [rounds, setRounds] = useState<RoundState[]>([]);
  const [allTracks, setAllTracks] = useState<SpotifyTrack[]>([]);
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);
  const [maxReachedRoundIndex, setMaxReachedRoundIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spotifyPlayer, setSpotifyPlayer] = useState<SpotifyWebPlaybackPlayer | null>(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [playbackHealth, setPlaybackHealth] = useState<SessionPlaybackHealth>({
    consecutiveFailures: 0,
    previewOnlyMode: false,
    drmSupported: null,
  });
  const [hookPlaying, setHookPlaying] = useState(false);
  const [hookClipEndsAt, setHookClipEndsAt] = useState<number | null>(null);
  const [hookRemainingMs, setHookRemainingMs] = useState<number | null>(null);
  const [clipRemainingMs, setClipRemainingMs] = useState(HOOK_CLIP_MS);
  const [activeHookStartMs, setActiveHookStartMs] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const spotifyPlayerRef = useRef<SpotifyWebPlaybackPlayer | null>(null);
  const spotifyDeviceIdRef = useRef<string | null>(null);
  const hookStopTimerRef = useRef<number | null>(null);
  const playbackRequestRef = useRef(0);
  const heardStartedAtRef = useRef<number | null>(null);

  const activeRound = rounds[activeRoundIndex] || null;
  const readOnlyRound = activeRoundIndex < maxReachedRoundIndex;
  const currentPrepared = activeRound?.preparedPlayback || null;
  const currentTargetTrack = currentPrepared?.resolvedTrack || activeRound?.track || null;
  const currentPlayerIdx = Math.min(playerNames.length - 1, getPlayerForRound(activeRoundIndex, mode) % Math.max(playerNames.length, 1));

  const scores = useMemo(() => {
    const initial = playerNames.map((name) => ({ name, score: 0, heardMs: 0 }));
    rounds.forEach((round, roundIndex) => {
      if (!round.submitted) return;
      const index = Math.min(initial.length - 1, getPlayerForRound(roundIndex, mode) % Math.max(initial.length, 1));
      if (!initial[index]) return;
      initial[index].score += round.finalPoints;
      initial[index].heardMs += round.heardMs;
    });
    return initial;
  }, [mode, playerNames, rounds]);

  const hookRemainingPercent = useMemo(() => {
    const remaining = hookRemainingMs ?? clipRemainingMs;
    return clamp((remaining / HOOK_CLIP_MS) * 100, 0, 100);
  }, [clipRemainingMs, hookRemainingMs]);
  const hookElapsedPercent = useMemo(() => 100 - hookRemainingPercent, [hookRemainingPercent]);

  const updateRound = useCallback((roundIndex: number, updater: (round: RoundState) => RoundState) => {
    setRounds((prev) => prev.map((round, index) => (index === roundIndex ? updater(round) : round)));
  }, []);

  const clearHookStopTimer = useCallback(() => {
    if (hookStopTimerRef.current !== null) {
      window.clearTimeout(hookStopTimerRef.current);
      hookStopTimerRef.current = null;
    }
    setHookClipEndsAt(null);
  }, []);

  const addRoundHeardMs = useCallback((deltaMs: number) => {
    if (deltaMs <= 0) return;
    updateRound(activeRoundIndex, (round) => ({ ...round, heardMs: round.heardMs + deltaMs }));
  }, [activeRoundIndex, updateRound]);

  const startHeardTracking = useCallback(() => {
    if (heardStartedAtRef.current === null) heardStartedAtRef.current = Date.now();
  }, []);

  const stopHeardTracking = useCallback(() => {
    if (heardStartedAtRef.current === null) return;
    addRoundHeardMs(Date.now() - heardStartedAtRef.current);
    heardStartedAtRef.current = null;
  }, [addRoundHeardMs]);

  const stopAllPlayback = useCallback(() => {
    stopHeardTracking();
    clearHookStopTimer();
    setHookPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    if (spotifyPlayerRef.current) spotifyPlayerRef.current.pause().catch(() => undefined);
  }, [clearHookStopTimer, stopHeardTracking]);

  const scheduleHookStop = useCallback((source: PlaybackSource, requestId: number, durationMs: number) => {
    clearHookStopTimer();
    const safeDuration = Math.max(0, durationMs);
    setClipRemainingMs(safeDuration);
    const stopAt = Date.now() + safeDuration;
    setHookClipEndsAt(stopAt);
    hookStopTimerRef.current = window.setTimeout(() => {
      if (requestId !== playbackRequestRef.current) return;
      if (source === 'preview') {
        if (audioRef.current) audioRef.current.pause();
      } else if (source === 'spotify' && spotifyPlayerRef.current) {
        spotifyPlayerRef.current.pause().catch(() => undefined);
      }
      stopHeardTracking();
      setHookPlaying(false);
      setClipRemainingMs(0);
      setHookClipEndsAt(null);
      hookStopTimerRef.current = null;
    }, safeDuration);
  }, [clearHookStopTimer, stopHeardTracking]);

  const waitForSpotifyDeviceReady = useCallback(async (): Promise<boolean> => {
    if (spotifyPlayerRef.current && spotifyDeviceIdRef.current) return true;
    const startedAt = Date.now();
    while (Date.now() - startedAt < SPOTIFY_READY_WAIT_MS) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, SPOTIFY_READY_POLL_MS));
      if (spotifyPlayerRef.current && spotifyDeviceIdRef.current) return true;
    }
    return false;
  }, []);

  const registerPlaybackFailure = useCallback((reason?: string) => {
    setPlaybackHealth((prev) => {
      const failures = prev.consecutiveFailures + 1;
      return {
        ...prev,
        consecutiveFailures: failures,
        previewOnlyMode: prev.previewOnlyMode || failures >= MAX_PREPARE_FAILURES_BEFORE_PREVIEW_ONLY || !!reason?.includes('drm'),
      };
    });
  }, []);

  const findFallbackTrack = useCallback((startIndex: number): SpotifyTrack | null => {
    const canUseSpotify = (track: SpotifyTrack) => !playbackHealth.previewOnlyMode && canPlayViaSpotify(track);

    for (let i = startIndex + 1; i < rounds.length; i += 1) {
      const candidate = rounds[i]?.track;
      if (!candidate) continue;
      if (candidate.preview_url) return candidate;
      if (canUseSpotify(candidate)) return candidate;
    }

    for (let i = 0; i < rounds.length; i += 1) {
      const candidate = rounds[i]?.track;
      if (!candidate) continue;
      if (candidate.preview_url) return candidate;
    }

    for (const candidate of allTracks) {
      if (candidate.preview_url) return candidate;
    }

    for (const candidate of allTracks) {
      if (canUseSpotify(candidate)) return candidate;
    }
    return null;
  }, [allTracks, playbackHealth.previewOnlyMode, rounds]);

  const prepareTrackPlayback = useCallback(async (roundIndex: number): Promise<PreparedPlayback | null> => {
    const round = rounds[roundIndex];
    if (!round) return null;
    if (round.prepareStatus === 'ready' && round.preparedPlayback?.ready) return round.preparedPlayback;
    if (round.prepareStatus === 'preparing') return null;

    updateRound(roundIndex, (prev) => ({ ...prev, prepareStatus: 'preparing' }));

    const baseTrack = round.track;
    let startMs = 0;
    let fallbackReason: string | null = null;

    if (baseTrack.preview_url) {
      startMs = 0;
    } else {
      try {
        const estimate = await withTimeout(getEstimatedHookStartMs(baseTrack.id), 1800);
        startMs = estimate ?? getFallbackHookStartMs(baseTrack);
      } catch {
        startMs = 0;
        fallbackReason = 'hook-analysis-unavailable';
      }
    }

    const canUseSpotifyFull = !playbackHealth.previewOnlyMode && canPlayViaSpotify(baseTrack);

    let prepared: PreparedPlayback;

    if (canUseSpotifyFull) {
      prepared = {
        ready: true,
        mode: 'spotify_full',
        source: 'spotify',
        startMs,
        resolvedTrack: baseTrack,
        fallbackReason,
      };
    } else if (baseTrack.preview_url) {
      prepared = {
        ready: true,
        mode: 'spotify_preview',
        source: 'preview',
        startMs: 0,
        resolvedTrack: baseTrack,
        fallbackReason: fallbackReason || (playbackHealth.previewOnlyMode ? 'preview-only-mode' : null),
      };
    } else {
      const fallbackTrack = findFallbackTrack(roundIndex);
      if (fallbackTrack) {
        prepared = {
          ready: true,
          mode: 'fallback_track',
          source: fallbackTrack.preview_url ? 'preview' : 'spotify',
          startMs: fallbackTrack.preview_url ? 0 : startMs,
          resolvedTrack: fallbackTrack,
          fallbackReason: 'next-playable-track',
        };
      } else {
        prepared = {
          ready: false,
          mode: 'none',
          source: 'none',
          startMs: 0,
          resolvedTrack: null,
          fallbackReason: 'no-playable-track',
        };
      }
    }

    updateRound(roundIndex, (prev) => ({
      ...prev,
      preparedPlayback: prepared,
      prepareStatus: prepared.ready ? 'ready' : 'failed',
    }));

    if (roundIndex === activeRoundIndex && prepared.source === 'preview' && prepared.resolvedTrack?.preview_url && audioRef.current) {
      audioRef.current.src = prepared.resolvedTrack.preview_url;
      audioRef.current.currentTime = prepared.startMs / 1000;
      audioRef.current.load();
      setActiveHookStartMs(prepared.startMs);
    }
    return prepared;
  }, [activeRoundIndex, findFallbackTrack, playbackHealth.previewOnlyMode, rounds, updateRound]);

  const startPreparedPlayback = useCallback(async (preparedOverride?: PreparedPlayback | null) => {
    const prepared = preparedOverride ?? currentPrepared;
    if (!activeRound || !prepared || !prepared.ready || !prepared.resolvedTrack) return;

    const requestId = ++playbackRequestRef.current;
    setSpotifyError(null);
    stopHeardTracking();
    clearHookStopTimer();
    setClipRemainingMs(HOOK_CLIP_MS);

    const targetTrack = prepared.resolvedTrack;
    setActiveHookStartMs(prepared.startMs);

    if (prepared.source === 'preview' && targetTrack.preview_url) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = targetTrack.preview_url;
      audio.currentTime = prepared.startMs / 1000;
      audio.load();
      try {
        await audio.play();
        if (requestId !== playbackRequestRef.current) return;
        setHookPlaying(true);
        startHeardTracking();
        scheduleHookStop('preview', requestId, HOOK_CLIP_MS);
      } catch {
        registerPlaybackFailure('preview');
        setSpotifyError(t('screens.gameplay.previewPlaybackFailed'));
      }
      return;
    }

    if (!canPlayViaSpotify(targetTrack)) {
      setSpotifyError(t('screens.gameplay.trackUnavailable'));
      return;
    }

    const ready = await waitForSpotifyDeviceReady();
    if (!ready || !spotifyDeviceIdRef.current) {
      registerPlaybackFailure('spotify-not-ready');
      setSpotifyError(t('screens.gameplay.spotifyPlayerNotReady'));
      return;
    }

    try {
      await withTimeout(transferPlaybackToDevice(spotifyDeviceIdRef.current), 3000);
      await withTimeout(startPlaybackOnDevice(spotifyDeviceIdRef.current, targetTrack.uri, prepared.startMs), 3000);
      if (requestId !== playbackRequestRef.current) return;
      setHookPlaying(true);
      startHeardTracking();
      scheduleHookStop('spotify', requestId, HOOK_CLIP_MS);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      registerPlaybackFailure(message.toLowerCase().includes('drm') ? 'drm' : 'spotify-playback');
      if (targetTrack.preview_url) {
        updateRound(activeRoundIndex, (round) => ({
          ...round,
          preparedPlayback: {
            ...prepared,
            source: 'preview',
            mode: 'spotify_preview',
            startMs: 0,
            fallbackReason: 'spotify-playback-failed',
          },
          prepareStatus: 'ready',
        }));
      } else {
        const emergencyPreviewTrack = rounds.find((candidate, index) => (
          index !== activeRoundIndex && Boolean(candidate.track.preview_url)
        ))?.track || null;
        if (emergencyPreviewTrack?.preview_url) {
          const emergencyPrepared: PreparedPlayback = {
            ready: true,
            mode: 'fallback_track',
            source: 'preview',
            startMs: 0,
            resolvedTrack: emergencyPreviewTrack,
            fallbackReason: 'emergency-preview',
          };
          updateRound(activeRoundIndex, (round) => ({
            ...round,
            preparedPlayback: emergencyPrepared,
            prepareStatus: 'ready',
          }));
        }
      }
      setSpotifyError(`${t('screens.gameplay.spotifyPlaybackFailed')} ${normalizeSpotifyError(message, t)}`);
      setHookPlaying(false);
    }
  }, [activeRound, activeRoundIndex, clearHookStopTimer, currentPrepared, registerPlaybackFailure, rounds, scheduleHookStop, startHeardTracking, stopHeardTracking, t, updateRound, waitForSpotifyDeviceReady]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedTracks = await getPlaylistTracks(playlistId);
        const playable = fetchedTracks.filter((track) => Boolean(track.preview_url) || canPlayViaSpotify(track));
        if (playable.length === 0) {
          setAllTracks([]);
          setRounds([]);
          setError(t('screens.gameplay.noPlayableTracks'));
          return;
        }
        const shuffled = [...playable].sort(() => Math.random() - 0.5).slice(0, Math.min(30, playable.length));
        setAllTracks(playable);
        setRounds(shuffled.map(buildInitialRound));
        setActiveRoundIndex(0);
        setMaxReachedRoundIndex(0);
      } catch (loadError) {
        setAllTracks([]);
        setRounds([]);
        setError(loadError instanceof Error ? loadError.message : t('screens.gameplay.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => undefined);
  }, [playlistId, t]);

  useEffect(() => {
    supportsWidevineAudioPlayback().then((supported) => {
      setPlaybackHealth((prev) => ({ ...prev, drmSupported: supported }));
    }).catch(() => {
      setPlaybackHealth((prev) => ({ ...prev, drmSupported: false }));
    });
  }, []);

  useEffect(() => {
    spotifyPlayerRef.current = spotifyPlayer;
  }, [spotifyPlayer]);

  useEffect(() => {
    spotifyDeviceIdRef.current = spotifyDeviceId;
  }, [spotifyDeviceId]);

  useEffect(() => {
    if (!rounds.length || playbackHealth.previewOnlyMode) return;
    if (!rounds.some((round) => canPlayViaSpotify(round.track) && !round.track.preview_url)) return;

    let cancelled = false;
    let player: SpotifyWebPlaybackPlayer | null = null;

    const init = async () => {
      try {
        await loadSpotifyWebPlaybackSdk();
        if (!window.Spotify?.Player) throw new Error(t('screens.gameplay.spotifySdkUnavailable'));

        player = new window.Spotify.Player({
          name: 'HookHunt Browser Player',
          getOAuthToken: (callback) => {
            getValidAccessToken().then((token) => callback(token || '')).catch(() => callback(''));
          },
          volume: 0.85,
        });

        player.addListener('ready', ({ device_id }: { device_id: string }) => {
          if (cancelled) return;
          setSpotifyDeviceId(device_id);
          setSpotifyError(null);
        });

        player.addListener('initialization_error', ({ message }: { message: string }) => {
          if (cancelled) return;
          registerPlaybackFailure(message.toLowerCase());
          setSpotifyError(normalizeSpotifyError(message, t));
        });

        player.addListener('playback_error', ({ message }: { message: string }) => {
          if (cancelled) return;
          registerPlaybackFailure(message.toLowerCase());
          setSpotifyError(normalizeSpotifyError(message, t));
        });

        const connected = await player.connect();
        if (!connected) throw new Error(t('screens.gameplay.spotifySdkUnavailable'));
        if (!cancelled) setSpotifyPlayer(player);
      } catch (err) {
        if (cancelled) return;
        registerPlaybackFailure('drm');
        const message = err instanceof Error ? err.message : t('screens.gameplay.spotifySdkUnavailable');
        setSpotifyError(normalizeSpotifyError(message, t));
      }
    };

    init().catch(() => undefined);

    return () => {
      cancelled = true;
      if (player) player.disconnect();
      setSpotifyPlayer(null);
      setSpotifyDeviceId(null);
    };
  }, [playbackHealth.previewOnlyMode, registerPlaybackFailure, rounds, t]);

  useEffect(() => {
    if (!activeRound) return;
    prepareTrackPlayback(activeRoundIndex).catch(() => undefined);
    stopAllPlayback();
    setClipRemainingMs(HOOK_CLIP_MS);
    setHookRemainingMs(null);
  }, [activeRound, activeRoundIndex, prepareTrackPlayback, stopAllPlayback]);

  useEffect(() => {
    if (!hookClipEndsAt) {
      setHookRemainingMs(null);
      return;
    }
    const tick = () => setHookRemainingMs(Math.max(0, hookClipEndsAt - Date.now()));
    tick();
    const intervalId = window.setInterval(tick, 250);
    return () => window.clearInterval(intervalId);
  }, [hookClipEndsAt]);

  useEffect(() => () => {
    playbackRequestRef.current += 1;
    clearHookStopTimer();
    stopHeardTracking();
    if (audioRef.current) audioRef.current.pause();
    if (spotifyPlayerRef.current) spotifyPlayerRef.current.disconnect();
  }, [clearHookStopTimer, stopHeardTracking]);

  const togglePlayback = useCallback(async () => {
    if (!activeRound) return;
    if (!currentPrepared?.ready) {
      if (activeRound.prepareStatus === 'preparing') {
        setSpotifyError(t('screens.gameplay.preparing'));
        return;
      }
      const prepared = await prepareTrackPlayback(activeRoundIndex);
      if (!prepared?.ready) {
        setSpotifyError(t('screens.gameplay.prepareFailed'));
        return;
      }
      await startPreparedPlayback(prepared);
      return;
    }

    if (hookPlaying) {
      const remaining = hookClipEndsAt ? Math.max(0, hookClipEndsAt - Date.now()) : clipRemainingMs;
      clearHookStopTimer();
      setClipRemainingMs(remaining);
      stopHeardTracking();
      if (currentPrepared.source === 'preview' && audioRef.current) {
        audioRef.current.pause();
      } else if (currentPrepared.source === 'spotify' && spotifyPlayerRef.current) {
        spotifyPlayerRef.current.pause().catch(() => undefined);
      }
      setHookPlaying(false);
      return;
    }

    if (clipRemainingMs <= 200) {
      updateRound(activeRoundIndex, (round) => ({ ...round, replayCount: round.replayCount + 1 }));
      await startPreparedPlayback();
      return;
    }

    try {
      if (currentPrepared.source === 'preview' && audioRef.current) {
        await audioRef.current.play();
      } else if (currentPrepared.source === 'spotify' && spotifyPlayerRef.current) {
        await spotifyPlayerRef.current.resume();
      } else {
        await startPreparedPlayback();
        return;
      }
      const requestId = playbackRequestRef.current;
      setHookPlaying(true);
      startHeardTracking();
      scheduleHookStop(currentPrepared.source, requestId, clipRemainingMs);
    } catch {
      await startPreparedPlayback();
    }
  }, [activeRound, activeRoundIndex, clearHookStopTimer, clipRemainingMs, currentPrepared, hookClipEndsAt, hookPlaying, prepareTrackPlayback, scheduleHookStop, startHeardTracking, startPreparedPlayback, stopHeardTracking, t, updateRound]);

  const handleGuessChange = (field: 'title' | 'artist' | 'year', value: string) => {
    if (readOnlyRound || !activeRound || activeRound.submitted) return;
    updateRound(activeRoundIndex, (round) => ({
      ...round,
      guesses: { ...round.guesses, [field]: value },
    }));
  };

  const currentPreviewEvaluation = useMemo(() => {
    if (!activeRound || !currentTargetTrack) return null;
    return evaluateGuess({
      titleGuess: activeRound.guesses.title,
      artistGuess: activeRound.guesses.artist,
      yearGuess: activeRound.guesses.year,
      targetTitle: currentTargetTrack.name || '',
      mainArtist: currentTargetTrack.artists?.[0]?.name || '',
      featuredArtists: currentTargetTrack.artists?.slice(1).map((artist) => artist.name) || [],
      targetYear: releaseYearFromDate(currentTargetTrack.release_date),
      thresholdPct: settings.matchThreshold,
      partialPoints: settings.pointsForPartial,
      fullPoints: settings.pointsForFull,
      replayCount: activeRound.replayCount,
      replayPenaltyPerReplay: REPLAY_PENALTY_PER_REPLAY,
    });
  }, [activeRound, currentTargetTrack, settings.matchThreshold, settings.pointsForFull, settings.pointsForPartial]);

  const hasAnyGuess = Boolean(activeRound?.guesses.title.trim() || activeRound?.guesses.artist.trim() || activeRound?.guesses.year.trim());

  const submitOrAdvance = () => {
    if (!activeRound || !currentTargetTrack) return;

    if (activeRound.submitted) {
      const shouldFinish = activeRoundIndex + 1 >= rounds.length || scores.some((entry) => entry.score >= settings.pointsToWin);
      if (shouldFinish) {
        onFinish(scores);
        return;
      }
      setActiveRoundIndex((index) => Math.min(rounds.length - 1, index + 1));
      setMaxReachedRoundIndex((previous) => Math.max(previous, Math.min(rounds.length - 1, activeRoundIndex + 1)));
      return;
    }

    if (readOnlyRound) return;

    stopAllPlayback();

    const details = evaluateGuess({
      titleGuess: activeRound.guesses.title,
      artistGuess: activeRound.guesses.artist,
      yearGuess: activeRound.guesses.year,
      targetTitle: currentTargetTrack.name || '',
      mainArtist: currentTargetTrack.artists?.[0]?.name || '',
      featuredArtists: currentTargetTrack.artists?.slice(1).map((artist) => artist.name) || [],
      targetYear: releaseYearFromDate(currentTargetTrack.release_date),
      thresholdPct: settings.matchThreshold,
      partialPoints: settings.pointsForPartial,
      fullPoints: settings.pointsForFull,
      replayCount: activeRound.replayCount,
      replayPenaltyPerReplay: REPLAY_PENALTY_PER_REPLAY,
    });

    const listeningFactor = activeRound.heardMs <= 4_000
      ? 1.5
      : activeRound.heardMs <= 8_000
        ? 1.25
        : activeRound.heardMs <= 12_000
          ? 1.0
          : activeRound.heardMs <= 20_000
            ? 0.75
            : 0.5;

    const adjustedPoints = details.pointsAfterReplayPenalty > 0
      ? Math.max(0, Math.floor(details.pointsAfterReplayPenalty * listeningFactor))
      : 0;

    updateRound(activeRoundIndex, (round) => ({
      ...round,
      submitted: true,
      feedback: details,
      finalPoints: adjustedPoints,
      revealedFields: {
        title: details.fields.title.status === 'close' || details.fields.title.status === 'exact',
        artist: details.fields.artist.status === 'close' || details.fields.artist.status === 'exact',
        year: details.fields.year.status === 'close' || details.fields.year.status === 'exact',
      },
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center"><div className="hh-surface-card text-center p-4 max-w-md"><p className="hh-content text-sm text-slate-700 dark:text-slate-200">{t('screens.gameplay.loading')}</p></div></div>;
  }

  if (error || rounds.length === 0 || !activeRound) {
    return (
      <div className="flex items-center justify-center">
        <div className="hh-surface-card text-center p-4 max-w-md space-y-3">
          <p className="hh-content text-sm text-rose-700 dark:text-rose-300">{error || t('screens.gameplay.noPlayableTracks')}</p>
          <button onClick={onBackToPlaylist} className="hh-btn-muted !w-auto !px-4 !py-2"><ArrowLeft size={16} /> {t('screens.gameplay.backToPlaylist')}</button>
        </div>
      </div>
    );
  }

  const metaTitle = activeRound.revealedFields.title ? (currentTargetTrack?.name || t('screens.gameplay.metaUnknown')) : t('screens.gameplay.metaTitlePlaceholder');
  const metaArtists = activeRound.revealedFields.artist
    ? ((currentTargetTrack?.artists || []).map((artist) => artist.name).join(', ') || t('screens.gameplay.metaUnknown'))
    : t('screens.gameplay.metaArtistPlaceholder');
  const metaYear = activeRound.revealedFields.year
    ? (releaseYearFromDate(currentTargetTrack?.release_date)?.toString() || t('screens.gameplay.metaUnknown'))
    : t('screens.gameplay.metaYearPlaceholder');

  const primaryLabel = activeRound.submitted
    ? t('screens.gameplay.next')
    : hasAnyGuess
      ? t('screens.gameplay.submit')
      : t('screens.gameplay.skip');

  const secondaryLabel = activeRoundIndex === 0 ? t('screens.gameplay.backToPlaylist') : t('screens.gameplay.backRound');

  return (
    <div className="flex-1 flex items-start justify-center bg-transparent py-2 sm:py-3 px-0 min-h-0">
      <motion.div initial={animationsEnabled ? { opacity: 0, y: 10 } : {}} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="hh-surface-card p-4 sm:p-5 md:p-6 w-full">
        <audio ref={audioRef} preload="auto" className="hidden" />

        <div className="hh-content mb-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="rounded-2xl border border-white/80 dark:border-slate-600/70 bg-white/80 dark:bg-slate-900/60 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{t('screens.gameplay.currentPlayer', { name: scores[currentPlayerIdx]?.name })}</div>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{t('screens.gameplay.score', { score: scores[currentPlayerIdx]?.score || 0 })}</div>
          </div>
          <div className="hh-chip text-[11px]">{t('screens.gameplay.roundLabel', { current: activeRoundIndex + 1, total: Math.max(rounds.length, 1) })}</div>
        </div>

        <div className="hh-content rounded-3xl border border-slate-700/45 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_22px_42px_-30px_rgba(2,6,23,0.95)]">
          <div className="grid gap-3 md:grid-cols-[120px_1fr]">
            <button
              type="button"
              onClick={() => togglePlayback().catch(() => undefined)}
              aria-label={hookPlaying ? t('screens.gameplay.pause') : t('screens.gameplay.playHook')}
              className="relative h-[110px] w-full rounded-2xl border border-slate-600/70 bg-slate-900/70 overflow-hidden transition-all active:scale-[0.99]"
            >
              {activeRound.revealedFields.title || activeRound.revealedFields.artist || activeRound.revealedFields.year ? (
                currentTargetTrack?.album?.images?.[0]?.url ? (
                  <img src={currentTargetTrack.album.images[0].url} alt="cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-slate-300">{t('screens.gameplay.coverPlaceholder')}</div>
                )
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">{t('screens.gameplay.coverHiddenUntilReveal')}</div>
              )}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                {hookPlaying ? <Pause size={56} strokeWidth={2} /> : <Play size={56} strokeWidth={2} />}
              </span>
            </button>

            <div className="grid gap-2 rounded-2xl border border-slate-700/70 bg-black/20 px-3 py-3 text-xs text-slate-300">
              <div className="font-semibold text-slate-100 text-sm">{metaTitle}</div>
              <div>{metaArtists}</div>
              <div>{metaYear}</div>
              <div className="mt-1">{t('screens.gameplay.hookStartsAt', { time: formatHookTime(activeHookStartMs) })}</div>
              <div>
                {activeRound.prepareStatus === 'preparing'
                  ? t('screens.gameplay.preparing')
                  : currentPrepared?.ready
                    ? t('screens.gameplay.readyToPlay')
                    : t('screens.gameplay.prepareFailed')}
              </div>
              {currentPrepared?.fallbackReason && <div className="text-amber-300">{t('screens.gameplay.fallbackActive')}</div>}
            </div>
          </div>

          <div className="mt-3 relative h-2.5 rounded-full bg-slate-700/85">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 via-orange-400 to-rose-400 transition-all duration-200" style={{ width: `${hookElapsedPercent}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-right text-slate-300">
            {hookRemainingMs === null
              ? t(activeRound.prepareStatus === 'preparing' ? 'screens.gameplay.preparing' : 'screens.gameplay.hookReady')
              : t('screens.gameplay.hookTimeRemaining', { seconds: Math.max(0, Math.ceil(hookRemainingMs / 1000)) })}
          </div>

          {spotifyError && (
            <div className="mt-3 rounded-xl border border-rose-400/35 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{spotifyError}</div>
          )}

          <div className="mt-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] items-start">
              <div>
                <input value={activeRound.guesses.title} onChange={(event) => handleGuessChange('title', event.target.value)} placeholder={t('screens.gameplay.titlePlaceholder')} className="hh-input" disabled={readOnlyRound || activeRound.submitted} />
                <p className="mt-1 text-[11px] text-slate-300">{currentPreviewEvaluation ? scoreFieldHint(currentPreviewEvaluation.fields.title.status, currentPreviewEvaluation.fields.title.confidence, t) : t('screens.gameplay.hintAwaiting')}</p>
              </div>
              <div className="hh-chip !text-xs min-w-[86px] justify-center">{t('screens.gameplay.pointsLabel', { points: currentPreviewEvaluation?.fields.title.points || 0 })}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto] items-start">
              <div>
                <input value={activeRound.guesses.artist} onChange={(event) => handleGuessChange('artist', event.target.value)} placeholder={t('screens.gameplay.artistPlaceholder')} className="hh-input" disabled={readOnlyRound || activeRound.submitted} />
                <p className="mt-1 text-[11px] text-slate-300">{currentPreviewEvaluation ? scoreFieldHint(currentPreviewEvaluation.fields.artist.status, currentPreviewEvaluation.fields.artist.mainConfidence, t) : t('screens.gameplay.hintAwaiting')}</p>
              </div>
              <div className="hh-chip !text-xs min-w-[86px] justify-center">{t('screens.gameplay.pointsLabel', { points: currentPreviewEvaluation?.fields.artist.points || 0 })}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto] items-start">
              <div>
                <input value={activeRound.guesses.year} onChange={(event) => handleGuessChange('year', event.target.value)} placeholder={t('screens.gameplay.yearPlaceholder')} className="hh-input" disabled={readOnlyRound || activeRound.submitted} inputMode="numeric" />
                <p className="mt-1 text-[11px] text-slate-300">{currentPreviewEvaluation ? scoreFieldHint(currentPreviewEvaluation.fields.year.status, currentPreviewEvaluation.fields.year.confidence, t) : t('screens.gameplay.hintAwaiting')}</p>
              </div>
              <div className="hh-chip !text-xs min-w-[86px] justify-center">{t('screens.gameplay.pointsLabel', { points: currentPreviewEvaluation?.fields.year.points || 0 })}</div>
            </div>
          </div>

          {activeRound.feedback && (
            <div className="mt-4 rounded-2xl border border-white/80 dark:border-slate-600/80 bg-white/70 dark:bg-slate-900/60 p-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-semibold mb-1">{t('screens.gameplay.roundFeedbackTitle')}</p>
              <p>{t('screens.gameplay.roundPointsTotal', { points: activeRound.finalPoints })}</p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                stopAllPlayback();
                if (activeRoundIndex === 0) onBackToPlaylist();
                else setActiveRoundIndex((index) => Math.max(0, index - 1));
              }}
              className="hh-btn-muted !w-auto !px-4 !py-2"
            >
              <ArrowLeft size={15} /> {secondaryLabel}
            </button>

            <button onClick={submitOrAdvance} className="hh-btn-primary !w-auto !px-5 !py-2.5" disabled={readOnlyRound && !activeRound.submitted}>
              {primaryLabel}
            </button>
          </div>
        </div>

        <div className="hh-content mt-3 flex items-center justify-end gap-2 flex-wrap opacity-90">
          {scores.map((score) => (
            <span key={score.name} className="text-[11px] rounded-full px-2 py-1 border border-white/70 dark:border-slate-600/70 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
              {score.name}: {score.score}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
