'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

export function PerformanceMonitor({ children }: PerformanceMonitorProps) {
  useEffect(() => {
    // Web Vitals monitoring
    const reportWebVitals = (metric: any) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', metric);
      }
    };

    // Core Web Vitals
    const reportCoreWebVitals = () => {
      // LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          
          reportWebVitals({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: getRating(lastEntry.startTime, [2500, 4000]),
          });
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // FID (First Input Delay)
      if ('PerformanceObserver' in window) {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            reportWebVitals({
              name: 'FID',
              value: fid,
              rating: getRating(fid, [100, 300]),
            });
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
      }

      // CLS (Cumulative Layout Shift)
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // Report CLS on page unload
        window.addEventListener('beforeunload', () => {
          reportWebVitals({
            name: 'CLS',
            value: clsValue,
            rating: getRating(clsValue, [0.1, 0.25]),
          });
        });
      }

      // FCP (First Contentful Paint)
      if ('PerformanceObserver' in window) {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          
          reportWebVitals({
            name: 'FCP',
            value: firstEntry.startTime,
            rating: getRating(firstEntry.startTime, [1800, 3000]),
          });
        });
        
        fcpObserver.observe({ entryTypes: ['first-contentful-paint'] });
      }

      // TTFB (Time to First Byte)
      if ('PerformanceObserver' in window) {
        const ttfbObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            reportWebVitals({
              name: 'TTFB',
              value: entry.responseStart - entry.requestStart,
              rating: getRating(entry.responseStart - entry.requestStart, [800, 1800]),
            });
          });
        });
        
        ttfbObserver.observe({ entryTypes: ['navigation'] });
      }
    };

    // Helper function to determine rating
    const getRating = (value: number, thresholds: [number, number]): 'good' | 'needs-improvement' | 'poor' => {
      if (value <= thresholds[0]) return 'good';
      if (value <= thresholds[1]) return 'needs-improvement';
      return 'poor';
    };

    // Start monitoring
    reportCoreWebVitals();

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
                  if (entry.duration > 50) { // 50ms threshold
          if (process.env.NODE_ENV === 'development') {
            console.log('Long task detected:', entry.duration, 'ms');
          }
        }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      const reportMemory = () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Memory usage:', {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
          });
        }
      };
      
      // Report memory usage every 30 seconds
      const memoryInterval = setInterval(reportMemory, 30000);
      reportMemory(); // Initial report
      
      return () => clearInterval(memoryInterval);
    }
  }, []);

  return <>{children}</>;
}

// Hook for custom performance measurements
export function usePerformanceMeasurement() {
  const measure = (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance measurement [${name}]:`, duration, 'ms');
    }
    
    return duration;
  };

  const measureAsync = async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Async performance measurement [${name}]:`, duration, 'ms');
    }
    
    return { result, duration };
  };

  return { measure, measureAsync };
}
