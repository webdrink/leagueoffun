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
