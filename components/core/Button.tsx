import React from "react";

/**
 * Button component with different variants and states
 * 
 * A reusable button component that supports different visual styles,
 * disabled state, and custom className for further customization.
 */
export interface ButtonProps {
  /** The content to display inside the button */
  children: React.ReactNode;
  /** Function to call when the button is clicked */
  onClick?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Visual style variant */
  variant?: "default" | "outline";
  /** Additional CSS classes to apply */
  className?: string;
  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";
  /** Tooltip text */
  title?: string;
}

export function Button(props: ButtonProps) {
  const { children, onClick, disabled = false, variant = "default", className, type = "button", title } = props;
  const base = "px-4 py-2 rounded font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 shadow-lg hover:shadow-xl";
  const variants = {
    default: "bg-gradient-to-r from-autumn-500 to-rust-500 text-white hover:from-autumn-600 hover:to-rust-600 focus:ring-autumn-400",
    outline: "bg-white dark:bg-gray-800 border-2 border-autumn-500 dark:border-autumn-400 text-autumn-600 dark:text-autumn-400 hover:bg-autumn-50 dark:hover:bg-autumn-900/20 focus:ring-autumn-400",
  };
  return (
    <button
      className={`${base} ${variants[variant] || variants.default} ${disabled ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      title={title}
    >
      {children}
    </button>
  );
}
