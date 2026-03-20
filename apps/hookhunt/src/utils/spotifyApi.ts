export interface SpotifyPlaylist {
  id: string;
  name: string;
  images?: { url: string }[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album?: { images?: { url: string }[] };
  preview_url?: string;
  release_date?: string;
}

const API = 'https://api.spotify.com/v1';

export async function getUserPlaylists(token: string): Promise<SpotifyPlaylist[]> {
  const res = await fetch(`${API}/me/playlists?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load playlists');
  const data = await res.json();
  return data.items || [];
}

export async function searchPlaylists(token: string, query: string): Promise<SpotifyPlaylist[]> {
  const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}&type=playlist&limit=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to search playlists');
  const data = await res.json();
  return data.playlists?.items || [];
}

export async function getPlaylistTracks(token: string, playlistId: string): Promise<SpotifyTrack[]> {
  const res = await fetch(`${API}/playlists/${playlistId}/tracks?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load tracks');
  const data = await res.json();
  const items = data.items || [];
  return items.map((it: any) => it.track).filter(Boolean);
}

export const CURATED: SpotifyPlaylist[] = [
  { id: '37i9dQZF1DXcBWIGoYsB0V', name: 'Today’s Top Hits' },
  { id: '37i9dQZF1DXcF1qqC4yNow', name: 'All Out 00s' },
  { id: '37i9dQZF1DXbTSaG6FDp6w', name: 'All Out 80s' },
  { id: '37i9dQZF1DXbYM3nMM0oPk', name: 'All Out 90s' }
];
