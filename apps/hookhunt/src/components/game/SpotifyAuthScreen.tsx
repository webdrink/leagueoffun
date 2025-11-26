/**
 * SpotifyAuthScreen
 *
 * Handles connecting a Spotify account using the PKCE OAuth flow.
 * If already authenticated, fetches the current user and advances.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../core/Card';
import { LogIn, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { spotifyAuth } from '../../lib/integrations/spotify/SpotifyAuth';
import { spotifyAPI } from '../../lib/integrations/spotify/SpotifyAPI';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';
import { useHookHuntAuth } from '../../store/hookHuntStore';

const SpotifyAuthScreen: React.FC = () => {
  const { dispatch } = useFrameworkRouter();
  const { isAuthenticated, user, setUser, setTokenExpiry } = useHookHuntAuth();
  const [status, setStatus] = useState<'idle'|'authenticating'|'error'|'ready'>("idle");
  const [error, setError] = useState<string | null>(null);

  const canAdvance = useMemo(() => isAuthenticated && !!user, [isAuthenticated, user]);

  // Handle callback redirect or existing session
  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const err = url.searchParams.get('error');
        if (err) {
          setError(err);
          setStatus('error');
          return;
        }
        if (code) {
          setStatus('authenticating');
          const tokenData = await spotifyAuth.handleCallback(code);
          setTokenExpiry(Date.now() + tokenData.expires_in * 1000);
          const me = await spotifyAPI.getCurrentUser();
          setUser(me);
          setStatus('ready');
          // Clean URL
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          window.history.replaceState({}, document.title, url.toString());
          return;
        }
        // Already authenticated? hydrate user
        if (spotifyAuth.isAuthenticated() && !user) {
          const token = await spotifyAuth.getAccessToken();
          if (token) {
            const me = await spotifyAPI.getCurrentUser();
            setUser(me);
            const expiry = spotifyAuth.getTokenExpiry();
            if (expiry) setTokenExpiry(expiry);
            setStatus('ready');
          }
        }
      } catch (e) {
        console.error(e);
        setError((e as Error).message);
        setStatus('error');
      }
    };
    run();
  }, [setUser, setTokenExpiry, user]);

  useEffect(() => {
    if (canAdvance && status === 'ready') {
      const t = setTimeout(() => dispatch(GameAction.ADVANCE), 500);
      return () => clearTimeout(t);
    }
  }, [canAdvance, status, dispatch]);

  const handleConnect = async () => {
    setError(null);
    setStatus('authenticating');
    await spotifyAuth.login(); // redirects to Spotify
  };

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="w-full max-w-xl mx-auto p-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-blue-600/10 border-cyan-200">
        <CardHeader>
          <CardTitle className="text-2xl">Connect Spotify</CardTitle>
          <CardDescription>Sign in to pick your playlists and play HookHunt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              <AlertCircle size={18}/> {error}
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-3 p-3 bg-white/70 rounded">
              <UserIcon />
              <div className="text-sm">
                <div className="font-medium">{user.display_name || user.id}</div>
                <div className="text-gray-600">Authenticated with Spotify</div>
              </div>
            </div>
          ) : (
            <Button onClick={handleConnect} className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
              <LogIn className="mr-2" size={18}/> Connect Spotify
            </Button>
          )}

          <div className="pt-2 text-right">
            <Button disabled={!canAdvance} onClick={() => dispatch(GameAction.ADVANCE)} className="bg-cyan-600 text-white">
              Continue <ArrowRight className="ml-2" size={16}/>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SpotifyAuthScreen;