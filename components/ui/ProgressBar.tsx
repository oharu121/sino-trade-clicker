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
    lg: 'h-8',
  };

  // Color classes with gradients
  const colorClasses = {
    primary: 'bg-linear-to-r from-blue-600 to-indigo-600',
    success: 'bg-linear-to-r from-emerald-600 to-green-600',
    warning: 'bg-linear-to-r from-amber-600 to-orange-600',
    error: 'bg-linear-to-r from-red-600 to-rose-600',
  };

  // Glow effects
  const glowClasses = {
    primary: 'shadow-lg shadow-blue-500/50',
    success: 'shadow-lg shadow-emerald-500/50',
    warning: 'shadow-lg shadow-amber-500/50',
    error: 'shadow-lg shadow-red-500/50',
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
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {clampedValue}%
            </span>
          )}
        </div>
      )}

      <div
        className={`w-full bg-linear-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full overflow-hidden shadow-inner ${heightClasses[size]}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`${colorClasses[variant]} ${heightClasses[size]} ${glowClasses[variant]} rounded-full transition-all duration-500 ease-out flex items-center justify-center relative overflow-hidden`}
          style={{ width: `${clampedValue}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>

          {showPercentage && size === 'lg' && clampedValue > 10 && (
            <span className={`${textSizeClasses[size]} font-bold text-white drop-shadow-lg relative z-10`}>
              {clampedValue}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
