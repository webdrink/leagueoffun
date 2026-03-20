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
        <button onClick={onBack} className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 flex items-center gap-1">
          <ArrowLeft size={18} /> {t('screens.playlistSelect.back')}
        </button>
        <h2 className="text-lg font-bold">{t('screens.playlistSelect.title')}</h2>
        <div />
      </div>

      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-2xl p-4 md:p-6 w-full backdrop-blur-sm flex-1 flex flex-col overflow-auto"
      >
        {!token && (
          <div className="mb-4">
            <button
              onClick={() => {
                window.location.href = getSpotifyAuthUrl();
              }}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-green-500 hover:bg-green-600 text-white w-full font-semibold transition-all"
            >
              <LogIn size={18} /> {t('screens.playlistSelect.loginSpotify')}
            </button>
          </div>
        )}

        {token && (
          <>
            {/* Your playlists - Primary focus */}
            <div className="mb-4 flex-1">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Music size={18} className="text-orange-500" />
                {t('screens.playlistSelect.yourPlaylists')}
              </h3>
              {loading && <div className="text-sm text-gray-500">Loading…</div>}
              {!loading && yourPlaylists.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {yourPlaylists.map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => onSelect(pl.id)}
                      className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-3 text-left hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium truncate text-sm">{pl.name}</div>
                      <div className="text-xs text-gray-500">{t('screens.playlistSelect.select')}</div>
                    </button>
                  ))}
                </div>
              )}
              {!loading && yourPlaylists.length === 0 && (
                <p className="text-sm text-gray-500 mb-4">No playlists found. Create one on Spotify!</p>
              )}
            </div>

            {/* Search - Secondary */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{t('screens.playlistSelect.search')}</h3>
              <div className="flex gap-2 mb-2">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && doSearch()}
                  placeholder={t('screens.playlistSelect.searchPlaceholder')}
                  className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                />
                <button
                  onClick={doSearch}
                  title={t('screens.playlistSelect.search')}
                  aria-label={t('screens.playlistSelect.search')}
                  className="rounded-xl px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1 transition-all"
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
                      className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-3 text-left hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium truncate text-sm">{pl.name}</div>
                      <div className="text-xs text-gray-500">{t('screens.playlistSelect.select')}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Curated - Fallback */}
            <div>
              <h3 className="font-semibold mb-2">{t('screens.playlistSelect.curated')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {CURATED.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => onSelect(pl.id)}
                    className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-3 text-left hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium truncate text-sm">{pl.name}</div>
                    <div className="text-xs text-gray-500">{t('screens.playlistSelect.select')}</div>
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
