const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';
const TOKEN_REFRESH_BUFFER_MS = 45_000;

const STORAGE_KEYS = {
  accessToken: 'hookhunt.spotify.access_token',
  refreshToken: 'hookhunt.spotify.refresh_token',
  tokenType: 'hookhunt.spotify.token_type',
  scope: 'hookhunt.spotify.scope',
  expiresAt: 'hookhunt.spotify.expires_at',
};

const PKCE_KEYS = {
  verifier: 'hookhunt.spotify.pkce.verifier',
  state: 'hookhunt.spotify.pkce.state',
};

const SCOPES = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
];

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in: number;
  refresh_token?: string;
}

export interface SpotifyCallbackResult {
  handled: boolean;
  success: boolean;
  error?: string;
}

function getEnvClientId(): string | undefined {
  const value = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
  return value?.trim() || undefined;
}

function getNormalizedBasePath(): string {
  const baseUrl = (import.meta.env.BASE_URL as string | undefined) || '/';
  const prefixed = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
  return prefixed.endsWith('/') ? prefixed : `${prefixed}/`;
}

function getConfiguredRedirectUri(): string {
  const explicit = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined;
  if (explicit?.trim()) return explicit.trim();

  const normalizedBase = getNormalizedBasePath();
  const runtimeOrigin = new URL(window.location.origin);

  // Spotify OAuth no longer accepts localhost aliases; prefer loopback literal.
  if (runtimeOrigin.hostname === 'localhost') {
    runtimeOrigin.hostname = '127.0.0.1';
  }

  const appBase = new URL(normalizedBase, runtimeOrigin.toString());
  return new URL('callback/', appBase).toString();
}

function randomString(length: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

function base64UrlEncode(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function createCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

function storeTokens(tokens: SpotifyTokenResponse) {
  localStorage.setItem(STORAGE_KEYS.accessToken, tokens.access_token);
  localStorage.setItem(STORAGE_KEYS.tokenType, tokens.token_type || 'Bearer');
  if (tokens.scope) localStorage.setItem(STORAGE_KEYS.scope, tokens.scope);
  if (tokens.refresh_token) localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refresh_token);
  localStorage.setItem(STORAGE_KEYS.expiresAt, String(Date.now() + tokens.expires_in * 1000));
}

async function tokenRequest(params: URLSearchParams): Promise<SpotifyTokenResponse> {
  const response = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    let errorMessage = 'Spotify token request failed';
    try {
      const data = await response.json();
      errorMessage = data.error_description || data.error || errorMessage;
    } catch {
      // Keep fallback message.
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export function isSpotifyConfigured(): boolean {
  return Boolean(getEnvClientId());
}

export function clearSpotifyAuth() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  sessionStorage.removeItem(PKCE_KEYS.verifier);
  sessionStorage.removeItem(PKCE_KEYS.state);
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export async function getValidAccessToken(): Promise<string | null> {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  const expiresAt = Number(localStorage.getItem(STORAGE_KEYS.expiresAt) || '0');
  const now = Date.now();

  if (token && expiresAt > now + TOKEN_REFRESH_BUFFER_MS) {
    return token;
  }

  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  const clientId = getEnvClientId();
  if (!refreshToken || !clientId) {
    if (token && expiresAt <= now) clearSpotifyAuth();
    return null;
  }

  try {
    const refreshed = await tokenRequest(new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }));

    if (!refreshed.refresh_token) {
      refreshed.refresh_token = refreshToken;
    }

    storeTokens(refreshed);
    return refreshed.access_token;
  } catch (error) {
    console.error('Failed to refresh Spotify token:', error);
    clearSpotifyAuth();
    return null;
  }
}

export async function beginSpotifyLogin(forceDialog = false): Promise<void> {
  const clientId = getEnvClientId();
  if (!clientId) {
    throw new Error('Missing Spotify Client ID. Please set VITE_SPOTIFY_CLIENT_ID.');
  }

  const verifier = randomString(96);
  const state = randomString(24);
  const challenge = await createCodeChallenge(verifier);

  sessionStorage.setItem(PKCE_KEYS.verifier, verifier);
  sessionStorage.setItem(PKCE_KEYS.state, state);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: getConfiguredRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
    scope: SCOPES.join(' '),
  });

  if (forceDialog) {
    params.set('show_dialog', 'true');
  }

  window.location.assign(`${SPOTIFY_ACCOUNTS}/authorize?${params.toString()}`);
}

export async function handleSpotifyCallback(): Promise<SpotifyCallbackResult> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');
  const state = params.get('state');

  if (!code && !error) {
    return { handled: false, success: false };
  }

  // Clean callback params and normalize back to app root path.
  const appRootPath = getNormalizedBasePath();
  window.history.replaceState(null, document.title, appRootPath);

  if (error) {
    return { handled: true, success: false, error };
  }

  if (!code) {
    return { handled: true, success: false, error: 'missing_code' };
  }
  const authCode = code;

  const expectedState = sessionStorage.getItem(PKCE_KEYS.state);
  const verifier = sessionStorage.getItem(PKCE_KEYS.verifier);
  sessionStorage.removeItem(PKCE_KEYS.state);
  sessionStorage.removeItem(PKCE_KEYS.verifier);

  if (!state || !expectedState || state !== expectedState) {
    return { handled: true, success: false, error: 'state_mismatch' };
  }

  if (!verifier) {
    return { handled: true, success: false, error: 'missing_code_verifier' };
  }

  const clientId = getEnvClientId();
  if (!clientId) {
    return { handled: true, success: false, error: 'missing_client_id' };
  }

  try {
    const tokenResponse = await tokenRequest(new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: getConfiguredRedirectUri(),
      client_id: clientId,
      code_verifier: verifier,
    }));

    storeTokens(tokenResponse);
    return { handled: true, success: true };
  } catch (exchangeError) {
    console.error('Spotify code exchange failed:', exchangeError);
    return { handled: true, success: false, error: 'token_exchange_failed' };
  }
}

// Backward-compatible exports for old call sites.
export function readTokenFromHash(): string | null {
  return null;
}

export function storeAccessToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.accessToken, token);
  localStorage.setItem(STORAGE_KEYS.tokenType, 'Bearer');
  localStorage.setItem(STORAGE_KEYS.expiresAt, String(Date.now() + 3600_000));
}
