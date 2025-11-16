/**
 * FooterButton
 * Reusable footer button component with consistent styling matching the language selector pattern.
 * Provides autumn-toned backdrop, borders, hover effects, and accessibility features.
 */
import React from 'react';

export const FOOTER_ICON_STYLE = `
  text-white dark:text-white
  border-2 border-autumn-500/80 dark:border-autumn-400/80
  hover:bg-autumn-500/20 hover:border-autumn-400
  hover:text-white dark:hover:text-white
  bg-autumn-600/60 dark:bg-autumn-500/60
  transition-all duration-200
  rounded-xl
  backdrop-blur-md
  shadow-xl
  font-medium
  hover:shadow-2xl
  transform hover:scale-105
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autumn-400/60
  min-h-[44px] min-w-[44px]
  p-2.5
  flex items-center justify-center
` as const;

interface FooterButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const FooterButton: React.FC<FooterButtonProps> = ({
  onClick,
  children,
  title,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const baseClasses = `${FOOTER_ICON_STYLE} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      title={title}
      aria-label={ariaLabel || title}
      disabled={disabled}
      className={baseClasses}
    >
      {children}
    </button>
  );
};

export default FooterButton;