import useLocalStorage from './useLocalStorage';
import { useCallback } from 'react';
import { playSoundWithErrorHandling } from './utils/soundUtils';

interface UseSoundOutput {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (soundSrc: string) => void;
  volume: number;
  setVolume: (value: number) => void;
}

/**
 * Hook for sound management throughout the application
 * @returns Object with sound controls and state
 */
/**
 * Custom React hook for managing sound settings and playback.
 *
 * This hook provides state and handlers for enabling/disabling sound,
 * adjusting the volume, and playing sound effects with error handling.
 * It persists sound settings using local storage.
 *
 * @returns {UseSoundOutput} An object containing:
 * - `soundEnabled`: Whether sound is currently enabled.
 * - `toggleSound`: Function to toggle sound on or off.
 * - `playSound`: Function to play a sound by providing its source URL.
 * - `volume`: The current sound volume (0.0 to 1.0).
 * - `setVolume`: Function to set the sound volume.
 */
const useSound = (): UseSoundOutput => {
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('blamegame-sound-enabled', true);
  const [volume, setVolume] = useLocalStorage<number>('blamegame-sound-volume', 0.7);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, [setSoundEnabled]);

  const playSound = useCallback((soundSrc: string) => {
    if (soundEnabled) {
      playSoundWithErrorHandling(soundSrc, volume);
    }
  }, [soundEnabled, volume]);

  return { soundEnabled, toggleSound, playSound, volume, setVolume };
};

export default useSound;
