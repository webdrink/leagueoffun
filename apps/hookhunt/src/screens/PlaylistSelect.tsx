import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, LogIn, LogOut, Music, RefreshCw } from 'lucide-react';
import {
  beginSpotifyLogin,
  clearSpotifyAuth,
  getStoredAccessToken,
  getValidAccessToken,
  isSpotifyConfigured,
} from '../utils/spotifyAuth';
import { getCurrentUserProfile, getUserPlaylists, SpotifyPlaylist, SpotifyUserProfile } from '../utils/spotifyApi';

interface PlaylistSelectProps {
  onSelect: (playlistId: string) => void;
  onBack: () => void;
  animationsEnabled: boolean;
  disabled?: boolean;
}

const PROFILE_CACHE_KEY = 'hookhunt.spotify.profile';

function readCachedProfile(): SpotifyUserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpotifyUserProfile;
  } catch {
    return null;
  }
}

function writeCachedProfile(profile: SpotifyUserProfile | null) {
  if (!profile) {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    return;
  }
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

export default function PlaylistSelectScreen({
  onSelect,
  onBack,
  animationsEnabled,
  disabled = false,
}: PlaylistSelectProps) {
  const { t } = useTranslation();
  const [token, setToken] = useState<string | null>(getStoredAccessToken());
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [profile, setProfile] = useState<SpotifyUserProfile | null>(() => readCachedProfile());
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseSpotify = useMemo(() => isSpotifyConfigured(), []);
  const canStart = Boolean(selectedPlaylistId) && !loading && !disabled;
  const displayName = profile?.display_name || profile?.email || profile?.id || 'Spotify';

  const hydrateAuth = useCallback(async () => {
    const storedToken = getStoredAccessToken();
    if (storedToken) {
      setToken((previous) => (previous === storedToken ? previous : storedToken));
      return;
    }

    const validToken = await getValidAccessToken();
    setToken(validToken);
    if (!validToken) {
      writeCachedProfile(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    hydrateAuth().catch((err) => {
      console.error('Failed to hydrate Spotify auth:', err);
      setToken(null);
    });
  }, [hydrateAuth]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (!event.key || !event.key.startsWith('hookhunt.spotify.')) return;
      hydrateAuth().catch(() => undefined);
    };

    const onFocus = () => {
      hydrateAuth().catch(() => undefined);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [hydrateAuth]);

  const loadPlaylists = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const userPlaylists = await getUserPlaylists();
      setPlaylists(userPlaylists);
      setSelectedPlaylistId((previous) => previous || userPlaylists[0]?.id || '');
    } catch (err) {
      console.error('Failed to load playlists:', err);
      const message = err instanceof Error ? err.message : t('screens.playlistSelect.loadFailed');
      setError(message);
      if (message.toLowerCase().includes('session')) {
        clearSpotifyAuth();
        writeCachedProfile(null);
        setProfile(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [t, token]);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setLoadingProfile(true);
    try {
      const me = await getCurrentUserProfile();
      setProfile(me);
      writeCachedProfile(me);
    } catch (err) {
      console.error('Failed to load Spotify profile:', err);
      if (err instanceof Error && err.message.toLowerCase().includes('session')) {
        clearSpotifyAuth();
        writeCachedProfile(null);
        setProfile(null);
        setToken(null);
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [token]);

  const disconnectSpotify = useCallback(() => {
    clearSpotifyAuth();
    writeCachedProfile(null);
    setToken(null);
    setPlaylists([]);
    setSelectedPlaylistId('');
    setProfile(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadProfile().catch((err) => {
      console.error('Initial profile loading failed:', err);
    });
    loadPlaylists().catch((err) => {
      console.error('Initial playlist loading failed:', err);
    });
  }, [loadPlaylists, loadProfile, token]);

  return (
    <div className="flex-1 flex flex-col bg-transparent min-h-0 overflow-auto">
      <div className="flex items-center justify-between px-2 mb-2">
        <button onClick={onBack} className="hh-btn-muted !w-auto !px-3 !py-2">
          <ArrowLeft size={18} /> {t('screens.playlistSelect.back')}
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{t('screens.playlistSelect.title')}</h2>
        <div />
      </div>

      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hh-surface-card p-4 md:p-6 w-full flex-1 flex flex-col"
      >
        {!token && (
          <div className="hh-content flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center shadow-lg">
              <Music size={28} />
            </div>
            <p className="hh-subtitle max-w-md">{t('screens.playlistSelect.loginSpotify')}</p>
            {!canUseSpotify && (
              <p className="text-sm text-rose-700 dark:text-rose-300 font-semibold">
                {t('screens.playlistSelect.missingClientId')}
              </p>
            )}
            <button
              onClick={() => beginSpotifyLogin()}
              disabled={!canUseSpotify || disabled}
              className="hh-btn-primary max-w-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn size={18} /> {t('screens.playlistSelect.connectButton')}
            </button>
          </div>
        )}

        {token && (
          <div className="hh-content flex-1 flex flex-col gap-4">
            <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-500/35 bg-emerald-50/70 dark:bg-emerald-500/10 p-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {profile?.images?.[0]?.url ? (
                    <img
                      src={profile.images[0].url}
                      alt={displayName}
                      className="h-10 w-10 rounded-full object-cover border border-emerald-200/80 dark:border-emerald-400/40"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold">
                      {(displayName || 'S').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="hh-label !tracking-[0.08em] !text-emerald-700 dark:!text-emerald-200 mb-0.5">Spotify</p>
                    <p className="truncate text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      {loadingProfile
                        ? t('screens.playlistSelect.loadingSession')
                        : t('screens.playlistSelect.connectedAs', { name: displayName })}
                    </p>
                    <p className="text-xs text-emerald-800/90 dark:text-emerald-200/85">
                      {t('screens.playlistSelect.sessionPersisted')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hh-chip !text-emerald-800 dark:!text-emerald-200 !border-emerald-300/70 dark:!border-emerald-500/60">
                    {t('screens.playlistSelect.connectedBadge')}
                  </span>
                  <button
                    onClick={disconnectSpotify}
                    className="hh-btn-muted !px-3 !py-2 !rounded-xl"
                    disabled={disabled}
                  >
                    <LogOut size={14} /> {t('screens.playlistSelect.disconnect')}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="hh-section-title !mb-0">
                  <Music size={18} className="text-orange-500" />
                  {t('screens.playlistSelect.yourPlaylists')}
                </h3>
                <button
                  onClick={() => loadPlaylists()}
                  className="hh-btn-muted !px-3 !py-2 !rounded-xl"
                  title={t('screens.playlistSelect.reload')}
                  aria-label={t('screens.playlistSelect.reload')}
                  disabled={loading || disabled}
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              <p className="hh-subtitle mb-3">{t('screens.playlistSelect.dropdownHint')}</p>

              <select
                value={selectedPlaylistId}
                onChange={(event) => setSelectedPlaylistId(event.target.value)}
                className="hh-input"
                disabled={loading || playlists.length === 0 || disabled}
              >
                {playlists.length === 0 && (
                  <option value="">
                    {loading ? t('screens.playlistSelect.loading') : t('screens.playlistSelect.noPlaylists')}
                  </option>
                )}
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                    {typeof playlist.tracks?.total === 'number' ? ` (${playlist.tracks.total})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-300/80 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
                {error}
              </div>
            )}

            <div className="mt-auto">
              <button
                onClick={() => onSelect(selectedPlaylistId)}
                disabled={!canStart}
                className="hh-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t('screens.playlistSelect.startWithSelection')}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
