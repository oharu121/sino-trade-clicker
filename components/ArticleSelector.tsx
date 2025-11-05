/**
 * Article selector component with search
 * @module components/ArticleSelector
 */

'use client';

import React, { useEffect } from 'react';
import { Select } from './ui/Select';
import { useArticles } from '@/hooks/useArticles';
import type { Article } from '@/lib/types';

/**
 * ArticleSelector props
 */
export interface ArticleSelectorProps {
  /** Channel ID to fetch articles from */
  channelId: string;
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
 * Fetches articles via useArticles hook and provides search filtering.
 *
 * @example
 * ```tsx
 * <ArticleSelector
 *   channelId="6514f8b3b13f2760605fcef1"
 *   selectedArticle={article}
 *   onArticleSelect={setArticle}
 *   autoFocus
 * />
 * ```
 */
export function ArticleSelector({
  channelId,
  selectedArticle,
  onArticleSelect,
  autoFocus = false,
}: ArticleSelectorProps) {
  const {
    filteredArticles,
    loading,
    error,
    setSearchTerm,
    setSelectedArticle,
  } = useArticles(channelId);

  // Sync internal article state with external prop
  useEffect(() => {
    setSelectedArticle(selectedArticle);
  }, [selectedArticle, setSelectedArticle]);

  // Convert articles to select options
  const options = filteredArticles.map((article) => ({
    value: article._id,
    label: article.title,
  }));

  const handleChange = (articleId: string) => {
    const article = filteredArticles.find((a) => a._id === articleId);
    onArticleSelect(article || null);
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
        error={error || undefined}
        placeholder="搜尋文章..."
        fullWidth
      />

      {error && (
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
