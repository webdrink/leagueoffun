/**
 * HookHunt PlayerSetupScreen (Hot Seat)
 * Reuses generic UI patterns to set up local players and advance to gameplay.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import { Input } from '../core/Input';
import { useHookHuntPlayers, useHookHuntGame, useHookHuntStore } from '../../store/hookHuntStore';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { ArrowLeft, UserPlus, X } from 'lucide-react';
import { spotifyAPI } from '../../lib/integrations/spotify/SpotifyAPI';

const PlayerSetupScreen: React.FC = () => {
  const { players, addPlayer, removePlayer } = useHookHuntPlayers();
  const { startGame } = useHookHuntGame();
  const selectedPlaylist = useHookHuntStore(s => s.selectedPlaylist);
  const { dispatch } = useFrameworkRouter();
  const [tempName, setTempName] = useState('');
  const [error, setError] = useState<string|null>(null);

  const onAdd = () => {
    const name = tempName.trim();
    if (!name) return;
    if (players.length >= 8) {
      setError('Maximum 8 players allowed');
      return;
    }
    // Provide required fields for store's addPlayer signature
    addPlayer({ name, score: 0, streak: 0, correctGuesses: 0, totalGuesses: 0 });
    setTempName('');
    setError(null);
  };

  const [starting, setStarting] = useState(false);
  const canStart = players.length >= 2 && !!selectedPlaylist; // requires playlist

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" onClick={() => dispatch(GameAction.BACK)} className="p-2"><ArrowLeft size={18}/></Button>
          <h2 className="text-xl font-semibold">Player Setup</h2>
        </div>
        <div className="flex gap-2 mb-3">
          <Input value={tempName} onChange={e=>setTempName(e.target.value)} placeholder="Player name" />
          <Button onClick={onAdd} className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white"><UserPlus size={16} className="mr-1"/>Add</Button>
        </div>
        {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-3">{error}</div>}
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {players.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-2 rounded bg-cyan-50 border border-cyan-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs flex items-center justify-center">{i+1}</div>
                <div className="font-medium">{p.name}</div>
              </div>
              <button onClick={() => removePlayer(p.id)} className="p-1 text-red-600 hover:text-red-700" aria-label={`Remove ${p.name}`}><X size={16}/></button>
            </div>
          ))}
          {players.length === 0 && (
            <div className="text-sm text-gray-600 p-3 border border-dashed rounded">Add at least 2 players to start.</div>
          )}
        </div>
        <div className="mt-4 text-right">
          <Button 
            disabled={!canStart || starting} 
            onClick={async () => {
              if (!selectedPlaylist) return;
              setStarting(true);
              try {
                const tracks = await spotifyAPI.getHookHuntPlaylistTracks(selectedPlaylist.id);
                startGame(tracks);
                dispatch(GameAction.ADVANCE);
              } finally {
                setStarting(false);
              }
            }} 
            className="bg-cyan-600 text-white"
          >
            {starting ? 'Starting…' : 'Start Game'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerSetupScreen;
