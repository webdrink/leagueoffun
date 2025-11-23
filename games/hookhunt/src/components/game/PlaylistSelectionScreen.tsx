/**
 * PlaylistSelectionScreen Component
 * 
 * Allows users to browse and select a Spotify playlist for the HookHunt game.
 * Displays available playlists with filtering and search capabilities.
 * 
 * Props:
 * - onAdvance: Function to proceed to player setup with selected playlist
 * - onBack: Function to return to Spotify auth screen
 * - gameConfig: Configuration object from game.json
 * 
 * Expected behavior:
 * - Display user's available Spotify playlists
 * - Provide search/filter functionality
 * - Show playlist metadata (track count, images)
 * - Allow playlist selection and proceed to player setup
 * 
 * Dependencies:
 * - React, motion (framer-motion)
 * - Button component from framework
 * - Card components from framework
 * - Spotify API service for playlist fetching
 * 
 * Integration:
 * - Used by framework GameHost for playlist-selection phase
 * - Integrates with SpotifyAPI service for playlist data
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../core/Card';
import { Input } from '../core/Input';
import { Search, Music, Users, PlayCircle } from 'lucide-react';
import { spotifyAPI } from '../../lib/integrations/spotify/SpotifyAPI';
import type { Playlist } from '../../hookHuntTypes';
import { useHookHuntStore } from '../../store/hookHuntStore';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';

interface PlaylistSelectionScreenProps {
  onAdvance?: () => void;
  onBack?: () => void;
  gameConfig?: Record<string, unknown>;
}

const PlaylistSelectionScreen: React.FC<PlaylistSelectionScreenProps> = ({
  onAdvance: _onAdvance,
  onBack: _onBack,
  gameConfig: _gameConfig
}) => {
  const { dispatch } = useFrameworkRouter();
  const selectPlaylistStore = useHookHuntStore(s => s.selectPlaylist);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        const pls = await spotifyAPI.getHookHuntPlaylists();
        setPlaylists(pls);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (playlist.description && playlist.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePlaylistSelect = (playlistId: string) => {
    console.log(`🎵 PlaylistSelectionScreen: Selected playlist ${playlistId}`);
    setSelectedPlaylist(playlistId);
  };

  const handleContinue = () => {
    if (!selectedPlaylist) return;
    
    console.log(`🎵 PlaylistSelectionScreen: Continuing with playlist ${selectedPlaylist}`);
    setIsLoading(true);
    try {
      const p = playlists.find(pl => pl.id === selectedPlaylist);
      if (p) {
        selectPlaylistStore(p);
      }
      // proceed to player setup
      dispatch(GameAction.ADVANCE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    console.log('🎵 PlaylistSelectionScreen: Going back to auth');
    dispatch(GameAction.BACK);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto p-4"
    >
      <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Choose Your Playlist
          </CardTitle>
          
          <CardDescription className="text-lg text-gray-600 mt-2">
            Select a playlist to create your HookHunt quiz
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              type="text"
              placeholder="Search your playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-base"
            />
          </motion.div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
          )}
          {/* Playlist Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto"
          >
            {filteredPlaylists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedPlaylist === playlist.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white/60 hover:border-blue-300 hover:bg-white/80'
                }`}
                onClick={() => handlePlaylistSelect(playlist.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {playlist.description || 'No description available'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <PlayCircle className="w-3 h-3 mr-1" />
                        {playlist.trackCount} tracks
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {playlist.owner}
                      </span>
                    </div>
                  </div>
                  
                  {selectedPlaylist === playlist.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredPlaylists.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-center py-8 text-gray-500"
            >
              <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No playlists found matching your search.</p>
              <p className="text-sm mt-1">Try adjusting your search terms.</p>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-4">
          <Button
            onClick={handleGoBack}
            variant="outline"
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          
          <Button
            onClick={handleContinue}
            disabled={!selectedPlaylist || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </span>
            ) : (
              'Continue to Setup'
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PlaylistSelectionScreen;