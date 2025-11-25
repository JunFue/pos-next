"use client";

import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

/**
 * Analytics component to track Core Web Vitals
 * Only active in production
 */
export function Analytics() {
  useEffect(() => {
    // Only track in production
    if (process.env.NODE_ENV === 'production') {
      // Track Cumulative Layout Shift
      onCLS((metric) => {
        console.log('CLS:', metric);
        // You can send this to your analytics service
      });

      // Track Interaction to Next Paint
      onINP((metric) => {
        console.log('INP:', metric);
      });

      // Track Largest Contentful Paint
      onLCP((metric) => {
        console.log('LCP:', metric);
      });

      // Track First Contentful Paint
      onFCP((metric) => {
        console.log('FCP:', metric);
      });

      // Track Time to First Byte
      onTTFB((metric) => {
        console.log('TTFB:', metric);
      });
    }
  }, []);

  return null;
}
