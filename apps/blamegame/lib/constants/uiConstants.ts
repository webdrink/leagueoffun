/**
 * UI-related constants
 */

// Animation durations in milliseconds
export const ANIMATION = {
  QUICK: 150,
  STANDARD: 300,
  SLOW: 500,
  VERY_SLOW: 800
};

// Common UI element sizes
export const UI_SIZES = {
  BUTTON_HEIGHT: '48px',
  INPUT_HEIGHT: '40px',
  CARD_WIDTH: '320px',
  CARD_HEIGHT: '420px',
  MODAL_WIDTH: '90%',
  MODAL_MAX_WIDTH: '500px'
};

// Z-index values for layering UI elements
export const Z_INDEX = {
  BACKGROUND: 0,
  CONTENT: 1,
  OVERLAY: 10,
  MODAL: 20,
  TOAST: 30
};

// Button sizing constants for consistent UI components
export const BUTTON_SIZES = {
  // Standard action buttons (question screen navigation, modal buttons)
  ACTION: "min-h-[44px] min-w-[44px] px-4 py-2.5 text-base font-medium",
  
  // Compact buttons (footer controls, inline actions)
  COMPACT: "min-h-[36px] min-w-[36px] px-3 py-2 text-sm font-medium",
  
  // Large primary buttons (main CTAs, game start)
  PRIMARY: "min-h-[48px] min-w-[120px] px-6 py-3 text-lg font-semibold",
  
  // Icon-only buttons (settings, dark mode toggle)
  ICON: "min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center",
  
  // Small icon buttons for tight spaces
  ICON_SMALL: "min-h-[36px] min-w-[36px] p-2 flex items-center justify-center"
} as const;

// Footer button styling (used in GameShell) - improved visibility matching language selector
export const FOOTER_BUTTON_CLASSES = `
  text-white dark:text-white
  border-2 border-autumn-500/80 dark:border-autumn-400/80
  hover:bg-autumn-500/20 hover:border-autumn-400 
  hover:text-white dark:hover:text-white
  bg-autumn-600/60 dark:bg-autumn-500/60
  transition-all duration-200 rounded-xl backdrop-blur-md shadow-xl
  font-medium hover:shadow-2xl transform hover:scale-105
  focus:outline-none focus:ring-2 focus:ring-autumn-400/50
  ${BUTTON_SIZES.ICON}
`.replace(/\s+/g, ' ').trim();

// Question screen navigation button styling
export const QUESTION_NAV_BUTTON_CLASSES = `
  font-semibold rounded-xl transition-all duration-200 
  shadow-lg hover:shadow-xl transform hover:scale-105
  ${BUTTON_SIZES.ACTION}
`.replace(/\s+/g, ' ').trim();