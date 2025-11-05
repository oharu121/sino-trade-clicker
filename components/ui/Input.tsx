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
  // Generate ID for accessibility (hooks must be called unconditionally)
  const generatedId = React.useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = `${inputId}-error`;
  const helperTextId = `${inputId}-helper`;

  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error
    ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/50 bg-red-50 dark:bg-red-950/20'
    : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/50 bg-white dark:bg-slate-800';

  return (
    <div className={`flex flex-col gap-2 ${widthClass}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`
          min-h-[48px]
          px-4 py-3
          rounded-xl
          border-2
          text-base
          font-medium
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          transition-all
          duration-200
          focus:outline-none
          focus:ring-4
          focus:ring-offset-0
          focus:shadow-lg
          disabled:bg-slate-100 dark:disabled:bg-slate-900
          disabled:text-slate-400 dark:disabled:text-slate-600
          disabled:cursor-not-allowed
          disabled:border-slate-200 dark:disabled:border-slate-700
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
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span
            id={errorId}
            className="text-sm font-medium text-red-700 dark:text-red-400"
            role="alert"
          >
            {error}
          </span>
        </div>
      )}

      {!error && helperText && (
        <span
          id={helperTextId}
          className="text-sm text-slate-600 dark:text-slate-400"
        >
          {helperText}
        </span>
      )}
    </div>
  );
}
