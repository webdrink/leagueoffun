/**
 * Animation Context
 * 
 * Provides a global toggle for animations across the application.
 * This supports accessibility preferences and user choice to disable animations.
 * 
 * Shared across all League of Fun applications.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AnimationContextValue {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

const ANIMATION_PREF_KEY = 'leagueoffun.animationsEnabled';

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    // Check stored preference first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ANIMATION_PREF_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
      // Respect prefers-reduced-motion by default
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  });

  // Persist preference
  useEffect(() => {
    localStorage.setItem(ANIMATION_PREF_KEY, String(animationsEnabled));
  }, [animationsEnabled]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      const stored = localStorage.getItem(ANIMATION_PREF_KEY);
      if (stored === null) {
        setAnimationsEnabled(!e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleAnimations = () => {
    setAnimationsEnabled((prev: boolean) => !prev);
  };

  return (
    <AnimationContext.Provider value={{ animationsEnabled, toggleAnimations, setAnimationsEnabled }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimations(): AnimationContextValue {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimations must be used within AnimationProvider');
  }
  return context;
}

/**
 * Helper hook to get animation variants based on animation state.
 * Use this to create conditional animations that respect user preferences.
 */
export function useAnimationVariants() {
  const { animationsEnabled } = useAnimations();
  
  const fadeInUp = animationsEnabled
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 }
      }
    : {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
        transition: { duration: 0 }
      };

  const scaleIn = animationsEnabled
    ? {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: { duration: 0.3 }
      }
    : {
        initial: { opacity: 1, scale: 1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 1, scale: 1 },
        transition: { duration: 0 }
      };

  const staggerContainer = animationsEnabled
    ? {
        initial: {},
        animate: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }
    : {
        initial: {},
        animate: {}
      };

  return { fadeInUp, scaleIn, staggerContainer, animationsEnabled };
}
