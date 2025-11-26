import React, { useEffect, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Music, ArrowLeft, Zap, Play, Headphones, Users, Trophy, Star, Sparkles, Settings, Info, Moon, Sun } from 'lucide-react';
import { useAnimations } from '@game-core';

// Reusable FooterButton component matching BlameGame style
interface FooterButtonProps {
  onClick?: () => void;
  title: string;
  children: ReactNode;
}

const FooterButton: React.FC<FooterButtonProps> = ({ onClick, title, children }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-11 h-11 bg-orange-600/60 rounded-xl backdrop-blur-md border-2 border-orange-500/80 shadow-xl hover:bg-orange-500/70 hover:border-orange-400 transition-all duration-200 transform hover:scale-105"
    title={title}
  >
    {children}
  </button>
);

// Seasonal theme hook (matches BlameGame)
type Season = 'fall' | 'winter' | 'spring' | 'summer';

const getCurrentSeason = (): Season => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

const getSeasonalGradient = (season: Season, isDark: boolean): string => {
  switch (season) {
    case 'fall':
      return isDark 
        ? 'bg-gradient-to-br from-amber-900 via-orange-900 to-red-900'
        : 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500';
    case 'winter':
      return isDark
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
        : 'bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500';
    case 'spring':
      return isDark
        ? 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900'
        : 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500';
    case 'summer':
      return isDark
        ? 'bg-gradient-to-br from-yellow-900 via-orange-900 to-pink-900'
        : 'bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500';
  }
};

// Dark mode hook
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lof.v1.darkMode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('lof.v1.darkMode', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(prev => !prev) };
}

function App() {
  const [playerId, setPlayerId] = useState<string>('');
  const [returnUrl, setReturnUrl] = useState<string>('');
  const { animationsEnabled, toggleAnimations } = useAnimations();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  
  // Get season from localStorage or auto-detect (doesn't need to be stateful as it rarely changes)
  const season: Season = (() => {
    const saved = localStorage.getItem('lof.v1.theme.season') as Season | null;
    return saved || getCurrentSeason();
  })();

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

  const itemVariants = animationsEnabled
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }
    : {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 }
      };

  const features = [
    { icon: <Headphones size={18} />, text: 'Listen to 7-12 second hooks' },
    { icon: <Users size={18} />, text: 'Play with friends' },
    { icon: <Trophy size={18} />, text: 'Compete for high scores' },
    { icon: <Star size={18} />, text: 'Connect your Spotify' },
  ];

  const backgroundGradient = getSeasonalGradient(season, isDark);

  return (
    <div className={`min-h-screen ${backgroundGradient} animate-gentle-shift overflow-hidden`}>
      {/* Fixed Layout Container matching BlameGame structure */}
      <div className="h-screen flex flex-col bg-transparent overflow-hidden">
        {/* Main Viewport-Responsive Container */}
        <div className="flex flex-col h-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto w-full px-3 sm:px-4 lg:px-6 bg-transparent">
          
          {/* Top Padding */}
          <div className="h-4 sm:h-6 flex-shrink-0"></div>
          
          {/* Header Card - Matching BlameGame style */}
          <header className="py-3 sm:py-4 flex-shrink-0 flex justify-center items-center">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-4 w-full backdrop-blur-sm flex items-center justify-center min-h-[64px]">
              <div className="text-center w-full max-w-full">
                <motion.h1
                  initial={animationsEnabled ? { opacity: 0, y: -10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 dark:from-orange-400 dark:via-orange-500 dark:to-red-500 drop-shadow-sm leading-tight text-center w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                >
                  HookHunt
                </motion.h1>
                <motion.p
                  initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-orange-600 dark:text-orange-400 font-medium text-sm sm:text-base md:text-lg"
                >
                  Guess the hit from the hook! 🎵
                </motion.p>
              </div>
            </div>
          </header>

          {/* Padding after header */}
          <div className="h-3 sm:h-4 flex-shrink-0"></div>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col bg-transparent min-h-0 overflow-auto">
            <div className="flex-1 flex items-center justify-center bg-transparent py-2 sm:py-4 px-0 min-h-0">
              <motion.div
                initial={animationsEnabled ? { opacity: 0, y: 20, scale: 0.95 } : {}}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-2xl p-6 md:p-8 w-full backdrop-blur-sm"
              >
                {/* Coming Soon Badge - Preserved from original design */}
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-yellow-500/30 dark:to-orange-500/30 rounded-full border border-yellow-400/50 dark:border-yellow-500/50">
                    <Sparkles size={20} className="text-yellow-500 dark:text-yellow-400" />
                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold text-lg">Coming Soon!</span>
                  </div>
                </motion.div>

                {/* Game Icon */}
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl">
                      <Music size={40} className="text-white" />
                    </div>
                    {animationsEnabled && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ rotate: [0, 15, 0, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles size={20} className="text-yellow-500" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-600"
                >
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                    HookHunt is under development! Get ready to test your music knowledge
                    by identifying songs from their iconic hooks. Connect your Spotify playlist
                    and challenge friends to see who knows their tunes best!
                  </p>
                </motion.div>

                {/* Features grid */}
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-3 mb-6"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.text}
                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                      whileHover={animationsEnabled ? { scale: 1.02 } : {}}
                      initial={animationsEnabled ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="text-orange-500 dark:text-orange-400">{feature.icon}</div>
                      <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.7 }}
                  className="space-y-3"
                >
                  {/* Disabled play button - matches BlameGame button style */}
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-gray-500 dark:text-gray-400 font-bold py-4 px-6 rounded-xl cursor-not-allowed transition-all duration-200"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Play size={20} />
                      Game Coming Soon
                    </span>
                  </button>
                  
                  {/* Return to hub */}
                  {returnUrl && (
                    <motion.button
                      onClick={handleReturnToHub}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      whileHover={animationsEnabled ? { scale: 1.02 } : {}}
                      whileTap={animationsEnabled ? { scale: 0.98 } : {}}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <ArrowLeft size={20} />
                        Back to League of Fun
                      </span>
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </main>

          {/* Padding before footer */}
          <div className="h-3 sm:h-4 flex-shrink-0"></div>

          {/* Footer - Matching BlameGame style */}
          <footer className="flex-shrink-0 flex flex-col items-center justify-center pb-3 sm:pb-4">
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 mx-auto w-full max-w-2xl border border-white/20 shadow-2xl">
              {/* Top Row: Main Controls */}
              <div className="flex justify-center items-center gap-3 text-white dark:text-gray-200 mb-3">
                {/* Animation toggle */}
                <FooterButton
                  onClick={toggleAnimations}
                  title={animationsEnabled ? 'Disable animations' : 'Enable animations'}
                >
                  <Zap size={18} className={animationsEnabled ? '' : 'opacity-50'} />
                </FooterButton>
                
                {/* Settings button - Coming soon alert */}
                <FooterButton
                  onClick={() => alert('Settings coming soon!')}
                  title="Settings"
                >
                  <Settings size={18} />
                </FooterButton>
                
                {/* Info button - Coming soon alert */}
                <FooterButton
                  onClick={() => alert('HookHunt is under development. Stay tuned!')}
                  title="Information"
                >
                  <Info size={18} />
                </FooterButton>
                
                {/* Dark Mode Toggle */}
                <FooterButton
                  onClick={toggleDarkMode}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </FooterButton>
              </div>
              
              {/* Bottom Row: Support message */}
              <div className="border-t border-white/30 pt-3">
                <p className="text-sm text-center text-white font-medium">
                  🍂 Support us to unlock more games! 
                  <span className="block text-white/90 text-xs mt-1">
                    Your donation helps us create better games.
                  </span>
                </p>
              </div>
            </div>
          </footer>

          {/* Bottom Padding */}
          <div className="h-4 sm:h-6 flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
