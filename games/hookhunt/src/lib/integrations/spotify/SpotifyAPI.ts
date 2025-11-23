/**
 * Spotify Web API Client
 * 
 * Provides a typed interface to the Spotify Web API with built-in
 * authentication, rate limiting, and error handling.
 * 
 * Features:
 * - Automatic authentication header injection
 * - Rate limiting with exponential backoff
 * - Type-safe API responses
 * - Error handling and retry logic
 * - Caching for frequently accessed data
 */

import { spotifyAuth } from './SpotifyAuth';
import type {
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAudioAnalysis,
  Playlist,
  Track
} from '../../../hookHuntTypes';

// Spotify Web API base URL
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
} as const;

/**
 * Custom error class for Spotify API errors
 */
export class SpotifyAPIClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'SpotifyAPIClientError';
  }
}

/**
 * Rate limiting utility with exponential backoff
 */
class RateLimiter {
  private retryCount = 0;
  
  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      const result = await operation();
      this.retryCount = 0; // Reset on success
      return result;
    } catch (error: unknown) {
      if (this.shouldRetry(error) && this.retryCount < RATE_LIMIT_CONFIG.maxRetries) {
        this.retryCount++;
        const delay = this.calculateDelay();
        
        console.warn(`Spotify API rate limited. Retrying in ${delay}ms (attempt ${this.retryCount})`);
        await this.sleep(delay);
        
        return this.executeWithRetry(operation);
      }
      
      this.retryCount = 0;
      throw error;
    }
  }
  
  private shouldRetry(error: unknown): boolean {
    // Retry on rate limit (429) or server errors (5xx)
    const err = error as { status?: number };
    return err.status === 429 || (err.status !== undefined && err.status >= 500 && err.status < 600);
  }
  
  private calculateDelay(): number {
    const exponentialDelay = RATE_LIMIT_CONFIG.baseDelay * Math.pow(2, this.retryCount - 1);
    const jitteredDelay = exponentialDelay + (Math.random() * 1000);
    return Math.min(jitteredDelay, RATE_LIMIT_CONFIG.maxDelay);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Simple in-memory cache for API responses
 */
class APICache {
  private cache = new Map<string, { data: unknown; expiry: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }
    
    if (cached) {
      this.cache.delete(key); // Remove expired entry
    }
    
    return null;
  }
  
  set(key: string, data: unknown, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Main Spotify API client class
 */
export class SpotifyAPIClient {
  private rateLimiter = new RateLimiter();
  private cache = new APICache();
  
  /**
   * Makes authenticated requests to the Spotify API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await spotifyAuth.getAccessToken();
    
    if (!token) {
      throw new SpotifyAPIClientError('Not authenticated with Spotify');
    }
    
    const url = `${SPOTIFY_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      if (response.status === 401) {
        // Token expired, try to refresh
        try {
          await spotifyAuth.refreshToken();
          // Retry the request once with new token
          return this.makeRequest(endpoint, options);
        } catch (refreshError) {
          throw new SpotifyAPIClientError(
            'Authentication expired. Please log in again.',
            401,
            refreshError
          );
        }
      }
      
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
      throw new SpotifyAPIClientError(errorMessage, response.status, errorData);
    }
    
    return response.json();
  }
  
  /**
   * Gets the current user's profile
   */
  async getCurrentUser(): Promise<SpotifyUser> {
    const cacheKey = 'current_user';
    const cached = this.cache.get<SpotifyUser>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    return this.rateLimiter.executeWithRetry(async () => {
      const user = await this.makeRequest<SpotifyUser>('/me');
      this.cache.set(cacheKey, user);
      return user;
    });
  }
  
  /**
   * Gets the user's playlists
   */
  async getUserPlaylists(limit = 50, offset = 0): Promise<{ items: SpotifyPlaylist[]; total: number }> {
    const cacheKey = `user_playlists_${limit}_${offset}`;
    const cached = this.cache.get<{ items: SpotifyPlaylist[]; total: number }>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    return this.rateLimiter.executeWithRetry(async () => {
      const response = await this.makeRequest<{ items: SpotifyPlaylist[]; total: number }>(
        `/me/playlists?limit=${limit}&offset=${offset}`
      );
      this.cache.set(cacheKey, response);
      return response;
    });
  }
  
  /**
   * Gets all user playlists (handles pagination)
   */
  async getAllUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const cacheKey = 'all_user_playlists';
    const cached = this.cache.get<SpotifyPlaylist[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    return this.rateLimiter.executeWithRetry(async () => {
      const allPlaylists: SpotifyPlaylist[] = [];
      let offset = 0;
      const limit = 50;
      
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await this.getUserPlaylists(limit, offset);
        allPlaylists.push(...response.items);
        
        if (response.items.length < limit) {
          break; // No more pages
        }
        
        offset += limit;
      }
      
      this.cache.set(cacheKey, allPlaylists);
      return allPlaylists;
    });
  }
  
  /**
   * Gets tracks from a playlist
   */
  async getPlaylistTracks(playlistId: string, limit = 100, offset = 0): Promise<{ items: Array<{ track: SpotifyTrack }>; total: number }> {
    const cacheKey = `playlist_tracks_${playlistId}_${limit}_${offset}`;
    const cached = this.cache.get<{ items: Array<{ track: SpotifyTrack }>; total: number }>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    return this.rateLimiter.executeWithRetry(async () => {
      const response = await this.makeRequest<{ items: Array<{ track: SpotifyTrack }>; total: number }>(
        `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(id,name,artists,album,preview_url,duration_ms,popularity,external_urls)),total`
      );
      this.cache.set(cacheKey, response);
      return response;
    });
  }
  
  /**
   * Gets all tracks from a playlist (handles pagination)
   */
  async getAllPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const cacheKey = `all_playlist_tracks_${playlistId}`;
    const cached = this.cache.get<SpotifyTrack[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    return this.rateLimiter.executeWithRetry(async () => {
      const allTracks: SpotifyTrack[] = [];
      let offset = 0;
      const limit = 100;
      
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await this.getPlaylistTracks(playlistId, limit, offset);
        const validTracks = response.items
          .map(item => item.track)
          .filter(track => track && track.preview_url); // Only include tracks with previews
        
        allTracks.push(...validTracks);
        
        if (response.items.length < limit) {
          break; // No more pages
        }
        
        offset += limit;
      }
      
      this.cache.set(cacheKey, allTracks);
      return allTracks;
    });
  }
  
  /**
   * Gets audio analysis for a track (Pro mode)
   */
  async getAudioAnalysis(trackId: string): Promise<SpotifyAudioAnalysis> {
    const cacheKey = `audio_analysis_${trackId}`;
    const cached = this.cache.get<SpotifyAudioAnalysis>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    return this.rateLimiter.executeWithRetry(async () => {
      const analysis = await this.makeRequest<SpotifyAudioAnalysis>(`/audio-analysis/${trackId}`);
      this.cache.set(cacheKey, analysis, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return analysis;
    });
  }
  
  /**
   * Converts Spotify playlist to HookHunt format
   */
  convertPlaylist(spotifyPlaylist: SpotifyPlaylist): Playlist {
    return {
      id: spotifyPlaylist.id,
      name: spotifyPlaylist.name,
      description: spotifyPlaylist.description || undefined,
      trackCount: spotifyPlaylist.tracks.total,
      imageUrl: spotifyPlaylist.images[0]?.url,
      spotifyUrl: spotifyPlaylist.external_urls.spotify,
      owner: spotifyPlaylist.owner.display_name || spotifyPlaylist.owner.id,
    };
  }
  
  /**
   * Converts Spotify track to HookHunt format
   */
  convertTrack(spotifyTrack: SpotifyTrack): Track {
    return {
      id: spotifyTrack.id,
      title: spotifyTrack.name,
      artist: spotifyTrack.artists.map((a: SpotifyArtist) => a.name).join(', '),
      album: spotifyTrack.album.name,
      previewUrl: spotifyTrack.preview_url,
      duration: spotifyTrack.duration_ms,
      popularity: spotifyTrack.popularity,
      albumArt: spotifyTrack.album.images[0]?.url,
      spotifyUrl: spotifyTrack.external_urls.spotify,
    };
  }
  
  /**
   * Gets HookHunt-formatted playlists
   */
  async getHookHuntPlaylists(): Promise<Playlist[]> {
    const spotifyPlaylists = await this.getAllUserPlaylists();
    return spotifyPlaylists.map(playlist => this.convertPlaylist(playlist));
  }
  
  /**
   * Gets HookHunt-formatted tracks from a playlist
   */
  async getHookHuntPlaylistTracks(playlistId: string): Promise<Track[]> {
    const spotifyTracks = await this.getAllPlaylistTracks(playlistId);
    return spotifyTracks.map(track => this.convertTrack(track));
  }
  
  /**
   * Clears the API cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const spotifyAPI = new SpotifyAPIClient();