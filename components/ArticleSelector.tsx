/**
 * Article selector component with search
 * @module components/ArticleSelector
 */

'use client';

import React from 'react';
import { Select } from './ui/Select';
import type { Article } from '@/lib/types';

/**
 * ArticleSelector props
 */
export interface ArticleSelectorProps {
  /** Channel ID to fetch articles from */
  channelId: string;
  /** Pre-fetched articles to display */
  articles: Article[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Currently selected article */
  selectedArticle: Article | null;
  /** Selection change handler */
  onArticleSelect: (article: Article | null) => void;
  /** Auto-focus when channel changes */
  autoFocus?: boolean;
}

/**
 * Article Selector Component
 *
 * Searchable dropdown for selecting articles from a channel.
 * Accepts pre-fetched articles from parent component for efficient caching.
 *
 * @example
 * ```tsx
 * <ArticleSelector
 *   channelId="6514f8b3b13f2760605fcef1"
 *   articles={articles}
 *   loading={loading}
 *   error={error}
 *   selectedArticle={article}
 *   onArticleSelect={setArticle}
 *   autoFocus
 * />
 * ```
 */
export function ArticleSelector({
  channelId,
  articles,
  loading,
  error,
  selectedArticle,
  onArticleSelect,
  autoFocus = false,
}: ArticleSelectorProps) {
  // Convert articles to select options
  const options = articles.map((article) => ({
    value: article._id,
    label: article.title,
  }));

  const handleChange = (articleId: string) => {
    const article = articles.find((a) => a._id === articleId);
    // Add channelId to the article when selected
    if (article) {
      onArticleSelect({ ...article, channelId });
    } else {
      onArticleSelect(null);
    }
  };

  return (
    <div className="w-full">
      <Select
        label="選擇文章"
        options={options}
        value={selectedArticle?._id || null}
        onChange={handleChange}
        searchable
        loading={loading}
        error={error ? error : undefined}
        placeholder="搜尋文章..."
        fullWidth
      />

      {error && !loading && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            無法載入文章列表。請稍後再試。
          </p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}
