import { useEffect, useState } from 'react';

export type DarkModePreference = 'light' | 'dark' | 'system';

interface DarkModeState {
  isDark: boolean;
  preference: DarkModePreference;
  setPreference: (preference: DarkModePreference) => void;
  toggle: () => void;
}

/**
 * Hook for managing dark mode state with system preference detection
 * and localStorage persistence.
 */
function useDarkMode(): DarkModeState {
  const [preference, setPreferenceState] = useState<DarkModePreference>(() => {
    if (typeof window === 'undefined') return 'system';
    
    const stored = localStorage.getItem('lof.v1.theme.preference') as DarkModePreference;
    return stored || 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate actual dark mode state
  const isDark = preference === 'system' ? systemPrefersDark : preference === 'dark';

  // Apply dark mode to document
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const setPreference = (newPreference: DarkModePreference) => {
    setPreferenceState(newPreference);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lof.v1.theme.preference', newPreference);
    }
  };

  const toggle = () => {
    setPreference(isDark ? 'light' : 'dark');
  };

  return {
    isDark,
    preference,
    setPreference,
    toggle
  };
}

export default useDarkMode;