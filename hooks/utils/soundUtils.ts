/**
 * Utility functions for sound management
 */

/**
 * Safely play a sound with error handling
 * @param soundSrc The path to the sound file
 * @param volume Volume level (0-1)
 * @returns Promise that resolves when sound playback starts
 */
export const playSoundWithErrorHandling = async (
  soundSrc: string, 
  volume: number = 0.7
): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio(soundSrc);
    audio.volume = volume;
    await audio.play();
  } catch (error) {
    console.warn("Error playing sound:", error);
  }
};

/**
 * Preload audio files for better performance
 * @param soundPaths Array of sound file paths to preload
 */
export const preloadSounds = (soundPaths: string[]): void => {
  if (typeof window === 'undefined') return;
  
  soundPaths.forEach(path => {
    try {
      const audio = new Audio();
      audio.src = path;
    } catch (error) {
      console.warn("Error preloading sound:", error);
    }
  });
};
