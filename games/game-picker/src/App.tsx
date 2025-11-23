import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, User } from 'lucide-react';
import { usePlayer } from './PlayerContext';
import { games } from './games.config';

function App() {
  const { playerId } = usePlayer();

  const handlePlayGame = (gameId: string, gameUrl: string) => {
    const returnUrl = encodeURIComponent(window.location.href);
    const targetUrl = `${gameUrl}?playerId=${playerId}&returnUrl=${returnUrl}`;
    window.location.href = targetUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            League of Fun
          </h1>
          <p className="text-xl text-white/90">
            Choose your game and let the fun begin!
          </p>
        </motion.header>

        {/* Player ID Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-8 flex items-center justify-center gap-2 text-white"
        >
          <User size={20} />
          <span className="text-sm font-mono">
            Player ID: {playerId.slice(0, 8)}...
          </span>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                    <Gamepad2 size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {game.name}
                    </h2>
                    <div className="flex gap-2 mt-1">
                      {game.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  {game.description}
                </p>
                <button
                  onClick={() => handlePlayGame(game.id, game.entryUrl)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                >
                  Play Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8 mt-12 text-white/80"
        >
          <p>© 2025 League of Fun - Bringing people together through games</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
