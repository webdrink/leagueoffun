import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, User, Sparkles, Music, Target, Trophy, Users, Zap } from 'lucide-react';
import { usePlayer } from './PlayerContext';
import { useAnimations } from '@game-core';
import { games, GameInfo } from './games.config';

// Animation toggle component
function AnimationToggle() {
  const { animationsEnabled, toggleAnimations } = useAnimations();
  
  return (
    <button
      onClick={toggleAnimations}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white text-sm"
      aria-label={animationsEnabled ? 'Disable animations' : 'Enable animations'}
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
}

function GameCard({ game, index, onPlay }: GameCardProps) {
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
        return 'from-orange-500 via-red-500 to-pink-500';
      case 'hookhunt':
        return 'from-blue-500 via-purple-500 to-pink-500';
      default:
        return 'from-purple-500 via-pink-500 to-orange-500';
    }
  };
  
  const getGameAccent = (id: string) => {
    switch (id) {
      case 'blamegame':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'hookhunt':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };
  
  const getButtonGradient = (id: string) => {
    switch (id) {
      case 'blamegame':
        return 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600';
      case 'hookhunt':
        return 'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600';
      default:
        return 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700';
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
      
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {game.name}
              </h2>
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
          
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            {game.description}
          </p>
          
          {/* Game features/stats */}
          <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
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

  useEffect(() => {
    const stats = localStorage.getItem('leagueoffun.playerStats');
    if (stats) {
      setPlayerStats(JSON.parse(stats));
    }
  }, []);

  const handlePlayGame = (gameId: string, gameUrl: string) => {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const returnUrl = encodeURIComponent(window.location.href);
    
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated floating shapes */}
        {animationsEnabled && (
          <>
            <motion.div
              className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
              animate={floatingAnimation}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
              animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
            />
            <motion.div
              className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"
              animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.5 } }}
            />
          </>
        )}
        
        {/* Static gradient orbs for non-animated state */}
        {!animationsEnabled && (
          <>
            <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
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
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <User size={16} />
              <span className="font-mono">ID: {playerId.slice(0, 8)}...</span>
            </div>
            <AnimationToggle />
          </div>
          
          {/* Logo and title */}
          <motion.div
            className="inline-flex items-center justify-center gap-3 mb-4"
            animate={animationsEnabled ? floatingAnimation : {}}
          >
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <Gamepad2 size={32} className="text-purple-600" />
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
            League of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Fun</span>
          </h1>
          
          <p className="text-xl text-white/90 max-w-lg mx-auto leading-relaxed">
            Bringing friends together through unforgettable party games. 
            Choose your adventure and let the fun begin! 🎉
          </p>
        </motion.header>

        {/* Player stats summary (if any) */}
        {playerStats.length > 0 && (
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-yellow-400" />
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
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onPlay={handlePlayGame}
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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white/80">
            <Sparkles size={18} className="text-yellow-400" />
            <span>More games coming soon!</span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-12 mt-8 border-t border-white/10"
        >
          <p className="text-white/70 mb-2">
            © 2025 League of Fun
          </p>
          <p className="text-white/50 text-sm">
            Bringing people together through games 🎮
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
