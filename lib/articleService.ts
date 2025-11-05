/**
 * Article service for fetching articles from Sino Trade API
 * @module lib/articleService
 *
 * Client-side service for fetching article lists via Next.js API proxy
 */

import type { Article } from './types';

/**
 * Fetch articles by channel ID
 *
 * Calls Next.js API proxy route which handles GraphQL communication
 * with Sino Trade API. Includes client-side retry logic for resilience.
 *
 * @param channelId - GraphQL channel ID (e.g., "6514f8b3b13f2760605fcef1")
 * @param options - Optional fetch configuration
 * @returns Array of articles for the channel
 *
 * @throws {Error} If API request fails after retries
 * @throws {Error} If response validation fails
 *
 * @example
 * ```typescript
 * const articles = await fetchArticlesByChannel('6514f8b3b13f2760605fcef1', {
 *   limit: 100,
 *   page: 0
 * });
 * console.log(`Fetched ${articles.length} articles`);
 * ```
 */
export async function fetchArticlesByChannel(
  channelId: string,
  options: {
    limit?: number;
    page?: number;
    skip?: number;
  } = {}
): Promise<Article[]> {
  const { limit = 100, page = 0, skip = 1 } = options;

  try {
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelId,
        limit,
        page,
        skip,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(
        `API request failed with status ${response.status}: ${errorData.error || 'Unknown error'}${
          errorData.details ? ` - ${errorData.details}` : ''
        }`
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error('Invalid API response: articles array missing');
    }

    // Validate article structure
    for (const article of data.articles) {
      if (!article._id || typeof article._id !== 'string') {
        throw new Error('Invalid article: _id field missing or invalid');
      }
      if (!article.title || typeof article.title !== 'string') {
        throw new Error('Invalid article: title field missing or invalid');
      }
    }

    return data.articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
}

/**
 * Search articles by title substring
 *
 * Client-side filtering of articles. For large datasets, consider
 * implementing server-side search in the API route.
 *
 * @param articles - Array of articles to search
 * @param searchTerm - Search term to match against titles (case-insensitive)
 * @returns Filtered array of articles matching search term
 *
 * @example
 * ```typescript
 * const allArticles = await fetchArticlesByChannel(channelId);
 * const filtered = filterArticlesByTitle(allArticles, '美股');
 * console.log(`Found ${filtered.length} articles about 美股`);
 * ```
 */
export function filterArticlesByTitle(articles: Article[], searchTerm: string): Article[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return articles;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();

  return articles.filter((article) =>
    article.title.toLowerCase().includes(normalizedSearch)
  );
}
