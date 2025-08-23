import React from 'react';
import { ComponentProps } from '../types';

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
