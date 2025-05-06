import useLocalStorage from './useLocalStorage';
import { useCallback } from 'react';

interface UseSoundOutput {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (soundSrc: string) => void;
}

const useSound = (): UseSoundOutput => {
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('blamegame-sound-enabled', true);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, [setSoundEnabled]);

  const playSound = useCallback((soundSrc: string) => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const audio = new Audio(soundSrc);
        audio.play().catch(error => console.warn("Error playing sound:", error));
      } catch (error) {
        console.warn("Error creating or playing audio:", error);
      }
    }
  }, [soundEnabled]);

  return { soundEnabled, toggleSound, playSound };
};

export default useSound;
