import React, { useEffect } from 'react';
import { readTokenFromHash, storeAccessToken } from '../utils/spotifyAuth';

export default function Callback() {
  useEffect(() => {
    const token = readTokenFromHash();
    if (token) {
      storeAccessToken(token);
      // Redirect to root
      window.location.replace('/');
    }
  }, []);
  return <div />;
}
