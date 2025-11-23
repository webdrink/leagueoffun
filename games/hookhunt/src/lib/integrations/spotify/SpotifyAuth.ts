/**
 * Spotify PKCE OAuth Authentication
 * 
 * Implements OAuth 2.0 with PKCE (Proof Key for Code Exchange) flow for
 * secure client-side authentication with Spotify Web API.
 * 
 * Features:
 * - PKCE code verifier/challenge generation
 * - Secure token storage and management
 * - Automatic token refresh
 * - Proper scope management for HookHunt requirements
 */

import type { SpotifyTokenResponse, SpotifyUser } from '../../../hookHuntTypes';

// Spotify OAuth configuration
const SPOTIFY_CONFIG = {
  authUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',
  scopes: [
    'user-read-private',
    'user-read-email', 
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
    'streaming', // For Web Playback SDK (Pro mode)
  ],
} as const;

// Storage keys for localStorage
const STORAGE_KEYS = {
  accessToken: 'hookhunt_spotify_access_token',
  refreshToken: 'hookhunt_spotify_refresh_token',
  tokenExpiry: 'hookhunt_spotify_token_expiry',
  codeVerifier: 'hookhunt_spotify_code_verifier',
  user: 'hookhunt_spotify_user',
} as const;

/**
 * Generates a cryptographically secure random string for PKCE
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Creates a SHA256 hash of the code verifier for the challenge
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Gets environment configuration with validation
 */
function getSpotifyConfig() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  
  if (!clientId) {
    throw new Error('VITE_SPOTIFY_CLIENT_ID environment variable is required');
  }
  
  if (!redirectUri) {
    throw new Error('VITE_SPOTIFY_REDIRECT_URI environment variable is required');
  }
  
  return { clientId, redirectUri };
}

/**
 * SpotifyAuth class handles all OAuth operations
 */
export class SpotifyAuth {
  private clientId: string;
  private redirectUri: string;
  
  constructor() {
    const config = getSpotifyConfig();
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
  }
  
  /**
   * Initiates the Spotify OAuth flow by redirecting to Spotify's auth page
   */
  async login(): Promise<void> {
    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store the code verifier for later use
      localStorage.setItem(STORAGE_KEYS.codeVerifier, codeVerifier);
      
      const params = new URLSearchParams({
        client_id: this.clientId,
        response_type: 'code',
        redirect_uri: this.redirectUri,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        scope: SPOTIFY_CONFIG.scopes.join(' '),
        show_dialog: 'false', // Don't force approval dialog if already authorized
      });
      
      const authUrl = `${SPOTIFY_CONFIG.authUrl}?${params.toString()}`;
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Error initiating Spotify login:', error);
      throw new Error('Failed to start authentication process');
    }
  }
  
  /**
   * Handles the OAuth callback and exchanges code for tokens
   */
  async handleCallback(code: string): Promise<SpotifyTokenResponse> {
    try {
      const codeVerifier = localStorage.getItem(STORAGE_KEYS.codeVerifier);
      
      if (!codeVerifier) {
        throw new Error('No code verifier found. Please restart the login process.');
      }
      
      const tokenData = await this.exchangeCodeForTokens(code, codeVerifier);
      
      // Store tokens
      this.storeTokens(tokenData);
      
      // Clean up the code verifier
      localStorage.removeItem(STORAGE_KEYS.codeVerifier);
      
      return tokenData;
      
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw new Error('Failed to complete authentication');
    }
  }
  
  /**
   * Exchanges authorization code for access and refresh tokens
   */
  private async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<SpotifyTokenResponse> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });
    
    const response = await fetch(SPOTIFY_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Refreshes the access token using the refresh token
   */
  async refreshToken(): Promise<SpotifyTokenResponse> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    
    const response = await fetch(SPOTIFY_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    
    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      this.logout(); // Clear invalid tokens
      throw new Error('Token refresh failed. Please log in again.');
    }
    
    const tokenData = await response.json();
    
    // Preserve the refresh token if not provided in response
    if (!tokenData.refresh_token) {
      tokenData.refresh_token = refreshToken;
    }
    
    this.storeTokens(tokenData);
    return tokenData;
  }
  
  /**
   * Stores tokens and expiry time in localStorage
   */
  private storeTokens(tokenData: SpotifyTokenResponse): void {
    const expiryTime = Date.now() + (tokenData.expires_in * 1000);
    
    localStorage.setItem(STORAGE_KEYS.accessToken, tokenData.access_token);
    localStorage.setItem(STORAGE_KEYS.tokenExpiry, expiryTime.toString());
    
    if (tokenData.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, tokenData.refresh_token);
    }
  }
  
  /**
   * Gets the current access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string | null> {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    const expiryStr = localStorage.getItem(STORAGE_KEYS.tokenExpiry);
    
    if (!token || !expiryStr) {
      return null;
    }
    
    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();
    
    // If token expires in less than 5 minutes, refresh it
    if (now >= expiry - (5 * 60 * 1000)) {
      try {
        const refreshed = await this.refreshToken();
        return refreshed.access_token;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    }
    
    return token;
  }
  
  /**
   * Checks if the user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    const expiryStr = localStorage.getItem(STORAGE_KEYS.tokenExpiry);
    
    if (!token || !expiryStr) {
      return false;
    }
    
    const expiry = parseInt(expiryStr, 10);
    return Date.now() < expiry;
  }
  
  /**
   * Gets stored user data
   */
  getStoredUser(): SpotifyUser | null {
    const userData = localStorage.getItem(STORAGE_KEYS.user);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem(STORAGE_KEYS.user);
      }
    }
    return null;
  }
  
  /**
   * Stores user data
   */
  storeUser(user: SpotifyUser): void {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }
  
  /**
   * Logs out the user by clearing all stored data
   */
  logout(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
  
  /**
   * Gets the token expiry time
   */
  getTokenExpiry(): number | null {
    const expiryStr = localStorage.getItem(STORAGE_KEYS.tokenExpiry);
    return expiryStr ? parseInt(expiryStr, 10) : null;
  }
}

// Export a singleton instance
export const spotifyAuth = new SpotifyAuth();

/**
 * Utility function to check if we're in a callback URL
 */
export function isSpotifyCallback(): boolean {
  const url = new URL(window.location.href);
  return url.pathname.includes('/games/hookhunt/callback') && url.searchParams.has('code');
}

/**
 * Utility function to extract authorization code from callback URL
 */
export function getCallbackCode(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get('code');
}

/**
 * Utility function to extract error from callback URL
 */
export function getCallbackError(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get('error');
}