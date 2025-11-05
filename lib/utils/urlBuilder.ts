/**
 * Article URL builder utility
 * @module lib/utils/urlBuilder
 *
 * Constructs Sino Trade article URLs from article data
 * per requirements/enable-search.md specification
 */

import type { Article } from '../types';

/**
 * Sanitize article title for URL usage
 *
 * Replaces special characters with hyphens and collapses multiple hyphens.
 * Preserves Chinese characters for URL encoding by browser.
 *
 * @param title - Raw article title in Chinese with punctuation
 * @returns Sanitized title with hyphens replacing special chars
 *
 * @example
 * ```typescript
 * sanitizeTitle("美股依舊續創新高，背後的底氣是什麼?")
 * // Returns: "美股依舊續創新高-背後的底氣是什麼"
 * ```
 */
export function sanitizeTitle(title: string): string {
  return title
    .replace(/[,，\s?？:：%]/g, "-") // Replace comma, space, question marks, colons with hyphen
    .replace(/-+/g, "-") // Collapse multiple consecutive hyphens to single hyphen
    // .replace(/^-|-$/g, "");         // Trim leading and trailing hyphens
}

/**
 * Build Sino Trade article URL from article data
 *
 * Constructs URL following pattern:
 * `https://www.sinotrade.com.tw/richclub/MacroExpert/{sanitized-title}--{_id}`
 *
 * Note: Double-dash separator (`--`) before article ID is required
 *
 * @param article - Article object with _id and title
 * @returns Complete article URL for view boosting
 *
 * @throws {Error} If article._id is not 24-character hex string (MongoDB ObjectId format)
 * @throws {Error} If article.title is empty
 *
 * @example
 * ```typescript
 * const article = {
 *   _id: "68e4a15046b10f98ffe2f4bc",
 *   title: "美股依舊續創新高，背後的底氣是什麼?"
 * };
 *
 * buildArticleUrl(article);
 * // Returns: "https://www.sinotrade.com.tw/richclub/MacroExpert/美股依舊續創新高-背後的底氣是什麼--68e4a15046b10f98ffe2f4bc"
 * ```
 */
export function buildArticleUrl(article: Article): string {
  // Validate article ID format (24-character hex string)
  if (!article._id || !/^[a-f0-9]{24}$/i.test(article._id)) {
    throw new Error(`Invalid article ID format: ${article._id}. Must be 24-character hex string.`);
  }

  // Validate title is not empty
  if (!article.title || article.title.trim().length === 0) {
    throw new Error('Article title cannot be empty');
  }

  const sanitized = sanitizeTitle(article.title);

  // Construct URL with double-dash separator before ID
  return `https://www.sinotrade.com.tw/richclub/MacroExpert/${sanitized}--${article._id}`;
}
