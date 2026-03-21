import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SkipForward } from 'lucide-react';
import { getPlaylistTracks, SpotifyTrack } from '../utils/spotifyApi';
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
  animationsEnabled: boolean;
}

export default function GameplayScreen({ playlistId, playerNames, mode, settings, onFinish, animationsEnabled }: GameplayProps) {
  const { t } = useTranslation();
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [scores, setScores] = useState(playerNames.map(n => ({ name: n, score: 0 })));
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        const playable = tks.filter(track => Boolean(track.preview_url));
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

  useEffect(() => {
    // play preview if available
    const audio = audioRef.current;
    if (audio && currentTrack?.preview_url) {
      audio.src = currentTrack.preview_url;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, [currentTrack]);

  const advance = () => {
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
        <div className="hh-surface-card text-center p-4 max-w-md">
          <p className="hh-content text-sm text-rose-700 dark:text-rose-300">
            {error || t('screens.gameplay.noPlayableTracks')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-transparent py-2 sm:py-4 px-0 min-h-0">
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
            <audio ref={audioRef} controls className="w-full" />
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400">No preview available. Try guessing based on metadata.</div>
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
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Track {currentIndex + 1} / {Math.max(tracks.length, 1)}
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
