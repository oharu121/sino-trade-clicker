/**
 * Formatting utilities for numbers and text
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

/**
 * Normalize text for comparison by decoding HTML entities and Unicode escapes
 *
 * This function:
 * - Decodes HTML entities (&amp; → &, &lt; → <, etc.)
 * - Decodes numeric entities (&#38; → &, &#x26; → &)
 * - Handles Unicode escapes in JSON (\u0026 → &)
 * - Normalizes whitespace (multiple spaces → single space)
 * - Trims leading/trailing whitespace
 *
 * @param text - Text to normalize
 * @returns Normalized text suitable for comparison
 * @example
 * normalizeTextForComparison("S&amp;P 500") // "S&P 500"
 * normalizeTextForComparison("S\\u0026P 500") // "S&P 500"
 * normalizeTextForComparison("Multiple   spaces") // "Multiple spaces"
 */
export function normalizeTextForComparison(text: string): string {
  return text
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Decode numeric HTML entities (decimal)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    // Decode numeric HTML entities (hexadecimal)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Handle Unicode escapes (from JSON strings)
    .replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
