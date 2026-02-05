
import React from 'react';

// Extending standard button attributes to ensure common props like onClick, type, and disabled are supported.
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

/**
 * Custom Button component that handles variants and sizes while supporting all standard HTML button attributes.
 * Using React.FC to ensure standard React props like 'key' and 'ref' are handled correctly.
 * This fixes errors where 'onClick', 'type', and 'disabled' were reported as missing from ButtonProps.
 */
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'solid', 
  size = 'md', 
  className = "", 
  ...props 
}) => {
  const baseStyles = "rounded-xl font-bold transition-all flex items-center justify-center";
  
  // Defined size mapping to handle different button dimensions
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variants = {
    solid: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-50"
  };

  // Combining styles and spreading remaining props to the native button element
  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
