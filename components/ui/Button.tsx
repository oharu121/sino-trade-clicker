/**
 * Button component with variants and mobile-first design
 * @module components/ui/Button
 */

'use client';

import React from 'react';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

/**
 * Button component props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Children content */
  children: React.ReactNode;
}

/**
 * Get variant-specific Tailwind classes
 */
function getVariantClasses(variant: ButtonVariant): string {
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35',
    secondary:
      'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 active:bg-blue-100 dark:active:bg-slate-600 disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed shadow-sm hover:shadow-md',
    danger:
      'bg-linear-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 active:from-red-700 active:to-rose-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35',
    success:
      'bg-linear-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 active:from-emerald-700 active:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35',
  };

  return variants[variant];
}

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
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
  loading = false,
  icon,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = getVariantClasses(variant);
  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        relative
        inline-flex
        items-center
        justify-center
        cursor-pointer
        min-h-11 min-w-11
        px-6 py-3
        rounded-xl
        font-semibold
        text-base
        transition-all
        duration-200
        ease-out
        transform
        hover:scale-[1.02]
        hover:-translate-y-0.5
        active:scale-[0.98]
        active:translate-y-0
        focus:outline-none
        focus:ring-4
        focus:ring-offset-2
        focus:ring-blue-500/50
        disabled:transform-none
        disabled:hover:scale-100
        disabled:hover:translate-y-0
        disabled:opacity-70
        ${variantClasses}
        ${widthClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      disabled={isDisabled}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && <span className="mr-2 -ml-1">{icon}</span>}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
}
