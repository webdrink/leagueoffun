import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SkipForward } from 'lucide-react';
import { getStoredAccessToken } from '../utils/spotifyAuth';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const token = getStoredAccessToken();

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const tks = await getPlaylistTracks(token, playlistId);
        // Shuffle and take first 30
        const shuffled = [...tks].sort(() => Math.random() - 0.5);
        setTracks(shuffled.slice(0, 30));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [token, playlistId]);

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

  if (!token) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center bg-white/90 dark:bg-gray-800/90 rounded-2xl p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Please connect Spotify to play.</p>
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
        className="bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-2xl p-6 md:p-8 w-full backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium">{t('screens.gameplay.currentPlayer', { name: scores[currentPlayerIdx]?.name })}</div>
          <div className="text-sm">{t('screens.gameplay.score', { score: scores[currentPlayerIdx]?.score })}</div>
        </div>

        <div className="mb-4">
          {currentTrack?.preview_url ? (
            <audio ref={audioRef} controls className="w-full" />
          ) : (
            <div className="text-sm text-gray-500">No preview available. Try guessing based on metadata.</div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder={t('screens.gameplay.guessPlaceholder')}
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          />
          <button onClick={submit} className="rounded-xl px-4 py-2 bg-orange-500 text-white">
            {t('screens.gameplay.submit')}
          </button>
          <button onClick={advance} className="rounded-xl px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-1">
            <SkipForward size={16} /> {t('screens.gameplay.skip')}
          </button>
        </div>

        <div className="text-xs text-gray-500">
          Track {currentIndex + 1} / {Math.max(tracks.length, 1)}
        </div>
      </motion.div>
    </div>
  );
}
