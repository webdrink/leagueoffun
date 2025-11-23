/**
 * HookHunt Intro Screen Component
 * 
 * Purpose: Main entry point for the HookHunt music quiz game. Handles Spotify 
 * authentication, game mode selection, and navigation to playlist selection.
 * 
 * Props: None (uses HookHunt store for state management)
 * 
 * Expected behavior:
 * - Display game title and description
 * - Show Spotify login button when not authenticated
 * - Show game mode selection (Lite vs Pro) when authenticated
 * - Navigate to playlist selection when ready to start
 * 
 * Dependencies:
 * - React, framer-motion for animations
 * - HookHunt store for authentication state
 * - Spotify authentication utilities
 * - Framework button and layout components
 * 
 * Integration:
 * - Uses existing framework Button and Card components
 * - Integrates with framework routing system
 * - Follows established animation patterns
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Zap, Settings, LogIn, User } from 'lucide-react';

// Framework components (adjust paths as needed)
import { Button } from '../core/Button';
import { Card, CardContent } from '../core/Card';

// HookHunt store and utilities
import { useHookHuntStore, useHookHuntAuth, useHookHuntUI } from '../../store/hookHuntStore';
import { spotifyAuth, isSpotifyCallback, getCallbackCode, getCallbackError } from '../../lib/integrations/spotify/SpotifyAuth';
import { spotifyAPI } from '../../lib/integrations/spotify/SpotifyAPI';

/**
 * HookHunt Intro Screen - Main entry point for the music quiz game
 */
const HookHuntIntroScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store hooks
  const { 
    isAuthenticated, 
    user, 
    setUser, 
    setTokenExpiry 
  } = useHookHuntAuth();
  
  const { 
    gameMode, 
    setGameMode, 
    setCurrentScreen 
  } = useHookHuntStore();
  
  const {
    setIsLoading: setUILoading,
    setError: setUIError
  } = useHookHuntUI();
  
  // Handle OAuth callback on component mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (isSpotifyCallback()) {
        setIsLoading(true);
        setError(null);
        
        try {
          const code = getCallbackCode();
          const authError = getCallbackError();
          
          if (authError) {
            throw new Error(`Spotify authentication failed: ${authError}`);
          }
          
          if (!code) {
            throw new Error('No authorization code received from Spotify');
          }
          
          // Exchange code for tokens
          const tokenData = await spotifyAuth.handleCallback(code);
          setTokenExpiry(Date.now() + (tokenData.expires_in * 1000));
          
          // Fetch user profile
          const userProfile = await spotifyAPI.getCurrentUser();
          spotifyAuth.storeUser(userProfile);
          setUser(userProfile);
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
        } catch (err) {
          console.error('OAuth callback error:', err);
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setUIError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleOAuthCallback();
  }, [setUser, setTokenExpiry, setUIError]);
  
  // Check for existing authentication on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      if (spotifyAuth.isAuthenticated()) {
        const storedUser = spotifyAuth.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setTokenExpiry(spotifyAuth.getTokenExpiry());
        } else {
          // Fetch fresh user data
          try {
            const userProfile = await spotifyAPI.getCurrentUser();
            spotifyAuth.storeUser(userProfile);
            setUser(userProfile);
          } catch (err) {
            console.error('Failed to fetch user profile:', err);
            spotifyAuth.logout();
          }
        }
      }
    };
    
    checkExistingAuth();
  }, [setUser, setTokenExpiry]);
  
  const handleSpotifyLogin = async () => {
    setIsLoading(true);
    setError(null);
    setUILoading(true);
    
    try {
      await spotifyAuth.login();
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start authentication';
      setError(errorMessage);
      setUIError(errorMessage);
      setIsLoading(false);
      setUILoading(false);
    }
  };
  
  const handleLogout = () => {
    spotifyAuth.logout();
    setUser(null);
    setTokenExpiry(null);
    setError(null);
    setUIError(null);
  };
  
  const handleStartGame = () => {
    if (isAuthenticated) {
      setCurrentScreen('playlist-selection');
    }
  };
  
  const handleGameModeChange = (mode: 'lite' | 'pro') => {
    setGameMode(mode);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-6"
      >
        {/* Game Title */}
        <motion.div 
          variants={itemVariants}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 rounded-full">
              <Music className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            HookHunt
          </h1>
          <p className="text-purple-200 text-lg">
            Guess the song from the hook!
          </p>
        </motion.div>
        
        {/* Error Display */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="bg-red-500/20 border border-red-500 rounded-lg p-4"
          >
            <p className="text-red-200 text-sm">{error}</p>
          </motion.div>
        )}
        
        {/* Authentication Section */}
        {!isAuthenticated ? (
          <motion.div variants={itemVariants}>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Connect to Spotify
                </h2>
                <p className="text-purple-200 mb-6">
                  Sign in with your Spotify account to access your playlists and start playing!
                </p>
                <Button
                  onClick={handleSpotifyLogin}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  {isLoading ? 'Connecting...' : 'Login with Spotify'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-4">
            {/* User Info */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 p-2 rounded-full">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {user?.display_name || 'Spotify User'}
                      </p>
                      <p className="text-purple-200 text-sm">Connected</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-purple-300 hover:text-white text-sm"
                  >
                    Logout
                  </button>
                </div>
              </CardContent>
            </Card>
            
            {/* Game Mode Selection */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Choose Game Mode
                </h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleGameModeChange('lite')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      gameMode === 'lite'
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-6 h-6 text-purple-400" />
                        <div className="text-left">
                          <h3 className="text-white font-medium">Lite Mode</h3>
                          <p className="text-purple-200 text-sm">
                            30-second previews with smart hook detection
                          </p>
                        </div>
                      </div>
                      {gameMode === 'lite' && (
                        <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                      )}
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleGameModeChange('pro')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      gameMode === 'pro'
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Settings className="w-6 h-6 text-purple-400" />
                        <div className="text-left">
                          <h3 className="text-white font-medium">Pro Mode</h3>
                          <p className="text-purple-200 text-sm">
                            Full tracks with advanced audio analysis
                          </p>
                        </div>
                      </div>
                      {gameMode === 'pro' && (
                        <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                      )}
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
            
            {/* Start Button */}
            <Button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-4"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </motion.div>
        )}
        
        {/* Game Info */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <h3 className="text-white font-medium mb-2">How to Play</h3>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• Listen to song hooks (7-12 seconds)</li>
                <li>• Guess the song title and/or artist</li>
                <li>• Earn points for correct matches</li>
                <li>• Play with friends in hot-seat mode</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HookHuntIntroScreen;