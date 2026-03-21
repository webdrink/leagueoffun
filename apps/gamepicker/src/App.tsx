import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, User, Sparkles, Music, Target, Trophy, Users, Zap, Copy, Check, Clock3 } from 'lucide-react';
import { usePlayer } from './PlayerContext';
import { useAnimations } from '@game-core';
import { games, GameInfo } from './games.config';

// Session ID display with copy functionality
function SessionIdDisplay() {
  const { playerId } = usePlayer();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(playerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [playerId]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 hover:bg-slate-900/55 border border-white/10 transition-colors text-white/85 hover:text-white text-sm group"
      title="Click to copy Session ID. Used to reconnect to ongoing sessions."
      aria-label={`Session ID: ${playerId.slice(0, 8)}. Click to copy.`}
    >
      <User size={16} />
      <span className="font-mono">Session: {playerId.slice(0, 8)}...</span>
      {copied ? (
        <Check size={14} className="text-green-400" />
      ) : (
        <Copy size={14} className="opacity-50 group-hover:opacity-100" />
      )}
    </button>
  );
}

// Animation toggle component
function AnimationToggle() {
  const { animationsEnabled, toggleAnimations } = useAnimations();
  
  return (
    <button
      onClick={toggleAnimations}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 hover:bg-slate-900/55 border border-white/10 transition-colors text-white/85 hover:text-white text-sm"
      aria-label={animationsEnabled ? 'Disable animations' : 'Enable animations'}
      role="switch"
      aria-checked={animationsEnabled}
    >
      {animationsEnabled ? <Zap size={16} /> : <Zap size={16} className="opacity-50" />}
      <span className="hidden sm:inline">{animationsEnabled ? 'Animations On' : 'Animations Off'}</span>
    </button>
  );
}

// Game card component with enhanced visuals
interface GameCardProps {
  game: GameInfo;
  index: number;
  onPlay: (gameId: string, gameUrl: string) => void;
  isLastPlayed: boolean;
}

function GameCard({ game, index, onPlay, isLastPlayed }: GameCardProps) {
  const { animationsEnabled } = useAnimations();
  const [isHovered, setIsHovered] = useState(false);
  
  const getGameIcon = (id: string) => {
    switch (id) {
      case 'blamegame':
        return <Target className="text-white" size={32} />;
      case 'hookhunt':
        return <Music className="text-white" size={32} />;
      default:
        return <Gamepad2 className="text-white" size={32} />;
    }
  };
  
  const getGameGradient = (id: string) => {
    switch (id) {
      case 'blamegame':
        return 'from-amber-500 via-orange-500 to-red-500';
      case 'hookhunt':
        return 'from-cyan-500 via-teal-500 to-emerald-500';
      default:
        return 'from-sky-500 via-cyan-500 to-teal-500';
    }
  };
  
  const getGameAccent = (id: string) => {
    switch (id) {
      case 'blamegame':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hookhunt':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    }
  };
  
  const getButtonGradient = (id: string) => {
    switch (id) {
      case 'blamegame':
        return 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700';
      case 'hookhunt':
        return 'from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700';
      default:
        return 'from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700';
    }
  };

  const cardVariants = animationsEnabled
    ? {
        initial: { opacity: 0, y: 30, scale: 0.95 },
        animate: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { 
            delay: index * 0.15,
            duration: 0.5,
            type: 'spring',
            stiffness: 100
          }
        },
        hover: { 
          scale: 1.02,
          y: -8,
          transition: { duration: 0.2 }
        }
      }
    : {
        initial: { opacity: 1, y: 0, scale: 1 },
        animate: { opacity: 1, y: 0, scale: 1 },
        hover: { scale: 1, y: 0 }
      };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glow effect behind card */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${getGameGradient(game.id)} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`}
      />
      
      <div className="bg-white/95 rounded-3xl shadow-xl overflow-hidden border border-white/70">
        {/* Decorative header bar */}
        <div className={`h-2 bg-gradient-to-r ${getGameGradient(game.id)}`} />
        
        <div className="p-8">
          <div className="flex items-start gap-5 mb-6">
            {/* Game icon with animated gradient */}
            <div className={`relative w-20 h-20 bg-gradient-to-br ${getGameGradient(game.id)} rounded-2xl flex items-center justify-center shadow-lg`}>
              {getGameIcon(game.id)}
              {/* Animated sparkle effect */}
              {animationsEnabled && isHovered && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles size={20} className="text-yellow-400" />
                </motion.div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {game.name}
              </h2>
              {isLastPlayed && (
                <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mb-2">
                  <Clock3 size={12} />
                  Continue Last Session
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {game.tags.map(tag => (
                  <span
                    key={tag}
                    className={`text-xs px-3 py-1 rounded-full border ${getGameAccent(game.id)} font-medium`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-slate-600 mb-6 text-lg leading-relaxed">
            {game.description}
          </p>
          
          {/* Game features/stats */}
          <div className="flex items-center gap-6 mb-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>2+ players</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={16} />
              <span>Party game</span>
            </div>
          </div>
          
          <motion.button
            onClick={() => onPlay(game.id, game.entryUrl)}
            className={`w-full bg-gradient-to-r ${getButtonGradient(game.id)} text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
            whileHover={animationsEnabled ? { scale: 1.02 } : {}}
            whileTap={animationsEnabled ? { scale: 0.98 } : {}}
          >
            <Gamepad2 size={20} />
            Play Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Main App component
function App() {
  const { playerId } = usePlayer();
  const { animationsEnabled } = useAnimations();
  const [playerStats, setPlayerStats] = useState<Array<{ gameId: string; score: number; playedAt: string }>>([]);
  const [lastGameId, setLastGameId] = useState<string | null>(() => localStorage.getItem('leagueoffun.lastGameId'));

  useEffect(() => {
    const stats = localStorage.getItem('leagueoffun.playerStats');
    if (stats) {
      try {
        const parsed = JSON.parse(stats) as Array<{ gameId: string; score: number; playedAt: string }>;
        setPlayerStats(parsed);
        if (parsed.length > 0) {
          const latest = [...parsed].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())[0];
          if (latest?.gameId) {
            setLastGameId(latest.gameId);
          }
        }
      } catch {
        setPlayerStats([]);
      }
    }
  }, []);

  const orderedGames = useMemo(() => {
    if (!lastGameId) return games;
    return [...games].sort((a, b) => {
      if (a.id === lastGameId) return -1;
      if (b.id === lastGameId) return 1;
      return 0;
    });
  }, [lastGameId]);

  const handlePlayGame = (gameId: string, gameUrl: string) => {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const returnUrl = encodeURIComponent(window.location.href);
    const playedAt = new Date().toISOString();
    localStorage.setItem('leagueoffun.lastGameId', gameId);
    localStorage.setItem('leagueoffun.lastPlayedAt', playedAt);
    setLastGameId(gameId);
    
    // In local development, route to local game servers on their specific ports
    let targetBaseUrl = gameUrl;
    if (isLocalDev) {
      // Map game ID to local dev ports
      const localPorts: Record<string, number> = {
        'blamegame': 9991,
        'hookhunt': 9992,
      };
      const port = localPorts[gameId] || 9991;
      targetBaseUrl = `http://localhost:${port}`;
    }
    
    const targetUrl = `${targetBaseUrl}?playerId=${playerId}&returnUrl=${returnUrl}`;
    window.location.href = targetUrl;
  };

  const headerVariants = animationsEnabled
    ? {
        initial: { opacity: 0, y: -30 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.6, type: 'spring', stiffness: 100 }
        }
      }
    : {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 }
      };

  const floatingAnimation = animationsEnabled
    ? {
        y: [0, -10, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated floating shapes */}
        {animationsEnabled && (
          <>
            <motion.div
              className="absolute top-20 left-10 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl"
              animate={floatingAnimation}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"
              animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
            />
            <motion.div
              className="absolute top-1/2 left-1/3 w-48 h-48 bg-amber-300/15 rounded-full blur-3xl"
              animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.5 } }}
            />
          </>
        )}
        
        {/* Static gradient orbs for non-animated state */}
        {!animationsEnabled && (
          <>
            <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
          </>
        )}
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          {/* Settings bar */}
          <div className="flex justify-between items-center mb-8">
            <SessionIdDisplay />
            <AnimationToggle />
          </div>
          
          {/* Logo and title */}
          <motion.div
            className="inline-flex items-center justify-center gap-3 mb-4"
            animate={animationsEnabled ? floatingAnimation : {}}
          >
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <Gamepad2 size={32} className="text-teal-700" />
              </div>
              {animationsEnabled && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: [0, 15, 0, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles size={20} className="text-yellow-400" />
                </motion.div>
              )}
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            League of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Fun</span>
          </h1>
          
          <p className="text-xl text-white/90 max-w-lg mx-auto leading-relaxed">
            Bringing friends together through unforgettable party games.
            Choose your adventure and let the fun begin.
          </p>
        </motion.header>

        {/* Player stats summary (if any) */}
        {playerStats.length > 0 && (
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/35 backdrop-blur-md rounded-2xl p-4 mb-8 border border-white/15"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-amber-300" />
                <div>
                  <p className="text-white font-semibold">Recent Activity</p>
                  <p className="text-white/70 text-sm">
                    {playerStats.length} game{playerStats.length !== 1 ? 's' : ''} played
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Total Score</p>
                <p className="text-white font-bold text-lg">
                  {playerStats.reduce((sum, s) => sum + s.score, 0)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Games Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {orderedGames.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onPlay={handlePlayGame}
              isLastPlayed={game.id === lastGameId}
            />
          ))}
        </div>

        {/* Coming soon placeholder */}
        <motion.div
          initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900/35 backdrop-blur-sm rounded-full border border-white/20 text-white/85">
            <Sparkles size={18} className="text-yellow-400" />
            <span>More games coming soon!</span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-12 mt-8 border-t border-white/15"
        >
          <p className="text-white/70 mb-2">
            © 2025 League of Fun
          </p>
          <p className="text-white/50 text-sm">
            Bringing people together through games.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
