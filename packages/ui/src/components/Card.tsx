import React from 'react';
import { ComponentProps } from '../types';

export interface CardProps extends ComponentProps {
  title?: string;
  subtitle?: string;
}

export function Card({ 
  children, 
  className = '', 
  title,
  subtitle,
  ...props 
}: CardProps) {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}
