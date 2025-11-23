/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/framework-ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
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
        'stars-twinkle': {
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
        'stars-twinkle-fast': 'stars-twinkle 2s ease-in-out infinite',
        'stars-twinkle-medium': 'stars-twinkle 3.5s ease-in-out infinite',
        'stars-twinkle-slow': 'stars-twinkle 5s ease-in-out infinite',
        'stars-shimmer': 'stars-shimmer 4s ease-in-out infinite',
        'stars-float': 'stars-float 6s ease-in-out infinite',
      },
    }
  },
  plugins: []
}
