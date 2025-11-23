/**
 * HookHuntGameScreen Component
 * 
 * The main gameplay screen for HookHunt where players listen to song hooks
 * and submit their guesses for song titles and artists.
 * 
 * Props:
 * - onAdvance: Function to proceed to summary screen when game ends
 * - onBack: Function to return to player setup
 * - gameConfig: Configuration object from game.json
 * 
 * Expected behavior:
 * - Display current song's hook audio player
 * - Show input fields for song and artist guesses
 * - Track current player turn and scores
 * - Display game progress and remaining songs
 * - Handle guess submission and scoring
 * 
 * Dependencies:
 * - React, motion (framer-motion)
 * - Button component from framework
 * - Card components from framework
 * - Input component from framework
 * - Audio playback and hook detection services
 * 
 * Integration:
 * - Used by framework GameHost for game phase
 * - Integrates with audio playback and matching services
 */

import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../core/Card';
import { Play, User } from 'lucide-react';
import { useHookHuntGame, useHookHuntPlayers } from '../../store/hookHuntStore';
import type { Track } from '../../hookHuntTypes';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';

const HookHuntGameScreen: React.FC = () => {
  const { currentSession, currentTrack, nextRound } = useHookHuntGame();
  const { players, updatePlayer, nextPlayer } = useHookHuntPlayers();
  const { dispatch } = useFrameworkRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [titleGuess, setTitleGuess] = useState('');
  const [artistGuess, setArtistGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const activePlayer = useMemo(() => players[currentSession?.currentPlayerIndex || 0], [players, currentSession]);
  const track: Track | null = currentTrack;

  const handlePlay = () => {
    if (!track?.previewUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(track.previewUrl);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(()=>{});
  };

  const scoreAndReveal = () => {
    if (!track || !activePlayer) return;
    let points = 0;
    const titleOk = titleGuess.trim().length > 0 && track.title.toLowerCase().includes(titleGuess.trim().toLowerCase());
    const artistOk = artistGuess.trim().length > 0 && track.artist.toLowerCase().includes(artistGuess.trim().toLowerCase());
    if (titleOk) points += 1;
    if (artistOk) points += 1;
    if (points > 0) {
      updatePlayer(activePlayer.id, { score: (activePlayer.score || 0) + points, correctGuesses: activePlayer.correctGuesses + 1, totalGuesses: activePlayer.totalGuesses + 1 });
    } else {
      updatePlayer(activePlayer.id, { totalGuesses: activePlayer.totalGuesses + 1 });
    }
    setRevealed(true);
  };

  const next = () => {
    setTitleGuess('');
    setArtistGuess('');
    setRevealed(false);
    if (!currentSession) return;
    const isLast = currentSession.currentTrackIndex + 1 >= currentSession.tracks.length;
    if (isLast) {
      dispatch(GameAction.ADVANCE);
      return;
    }
    nextPlayer();
    nextRound();
  };

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="w-full max-w-2xl mx-auto p-4">
      <Card className="bg-white/85 dark:bg-gray-800/85">
        <CardHeader>
          <CardTitle>Guess the hook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">Now playing: <strong>{activePlayer?.name || 'Player'}</strong></div>
            <Button onClick={handlePlay} className="bg-cyan-600 text-white"><Play size={16} className="mr-1"/>Play Preview</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="p-3 border rounded" placeholder="Song title" value={titleGuess} onChange={e=>setTitleGuess(e.target.value)} />
            <input className="p-3 border rounded" placeholder="Artist" value={artistGuess} onChange={e=>setArtistGuess(e.target.value)} />
          </div>
          {!revealed ? (
            <Button onClick={scoreAndReveal} className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white">Submit Guess</Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded bg-cyan-50 border border-cyan-200">
                Correct: <strong>{track?.title}</strong> — <strong>{track?.artist}</strong>
              </div>
              <Button onClick={next} className="w-full">Next</Button>
            </div>
          )}
          <div className="pt-2">
            <div className="text-sm font-medium mb-2 flex items-center"><User className="w-4 h-4 mr-2"/>Scores</div>
            <div className="grid grid-cols-2 gap-2">
              {players.map(p => (
                <div key={p.id} className={`p-2 rounded border ${p.id===activePlayer?.id?'border-cyan-400 bg-cyan-50':'border-gray-200 bg-gray-50'}`}>
                  <div className="text-sm">{p.name}</div>
                  <div className="text-lg font-semibold">{p.score ?? 0}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HookHuntGameScreen;