const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';
const TOKEN_REFRESH_BUFFER_MS = 45_000;
const FALLBACK_SPOTIFY_CLIENT_ID = '556a3baca0464c9b95cbaada1ac4bd0e';
const MAX_REFRESH_ATTEMPTS = 3;

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

const RETRYABLE_REFRESH_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRYABLE_REFRESH_CODES = new Set(['server_error', 'temporarily_unavailable']);
const AUTH_DEBUG_PREFIX = '[HookHuntAuth]';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in: number;
  refresh_token?: string;
}

interface SpotifyTokenErrorResponse {
  error?: string;
  error_description?: string;
}

export interface SpotifyCallbackResult {
  handled: boolean;
  success: boolean;
  error?: string;
}

export type SpotifyAuthState = 'connected' | 'refreshing' | 'reauth_required' | 'degraded';

let spotifyAuthState: SpotifyAuthState = 'degraded';
let lastAuthError: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

class TokenRequestError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'TokenRequestError';
    this.status = status;
    this.code = code;
  }
}

function logAuthEvent(event: string, payload: Record<string, unknown> = {}) {
  console.info(AUTH_DEBUG_PREFIX, {
    event,
    at: new Date().toISOString(),
    ...payload,
  });
}

function setSpotifyAuthState(nextState: SpotifyAuthState, errorMessage?: string | null) {
  spotifyAuthState = nextState;
  if (typeof errorMessage !== 'undefined') {
    lastAuthError = errorMessage;
  }
}

export function getSpotifyAuthState(): SpotifyAuthState {
  return spotifyAuthState;
}

export function getSpotifyAuthDebugInfo(): { state: SpotifyAuthState; error: string | null } {
  return {
    state: spotifyAuthState,
    error: lastAuthError,
  };
}

function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in constrained browser contexts.
  }
}

function safeLocalStorageRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures in constrained browser contexts.
  }
}

function safeSessionStorageGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionStorageSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage failures.
  }
}

function safeSessionStorageRemove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

function getEnvClientId(): string | undefined {
  const value = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
  return value?.trim() || FALLBACK_SPOTIFY_CLIENT_ID;
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
  safeLocalStorageSet(STORAGE_KEYS.accessToken, tokens.access_token);
  safeLocalStorageSet(STORAGE_KEYS.tokenType, tokens.token_type || 'Bearer');
  if (tokens.scope) safeLocalStorageSet(STORAGE_KEYS.scope, tokens.scope);
  if (tokens.refresh_token) safeLocalStorageSet(STORAGE_KEYS.refreshToken, tokens.refresh_token);
  safeLocalStorageSet(STORAGE_KEYS.expiresAt, String(Date.now() + tokens.expires_in * 1000));
  setSpotifyAuthState('connected', null);
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
    let code = 'unknown_error';
    let description = 'Spotify token request failed';

    try {
      const data = (await response.json()) as SpotifyTokenErrorResponse;
      if (typeof data.error === 'string' && data.error.trim().length > 0) {
        code = data.error.trim();
      }
      if (typeof data.error_description === 'string' && data.error_description.trim().length > 0) {
        description = data.error_description.trim();
      } else if (typeof data.error === 'string' && data.error.trim().length > 0) {
        description = data.error.trim();
      }
    } catch {
      // Keep fallback message if response body is not parseable.
    }

    throw new TokenRequestError(description, response.status, code);
  }

  return response.json();
}

function isRetryableRefreshError(error: unknown): boolean {
  if (!(error instanceof TokenRequestError)) {
    return false;
  }

  if (RETRYABLE_REFRESH_STATUSES.has(error.status)) {
    return true;
  }

  if (RETRYABLE_REFRESH_CODES.has(error.code)) {
    return true;
  }

  // Known intermittent Spotify accounts backend failure text.
  return error.message.toLowerCase().includes('failed to remove token');
}

function isReauthRefreshError(error: unknown): boolean {
  if (!(error instanceof TokenRequestError)) {
    return false;
  }

  if (error.status !== 400) {
    return false;
  }

  const code = error.code.toLowerCase();
  const message = error.message.toLowerCase();
  return code === 'invalid_grant' || message.includes('invalid_grant') || message.includes('invalid refresh token');
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRetryDelayMs(attempt: number): number {
  const baseDelay = Math.min(3000, 350 * (2 ** (attempt - 1)));
  const jitter = Math.floor(Math.random() * 200);
  return baseDelay + jitter;
}

async function refreshAccessToken(refreshToken: string, clientId: string): Promise<string | null> {
  setSpotifyAuthState('refreshing', null);
  logAuthEvent('refresh:start');

  for (let attempt = 1; attempt <= MAX_REFRESH_ATTEMPTS; attempt += 1) {
    try {
      logAuthEvent('refresh:attempt', { attempt });
      const refreshed = await tokenRequest(new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
      }));

      if (!refreshed.refresh_token) {
        refreshed.refresh_token = refreshToken;
      }

      storeTokens(refreshed);
      logAuthEvent('refresh:success', { attempt });
      return refreshed.access_token;
    } catch (error) {
      if (isReauthRefreshError(error)) {
        const reason = error instanceof Error ? error.message : 'invalid_grant';
        logAuthEvent('refresh:reauth_required', { attempt, reason });
        setSpotifyAuthState('reauth_required', reason);
        clearSpotifyAuth();
        return null;
      }

      if (isRetryableRefreshError(error) && attempt < MAX_REFRESH_ATTEMPTS) {
        logAuthEvent('refresh:retry', {
          attempt,
          reason: error instanceof Error ? error.message : 'retryable_error',
        });
        await sleep(getRetryDelayMs(attempt));
        continue;
      }

      const reason = error instanceof Error ? error.message : 'Spotify token refresh failed';
      console.error('Failed to refresh Spotify token:', error);
      logAuthEvent('refresh:degraded', { attempt, reason });
      setSpotifyAuthState('degraded', reason);
      return null;
    }
  }

  logAuthEvent('refresh:degraded', { reason: 'retry_budget_exhausted' });
  setSpotifyAuthState('degraded', 'Spotify token refresh exhausted retry budget');
  return null;
}

export function isSpotifyConfigured(): boolean {
  return Boolean(getEnvClientId());
}

export function clearSpotifyAuth() {
  Object.values(STORAGE_KEYS).forEach((key) => safeLocalStorageRemove(key));
  safeSessionStorageRemove(PKCE_KEYS.verifier);
  safeSessionStorageRemove(PKCE_KEYS.state);
  setSpotifyAuthState('reauth_required', null);
}

export function getStoredAccessToken(): string | null {
  return safeLocalStorageGet(STORAGE_KEYS.accessToken);
}

export async function getValidAccessToken(): Promise<string | null> {
  const token = safeLocalStorageGet(STORAGE_KEYS.accessToken);
  const expiresAt = Number(safeLocalStorageGet(STORAGE_KEYS.expiresAt) || '0');
  const now = Date.now();

  if (token && expiresAt > now + TOKEN_REFRESH_BUFFER_MS) {
    setSpotifyAuthState('connected', null);
    return token;
  }

  const refreshToken = safeLocalStorageGet(STORAGE_KEYS.refreshToken);
  const clientId = getEnvClientId();
  if (!refreshToken || !clientId) {
    if (token && expiresAt <= now) {
      clearSpotifyAuth();
    } else {
      setSpotifyAuthState('reauth_required', null);
    }
    return null;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = refreshAccessToken(refreshToken, clientId)
    .catch((error) => {
      console.error('Unexpected Spotify refresh failure:', error);
      setSpotifyAuthState('degraded', error instanceof Error ? error.message : 'unexpected_refresh_failure');
      return null;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export async function beginSpotifyLogin(forceDialog = false): Promise<void> {
  const clientId = getEnvClientId();
  if (!clientId) {
    throw new Error('Missing Spotify Client ID. Please set VITE_SPOTIFY_CLIENT_ID.');
  }

  const verifier = randomString(96);
  const state = randomString(24);
  const challenge = await createCodeChallenge(verifier);

  safeSessionStorageSet(PKCE_KEYS.verifier, verifier);
  safeSessionStorageSet(PKCE_KEYS.state, state);

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
    setSpotifyAuthState('reauth_required', error);
    return { handled: true, success: false, error };
  }

  if (!code) {
    setSpotifyAuthState('reauth_required', 'missing_code');
    return { handled: true, success: false, error: 'missing_code' };
  }

  const expectedState = safeSessionStorageGet(PKCE_KEYS.state);
  const verifier = safeSessionStorageGet(PKCE_KEYS.verifier);
  safeSessionStorageRemove(PKCE_KEYS.state);
  safeSessionStorageRemove(PKCE_KEYS.verifier);

  if (!state || !expectedState || state !== expectedState) {
    setSpotifyAuthState('reauth_required', 'state_mismatch');
    return { handled: true, success: false, error: 'state_mismatch' };
  }

  if (!verifier) {
    setSpotifyAuthState('reauth_required', 'missing_code_verifier');
    return { handled: true, success: false, error: 'missing_code_verifier' };
  }

  const clientId = getEnvClientId();
  if (!clientId) {
    setSpotifyAuthState('degraded', 'missing_client_id');
    return { handled: true, success: false, error: 'missing_client_id' };
  }

  try {
    const tokenResponse = await tokenRequest(new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getConfiguredRedirectUri(),
      client_id: clientId,
      code_verifier: verifier,
    }));

    storeTokens(tokenResponse);
    return { handled: true, success: true };
  } catch (exchangeError) {
    console.error('Spotify code exchange failed:', exchangeError);
    setSpotifyAuthState('degraded', exchangeError instanceof Error ? exchangeError.message : 'token_exchange_failed');
    return { handled: true, success: false, error: 'token_exchange_failed' };
  }
}

// Backward-compatible exports for old call sites.
export function readTokenFromHash(): string | null {
  return null;
}

export function storeAccessToken(token: string) {
  safeLocalStorageSet(STORAGE_KEYS.accessToken, token);
  safeLocalStorageSet(STORAGE_KEYS.tokenType, 'Bearer');
  safeLocalStorageSet(STORAGE_KEYS.expiresAt, String(Date.now() + 3600_000));
  setSpotifyAuthState('connected', null);
}
