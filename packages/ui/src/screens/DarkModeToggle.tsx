/**
 * DarkModeToggle
 * Accessible dark mode toggle component with proper ARIA support and visual feedback.
 * Integrates with useDarkMode hook and persists preference.
 */
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../components/Button';
import { FOOTER_ICON_STYLE } from '../components/FooterButton';
import useDarkMode from '../../../hooks/useDarkMode';

interface DarkModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'outlined' | 'filled' | 'footer';
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'outlined'
}) => {
  const { isDark, toggle, preference } = useDarkMode();
  
  // Icon size based on component size
  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20
  }[size];
  
  // Button styling based on variant
  const variantClasses = {
    minimal: "text-white/90 dark:text-gray-200/90 hover:text-white dark:hover:text-gray-100 hover:bg-white/10 dark:hover:bg-gray-600/20 bg-transparent border-none p-2",
    outlined: "text-white border-2 border-white/90 hover:bg-white/40 hover:border-white hover:text-autumn-800 bg-black/50 font-medium hover:shadow-2xl transform hover:scale-105 backdrop-blur-md shadow-xl",
    filled: "bg-white/20 dark:bg-gray-700/60 text-white dark:text-gray-100 hover:bg-white/30 dark:hover:bg-gray-600/70 border-white/30 dark:border-gray-400/30 backdrop-blur-sm shadow-lg",
    footer: FOOTER_ICON_STYLE + ' cursor-pointer'
  }[variant];
  
  // Size-specific padding
  const sizeClasses = {
    sm: "p-2 min-w-[36px] min-h-[36px]",
    md: "p-2.5 min-w-[44px] min-h-[44px]", 
    lg: "p-3 min-w-[48px] min-h-[48px]"
  }[size];

  // For footer variant, render plain button to avoid blue styles from core Button
  if (variant === 'footer') {
    return (
      <button
        type="button"
        onClick={toggle}
        className={`${variantClasses} ${sizeClasses} ${className}`.trim()}
        data-testid="dark-mode-toggle"
        aria-pressed={Boolean(isDark)}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={`Current: ${preference === 'system' ? 'System' : (isDark ? 'Dark' : 'Light')} mode. Click to toggle.`}
      >
        {isDark ? (
          <Sun size={iconSize} className="transition-transform duration-200 hover:rotate-12" />
        ) : (
          <Moon size={iconSize} className="transition-transform duration-200 hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={variant === 'filled' ? 'default' : 'outline'}
      onClick={toggle}
      className={`${className || variantClasses} ${!className ? sizeClasses : ''} ${!className ? 'transition-all duration-200 rounded-xl' : ''}`}
      data-testid="dark-mode-toggle"
      aria-pressed={Boolean(isDark)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={`Current: ${preference === 'system' ? 'System' : (isDark ? 'Dark' : 'Light')} mode. Click to toggle.`}
    >
      {isDark ? (
        <Sun size={iconSize} className="transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Moon size={iconSize} className="transition-transform duration-200 hover:-rotate-12" />
      )}
    </Button>
  );
};

export default DarkModeToggle;