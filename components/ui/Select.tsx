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
  const errorClass = error ? 'border-red-500' : 'border-gray-300';

  const selectId = React.useId();

  return (
    <div className={`relative ${widthClass}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
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
          min-h-[44px]
          w-full
          px-3 py-2
          rounded-lg
          border-2
          text-base
          text-left
          bg-white
          transition-colors
          duration-150
          focus:outline-none
          focus:ring-2
          focus:ring-offset-1
          focus:ring-blue-500
          disabled:bg-gray-100
          disabled:cursor-not-allowed
          ${errorClass}
        `.trim().replace(/\s+/g, ' ')}
      >
        <span className="block truncate">
          {loading
            ? 'Loading...'
            : selectedOption
            ? selectedOption.label
            : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
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
        <span className="text-sm text-red-600 mt-1" role="alert">
          {error}
        </span>
      )}

      {isOpen && !loading && (
        <div
          className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden"
          role="listbox"
        >
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setFocusedIndex(0);
                }}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          <ul className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-gray-500">No options found</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors
                    ${option.value === value ? 'bg-blue-100 font-medium' : ''}
                    ${index === focusedIndex ? 'bg-gray-100' : ''}
                    hover:bg-gray-100
                  `.trim().replace(/\s+/g, ' ')}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
