/**
 * Number formatting utilities
 * @module lib/utils/format
 */

/**
 * Format a number with comma separators for every 3 digits
 * @param num - Number to format
 * @returns Formatted string (e.g., 1000 -> "1,000")
 * @example
 * formatNumber(1000) // "1,000"
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(undefined) // "0"
 */
export function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) {
    return '0';
  }
  return num.toLocaleString('en-US');
}
