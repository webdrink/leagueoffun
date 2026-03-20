import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AnimationProvider } from '@game-core';
import './index.css';

// Cleanup legacy PWA caches/service workers from earlier HookHunt versions.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().catch(() => undefined);
    });
  }).catch(() => undefined);
}

if ('caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      caches.delete(key).catch(() => undefined);
    });
  }).catch(() => undefined);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AnimationProvider>
      <App />
    </AnimationProvider>
  </React.StrictMode>
);
