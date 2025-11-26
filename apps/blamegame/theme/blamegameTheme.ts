/**
 * BlameGame Theme
 * Warm orange/autumn color palette for the October 31 look
 */

export const blamegameTheme = {
  // Primary gradient for headers and main buttons
  primaryGradient: {
    from: '#f97316', // orange-600
    to: '#ea580c',   // orange-700
    css: 'from-orange-500 via-orange-600 to-orange-700'
  },
  
  // Button gradient
  primaryButtonGradient: {
    from: '#fb923c', // orange-400
    to: '#f97316',   // orange-600
    hover: {
      from: '#f97316', // orange-600
      to: '#ea580c',   // orange-700
    },
    css: 'from-orange-400 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  },
  
  // Accent color for selected states, active elements
  accent: {
    main: '#f97316',     // orange-600
    light: '#fb923c',    // orange-400
    lighter: '#fed7aa',  // orange-200
    css: 'orange-600'
  },
  
  // Surface colors (cards, backgrounds)
  surface: {
    primary: '#ffffff',
    secondary: '#fef3c7', // amber-100
    tertiary: '#fed7aa',  // orange-200
  },
  
  // Text colors
  text: {
    primary: '#1f2937',   // gray-800
    secondary: '#6b7280', // gray-500
    onAccent: '#ffffff',
    css: {
      primary: 'text-gray-800',
      secondary: 'text-gray-500',
      onAccent: 'text-white'
    }
  },
  
  // Toggle/pill styles
  toggle: {
    inactive: {
      bg: '#f3f4f6',    // gray-100
      text: '#6b7280',  // gray-500
      border: '#e5e7eb' // gray-200
    },
    active: {
      bg: '#fb923c',    // orange-400
      text: '#ffffff',
      border: '#f97316' // orange-600
    },
    css: {
      base: 'rounded-full transition-all duration-200',
      inactive: 'bg-gray-100 text-gray-500 border-gray-200',
      active: 'bg-orange-400 text-white border-orange-600'
    }
  }
};

export type BlameGameTheme = typeof blamegameTheme;
