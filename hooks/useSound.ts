import useLocalStorage from './useLocalStorage';
import { useCallback } from 'react';

interface UseSoundOutput {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (soundSrc: string) => void;
  volume: number;
  setVolume: (value: number) => void;
}

const useSound = (): UseSoundOutput => {
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('blamegame-sound-enabled', true);
  const [volume, setVolume] = useLocalStorage<number>('blamegame-sound-volume', 0.7);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, [setSoundEnabled]);

  const playSound = useCallback((soundSrc: string) => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const audio = new Audio(soundSrc);
        audio.volume = volume; // Set the volume
        audio.play().catch(error => console.warn("Error playing sound:", error));
      } catch (error) {
        console.warn("Error creating or playing audio:", error);
      }
    }
  }, [soundEnabled, volume]);

  return { soundEnabled, toggleSound, playSound, volume, setVolume };
};

export default useSound;
