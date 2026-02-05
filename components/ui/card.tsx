
import React from 'react';

// Using React.HTMLAttributes to include standard props like className and key
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Standard Card component for dashboard layouts.
 * Using React.FC to handle standard React attributes like 'key'.
 * This fixes errors where 'key' was reported as missing from CardProps during list rendering.
 */
export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`bg-white border border-slate-200 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Content wrapper for the Card component.
 */
export const CardContent: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);
