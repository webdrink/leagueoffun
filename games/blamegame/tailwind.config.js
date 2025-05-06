/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}", // Include root level TS/JS files like App.tsx, index.tsx
    "./components/**/*.{js,ts,jsx,tsx}", // Include all TS/JS files in components folder
    "./hooks/**/*.{js,ts,jsx,tsx}", // Added hooks directory
  ],
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
        'stars': { // Basic star twinkle example
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        }
      },
      animation: {
        'subtle-pulse': 'subtle-pulse 4s ease-in-out infinite',
        'slow-float': 'slow-float 5s ease-in-out infinite',
        'gentle-shift': 'gentle-shift 15s ease-in-out infinite alternate',
        // For stars, you'd typically apply this to individual star elements,
        // or use a more complex background technique.
        'stars': 'stars 2s ease-in-out infinite alternate',
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

