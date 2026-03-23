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
  uri?: string;
  is_local?: boolean;
  duration_ms?: number;
  artists: { name: string }[];
  album?: { images?: { url: string }[]; release_date?: string };
  preview_url?: string;
  release_date?: string;
}

export interface SpotifyUserProfile {
  id: string;
  display_name?: string;
  email?: string;
  images?: { url: string }[];
}

interface SpotifyApiErrorResponse {
  error?: {
    message?: string;
  };
}

interface SpotifyAudioAnalysisSection {
  start: number;
  duration: number;
  confidence?: number;
  loudness?: number;
  tempo?: number;
}

interface SpotifyAudioAnalysisSegment {
  start: number;
  duration: number;
  loudness_max?: number;
}

interface SpotifyAudioAnalysis {
  sections?: SpotifyAudioAnalysisSection[];
  segments?: SpotifyAudioAnalysisSegment[];
}

const API = 'https://api.spotify.com/v1';
const hookEstimateCache = new Map<string, number | null>();
let audioAnalysisAvailability: boolean | null = null;
const ENABLE_AUDIO_ANALYSIS = (import.meta.env.VITE_ENABLE_SPOTIFY_AUDIO_ANALYSIS as string | undefined) === 'true';

async function spotifyFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('Spotify session expired. Please connect again.');
  }

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearSpotifyAuth();
    throw new Error('Spotify session expired. Please connect again.');
  }

  return response;
}

async function extractSpotifyError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as SpotifyApiErrorResponse;
    return data.error?.message || fallback;
  } catch {
    return fallback;
  }
}

export async function getUserPlaylists(): Promise<SpotifyPlaylist[]> {
  const res = await spotifyFetch('/me/playlists?limit=50');
  if (!res.ok) throw new Error('Failed to load playlists');
  const data = await res.json();
  return data.items || [];
}

export async function getCurrentUserProfile(): Promise<SpotifyUserProfile> {
  const res = await spotifyFetch('/me');
  if (!res.ok) throw new Error('Failed to load Spotify profile');
  return res.json();
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
      `/playlists/${playlistId}/items?limit=${limit}&offset=${offset}&fields=items(item(id,name,uri,is_local,duration_ms,artists(name),album(images,release_date),preview_url),track(id,name,uri,is_local,duration_ms,artists(name),album(images,release_date),preview_url)),total`
    );
    if (!res.ok) throw new Error('Failed to load tracks');

    const data = await res.json();
    total = data.total || 0;
    const items = (data.items || []) as Array<{ item?: SpotifyTrack | null; track?: SpotifyTrack | null }>;

    items.forEach((item) => {
      const parsedTrack = item.item || item.track;
      if (parsedTrack?.id) {
        tracks.push({
          ...parsedTrack,
          release_date: parsedTrack.release_date || parsedTrack.album?.release_date,
        });
      }
    });

    offset += limit;
  } while (offset < total);

  return tracks;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function transferPlaybackToDevice(deviceId: string): Promise<void> {
  const res = await spotifyFetch('/me/player', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false,
    }),
  });

  if (!res.ok) {
    const message = await extractSpotifyError(res, 'Could not transfer Spotify playback to browser.');
    throw new Error(message);
  }
}

export async function startPlaybackOnDevice(
  deviceId: string,
  trackUri: string,
  positionMs = 0
): Promise<void> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const res = await spotifyFetch(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri],
        position_ms: Math.max(0, Math.floor(positionMs)),
      }),
    });

    if (res.ok) {
      return;
    }

    const retryable = res.status === 404 || res.status === 429;
    if (retryable && attempt < maxAttempts) {
      await sleep(300 * attempt);
      continue;
    }

    const message = await extractSpotifyError(res, 'Could not start Spotify playback.');
    throw new Error(message);
  }
}

async function getTrackAudioAnalysis(trackId: string): Promise<SpotifyAudioAnalysis | null> {
  if (!ENABLE_AUDIO_ANALYSIS) {
    return null;
  }

  if (audioAnalysisAvailability === false) {
    return null;
  }

  const response = await spotifyFetch(`/audio-analysis/${trackId}`);
  if (!response.ok) {
    if (response.status === 403 || response.status === 404) {
      audioAnalysisAvailability = false;
    }
    return null;
  }

  audioAnalysisAvailability = true;
  const data = (await response.json()) as SpotifyAudioAnalysis;
  return data;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scoreSection(section: SpotifyAudioAnalysisSection): number {
  const loudnessScore = clamp(((section.loudness ?? -18) + 30) / 30, 0, 1);
  const confidenceScore = clamp(section.confidence ?? 0.45, 0, 1);
  const tempo = section.tempo ?? 110;
  const tempoScore = clamp((tempo - 70) / 90, 0, 1);
  const durationScore = clamp(section.duration / 22, 0, 1);

  // Hooks are often not in the very first intro bars.
  const introPenalty = section.start < 12 ? 0.2 : 0;
  // Prefer early/mid song hooks for game pace.
  const timingBias = 1 - clamp(section.start / 160, 0, 1);

  const score =
    loudnessScore * 0.32 +
    confidenceScore * 0.24 +
    tempoScore * 0.14 +
    durationScore * 0.14 +
    timingBias * 0.26 -
    introPenalty;

  return score;
}

function estimateHookStartFromAnalysis(analysis: SpotifyAudioAnalysis): number | null {
  const sections = analysis.sections || [];
  if (sections.length === 0) {
    return null;
  }

  const candidates = sections.filter((section) => section.duration >= 6 && section.start >= 6);
  if (candidates.length === 0) {
    return null;
  }

  const best = candidates.reduce((winner, section) => {
    const winnerScore = scoreSection(winner);
    const sectionScore = scoreSection(section);
    return sectionScore > winnerScore ? section : winner;
  });

  let estimatedSeconds = best.start;
  const segments = analysis.segments || [];
  if (segments.length > 0) {
    const sectionEnd = best.start + best.duration;
    const loudSegment = segments
      .filter((segment) => segment.start >= best.start && segment.start <= sectionEnd)
      .reduce<SpotifyAudioAnalysisSegment | null>((winner, segment) => {
        if (!winner) return segment;
        return (segment.loudness_max ?? -60) > (winner.loudness_max ?? -60) ? segment : winner;
      }, null);

    if (loudSegment) {
      estimatedSeconds = loudSegment.start;
    }
  }

  return Math.max(0, Math.round(estimatedSeconds * 1000));
}

export async function getEstimatedHookStartMs(trackId: string): Promise<number | null> {
  if (hookEstimateCache.has(trackId)) {
    return hookEstimateCache.get(trackId) ?? null;
  }

  try {
    const analysis = await getTrackAudioAnalysis(trackId);
    if (!analysis) {
      hookEstimateCache.set(trackId, null);
      return null;
    }

    const estimate = estimateHookStartFromAnalysis(analysis);
    hookEstimateCache.set(trackId, estimate);
    return estimate;
  } catch {
    hookEstimateCache.set(trackId, null);
    return null;
  }
}

export const CURATED: SpotifyPlaylist[] = [
  { id: '37i9dQZF1DXcBWIGoYsB0V', name: 'Today’s Top Hits' },
  { id: '37i9dQZF1DXcF1qqC4yNow', name: 'All Out 00s' },
  { id: '37i9dQZF1DXbTSaG6FDp6w', name: 'All Out 80s' },
  { id: '37i9dQZF1DXbYM3nMM0oPk', name: 'All Out 90s' }
];
