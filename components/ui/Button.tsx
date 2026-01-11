/**
 * Button component with variants and mobile-first design
 * @module components/ui/Button
 */

'use client';

import React from 'react';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger';

/**
 * Button component props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Full width button */
  fullWidth?: boolean;
  /** Children content */
  children: React.ReactNode;
}

/**
 * Get variant-specific Tailwind classes
 */
function getVariantClasses(variant: ButtonVariant): string {
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
    secondary:
      'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 active:bg-slate-50 dark:active:bg-slate-700 disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed shadow-sm',
    danger:
      'bg-linear-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 active:from-red-800 active:to-rose-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
  };

  return variants[variant];
}

/**
 * Button component
 *
 * Mobile-first button with minimum 44x44px touch target per WCAG 2.1 AA guidelines.
 * Supports primary, secondary, and danger variants.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Start Boost
 * </Button>
 *
 * <Button variant="secondary" disabled>
 *   Disabled Button
 * </Button>
 *
 * <Button variant="danger" fullWidth>
 *   Delete
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClasses = getVariantClasses(variant);
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        min-h-[44px] min-w-[44px]
        px-6 py-3
        rounded-xl
        font-semibold
        text-base
        transition-all
        duration-200
        transform
        hover:scale-[1.02]
        active:scale-[0.98]
        focus:outline-none
        focus:ring-4
        focus:ring-offset-2
        focus:ring-blue-500/50
        disabled:transform-none
        disabled:hover:scale-100
        ${variantClasses}
        ${widthClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
}
