const getEnvClientId = (): string | undefined => {
  // Vite uses import.meta.env prefixed with VITE_
  const viteId = (import.meta as any).env?.VITE_SPOTIFY_CLIENT_ID as string | undefined;
  const procId = (typeof process !== 'undefined' ? (process as any).env?.SPOTIFY_CLIENT_ID : undefined) as string | undefined;
  return viteId || procId;
};

const SCOPES = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative'
];

export function getSpotifyAuthUrl(): string {
  const clientId = getEnvClientId();
  if (!clientId) {
    throw new Error('Missing Spotify Client ID. Please set VITE_SPOTIFY_CLIENT_ID.');
  }
  const baseUrl = ((import.meta as any).env?.BASE_URL as string | undefined) || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const appBase = new URL(normalizedBase, window.location.origin);
  const redirectUri = new URL('callback/', appBase).toString();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
    redirect_uri: redirectUri,
    scope: SCOPES.join(' '),
    show_dialog: 'true',
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function readTokenFromHash(): string | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

export function storeAccessToken(token: string) {
  localStorage.setItem('hookhunt.spotify.token', token);
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem('hookhunt.spotify.token');
}
