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
  return title.replace(/[,，\s\?？:：%*、()（）【】\[\]！!.]/g, '-'); // Replace each special character with hyphen
}

/**
 * Build Sino Trade article URL from article data
 *
 * Constructs URL following pattern based on channel:
 * - MacroExpert (深談總經): `https://www.sinotrade.com.tw/richclub/MacroExpert/{sanitized-title}--{_id}`
 * - Stock Talk (股市熱話): `https://www.sinotrade.com.tw/richclub/hotstock/{sanitized-title}--{_id}`
 *
 * Note: Double-dash separator (`--`) before article ID is required
 *
 * @param article - Article object with _id and title
 * @param channelId - Channel ID to determine URL path (optional, defaults to MacroExpert)
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
 * buildArticleUrl(article, '6514f8b3b13f2760605fcef1');
 * // Returns: "https://www.sinotrade.com.tw/richclub/MacroExpert/美股依舊續創新高-背後的底氣是什麼--68e4a15046b10f98ffe2f4bc"
 *
 * buildArticleUrl(article, '630c2850c6435a2ff402ccfb');
 * // Returns: "https://www.sinotrade.com.tw/richclub/hotstock/美股依舊續創新高-背後的底氣是什麼--68e4a15046b10f98ffe2f4bc"
 * ```
 */
export function buildArticleUrl(article: Article, channelId?: string): string {
  // Validate article ID format (24-character hex string)
  if (!article._id || !/^[a-f0-9]{24}$/i.test(article._id)) {
    throw new Error(`Invalid article ID format: ${article._id}. Must be 24-character hex string.`);
  }

  // Validate title is not empty
  if (!article.title || article.title.trim().length === 0) {
    throw new Error('Article title cannot be empty');
  }

  const sanitized = sanitizeTitle(article.title);

  // Determine URL path based on channel ID
  // 深談總經: 6514f8b3b13f2760605fcef1 -> MacroExpert
  // 股市熱話: 630c2850c6435a2ff402ccfb -> hotstock
  const isStockTalk = channelId === '630c2850c6435a2ff402ccfb';
  const path = isStockTalk ? 'hotstock' : 'MacroExpert';

  // Construct URL with double-dash separator before ID
  return `https://www.sinotrade.com.tw/richclub/${path}/${sanitized}--${article._id}`;
}
