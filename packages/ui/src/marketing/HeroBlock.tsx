import React from 'react';
import { ComponentProps } from '../types';

export interface HeroBlockProps extends ComponentProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function HeroBlock({ 
  children, 
  className = '', 
  title,
  subtitle,
  ctaText,
  ctaLink,
  ...props 
}: HeroBlockProps) {
  return (
    <section className={`hero ${className}`} {...props}>
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {children}
        {ctaText && ctaLink && (
          <a href={ctaLink} className="hero-cta">
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
