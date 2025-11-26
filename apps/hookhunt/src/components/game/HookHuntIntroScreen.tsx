/**
 * HookHuntIntroScreen Component
 * 
 * The main intro screen for HookHunt game. This component serves as the entry point
 * for the music quiz game, allowing users to start playing and providing basic
 * information about the game.
 * 
 * Props:
 * - onAdvance: Function to proceed to the next screen (Spotify authentication)
 * - gameConfig: Configuration object from game.json
 * 
 * Expected behavior:
 * - Display HookHunt branding and tagline from game.json
 * - Show a start button that triggers onAdvance callback
 * - Provide basic information about the game mechanics
 * - Use framework Button and Card components for consistency
 * 
 * Dependencies:
 * - React, motion (framer-motion)
 * - Button component from framework
 * - Card components from framework
 * 
 * Integration:
 * - Used by framework GameHost via game.json screen configuration
 * - Triggers transition to spotify-auth phase when start button is clicked
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../core/Card';
import { Music, Play, Users } from 'lucide-react';
import type { GameConfig } from '../../framework/config/game.schema';

interface HookHuntIntroScreenProps {
  onAdvance?: () => void;
  gameConfig?: Record<string, unknown>;
  isLoading?: boolean;
}

const HookHuntIntroScreen: React.FC<HookHuntIntroScreenProps> = ({
  onAdvance,
  gameConfig: _gameConfig,
  isLoading = false
}) => {
  const gc = (_gameConfig || {}) as Partial<GameConfig>;
  const handleStartGame = () => {
    console.log('🎵 HookHuntIntroScreen: Start button clicked');
    if (onAdvance) {
      onAdvance();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto p-4"
      data-testid="hookhunt-intro"
    >
      <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 backdrop-blur-sm border-purple-200">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4"
          >
            <Music size={32} className="text-white" />
          </motion.div>
          
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {gc.ui?.branding?.gameName || 'HookHunt'}
          </CardTitle>
          
          <CardDescription className="text-lg text-gray-600 mt-2">
            {gc.ui?.branding?.tagline || 'Guess the song from the hook!'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center"
          >
            <p className="text-gray-700 text-base leading-relaxed">
              {gc.ui?.branding?.subtitle || 'Test your music knowledge with Spotify playlists'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <Play className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <h3 className="font-semibold text-sm">Listen to Hooks</h3>
              <p className="text-xs text-gray-600 mt-1">Hear the catchiest parts of songs</p>
            </div>
            
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <Music className="w-8 h-8 mx-auto text-pink-500 mb-2" />
              <h3 className="font-semibold text-sm">Guess Songs</h3>
              <p className="text-xs text-gray-600 mt-1">Name the song or artist</p>
            </div>
            
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <Users className="w-8 h-8 mx-auto text-red-500 mb-2" />
              <h3 className="font-semibold text-sm">Compete</h3>
              <p className="text-xs text-gray-600 mt-1">Play with up to {gc.maxPlayers || 8} players</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="bg-purple-50 border border-purple-200 rounded-lg p-4"
          >
            <h4 className="font-semibold text-purple-800 mb-2">How to Play:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Connect your Spotify account</li>
              <li>• Choose your favorite playlist</li>
              <li>• Listen to song hooks and guess the title or artist</li>
              <li>• Earn points for correct answers</li>
            </ul>
          </motion.div>
        </CardContent>

        <CardFooter className="flex justify-center pt-6">
          <Button
            onClick={handleStartGame}
            disabled={isLoading}
            className="w-full max-w-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Play size={20} className="mr-2" />
                Start Playing
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default HookHuntIntroScreen;