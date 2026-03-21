import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, LogIn, Music, RefreshCw } from 'lucide-react';
import {
  beginSpotifyLogin,
  clearSpotifyAuth,
  getStoredAccessToken,
  getValidAccessToken,
  isSpotifyConfigured,
} from '../utils/spotifyAuth';
import { getUserPlaylists, SpotifyPlaylist } from '../utils/spotifyApi';

interface PlaylistSelectProps {
  onSelect: (playlistId: string) => void;
  onBack: () => void;
  animationsEnabled: boolean;
  disabled?: boolean;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseSpotify = useMemo(() => isSpotifyConfigured(), []);
  const canStart = Boolean(selectedPlaylistId) && !loading && !disabled;

  useEffect(() => {
    const hydrateAuth = async () => {
      const validToken = await getValidAccessToken();
      setToken(validToken);
    };
    hydrateAuth().catch((err) => {
      console.error('Failed to hydrate Spotify auth:', err);
      setToken(null);
    });
  }, []);

  const loadPlaylists = async () => {
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
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists().catch((err) => {
      console.error('Initial playlist loading failed:', err);
    });
  }, [token]);

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
