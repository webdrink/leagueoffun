import { useEffect, useState } from 'react';

export type Theme = 'morning' | 'afternoon' | 'evening' | 'night';

interface ThemeDetails {
  name: Theme;
  gradient: string;
  animationClass?: string; // For background animations
}

/**
 * Returns theme details based on the provided hour of the day.
 *
 * Determines the appropriate theme (morning, afternoon, evening, or night)
 * by evaluating the given hour and returns an object containing the theme's
 * name, gradient CSS classes, and an animation class.
 *
 * @param hour - The current hour in 24-hour format (0-23).
 * @returns An object containing the theme's name, gradient, and animation class.
 */
const getThemeDetails = (hour: number): ThemeDetails => {
  if (hour >= 6 && hour < 12) {
    return {
      name: 'morning',
      gradient: 'bg-gradient-to-br from-yellow-200 via-orange-300 to-red-300',
      animationClass: 'animate-subtle-pulse', // Example animation
    };
  }
  if (hour >= 12 && hour < 18) {
    return {
      name: 'afternoon',
      gradient: 'bg-gradient-to-br from-blue-300 via-sky-400 to-indigo-400',
      animationClass: 'animate-slow-float', // Example animation
    };
  }
  if (hour >= 18 && hour < 22) {
    return {
      name: 'evening',
      gradient: 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500',
      animationClass: 'animate-gentle-shift', // Example animation
    };
  }
  return {
    name: 'night',
    gradient: 'bg-gradient-to-br from-gray-700 via-slate-800 to-black',
    animationClass: 'animate-stars', // Example animation for stars
  };
};

function useTheme(): ThemeDetails {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timerId);
  }, []);

  const hour = currentTime.getHours();
  return getThemeDetails(hour);
}

export default useTheme;
