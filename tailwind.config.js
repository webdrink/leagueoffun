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

