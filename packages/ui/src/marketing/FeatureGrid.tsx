import React from 'react';
import { ComponentProps } from '../types';

export interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface FeatureGridProps extends ComponentProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
}

export function FeatureGrid({ 
  children, 
  className = '', 
  features,
  columns = 3,
  ...props 
}: FeatureGridProps) {
  return (
    <section className={`feature-grid feature-grid-${columns} ${className}`} {...props}>
      {features.map((feature, index) => (
        <div key={index} className="feature-item">
          {feature.icon && <div className="feature-icon">{feature.icon}</div>}
          <h3 className="feature-title">{feature.title}</h3>
          <p className="feature-description">{feature.description}</p>
        </div>
      ))}
      {children}
    </section>
  );
}
