import { useEffect, useState } from 'react';

export type Season = 'fall' | 'winter' | 'spring' | 'summer' | 'cyber';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface ThemeDetails {
  season: Season;
  timeOfDay: TimeOfDay;
  gradient: string;
  animationClass?: string;
}

/**
 * Get the current season based on the month (Northern Hemisphere)
 */
const getCurrentSeason = (): Season => {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring'; // March, April, May
  if (month >= 5 && month <= 7) return 'summer'; // June, July, August
  if (month >= 8 && month <= 10) return 'fall'; // September, October, November
  return 'winter'; // December, January, February
};

/**
 * Returns theme details based on the season and time of day.
 */
const getThemeDetails = (hour: number, season: Season): ThemeDetails => {
  let timeOfDay: TimeOfDay;
  let gradient: string;
  let animationClass: string | undefined;

  // Determine time of day
  if (hour >= 6 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 18) {
    timeOfDay = 'afternoon';
  } else if (hour >= 18 && hour < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  // Generate gradients based on season and time of day
  switch (season) {
    case 'fall':
      if (timeOfDay === 'morning') {
        gradient = 'bg-gradient-to-br from-autumn-300 via-rust-400 to-brown-400';
        animationClass = 'animate-subtle-pulse';
      } else if (timeOfDay === 'afternoon') {
        gradient = 'bg-gradient-to-br from-autumn-400 via-rust-500 to-brown-500';
        animationClass = 'animate-slow-float';
      } else if (timeOfDay === 'evening') {
        gradient = 'bg-gradient-to-br from-rust-500 via-autumn-600 to-brown-700';
        animationClass = 'animate-gentle-shift';
      } else {
        gradient = 'bg-gradient-to-br from-brown-800 via-rust-900 to-brown-900';
        animationClass = 'animate-stars';
      }
      break;

    case 'winter':
      if (timeOfDay === 'morning') {
        gradient = 'bg-gradient-to-br from-ice-100 via-frost-200 to-ice-300';
        animationClass = 'animate-subtle-pulse';
      } else if (timeOfDay === 'afternoon') {
        gradient = 'bg-gradient-to-br from-frost-300 via-ice-400 to-frost-400';
        animationClass = 'animate-slow-float';
      } else if (timeOfDay === 'evening') {
        gradient = 'bg-gradient-to-br from-frost-500 via-ice-600 to-frost-600';
        animationClass = 'animate-gentle-shift';
      } else {
        gradient = 'bg-gradient-to-br from-ice-800 via-frost-900 to-ice-900';
        animationClass = 'animate-stars';
      }
      break;

    case 'spring':
      if (timeOfDay === 'morning') {
        gradient = 'bg-gradient-to-br from-bloom-200 via-meadow-300 to-bloom-300';
        animationClass = 'animate-subtle-pulse';
      } else if (timeOfDay === 'afternoon') {
        gradient = 'bg-gradient-to-br from-meadow-300 via-bloom-400 to-meadow-400';
        animationClass = 'animate-slow-float';
      } else if (timeOfDay === 'evening') {
        gradient = 'bg-gradient-to-br from-bloom-500 via-meadow-500 to-bloom-600';
        animationClass = 'animate-gentle-shift';
      } else {
        gradient = 'bg-gradient-to-br from-meadow-800 via-bloom-800 to-meadow-900';
        animationClass = 'animate-stars';
      }
      break;

    case 'summer':
      if (timeOfDay === 'morning') {
        gradient = 'bg-gradient-to-br from-sun-300 via-ocean-300 to-sun-400';
        animationClass = 'animate-subtle-pulse';
      } else if (timeOfDay === 'afternoon') {
        gradient = 'bg-gradient-to-br from-ocean-400 via-sun-500 to-ocean-500';
        animationClass = 'animate-slow-float';
      } else if (timeOfDay === 'evening') {
        gradient = 'bg-gradient-to-br from-sun-600 via-ocean-600 to-sun-700';
        animationClass = 'animate-gentle-shift';
      } else {
        gradient = 'bg-gradient-to-br from-ocean-800 via-sun-900 to-ocean-900';
        animationClass = 'animate-stars';
      }
      break;

    case 'cyber':
      if (timeOfDay === 'morning') {
        gradient = 'bg-gradient-to-br from-cyber-400 via-neon-400 to-matrix-500';
        animationClass = 'animate-subtle-pulse';
      } else if (timeOfDay === 'afternoon') {
        gradient = 'bg-gradient-to-br from-neon-500 via-cyber-600 to-matrix-600';
        animationClass = 'animate-slow-float';
      } else if (timeOfDay === 'evening') {
        gradient = 'bg-gradient-to-br from-cyber-600 via-matrix-700 to-neon-700';
        animationClass = 'animate-gentle-shift';
      } else {
        gradient = 'bg-gradient-to-br from-matrix-900 via-cyber-900 to-black';
        animationClass = 'animate-stars';
      }
      break;
  }

  return {
    season,
    timeOfDay,
    gradient,
    animationClass,
  };
};

function useTheme(): ThemeDetails {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    // Load saved season preference from localStorage
    const savedSeason = localStorage.getItem('lof.v1.theme.season') as Season | null;
    if (savedSeason && ['fall', 'winter', 'spring', 'summer', 'cyber'].includes(savedSeason)) {
      setSelectedSeason(savedSeason);
    }
  }, []);

  const hour = currentTime.getHours();
  const season = selectedSeason || getCurrentSeason();
  
  return getThemeDetails(hour, season);
}

export function useSeasonalTheme() {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  useEffect(() => {
    // Load saved season preference from localStorage
    const savedSeason = localStorage.getItem('lof.v1.theme.season') as Season | null;
    if (savedSeason && ['fall', 'winter', 'spring', 'summer', 'cyber'].includes(savedSeason)) {
      setSelectedSeason(savedSeason);
    }
  }, []);

  const changeSeason = (season: Season | 'auto') => {
    if (season === 'auto') {
      localStorage.removeItem('lof.v1.theme.season');
      setSelectedSeason(null);
    } else {
      localStorage.setItem('lof.v1.theme.season', season);
      setSelectedSeason(season);
    }
  };

  return {
    selectedSeason: selectedSeason || getCurrentSeason(),
    isAuto: selectedSeason === null,
    changeSeason,
  };
}

export default useTheme;
