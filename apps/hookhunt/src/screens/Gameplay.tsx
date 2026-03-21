import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pause, Play, RefreshCw, RotateCcw, SkipForward } from 'lucide-react';
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
const HOOK_CLIP_SECONDS = Math.round(HOOK_CLIP_MS / 1000);
const REPLAY_PENALTY_PER_REPLAY = 0.15;
const SPOTIFY_READY_WAIT_MS = 6_000;
const SPOTIFY_READY_POLL_MS = 200;

interface RoundFeedback {
  details: GuessEvaluation;
  listeningFactor: number;
  finalPoints: number;
  revealedNoPoints: boolean;
}

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
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onerror = () => {
        reject(new Error('Failed to load Spotify Web Playback SDK.'));
      };
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
    return minStart;
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

function formatSeconds(ms: number): number {
  return Math.max(0, Math.round(ms / 1000));
}

function confidencePct(confidence: number): number {
  return Math.round(confidence * 100);
}

function statusText(status: MatchStatus, t: (key: string) => string): string {
  if (status === 'exact') return t('screens.gameplay.feedbackExact');
  if (status === 'close') return t('screens.gameplay.feedbackClose');
  if (status === 'partial') return t('screens.gameplay.feedbackPartial');
  return t('screens.gameplay.feedbackMiss');
}

function statusClass(status: MatchStatus): string {
  if (status === 'exact') {
    return 'border-emerald-300/80 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100';
  }
  if (status === 'close') {
    return 'border-sky-300/80 bg-sky-50/80 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100';
  }
  if (status === 'partial') {
    return 'border-amber-300/80 bg-amber-50/80 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100';
  }
  return 'border-rose-300/80 bg-rose-50/80 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100';
}

function listeningFactor(heardMs: number): number {
  if (heardMs <= 4_000) return 1.5;
  if (heardMs <= 8_000) return 1.25;
  if (heardMs <= 12_000) return 1.0;
  if (heardMs <= 20_000) return 0.75;
  return 0.5;
}

function normalizeSpotifyError(message: string, t: (key: string) => string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('premium')) {
    return t('screens.gameplay.spotifyPremiumRequired');
  }
  if (
    normalized.includes('no list was loaded') ||
    normalized.includes('no device') ||
    normalized.includes('cannot perform operation')
  ) {
    return t('screens.gameplay.spotifyPlayerNotReady');
  }
  if (
    normalized.includes('keysystem') ||
    normalized.includes('drm') ||
    normalized.includes('eme')
  ) {
    return t('screens.gameplay.spotifyDrmUnsupported');
  }
  return message;
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
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [titleGuess, setTitleGuess] = useState('');
  const [artistGuess, setArtistGuess] = useState('');
  const [yearGuess, setYearGuess] = useState('');
  const [scores, setScores] = useState<PlayerRoundScore[]>(playerNames.map((name) => ({ name, score: 0, heardMs: 0 })));
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [roundSubmitted, setRoundSubmitted] = useState(false);
  const [roundFeedback, setRoundFeedback] = useState<RoundFeedback | null>(null);
  const [pendingFinishScores, setPendingFinishScores] = useState<PlayerRoundScore[] | null>(null);
  const [replayCount, setReplayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hookEstimateMs, setHookEstimateMs] = useState<number | null>(null);
  const [activeHookStartMs, setActiveHookStartMs] = useState<number | null>(null);
  const [hookLoading, setHookLoading] = useState(false);
  const [hookPlaying, setHookPlaying] = useState(false);
  const [hookClipEndsAt, setHookClipEndsAt] = useState<number | null>(null);
  const [hookRemainingMs, setHookRemainingMs] = useState<number | null>(null);
  const [clipRemainingMs, setClipRemainingMs] = useState(HOOK_CLIP_MS);
  const [roundHeardMs, setRoundHeardMs] = useState(0);
  const [roundRevealed, setRoundRevealed] = useState(false);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>('none');
  const [spotifyPlayer, setSpotifyPlayer] = useState<SpotifyWebPlaybackPlayer | null>(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackRequestRef = useRef(0);
  const spotifyPlayerRef = useRef<SpotifyWebPlaybackPlayer | null>(null);
  const spotifyDeviceIdRef = useRef<string | null>(null);
  const hookStopTimerRef = useRef<number | null>(null);
  const heardStartedAtRef = useRef<number | null>(null);
  const roundHeardMsRef = useRef(0);
  const replayCountRef = useRef(0);
  const hasPlayedHookOnceRef = useRef(false);

  const clearHookStopTimer = useCallback(() => {
    if (hookStopTimerRef.current !== null) {
      window.clearTimeout(hookStopTimerRef.current);
      hookStopTimerRef.current = null;
    }
    setHookClipEndsAt(null);
  }, []);

  const addRoundHeardMs = useCallback((deltaMs: number) => {
    const safeDelta = Math.max(0, deltaMs);
    roundHeardMsRef.current += safeDelta;
    setRoundHeardMs(roundHeardMsRef.current);
  }, []);

  const startHeardTracking = useCallback(() => {
    if (heardStartedAtRef.current === null) {
      heardStartedAtRef.current = Date.now();
    }
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

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.pause().catch(() => undefined);
    }
  }, [clearHookStopTimer, stopHeardTracking]);

  const scheduleHookStop = useCallback(
    (source: PlaybackSource, requestId: number, durationMs: number) => {
      clearHookStopTimer();
      const safeDuration = Math.max(0, durationMs);
      setClipRemainingMs(safeDuration);

      const stopAt = Date.now() + safeDuration;
      setHookClipEndsAt(stopAt);

      hookStopTimerRef.current = window.setTimeout(() => {
        if (requestId !== playbackRequestRef.current) {
          return;
        }

        if (source === 'preview') {
          const audio = audioRef.current;
          if (audio) {
            audio.pause();
          }
        } else if (source === 'spotify' && spotifyPlayerRef.current) {
          spotifyPlayerRef.current.pause().catch(() => undefined);
        }

        stopHeardTracking();
        setHookPlaying(false);
        setClipRemainingMs(0);
        setHookClipEndsAt(null);
        hookStopTimerRef.current = null;
      }, safeDuration);
    },
    [clearHookStopTimer, stopHeardTracking]
  );

  useEffect(() => {
    const shuffle = <T,>(input: T[]): T[] => {
      const result = [...input];
      for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedTracks = await getPlaylistTracks(playlistId);
        const playable = fetchedTracks.filter((track) => Boolean(track.preview_url) || canPlayViaSpotify(track));
        if (playable.length === 0) {
          setTracks([]);
          setError(t('screens.gameplay.noPlayableTracks'));
          return;
        }

        const randomized = shuffle(playable);
        setTracks(randomized.slice(0, Math.min(30, randomized.length)));
        setCurrentIndex(0);
      } catch (loadError) {
        console.error('Failed to load playlist tracks:', loadError);
        setTracks([]);
        setError(loadError instanceof Error ? loadError.message : t('screens.gameplay.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => undefined);
  }, [playlistId, t]);

  const currentTrack = tracks[currentIndex];
  const releaseYear = useMemo(() => releaseYearFromDate(currentTrack?.release_date), [currentTrack]);
  const needsSpotifyPlayback = useMemo(
    () => tracks.some((track) => !track.preview_url && canPlayViaSpotify(track)),
    [tracks]
  );
  const roundFactor = useMemo(() => listeningFactor(roundHeardMs), [roundHeardMs]);
  const hookRemainingPercent = useMemo(() => {
    const remaining = hookRemainingMs ?? clipRemainingMs;
    return clamp((remaining / HOOK_CLIP_MS) * 100, 0, 100);
  }, [clipRemainingMs, hookRemainingMs]);
  const hookElapsedPercent = useMemo(() => 100 - hookRemainingPercent, [hookRemainingPercent]);

  useEffect(() => {
    spotifyPlayerRef.current = spotifyPlayer;
  }, [spotifyPlayer]);

  useEffect(() => {
    spotifyDeviceIdRef.current = spotifyDeviceId;
  }, [spotifyDeviceId]);

  const waitForSpotifyDeviceReady = useCallback(async (maxWaitMs = SPOTIFY_READY_WAIT_MS): Promise<boolean> => {
    if (spotifyPlayerRef.current && spotifyDeviceIdRef.current) {
      return true;
    }

    const startedAt = Date.now();
    while (Date.now() - startedAt < maxWaitMs) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, SPOTIFY_READY_POLL_MS);
      });
      if (spotifyPlayerRef.current && spotifyDeviceIdRef.current) {
        return true;
      }
    }

    return false;
  }, []);

  useEffect(() => {
    if (!hookClipEndsAt) {
      setHookRemainingMs(null);
      return;
    }

    const tick = () => {
      setHookRemainingMs(Math.max(0, hookClipEndsAt - Date.now()));
    };

    tick();
    const intervalId = window.setInterval(tick, 250);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [hookClipEndsAt]);

  useEffect(() => {
    if (!needsSpotifyPlayback) {
      return;
    }

    let cancelled = false;
    let player: SpotifyWebPlaybackPlayer | null = null;

    const initSpotifyPlayer = async () => {
      try {
        await loadSpotifyWebPlaybackSdk();
        if (!window.Spotify?.Player) {
          throw new Error(t('screens.gameplay.spotifySdkUnavailable'));
        }

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

        player.addListener('not_ready', () => {
          if (cancelled) return;
          setSpotifyDeviceId(null);
          setSpotifyError(t('screens.gameplay.spotifyDeviceUnavailable'));
        });

        player.addListener('initialization_error', ({ message }: { message: string }) => {
          if (cancelled) return;
          setSpotifyError(normalizeSpotifyError(message, t));
        });

        player.addListener('authentication_error', ({ message }: { message: string }) => {
          if (cancelled) return;
          setSpotifyError(normalizeSpotifyError(message, t));
        });

        player.addListener('account_error', ({ message }: { message: string }) => {
          if (cancelled) return;
          setSpotifyError(normalizeSpotifyError(message, t));
        });

        player.addListener('playback_error', ({ message }: { message: string }) => {
          if (cancelled) return;
          setSpotifyError(normalizeSpotifyError(message, t));
        });

        player.addListener('player_state_changed', (state: SpotifyWebPlaybackPlayerState | null) => {
          if (cancelled) return;
          if (!state) {
            setHookPlaying(false);
            return;
          }
          setHookPlaying(!state.paused);
        });

        const connected = await player.connect();
        if (!connected) {
          throw new Error(t('screens.gameplay.spotifySdkUnavailable'));
        }

        if (!cancelled) {
          setSpotifyPlayer(player);
        }
      } catch (sdkError) {
        if (cancelled) return;
        const message = sdkError instanceof Error ? sdkError.message : t('screens.gameplay.spotifySdkUnavailable');
        setSpotifyError(normalizeSpotifyError(message, t));
      }
    };

    initSpotifyPlayer().catch(() => undefined);

    return () => {
      cancelled = true;
      if (player) {
        player.disconnect();
      }
      setSpotifyPlayer(null);
      setSpotifyDeviceId(null);
      setHookPlaying(false);
    };
  }, [needsSpotifyPlayback, t]);

  const startHookFromBeginning = useCallback(
    async (track?: SpotifyTrack, options?: { countAsReplay?: boolean }) => {
      if (!track) return;
      if (options?.countAsReplay && hasPlayedHookOnceRef.current) {
        setReplayCount((previous) => {
          const next = previous + 1;
          replayCountRef.current = next;
          return next;
        });
      }

      const requestId = ++playbackRequestRef.current;
      setSpotifyError(null);
      setHookLoading(true);
      setHookPlaying(false);
      stopHeardTracking();
      clearHookStopTimer();
      setClipRemainingMs(HOOK_CLIP_MS);

      const estimate = await getEstimatedHookStartMs(track.id);
      if (requestId !== playbackRequestRef.current) return;

      setHookEstimateMs(estimate);
      const effectiveHookStartMs = track.preview_url ? 0 : estimate ?? getFallbackHookStartMs(track);
      setActiveHookStartMs(effectiveHookStartMs);
      setHookLoading(false);

      if (track.preview_url) {
        if (spotifyPlayerRef.current) {
          spotifyPlayerRef.current.pause().catch(() => undefined);
        }

        const audio = audioRef.current;
        if (!audio) return;
        audio.src = track.preview_url;
        audio.currentTime = 0;

        try {
          await audio.play();
          if (requestId !== playbackRequestRef.current) return;
          setPlaybackSource('preview');
          setHookPlaying(true);
          hasPlayedHookOnceRef.current = true;
          startHeardTracking();
          scheduleHookStop('preview', requestId, HOOK_CLIP_MS);
        } catch {
          setHookPlaying(false);
          setSpotifyError(t('screens.gameplay.previewPlaybackFailed'));
        }
        return;
      }

      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }

      if (!canPlayViaSpotify(track)) {
        setSpotifyError(t('screens.gameplay.trackUnavailable'));
        return;
      }

      if (!spotifyPlayerRef.current || !spotifyDeviceIdRef.current) {
        const becameReady = await waitForSpotifyDeviceReady();
        if (requestId !== playbackRequestRef.current) return;
        if (!becameReady || !spotifyPlayerRef.current || !spotifyDeviceIdRef.current) {
          setSpotifyError(t('screens.gameplay.spotifyPlayerNotReady'));
          return;
        }
      }

      try {
        let activeDeviceId = spotifyDeviceIdRef.current;
        if (!activeDeviceId) {
          setSpotifyError(t('screens.gameplay.spotifyPlayerNotReady'));
          return;
        }

        try {
          await transferPlaybackToDevice(activeDeviceId);
          await startPlaybackOnDevice(activeDeviceId, track.uri, effectiveHookStartMs);
        } catch (firstError) {
          const firstMessage = firstError instanceof Error ? firstError.message : '';
          const normalizedMessage = firstMessage.toLowerCase();
          const transientDeviceError =
            normalizedMessage.includes('no device') ||
            normalizedMessage.includes('cannot perform operation') ||
            normalizedMessage.includes('no list was loaded');

          if (!transientDeviceError) {
            throw firstError;
          }

          const becameReady = await waitForSpotifyDeviceReady();
          if (requestId !== playbackRequestRef.current) return;
          if (!becameReady || !spotifyDeviceIdRef.current) {
            throw firstError;
          }

          activeDeviceId = spotifyDeviceIdRef.current;
          await transferPlaybackToDevice(activeDeviceId);
          await startPlaybackOnDevice(activeDeviceId, track.uri, effectiveHookStartMs);
        }

        if (requestId !== playbackRequestRef.current) return;
        setPlaybackSource('spotify');
        setHookPlaying(true);
        hasPlayedHookOnceRef.current = true;
        startHeardTracking();
        scheduleHookStop('spotify', requestId, HOOK_CLIP_MS);
      } catch (playbackError) {
        setHookPlaying(false);
        const message = playbackError instanceof Error ? playbackError.message : t('screens.gameplay.spotifyPlaybackFailed');
        setSpotifyError(`${t('screens.gameplay.spotifyPlaybackFailed')} ${normalizeSpotifyError(message, t)}`);
      }
    },
    [clearHookStopTimer, scheduleHookStop, startHeardTracking, stopHeardTracking, t, waitForSpotifyDeviceReady]
  );

  const pauseHook = useCallback(() => {
    if (!hookPlaying) return;
    const remaining = hookClipEndsAt ? Math.max(0, hookClipEndsAt - Date.now()) : clipRemainingMs;
    clearHookStopTimer();
    setClipRemainingMs(remaining);
    stopHeardTracking();

    if (playbackSource === 'preview') {
      const audio = audioRef.current;
      if (audio) audio.pause();
    } else if (playbackSource === 'spotify' && spotifyPlayerRef.current) {
      spotifyPlayerRef.current.pause().catch(() => undefined);
    }
    setHookPlaying(false);
  }, [clearHookStopTimer, clipRemainingMs, hookClipEndsAt, hookPlaying, playbackSource, stopHeardTracking]);

  const resumeHook = useCallback(async () => {
    if (roundRevealed || !currentTrack) return;

    if (clipRemainingMs <= 200 || playbackSource === 'none') {
      await startHookFromBeginning(currentTrack, { countAsReplay: true });
      return;
    }

    const requestId = playbackRequestRef.current;

    try {
      if (playbackSource === 'preview') {
        const audio = audioRef.current;
        if (!audio) return;
        await audio.play();
      } else if (playbackSource === 'spotify' && spotifyPlayerRef.current) {
        await spotifyPlayerRef.current.resume();
      }

      setHookPlaying(true);
      startHeardTracking();
      scheduleHookStop(playbackSource, requestId, clipRemainingMs);
    } catch {
      setSpotifyError(t('screens.gameplay.spotifyPlaybackFailed'));
    }
  }, [clipRemainingMs, currentTrack, playbackSource, roundRevealed, scheduleHookStop, startHeardTracking, startHookFromBeginning, t]);

  useEffect(() => {
    if (!currentTrack) return;

    setRoundRevealed(false);
    setRoundSubmitted(false);
    setRoundFeedback(null);
    setPendingFinishScores(null);
    setTitleGuess('');
    setArtistGuess('');
    setYearGuess('');
    setReplayCount(0);
    replayCountRef.current = 0;
    hasPlayedHookOnceRef.current = false;
    setRoundHeardMs(0);
    roundHeardMsRef.current = 0;
    heardStartedAtRef.current = null;
    setPlaybackSource('none');
    setClipRemainingMs(HOOK_CLIP_MS);
    setHookRemainingMs(null);
    startHookFromBeginning(currentTrack, { countAsReplay: false }).catch(() => undefined);
  }, [currentTrack, startHookFromBeginning]);

  useEffect(
    () => () => {
      playbackRequestRef.current += 1;
      clearHookStopTimer();
      stopHeardTracking();

      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
      }
    },
    [clearHookStopTimer, stopHeardTracking]
  );

  const revealTrack = () => {
    if (roundRevealed) return;
    stopAllPlayback();
    setRoundRevealed(true);
  };

  const restartRound = useCallback(() => {
    if (!currentTrack || roundSubmitted) return;

    stopAllPlayback();
    setRoundRevealed(false);
    setRoundSubmitted(false);
    setRoundFeedback(null);
    setPendingFinishScores(null);
    setTitleGuess('');
    setArtistGuess('');
    setYearGuess('');
    setReplayCount(0);
    replayCountRef.current = 0;
    hasPlayedHookOnceRef.current = false;
    setRoundHeardMs(0);
    roundHeardMsRef.current = 0;
    heardStartedAtRef.current = null;
    setPlaybackSource('none');
    setClipRemainingMs(HOOK_CLIP_MS);
    setHookRemainingMs(null);
    setHookEstimateMs(null);
    setActiveHookStartMs(null);
    startHookFromBeginning(currentTrack, { countAsReplay: false }).catch(() => undefined);
  }, [currentTrack, roundSubmitted, startHookFromBeginning, stopAllPlayback]);

  const advance = () => {
    stopAllPlayback();
    const nextIdx = currentIndex + 1;
    if (nextIdx >= tracks.length) {
      onFinish(scores);
      return;
    }

    setCurrentIndex(nextIdx);
    if (mode === 'hotSeat') {
      setCurrentPlayerIdx((index) => (index + 1) % playerNames.length);
    }
  };

  const submit = () => {
    if (!currentTrack) return;

    if (roundSubmitted) {
      if (pendingFinishScores) {
        onFinish(pendingFinishScores);
        return;
      }
      advance();
      return;
    }

    stopAllPlayback();

    const heardThisRoundMs = roundHeardMsRef.current;
    const factor = listeningFactor(heardThisRoundMs);
    const mainArtist = currentTrack.artists?.[0]?.name || '';
    const featuredArtists = currentTrack.artists?.slice(1).map((artist) => artist.name) || [];
    const details = evaluateGuess({
      titleGuess,
      artistGuess,
      yearGuess,
      targetTitle: currentTrack.name || '',
      mainArtist,
      featuredArtists,
      targetYear: releaseYear,
      thresholdPct: settings.matchThreshold,
      partialPoints: settings.pointsForPartial,
      fullPoints: settings.pointsForFull,
      replayCount: replayCountRef.current,
      replayPenaltyPerReplay: REPLAY_PENALTY_PER_REPLAY,
    });

    const pointsAfterReplay = roundRevealed ? 0 : details.pointsAfterReplayPenalty;
    const adjustedPoints = pointsAfterReplay > 0 ? Math.max(0, Math.floor(pointsAfterReplay * factor)) : 0;

    const newScores = scores.map((score, index) => {
      if (index !== currentPlayerIdx) return score;
      return {
        ...score,
        score: score.score + adjustedPoints,
        heardMs: score.heardMs + heardThisRoundMs,
      };
    });
    setScores(newScores);
    setRoundFeedback({
      details,
      listeningFactor: factor,
      finalPoints: adjustedPoints,
      revealedNoPoints: roundRevealed,
    });
    setRoundSubmitted(true);

    const reachedPointsToWin = newScores.some((score) => score.score >= settings.pointsToWin);
    const reachedTrackEnd = currentIndex + 1 >= tracks.length;
    if (reachedPointsToWin || reachedTrackEnd) {
      setPendingFinishScores(newScores);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="hh-surface-card text-center p-4 max-w-md">
          <p className="hh-content text-sm text-slate-700 dark:text-slate-200">{t('screens.gameplay.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || tracks.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <div className="hh-surface-card text-center p-4 max-w-md space-y-3">
          <p className="hh-content text-sm text-rose-700 dark:text-rose-300">
            {error || t('screens.gameplay.noPlayableTracks')}
          </p>
          <button onClick={onBackToPlaylist} className="hh-btn-muted !w-auto !px-4 !py-2">
            <ArrowLeft size={16} /> {t('screens.gameplay.backToPlaylist')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-start justify-center bg-transparent py-2 sm:py-3 px-0 min-h-0">
      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hh-surface-card p-5 md:p-7 w-full"
      >
        <div className="hh-content mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="rounded-2xl border border-white/80 dark:border-slate-600/70 bg-gradient-to-br from-white/85 via-orange-50/75 to-rose-50/60 dark:from-slate-900/70 dark:via-slate-800/70 dark:to-slate-900/65 px-4 py-3 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.6)]">
            <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
              {t('screens.gameplay.currentPlayer', { name: scores[currentPlayerIdx]?.name })}
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('screens.gameplay.score', { score: scores[currentPlayerIdx]?.score })}
            </div>
          </div>
          <div className="hh-chip text-[11px] shadow-[0_12px_24px_-18px_rgba(249,115,22,0.75)]">
            {t('screens.gameplay.roundLabel', { current: currentIndex + 1, total: Math.max(tracks.length, 1) })}
          </div>
        </div>

        <div className="hh-content mb-4 rounded-3xl border border-slate-700/45 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_22px_42px_-30px_rgba(2,6,23,0.95)]">
          <audio ref={audioRef} preload="auto" className="hidden" />

          <div className="flex items-center justify-between gap-3">
            <div className="text-white">
              <p className="text-sm font-semibold tracking-wide text-orange-200">{t('screens.gameplay.hookOnlyMode')}</p>
              <p className="mt-1 text-xs text-slate-300">
                {t('screens.gameplay.hookWindow', { seconds: HOOK_CLIP_SECONDS })}
              </p>
            </div>
            <div className={`h-3.5 w-3.5 rounded-full ring-4 ring-white/10 ${hookPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'}`} />
          </div>

          <div className="mt-3 relative h-2.5 overflow-visible rounded-full bg-slate-700/85">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 via-orange-400 to-rose-400 transition-all duration-200"
              style={{ width: `${hookElapsedPercent}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white/90 bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)] transition-all duration-200"
              style={{ left: `${hookElapsedPercent}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-right text-slate-300">
            {hookRemainingMs === null
              ? t('screens.gameplay.hookReady')
              : t('screens.gameplay.hookTimeRemaining', { seconds: Math.max(0, Math.ceil(hookRemainingMs / 1000)) })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => startHookFromBeginning(currentTrack, { countAsReplay: true })}
              className="hh-btn-primary !w-auto !px-4 !py-2.5"
              disabled={roundRevealed || roundSubmitted}
            >
              <RotateCcw size={15} /> {t('screens.gameplay.replayHook')}
            </button>
            <button
              onClick={restartRound}
              className="hh-btn-muted !w-auto !px-4 !py-2.5"
              disabled={roundRevealed || roundSubmitted}
            >
              <RefreshCw size={15} /> {t('screens.gameplay.restartRound')}
            </button>
            <button
              onClick={() => (hookPlaying ? pauseHook() : resumeHook())}
              className="hh-btn-muted !w-auto !px-4 !py-2.5"
              disabled={roundRevealed || roundSubmitted}
            >
              {hookPlaying ? <Pause size={15} /> : <Play size={15} />}
              {hookPlaying ? t('screens.gameplay.pauseHook') : t('screens.gameplay.playHook')}
            </button>
            <button
              onClick={revealTrack}
              className="hh-btn-muted !w-auto !px-4 !py-2.5 border-rose-300 text-rose-700 dark:text-rose-200 hover:border-rose-400"
              disabled={roundRevealed || roundSubmitted}
            >
              {t('screens.gameplay.revealTrackNoPoints')}
            </button>
          </div>

          <div className="mt-3 grid gap-1 rounded-2xl border border-slate-700/70 bg-black/20 px-3 py-2.5 text-xs text-slate-300">
            <p>
              {hookLoading
                ? t('screens.gameplay.hookAnalyzing')
                : t('screens.gameplay.hookStartsAt', { time: formatHookTime(activeHookStartMs ?? hookEstimateMs) })}
            </p>
            <p>
              {currentTrack?.preview_url
                ? t('screens.gameplay.hookSourcePreview')
                : t('screens.gameplay.hookSourceSpotify')}
            </p>
            <p>{t('screens.gameplay.heardThisRound', { seconds: formatSeconds(roundHeardMs) })}</p>
            <p>{t('screens.gameplay.speedFactor', { factor: roundFactor.toFixed(2) })}</p>
            <p>{t('screens.gameplay.replayPenalty', { count: replayCount, percent: Math.round(replayCount * REPLAY_PENALTY_PER_REPLAY * 100) })}</p>
          </div>

          {roundRevealed && (
            <div className="mt-3 rounded-2xl border border-amber-300/60 bg-amber-100/15 px-3 py-3 text-xs text-amber-100 shadow-[0_16px_30px_-24px_rgba(245,158,11,0.8)]">
              <p className="font-semibold">{t('screens.gameplay.revealedNoPoints')}</p>
              <p className="mt-1">
                {t('screens.gameplay.answer')}: {currentTrack?.name} • {currentTrack?.artists?.map((artist) => artist.name).join(', ')}
              </p>
              {currentTrack && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-200/35 bg-black/20 p-2.5">
                  {currentTrack.album?.images?.[0]?.url && (
                    <img
                      src={currentTrack.album.images[0].url}
                      alt={currentTrack.name}
                      className="h-12 w-12 rounded-lg object-cover shadow-lg"
                    />
                  )}
                  <div className="min-w-0 flex-1 text-amber-50">
                    <p className="truncate text-sm font-semibold">{currentTrack.name}</p>
                    <p className="truncate text-xs text-amber-100/80">
                      {currentTrack.artists?.map((artist) => artist.name).join(', ')}
                    </p>
                  </div>
                  <a
                    href={`https://open.spotify.com/track/${currentTrack.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hh-btn-muted !w-auto !px-3 !py-2 text-xs"
                  >
                    {t('screens.gameplay.openTrack')}
                  </a>
                </div>
              )}
            </div>
          )}

          {spotifyError && (
            <div className="mt-3 space-y-2">
              <p className="rounded-xl border border-rose-400/35 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{spotifyError}</p>
              <button onClick={onBackToPlaylist} className="hh-btn-muted !w-auto !px-4 !py-2">
                <ArrowLeft size={15} /> {t('screens.gameplay.backToPlaylist')}
              </button>
            </div>
          )}
        </div>

        {roundFeedback && (
          <div className="hh-content mb-4 rounded-2xl border border-white/80 dark:border-slate-600/80 bg-white/70 dark:bg-slate-900/60 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t('screens.gameplay.roundFeedbackTitle')}
            </p>
            <div className="grid gap-2 md:grid-cols-3">
              <div className={`rounded-xl border px-3 py-2 text-xs ${statusClass(roundFeedback.details.fields.title.status)}`}>
                <p className="font-semibold">{t('screens.gameplay.fieldTitle')}</p>
                <p>{statusText(roundFeedback.details.fields.title.status, t)} · {confidencePct(roundFeedback.details.fields.title.confidence)}%</p>
                <p>{t('screens.gameplay.pointsAwarded', { points: roundFeedback.details.fields.title.points })}</p>
              </div>
              <div className={`rounded-xl border px-3 py-2 text-xs ${statusClass(roundFeedback.details.fields.artist.status)}`}>
                <p className="font-semibold">{t('screens.gameplay.fieldArtist')}</p>
                <p>{statusText(roundFeedback.details.fields.artist.status, t)} · {confidencePct(roundFeedback.details.fields.artist.mainConfidence)}%</p>
                <p>{t('screens.gameplay.pointsAwarded', { points: roundFeedback.details.fields.artist.points })}</p>
                {roundFeedback.details.fields.artist.bonusPoints > 0 && (
                  <p className="font-semibold">{t('screens.gameplay.featureBonus', { points: roundFeedback.details.fields.artist.bonusPoints })}</p>
                )}
              </div>
              <div className={`rounded-xl border px-3 py-2 text-xs ${statusClass(roundFeedback.details.fields.year.status)}`}>
                <p className="font-semibold">{t('screens.gameplay.fieldYear')}</p>
                <p>{statusText(roundFeedback.details.fields.year.status, t)} · {confidencePct(roundFeedback.details.fields.year.confidence)}%</p>
                <p>{t('screens.gameplay.pointsAwarded', { points: roundFeedback.details.fields.year.points })}</p>
                {roundFeedback.details.fields.year.yearDelta !== null && (
                  <p>{t('screens.gameplay.yearDelta', { delta: roundFeedback.details.fields.year.yearDelta })}</p>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 grid gap-1">
              <p>{t('screens.gameplay.replayPenaltyApplied', { percent: Math.round(roundFeedback.details.replayPenaltyRatio * 100) })}</p>
              <p>{t('screens.gameplay.speedFactor', { factor: roundFeedback.listeningFactor.toFixed(2) })}</p>
              <p className="font-semibold">{t('screens.gameplay.roundPointsTotal', { points: roundFeedback.finalPoints })}</p>
            </div>
          </div>
        )}

        <div className="hh-content mb-4 space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            <input
              value={titleGuess}
              onChange={(event) => setTitleGuess(event.target.value)}
              placeholder={t('screens.gameplay.titlePlaceholder')}
              className="hh-input"
              disabled={roundSubmitted}
            />
            <input
              value={artistGuess}
              onChange={(event) => setArtistGuess(event.target.value)}
              placeholder={t('screens.gameplay.artistPlaceholder')}
              className="hh-input"
              disabled={roundSubmitted}
            />
            <input
              value={yearGuess}
              onChange={(event) => setYearGuess(event.target.value)}
              placeholder={t('screens.gameplay.yearPlaceholder')}
              className="hh-input"
              disabled={roundSubmitted}
              inputMode="numeric"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="hh-btn-primary !w-auto !px-4 !py-2.5">
              {roundSubmitted
                ? t('screens.gameplay.next')
                : roundRevealed
                  ? t('screens.gameplay.continueNoPoints')
                  : t('screens.gameplay.submit')}
            </button>
            <button onClick={advance} className="hh-btn-muted !w-auto !px-4 !py-2.5" disabled={roundSubmitted}>
              <SkipForward size={16} /> {t('screens.gameplay.skip')}
            </button>
          </div>
        </div>

        <div className="hh-content flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            {t('screens.gameplay.roundLabel', { current: currentIndex + 1, total: Math.max(tracks.length, 1) })}
          </div>
          <div className="flex gap-2 flex-wrap justify-end max-w-[70%]">
            {scores.map((score) => (
              <span
                key={score.name}
                className="text-xs rounded-full px-2.5 py-1.5 border border-white/80 dark:border-slate-600/80 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.75)]"
              >
                {score.name}: {score.score} • {t('screens.gameplay.playerHeard', { seconds: formatSeconds(score.heardMs) })}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
