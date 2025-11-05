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
      'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 disabled:cursor-not-allowed',
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
        px-4 py-2
        rounded-lg
        font-medium
        text-base
        transition-colors
        duration-150
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-blue-500
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
