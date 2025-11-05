/**
 * Input component with validation and error display
 * @module components/ui/Input
 */

'use client';

import React from 'react';

/**
 * Input component props
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Input component
 *
 * Accessible input field with label, error state, and helper text.
 * Supports all standard HTML input attributes.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Visit Count"
 *   type="number"
 *   value={count}
 *   onChange={(e) => setCount(e.target.value)}
 *   error={countError}
 *   helperText="Enter value between 1 and 10000"
 *   min={1}
 *   max={10000}
 * />
 * ```
 */
export function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  id,
  ...props
}: InputProps) {
  // Generate ID for accessibility
  const inputId = id || `input-${React.useId()}`;
  const errorId = `${inputId}-error`;
  const helperTextId = `${inputId}-helper`;

  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  return (
    <div className={`flex flex-col gap-1 ${widthClass}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`
          min-h-[44px]
          px-3 py-2
          rounded-lg
          border-2
          text-base
          transition-colors
          duration-150
          focus:outline-none
          focus:ring-2
          focus:ring-offset-1
          disabled:bg-gray-100
          disabled:text-gray-500
          disabled:cursor-not-allowed
          ${errorClass}
          ${widthClass}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? errorId : helperText ? helperTextId : undefined
        }
        {...props}
      />

      {error && (
        <span
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </span>
      )}

      {!error && helperText && (
        <span
          id={helperTextId}
          className="text-sm text-gray-500"
        >
          {helperText}
        </span>
      )}
    </div>
  );
}
