/**
 * HookHunt App Component
 *
 * Purpose: Main application component for HookHunt music quiz game.
 *          Handles navigation between game screens, manages authentication,
 *          and coordinates the overall game flow.
 *
 * Game Flow:
 *  1. Intro Screen - Welcome and authentication
 *  2. Playlist Selection - Choose Spotify playlist  
 *  3. Player Setup - Add players and configure game
 *  4. Game Screen - Main gameplay with audio and guessing
 *  5. Summary Screen - Results and scores
 *
 * Dependencies:
 *  - Spotify Web API integration
 *  - Audio processing and playback
 *  - Player management and scoring
 *  - Game state management via Zustand
 */

import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useHookHuntStore } from './store/hookHuntStore';

// Import HookHunt screens
import HookHuntIntroScreen from './components/hookhunt/HookHuntIntroScreen';

// Core UI components  
import ErrorDisplay from './components/core/ErrorDisplay';

const HookHuntApp: React.FC = () => {
  const {
    currentScreen,
    error,
    isLoading,
    setError,
  } = useHookHuntStore();

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // ESC key to clear errors
      if (event.key === 'Escape' && error) {
        setError(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [error, setError]);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return <HookHuntIntroScreen key="intro" />;
      
      case 'playlist-selection':
        return <div key="playlist" className="text-white">Playlist Selection Coming Soon</div>;
      
      case 'player-setup':
        return <div key="player-setup" className="text-white">Player Setup Coming Soon</div>;
      
      case 'game':
        return <div key="game" className="text-white">Game Screen Coming Soon</div>;
      
      case 'summary':
        return <div key="summary" className="text-white">Summary Screen Coming Soon</div>;
      
      default:
        return <HookHuntIntroScreen key="intro" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Global Error Display */}
      {error && (
        <ErrorDisplay 
          message={error}
        />
      )}

      {/* Main Screen Content */}
      <AnimatePresence mode="wait">
        {renderCurrentScreen()}
      </AnimatePresence>

      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-800 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HookHuntApp;