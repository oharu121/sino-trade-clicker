/**
 * Progress bar component with animated transitions
 * @module components/ui/ProgressBar
 */

'use client';

import React from 'react';

/**
 * ProgressBar props
 */
export interface ProgressBarProps {
  /** Progress percentage (0-100) */
  value: number;
  /** Optional label */
  label?: string;
  /** Show percentage text inside bar */
  showPercentage?: boolean;
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'error';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Progress Bar Component
 *
 * Animated progress bar with percentage display.
 * Smooth transitions when progress updates.
 *
 * @example
 * ```tsx
 * <ProgressBar
 *   value={75}
 *   label="Processing"
 *   showPercentage
 *   variant="primary"
 *   size="md"
 * />
 * ```
 */
export function ProgressBar({
  value,
  label,
  showPercentage = true,
  variant = 'primary',
  size = 'md',
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Height classes
  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  // Color classes
  const colorClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  // Text size classes
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700">
              {clampedValue}%
            </span>
          )}
        </div>
      )}

      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`${colorClasses[variant]} ${heightClasses[size]} rounded-full transition-all duration-300 ease-out flex items-center justify-center`}
          style={{ width: `${clampedValue}%` }}
        >
          {showPercentage && size === 'lg' && clampedValue > 10 && (
            <span className={`${textSizeClasses[size]} font-medium text-white`}>
              {clampedValue}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
