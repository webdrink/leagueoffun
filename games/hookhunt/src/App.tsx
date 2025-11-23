import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, ArrowLeft } from 'lucide-react';

function App() {
  const [playerId, setPlayerId] = useState<string>('');
  const [returnUrl, setReturnUrl] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('playerId');
    const rurl = params.get('returnUrl');
    
    if (pid) {
      setPlayerId(pid);
      localStorage.setItem('hookhunt.playerId', pid);
    }
    
    if (rurl) {
      setReturnUrl(rurl);
    }
  }, []);

  const handleReturnToHub = () => {
    if (returnUrl) {
      const url = new URL(decodeURIComponent(returnUrl));
      url.searchParams.set('playerId', playerId);
      url.searchParams.set('gameId', 'hookhunt');
      url.searchParams.set('score', '0');
      url.searchParams.set('playedAt', new Date().toISOString());
      window.location.href = url.toString();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center"
        >
          <Music size={48} className="text-white" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-gray-800 mb-4"
        >
          HookHunt
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 mb-8"
        >
          Guess the hit from the hook!
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎵 Coming Soon!
          </h2>
          <p className="text-gray-700 leading-relaxed">
            HookHunt is under development. Get ready to test your music knowledge
            by identifying songs from their iconic hooks. Stay tuned for an epic
            musical adventure!
          </p>
        </motion.div>

        {playerId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-500 mb-6 font-mono"
          >
            Player ID: {playerId.slice(0, 8)}...
          </motion.div>
        )}
        
        {returnUrl && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={handleReturnToHub}
            className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft size={20} />
            Back to League of Fun
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

export default App;
