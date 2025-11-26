/**
 * Audio utility functions with proper path handling for GitHub Pages deployment
 * 
 * These functions ensure that audio files are loaded with the correct base URL path
 * in both development and production environments.
 */

import { getAssetsPath } from './assetUtils';

// Audio file mapping with proper path handling
export const AUDIO_FILES = {
  BUTTON_CLICK: getAssetsPath('assets/sounds/button-click.mp3'),
  CARD_FLIP: getAssetsPath('assets/sounds/card-flip.mp3'),
  GAME_START: getAssetsPath('assets/sounds/game-start.mp3'),
  GAME_END: getAssetsPath('assets/sounds/game-end.mp3'),
  // Add other sound files as needed
};

/**
 * Preloads audio files for better performance
 */
export const preloadAudioFiles = () => {
  Object.values(AUDIO_FILES).forEach(src => {
    const audio = new Audio();
    audio.src = src;
    // Just load it, don't play
    audio.load();
  });
};

/**
 * Plays a sound if sound is enabled in game settings
 * 
 * @param {string} src - Audio file source (use AUDIO_FILES constants)
 * @param {boolean} soundEnabled - Whether sound is enabled in settings
 * @param {number} volume - Volume level (0-100)
 */
export const playSound = (src: string, soundEnabled: boolean, volume: number = 100) => {
  if (!soundEnabled) return;
  
  try {
    const audio = new Audio(src);
    audio.volume = volume / 100;
    audio.play().catch(err => {
      console.warn('Failed to play sound:', err);
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};