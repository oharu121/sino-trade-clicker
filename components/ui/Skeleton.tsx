/**
 * Skeleton loading component for better UX during data fetching
 * @module components/ui/Skeleton
 */

'use client';

import React from 'react';

/**
 * Skeleton props
 */
export interface SkeletonProps {
  /** Width of skeleton */
  width?: string;
  /** Height of skeleton */
  height?: string;
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton Component
 *
 * Animated loading placeholder that indicates content is being loaded.
 * Provides better perceived performance and visual feedback.
 *
 * @example
 * ```tsx
 * <Skeleton width="100%" height="40px" rounded="md" />
 * ```
 */
export function Skeleton({
  width = '100%',
  height = '20px',
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * ArticleSelector Skeleton
 *
 * Pre-configured skeleton specifically for ArticleSelector component.
 */
export function ArticleSelectorSkeleton() {
  return (
    <div className="w-full space-y-2">
      {/* Label */}
      <Skeleton width="80px" height="20px" rounded="sm" />

      {/* Select box */}
      <Skeleton width="100%" height="44px" rounded="lg" />

      {/* Helper text area */}
      <div className="flex gap-2">
        <Skeleton width="60%" height="14px" rounded="sm" />
        <Skeleton width="30%" height="14px" rounded="sm" />
      </div>
    </div>
  );
}
