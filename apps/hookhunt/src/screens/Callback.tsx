import React, { useEffect, useState } from 'react';
import { handleSpotifyCallback } from '../utils/spotifyAuth';

export default function Callback() {
  const [message, setMessage] = useState('Completing Spotify login...');

  useEffect(() => {
    const complete = async () => {
      const result = await handleSpotifyCallback();
      if (result.success) {
        window.location.replace('/');
        return;
      }
      setMessage(result.error ? `Spotify login failed: ${result.error}` : 'Nothing to process.');
    };

    complete().catch((error) => {
      console.error('Callback processing failed:', error);
      setMessage('Spotify login failed.');
    });
  }, []);

  return <div className="p-6 text-center text-sm text-slate-700 dark:text-slate-200">{message}</div>;
}
