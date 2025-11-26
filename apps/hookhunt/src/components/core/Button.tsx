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
  const base = "px-4 py-2 rounded font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400";
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "bg-white border border-blue-500 text-blue-600 hover:bg-blue-50",
  };
  return (
    <button
      className={`${base} ${variants[variant] || variants.default} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      title={title}
    >
      {children}
    </button>
  );
}
