/**
 * Custom hook for fetching and managing articles
 * @module hooks/useArticles
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchArticlesByChannel, filterArticlesByTitle } from '@/lib/articleService';
import type { Article } from '@/lib/types';

/**
 * Hook state interface
 */
export interface UseArticlesState {
  /** Raw articles from API */
  articles: Article[];
  /** Filtered articles based on search term */
  filteredArticles: Article[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch fails */
  error: string | null;
  /** Currently selected article */
  selectedArticle: Article | null;
}

/**
 * Hook actions interface
 */
export interface UseArticlesActions {
  /** Set search term to filter articles */
  setSearchTerm: (term: string) => void;
  /** Set selected article */
  setSelectedArticle: (article: Article | null) => void;
  /** Retry fetching articles */
  refetch: () => void;
}

/**
 * Hook return type
 */
export interface UseArticlesReturn extends UseArticlesState, UseArticlesActions {}

/**
 * Custom hook for fetching and filtering articles by channel
 *
 * Fetches articles from the API on mount and provides filtering capabilities.
 * Handles loading, error states, and article selection.
 * Supports optional title filtering to narrow down results client-side.
 *
 * @param channelId - GraphQL channel ID to fetch articles from
 * @param titleFilter - Optional string to filter articles by title (client-side)
 * @returns State and actions for managing articles
 *
 * @example
 * ```tsx
 * function ArticleList({ channelId }: { channelId: string }) {
 *   const {
 *     filteredArticles,
 *     loading,
 *     error,
 *     setSearchTerm,
 *     setSelectedArticle
 *   } = useArticles(channelId, '【川普政策整理】');
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <>
 *       <input onChange={(e) => setSearchTerm(e.target.value)} />
 *       {filteredArticles.map((article) => (
 *         <div key={article._id} onClick={() => setSelectedArticle(article)}>
 *           {article.title}
 *         </div>
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function useArticles(channelId: string, titleFilter?: string): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Fetch articles function
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedArticles = await fetchArticlesByChannel(channelId, {
        limit: 100,
        page: 0,
        skip: 1,
      });

      // Apply title filter if provided (client-side filtering)
      const filtered = titleFilter
        ? fetchedArticles.filter((article) => article.title.includes(titleFilter))
        : fetchedArticles;

      setArticles(filtered);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch articles';
      setError(errorMessage);
      console.error('Error in useArticles:', err);
    } finally {
      setLoading(false);
    }
  }, [channelId, titleFilter]);

  // Fetch articles when channelId changes
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Filter articles based on search term (applied after titleFilter)
  const filteredArticles = searchTerm
    ? filterArticlesByTitle(articles, searchTerm)
    : articles;

  return {
    // State
    articles,
    filteredArticles,
    loading,
    error,
    selectedArticle,

    // Actions
    setSearchTerm,
    setSelectedArticle,
    refetch: fetchArticles,
  };
}
