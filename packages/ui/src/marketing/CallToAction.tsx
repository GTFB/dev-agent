import React from 'react';
import { ComponentProps } from '../types';

export interface CallToActionProps extends ComponentProps {
  title: string;
  description?: string;
  primaryText: string;
  primaryLink: string;
  secondaryText?: string;
  secondaryLink?: string;
}

export function CallToAction({ 
  children, 
  className = '', 
  title,
  description,
  primaryText,
  primaryLink,
  secondaryText,
  secondaryLink,
  ...props 
}: CallToActionProps) {
  return (
    <section className={`cta ${className}`} {...props}>
      <div className="cta-content">
        <h2 className="cta-title">{title}</h2>
        {description && <p className="cta-description">{description}</p>}
        {children}
        <div className="cta-buttons">
          <a href={primaryLink} className="cta-primary">
            {primaryText}
          </a>
          {secondaryText && secondaryLink && (
            <a href={secondaryLink} className="cta-secondary">
              {secondaryText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
