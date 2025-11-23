/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}", // Include root level TS/JS files like App.tsx, index.tsx
    "./components/**/*.{js,ts,jsx,tsx}", // Include all TS/JS files in components folder
    "./hooks/**/*.{js,ts,jsx,tsx}", // Added hooks directory
  ],
  darkMode: 'class', // Enable dark mode based on class toggle (was 'media')
  theme: {
    extend: {
      colors: {
        // Fall/Autumn Theme (current season)
        autumn: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        rust: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
        // Winter Theme
        frost: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        ice: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Spring Theme
        bloom: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        meadow: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Summer Theme
        sun: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        ocean: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Cyber/Matrix Theme (nerdy BlameGame original)
        cyber: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        neon: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        matrix: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      keyframes: {
        'subtle-pulse': {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1' },
        },
        'slow-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'gentle-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'stars-twinkle': { // Improved star twinkle animation
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        'stars-shimmer': {
          '0%, 100%': { opacity: '0.8' },
          '25%': { opacity: '0.2' },
          '75%': { opacity: '0.5' }
        },
        'stars-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
        }
      },
      animation: {
        'subtle-pulse': 'subtle-pulse 4s ease-in-out infinite',
        'slow-float': 'slow-float 5s ease-in-out infinite',
        'gentle-shift': 'gentle-shift 15s ease-in-out infinite alternate',
        // Optimized star animations with different durations
        'stars-twinkle-fast': 'stars-twinkle 2s ease-in-out infinite',
        'stars-twinkle-medium': 'stars-twinkle 3.5s ease-in-out infinite',
        'stars-twinkle-slow': 'stars-twinkle 5s ease-in-out infinite',
        'stars-shimmer': 'stars-shimmer 4s ease-in-out infinite',
        'stars-float': 'stars-float 6s ease-in-out infinite',
      },
      // Define background gradients as utilities if preferred, or use them directly as in useTheme.ts
      // Example: 
      // backgroundImage: {
      //   'morning-gradient': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      //   // ... and so on for other themes
      // },
    },
  },
  plugins: [],
}

