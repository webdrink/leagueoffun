import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, LogIn, Music } from 'lucide-react';
import { getSpotifyAuthUrl, readTokenFromHash, storeAccessToken, getStoredAccessToken } from '../utils/spotifyAuth';
import { CURATED, getUserPlaylists, searchPlaylists } from '../utils/spotifyApi';

interface PlaylistSelectProps {
  onSelect: (playlistId: string) => void;
  onBack: () => void;
  animationsEnabled: boolean;
}

export default function PlaylistSelectScreen({ onSelect, onBack, animationsEnabled }: PlaylistSelectProps) {
  const { t } = useTranslation();
  const [token, setToken] = useState<string | null>(getStoredAccessToken());
  const [yourPlaylists, setYourPlaylists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If returned from Spotify with token in hash
    const t = readTokenFromHash();
    if (t) {
      storeAccessToken(t);
      setToken(t);
      // Clear hash
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const pls = await getUserPlaylists(token);
        setYourPlaylists(pls);
      } catch (e) {
        console.error('Failed to load playlists:', e);
      }
      setLoading(false);
    };
    loadPlaylists();
  }, [token]);

  const doSearch = async () => {
    if (!token || !searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await searchPlaylists(token, searchQuery.trim());
      setSearchResults(results);
    } catch (e) {
      console.error('Failed to search playlists:', e);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent min-h-0 overflow-auto">
      <div className="flex items-center justify-between px-2 mb-2">
        <button onClick={onBack} className="hh-btn-muted !w-auto !px-3 !py-2">
          <ArrowLeft size={18} /> {t('screens.playlistSelect.back')}
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('screens.playlistSelect.title')}</h2>
        <div />
      </div>

      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hh-surface-card p-4 md:p-6 w-full flex-1 flex flex-col overflow-auto"
      >
        {!token && (
          <div className="hh-content mb-4">
            <p className="hh-subtitle mb-3 text-center">{t('screens.playlistSelect.loginSpotify')}</p>
            <button
              onClick={() => {
                window.location.href = getSpotifyAuthUrl();
              }}
              className="hh-btn-primary"
            >
              <LogIn size={18} /> {t('screens.playlistSelect.loginSpotify')}
            </button>
          </div>
        )}

        {token && (
          <>
            {/* Your playlists - Primary focus */}
            <div className="hh-content mb-5 flex-1">
              <h3 className="hh-section-title">
                <Music size={18} className="text-orange-500" />
                {t('screens.playlistSelect.yourPlaylists')}
              </h3>
              {loading && <div className="text-sm text-slate-500 dark:text-slate-400">Loading…</div>}
              {!loading && yourPlaylists.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {yourPlaylists.map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => onSelect(pl.id)}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-700 px-3 py-3 text-left bg-white/60 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="font-semibold truncate text-sm text-slate-800 dark:text-slate-100">{pl.name}</div>
                      <div className="text-xs text-slate-500">{t('screens.playlistSelect.select')}</div>
                    </button>
                  ))}
                </div>
              )}
              {!loading && yourPlaylists.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No playlists found. Create one on Spotify!</p>
              )}
            </div>

            {/* Search - Secondary */}
            <div className="hh-content mb-5">
              <h3 className="hh-section-title">{t('screens.playlistSelect.search')}</h3>
              <div className="flex gap-2 mb-2">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && doSearch()}
                  placeholder={t('screens.playlistSelect.searchPlaceholder')}
                  className="hh-input text-sm"
                />
                <button
                  onClick={doSearch}
                  title={t('screens.playlistSelect.search')}
                  aria-label={t('screens.playlistSelect.search')}
                  className="hh-btn-secondary !w-auto !px-3"
                >
                  <Search size={16} />
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {searchResults.map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => onSelect(pl.id)}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-700 px-3 py-3 text-left bg-white/60 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="font-semibold truncate text-sm text-slate-800 dark:text-slate-100">{pl.name}</div>
                      <div className="text-xs text-slate-500">{t('screens.playlistSelect.select')}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Curated - Fallback */}
            <div className="hh-content">
              <h3 className="hh-section-title">{t('screens.playlistSelect.curated')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {CURATED.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => onSelect(pl.id)}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-700 px-3 py-3 text-left bg-white/60 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="font-semibold truncate text-sm text-slate-800 dark:text-slate-100">{pl.name}</div>
                    <div className="text-xs text-slate-500">{t('screens.playlistSelect.select')}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
