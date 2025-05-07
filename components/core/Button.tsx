import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string; // Added optional 'title' property
}

export function Button(props: ButtonProps) {
  const { children, onClick, disabled = false, variant = "default", className, type = "button" } = props;
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
    >
      {children}
    </button>
  );
}
