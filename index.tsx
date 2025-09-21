import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Import i18n instance before App to ensure it's initialized
import './lib/localization/i18n';
import GameHost from './framework/core/GameHost';
import { GameInfoLoader } from './components/core/GameInfoLoader';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Only register service worker in production
  // Prefix variable with underscore to acknowledge intentional unused unless future UI prompt is added
  const _updateSW = registerSW({
    onNeedRefresh() {
      // Logic to prompt user to refresh for new content
      console.log('New content available, please refresh.');
    },
    onOfflineReady() {
      // Logic to notify user app is ready for offline use
      console.log('App ready for offline use.');
    },
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GameInfoLoader>
      <GameHost />
    </GameInfoLoader>
  </React.StrictMode>
);
