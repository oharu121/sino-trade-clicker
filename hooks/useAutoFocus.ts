/**
 * Custom hook for auto-focus behavior
 * @module hooks/useAutoFocus
 */

'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook to auto-focus an element when a dependency changes
 *
 * Focuses the ref element when the trigger dependency changes.
 * Useful for focusing inputs when tabs change or modals open.
 *
 * @param trigger - Dependency that triggers focus (e.g., selected tab ID)
 * @returns Ref to attach to the focusable element
 *
 * @example
 * ```tsx
 * function TabContent({ tabId }: { tabId: string }) {
 *   const inputRef = useAutoFocus<HTMLInputElement>(tabId);
 *
 *   return <input ref={inputRef} placeholder="Search..." />;
 * }
 * ```
 */
export function useAutoFocus<T extends HTMLElement = HTMLElement>(trigger: unknown) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (ref.current) {
      // Small delay to ensure element is fully rendered
      const timeoutId = setTimeout(() => {
        ref.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [trigger]);

  return ref;
}
