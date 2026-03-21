import { clearSpotifyAuth, getValidAccessToken } from './spotifyAuth';

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracks?: { total: number };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album?: { images?: { url: string }[]; release_date?: string };
  preview_url?: string;
  release_date?: string;
}

const API = 'https://api.spotify.com/v1';

async function spotifyFetch(path: string): Promise<Response> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('Spotify session expired. Please connect again.');
  }

  const response = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    clearSpotifyAuth();
    throw new Error('Spotify session expired. Please connect again.');
  }

  return response;
}

export async function getUserPlaylists(): Promise<SpotifyPlaylist[]> {
  const res = await spotifyFetch('/me/playlists?limit=50');
  if (!res.ok) throw new Error('Failed to load playlists');
  const data = await res.json();
  return data.items || [];
}

export async function searchPlaylists(query: string): Promise<SpotifyPlaylist[]> {
  const res = await spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=playlist&limit=20`);
  if (!res.ok) throw new Error('Failed to search playlists');
  const data = await res.json();
  return data.playlists?.items || [];
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  const limit = 100;
  let total = 0;

  do {
    const res = await spotifyFetch(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(id,name,artists(name),album(images,release_date),preview_url)),total`
    );
    if (!res.ok) throw new Error('Failed to load tracks');

    const data = await res.json();
    total = data.total || 0;
    const items = (data.items || []) as Array<{ track?: SpotifyTrack | null }>;

    items.forEach((item) => {
      if (item.track?.id) {
        tracks.push({
          ...item.track,
          release_date: item.track.release_date || item.track.album?.release_date,
        });
      }
    });

    offset += limit;
  } while (offset < total);

  return tracks;
}

export const CURATED: SpotifyPlaylist[] = [
  { id: '37i9dQZF1DXcBWIGoYsB0V', name: 'Today’s Top Hits' },
  { id: '37i9dQZF1DXcF1qqC4yNow', name: 'All Out 00s' },
  { id: '37i9dQZF1DXbTSaG6FDp6w', name: 'All Out 80s' },
  { id: '37i9dQZF1DXbYM3nMM0oPk', name: 'All Out 90s' }
];
