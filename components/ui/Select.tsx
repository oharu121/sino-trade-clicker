/**
 * Select component with search and keyboard navigation
 * @module components/ui/Select
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';

/**
 * Select option type
 */
export interface SelectOption {
  /** Option value */
  value: string;
  /** Option display label */
  label: string;
  /** Optional metadata to display (e.g., view count badge) */
  metadata?: React.ReactNode;
}

/**
 * Select component props
 */
export interface SelectProps {
  /** Select options */
  options: SelectOption[];
  /** Currently selected value */
  value: string | null;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Select label */
  label?: string;
  /** Enable search/filter */
  searchable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Searchable Select component
 *
 * Dropdown select with optional search filtering and keyboard navigation.
 * Mobile-first with 44x44px minimum touch targets.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Select Article"
 *   options={articles.map(a => ({ value: a._id, label: a.title }))}
 *   value={selectedId}
 *   onChange={setSelectedId}
 *   searchable
 *   placeholder="Search articles..."
 * />
 * ```
 */
export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  searchable = false,
  loading = false,
  error,
  disabled = false,
  fullWidth = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;

      case 'Enter':
        e.preventDefault();
        if (filteredOptions[focusedIndex]) {
          onChange(filteredOptions[focusedIndex].value);
          setIsOpen(false);
          setSearchTerm('');
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(0);
  };

  const widthClass = fullWidth ? 'w-full' : 'min-w-[200px]';
  const errorClass = error
    ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/50'
    : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/50';

  const selectId = React.useId();

  return (
    <div className={`relative ${widthClass}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          {label}
        </label>
      )}

      <button
        id={selectId}
        type="button"
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          min-h-[48px]
          w-full
          px-4 py-3
          rounded-xl
          border-2
          text-base
          font-medium
          text-left
          bg-white dark:bg-slate-800
          text-slate-900 dark:text-slate-100
          transition-all
          duration-200
          focus:outline-none
          focus:ring-4
          focus:ring-offset-0
          focus:shadow-lg
          disabled:bg-slate-100 dark:disabled:bg-slate-900
          disabled:cursor-not-allowed
          disabled:text-slate-400 dark:disabled:text-slate-600
          ${errorClass}
        `.trim().replace(/\s+/g, ' ')}
      >
        <span className={`block truncate ${!selectedOption && !loading ? 'text-slate-400 dark:text-slate-500' : ''}`}>
          {loading
            ? 'Loading...'
            : selectedOption
            ? selectedOption.label
            : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg
            className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {error && (
        <div className="flex items-start gap-2 mt-2">
          <svg className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-red-700 dark:text-red-400" role="alert">
            {error}
          </span>
        </div>
      )}

      {isOpen && !loading && (
        <div
          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl max-h-72 overflow-hidden backdrop-blur-sm"
          role="listbox"
        >
          {searchable && (
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFocusedIndex(0);
                  }}
                  placeholder="搜尋..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}

          <ul className="overflow-y-auto max-h-56 py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-8 text-slate-500 dark:text-slate-400 text-center text-sm">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                無符合選項
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  className={`
                    px-4 py-3 cursor-pointer transition-all duration-150 text-sm font-medium
                    ${option.value === value
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300'
                    }
                    ${index === focusedIndex && option.value !== value
                      ? 'bg-slate-100 dark:bg-slate-700'
                      : ''
                    }
                    ${option.value !== value ? 'hover:bg-slate-100 dark:hover:bg-slate-700' : ''}
                  `.trim().replace(/\s+/g, ' ')}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    {option.value === value && (
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="truncate flex-1 min-w-0">{option.label}</span>
                    {option.metadata && (
                      <span className="shrink-0">{option.metadata}</span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
