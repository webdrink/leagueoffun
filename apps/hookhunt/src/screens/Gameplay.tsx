import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import {
  getEstimatedHookStartMs,
  getPlaylistTracks,
  SpotifyTrack,
  startPlaybackOnDevice,
  transferPlaybackToDevice,
} from '../utils/spotifyApi';
import { getValidAccessToken } from '../utils/spotifyAuth';
import { decadeFromYear, pointsForGuess } from '../utils/scoring';

type GameMode = 'singleplayer' | 'hotSeat';

interface Settings {
  gameMode: GameMode;
  playerNames: string[];
  currentPlayerIndex: number;
  pointsToWin: number;
  matchThreshold: number;
  pointsForPartial: number;
  pointsForFull: number;
}

interface GameplayProps {
  playlistId: string;
  playerNames: string[];
  mode: GameMode;
  settings: Settings;
  onFinish: (scores: { name: string; score: number }[]) => void;
  onBackToPlaylist: () => void;
  animationsEnabled: boolean;
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

function formatHookTime(ms: number | null): string {
  if (ms === null) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
  const [guess, setGuess] = useState('');
  const [scores, setScores] = useState(playerNames.map(n => ({ name: n, score: 0 })));
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hookEstimateMs, setHookEstimateMs] = useState<number | null>(null);
  const [hookLoading, setHookLoading] = useState(false);
  const [spotifyPlayer, setSpotifyPlayer] = useState<SpotifyWebPlaybackPlayer | null>(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [spotifyPlaying, setSpotifyPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackRequestRef = useRef(0);
  const spotifyPlayerRef = useRef<SpotifyWebPlaybackPlayer | null>(null);

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
        const tks = await getPlaylistTracks(playlistId);
        const playable = tks.filter((track) => Boolean(track.preview_url) || canPlayViaSpotify(track));
        if (playable.length === 0) {
          setTracks([]);
          setError(t('screens.gameplay.noPlayableTracks'));
          return;
        }

        // Randomize playlist order once per game and play from the randomized queue.
        const randomized = shuffle(playable);
        setTracks(randomized.slice(0, Math.min(30, randomized.length)));
        setCurrentIndex(0);
      } catch (e) {
        console.error('Failed to load playlist tracks:', e);
        setTracks([]);
        setError(e instanceof Error ? e.message : t('screens.gameplay.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [playlistId, t]);

  const currentTrack = tracks[currentIndex];
  const decade = useMemo(() => decadeFromYear(currentTrack?.release_date), [currentTrack]);
  const needsSpotifyPlayback = useMemo(
    () => tracks.some((track) => !track.preview_url && canPlayViaSpotify(track)),
    [tracks]
  );

  useEffect(() => {
    spotifyPlayerRef.current = spotifyPlayer;
  }, [spotifyPlayer]);

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
            setSpotifyPlaying(false);
            return;
          }
          setSpotifyPlaying(!state.paused);
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
      setSpotifyPlaying(false);
    };
  }, [needsSpotifyPlayback, t]);

  const playCurrentTrack = useCallback(
    async (track?: SpotifyTrack) => {
      if (!track) return;

      const requestId = ++playbackRequestRef.current;
      setSpotifyError(null);
      setHookLoading(true);

      const estimate = await getEstimatedHookStartMs(track.id);
      if (requestId !== playbackRequestRef.current) return;
      setHookEstimateMs(estimate);
      setHookLoading(false);

      if (track.preview_url) {
        if (spotifyPlayerRef.current) {
          spotifyPlayerRef.current.pause().catch(() => undefined);
          setSpotifyPlaying(false);
        }
        const audio = audioRef.current;
        if (audio) {
          audio.src = track.preview_url;
          audio.currentTime = 0;
          audio.play().catch(() => undefined);
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

      if (!spotifyPlayer || !spotifyDeviceId) {
        setSpotifyError(t('screens.gameplay.spotifyPlayerNotReady'));
        return;
      }

      try {
        await transferPlaybackToDevice(spotifyDeviceId);
        await startPlaybackOnDevice(spotifyDeviceId, track.uri, estimate ?? 0);
        if (requestId !== playbackRequestRef.current) return;
        setSpotifyPlaying(true);
      } catch (playbackError) {
        const message = playbackError instanceof Error ? playbackError.message : t('screens.gameplay.spotifyPlaybackFailed');
        setSpotifyError(`${t('screens.gameplay.spotifyPlaybackFailed')} ${normalizeSpotifyError(message, t)}`);
      }
    },
    [spotifyPlayer, spotifyDeviceId, t]
  );

  useEffect(() => {
    playCurrentTrack(currentTrack).catch(() => undefined);
  }, [currentTrack, playCurrentTrack]);

  useEffect(() => () => {
    playbackRequestRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.disconnect();
    }
  }, []);

  const advance = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.pause().catch(() => undefined);
      setSpotifyPlaying(false);
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx >= tracks.length) {
      onFinish(scores);
    } else {
      setCurrentIndex(nextIdx);
      setGuess('');
      if (mode === 'hotSeat') {
        setCurrentPlayerIdx(i => (i + 1) % playerNames.length);
      }
    }
  };

  const submit = () => {
    if (!currentTrack) return;
    const artist = currentTrack.artists?.[0]?.name || '';
    const title = currentTrack.name || '';
    const res = pointsForGuess(
      guess,
      title,
      artist,
      decade,
      settings.matchThreshold,
      settings.pointsForPartial,
      settings.pointsForFull
    );

    let newScores = scores;
    if (res.awarded > 0) {
      newScores = scores.map((s, i) => 
        i === currentPlayerIdx 
          ? { ...s, score: s.score + res.awarded }
          : s
      );
      setScores(newScores);
    }

    // Check for winner with the new scores
    const winner = newScores.find(s => s.score >= settings.pointsToWin);
    if (winner) {
      onFinish(newScores);
      return;
    }
    advance();
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

  const toggleSpotifyPause = async () => {
    if (!spotifyPlayerRef.current) return;
    try {
      if (spotifyPlaying) {
        await spotifyPlayerRef.current.pause();
        setSpotifyPlaying(false);
      } else {
        await spotifyPlayerRef.current.resume();
        setSpotifyPlaying(true);
      }
    } catch {
      setSpotifyError(t('screens.gameplay.spotifyPlaybackFailed'));
    }
  };

  return (
    <div className="flex-1 flex items-start justify-center bg-transparent py-2 sm:py-3 px-0 min-h-0">
      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hh-surface-card p-6 md:p-8 w-full"
      >
        <div className="hh-content flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t('screens.gameplay.currentPlayer', { name: scores[currentPlayerIdx]?.name })}
          </div>
          <div className="hh-chip">{t('screens.gameplay.score', { score: scores[currentPlayerIdx]?.score })}</div>
        </div>

        <div className="hh-content mb-4">
          {currentTrack?.preview_url ? (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/75 dark:bg-slate-900/55 p-4 space-y-3">
              <audio ref={audioRef} controls className="w-full" />
              <div className="flex gap-2">
                <button onClick={() => playCurrentTrack(currentTrack)} className="hh-btn-muted !w-auto !px-4 !py-2">
                  <RotateCcw size={15} /> {t('screens.gameplay.replayHook')}
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {t('screens.gameplay.previewNotice')}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/75 dark:bg-slate-900/55 p-4 space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                {t('screens.gameplay.spotifyPlaybackLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => playCurrentTrack(currentTrack)} className="hh-btn-muted !w-auto !px-4 !py-2">
                  <RotateCcw size={15} /> {t('screens.gameplay.replayHook')}
                </button>
                <button onClick={toggleSpotifyPause} className="hh-btn-muted !w-auto !px-4 !py-2" disabled={!spotifyDeviceId}>
                  {spotifyPlaying ? <Pause size={15} /> : <Play size={15} />}
                  {spotifyPlaying ? t('screens.gameplay.pause') : t('screens.gameplay.resume')}
                </button>
              </div>
              {spotifyError && (
                <div className="space-y-2">
                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    {spotifyError}
                  </p>
                  <button onClick={onBackToPlaylist} className="hh-btn-muted !w-auto !px-4 !py-2">
                    <ArrowLeft size={15} /> {t('screens.gameplay.backToPlaylist')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hh-content flex gap-2 mb-4">
          <input
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder={t('screens.gameplay.guessPlaceholder')}
            className="hh-input flex-1"
          />
          <button onClick={submit} className="hh-btn-primary !w-auto !px-4 !py-2.5">
            {t('screens.gameplay.submit')}
          </button>
          <button onClick={advance} className="hh-btn-muted !w-auto !px-4 !py-2.5">
            <SkipForward size={16} /> {t('screens.gameplay.skip')}
          </button>
        </div>

        <div className="hh-content flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-300">
            <div>
              Track {currentIndex + 1} / {Math.max(tracks.length, 1)}
            </div>
            <div className="mt-1">
              {hookLoading
                ? t('screens.gameplay.hookAnalyzing')
                : t('screens.gameplay.hookEstimatedAt', { time: formatHookTime(hookEstimateMs) })}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end max-w-[65%]">
            {scores.map((score) => (
              <span key={score.name} className="text-xs rounded-full px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {score.name}: {score.score}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
