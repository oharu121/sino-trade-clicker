/**
 * Article selector component with search
 * @module components/ArticleSelector
 */

'use client';

import { Select } from './ui/Select';
import { ArticleSelectorSkeleton } from './ui/Skeleton';
import type { Article } from '@/lib/types';
import { formatNumber } from '@/lib/utils/format';

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
}: ArticleSelectorProps) {
  // Convert articles to select options with view count badges
  const options = articles.map((article) => ({
    value: article._id,
    label: article.title,
    metadata: article.totalView !== undefined ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs font-semibold">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {formatNumber(article.totalView)}
      </span>
    ) : undefined,
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

  // Show skeleton while loading and no cached data
  if (loading && articles.length === 0) {
    return <ArticleSelectorSkeleton />;
  }

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
