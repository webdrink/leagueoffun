/**
 * Dynamic Background Gradient Builder
 * Generates CSS gradient strings from game config theme colors with animation support.
 */

interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  neutral?: string;
  highlight?: string;
}

interface GradientOptions {
  direction?: 'to-br' | 'to-r' | 'to-bl' | 'to-tr' | 'to-b' | 'to-t';
  stops?: number; // Number of color stops (2-5)
  animated?: boolean;
  isDark?: boolean;
}

/**
 * Converts Tailwind color class to CSS custom property or hex
 * Falls back to provided color if conversion fails
 */
function colorToCSS(colorClass: string, isDark = false): string {
  // Handle Tailwind color classes like 'purple-500' or 'pink-400'
  if (colorClass.includes('-')) {
    const [colorName, shade] = colorClass.split('-');
    
    // For dark mode, use lighter shades
    const adjustedShade = isDark && shade ? 
      Math.max(100, parseInt(shade) - 100).toString() : shade;
    
    // Return CSS custom property format that can be resolved by Tailwind
    return `rgb(var(--color-${colorName}-${adjustedShade}) / 1)`;
  }
  
  // If it's already a hex or rgb, return as-is
  return colorClass;
}

/**
 * Builds a CSS gradient string from theme configuration
 */
export function buildThemeGradient(
  colors: ThemeColors,
  options: GradientOptions = {}
): string {
  const {
    direction = 'to-br',
    stops = 3,
    animated = false,
    isDark = false
  } = options;

  // Extract colors with fallbacks
  const primary = colors.primary || 'purple-500';
  const secondary = colors.secondary || 'pink-500';
  const accent = colors.accent || 'indigo-600';
  const highlight = colors.highlight || 'yellow-400';

  // Convert to CSS-ready colors
  const primaryCSS = colorToCSS(primary, isDark);
  const secondaryCSS = colorToCSS(secondary, isDark);
  const accentCSS = colorToCSS(accent, isDark);
  const highlightCSS = colorToCSS(highlight, isDark);

  // Build gradient stops based on requested number
  let gradientStops: string;
  
  switch (stops) {
    case 2:
      gradientStops = `${primaryCSS}, ${secondaryCSS}`;
      break;
    case 4:
      gradientStops = `${primaryCSS}, ${secondaryCSS}, ${accentCSS}, ${highlightCSS}`;
      break;
    case 5:
      gradientStops = `${primaryCSS}, ${secondaryCSS} 25%, ${accentCSS} 50%, ${highlight} 75%, ${primaryCSS}`;
      break;
    default: // 3 stops
      gradientStops = `${primaryCSS}, ${secondaryCSS}, ${accentCSS}`;
  }

  // Add animation support
  const animationClass = animated ? ' animate-gentle-shift' : '';
  const backgroundSize = animated ? 'background-size: 400% 400%;' : '';

  return `linear-gradient(${direction}, ${gradientStops}); ${backgroundSize}${animationClass}`;
}

/**
 * Builds dark mode variant of gradient with adjusted luminance
 */
export function buildDarkGradient(colors: ThemeColors, options: GradientOptions = {}): string {
  // Dark mode uses deeper, more muted colors
  const darkColors = {
    primary: 'gray-900',
    secondary: 'gray-800', 
    accent: 'gray-700',
    neutral: colors.neutral || 'gray-600',
    highlight: colors.primary || 'purple-500' // Keep some accent color
  };

  return buildThemeGradient(darkColors, { ...options, isDark: true });
}

/**
 * Returns CSS custom properties for use in stylesheets
 */
export function getGradientCSSVars(colors: ThemeColors, isDark = false): Record<string, string> {
  const lightGradient = buildThemeGradient(colors, { animated: true });
  const darkGradient = buildDarkGradient(colors, { animated: true });
  
  return {
    '--app-bg-gradient': lightGradient,
    '--app-bg-gradient-dark': darkGradient,
    '--app-bg-current': isDark ? darkGradient : lightGradient
  };
}

/**
 * Hook-friendly function to get current gradient CSS
 */
export function useThemeGradient(colors: ThemeColors, isDark = false): string {
  return isDark ? buildDarkGradient(colors) : buildThemeGradient(colors, { animated: true });
}