import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PlayerProvider } from './PlayerContext';
import { AnimationProvider } from '@game-core';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AnimationProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </AnimationProvider>
  </React.StrictMode>
);
