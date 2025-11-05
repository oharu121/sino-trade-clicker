/**
 * Main application page - Sino Trade Article View Manager
 * @module app/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { TabSelector } from '@/components/TabSelector';
import { ArticleSelector } from '@/components/ArticleSelector';
import { BoostControls } from '@/components/BoostControls';
import { ProgressMonitor } from '@/components/ProgressMonitor';
import { useBoostOperation } from '@/hooks/useBoostOperation';
import { CHANNELS, CHANNEL_LIST } from '@/lib/constants';
import { fetchArticlesByChannel } from '@/lib/articleService';
import type { Article } from '@/lib/types';

/**
 * Article cache entry
 */
interface CacheEntry {
  articles: Article[];
  timestamp: number;
}

/**
 * Home Page Component
 *
 * Main application interface for selecting articles and boosting view counts.
 * Implements User Story 1: Select and Boost Article Views.
 * Features in-memory article caching to avoid redundant API calls when switching tabs.
 */
export default function Home() {
  // Channel selection state
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    CHANNELS.MACRO_EXPERT.id
  );
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Article cache: { channelId: { articles, timestamp } }
  const [articleCache, setArticleCache] = useState<Record<string, CacheEntry>>({});

  // Current channel articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Boost operation state
  const { state: operation, start, pause, resume, reset, getProgress } = useBoostOperation();

  // Get current channel configuration
  const currentChannel = CHANNEL_LIST.find((ch) => ch.id === selectedChannelId);

  /**
   * Fetch articles for current channel
   * Uses cache if available, otherwise fetches from API
   */
  const fetchArticles = useCallback(async () => {
    if (!currentChannel) return;

    const cacheKey = `${currentChannel.channelId}-${currentChannel.titleFilter || ''}`;
    const cached = articleCache[cacheKey];

    // Check if cache exists
    if (cached) {
      setArticles(cached.articles);
      setLoading(false);
      setError(null);
      return;
    }

    // No cache, fetch from API
    setLoading(true);
    setError(null);

    try {
      const fetchedArticles = await fetchArticlesByChannel(currentChannel.channelId, {
        limit: 100,
        page: 0,
        skip: 1,
      });

      // Apply title filter if provided
      const filtered = currentChannel.titleFilter
        ? fetchedArticles.filter((article) => article.title.includes(currentChannel.titleFilter!))
        : fetchedArticles;

      // Update cache
      setArticleCache((prev) => ({
        ...prev,
        [cacheKey]: {
          articles: filtered,
          timestamp: Date.now(),
        },
      }));

      setArticles(filtered);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch articles';
      setError(errorMessage);
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, [currentChannel, articleCache]);

  // Fetch articles when channel changes
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  /**
   * Handle channel tab change
   * Reset article selection and update defaults
   */
  const handleChannelChange = (channelId: string) => {
    if (operation.status === 'idle') {
      setSelectedChannelId(channelId);
      setSelectedArticle(null);
    }
  };

  /**
   * Handle article selection
   */
  const handleArticleSelect = (article: Article | null) => {
    if (operation.status === 'idle') {
      setSelectedArticle(article);
    }
  };

  /**
   * Handle boost start
   */
  const handleStart = (count: number, interval: number) => {
    if (selectedArticle) {
      start(selectedArticle, count, interval);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            文章瀏覽管理器
          </h1>
          <p className="text-gray-600">
            選擇文章並自動增加瀏覽次數
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Channel Tab Selector */}
          <section>
            <TabSelector
              channels={CHANNEL_LIST}
              selectedChannelId={selectedChannelId}
              onChannelChange={handleChannelChange}
            />
          </section>

          {/* Article Selector */}
          <section>
            <ArticleSelector
              channelId={currentChannel?.channelId || ''}
              articles={articles}
              loading={loading}
              error={error}
              selectedArticle={selectedArticle}
              onArticleSelect={handleArticleSelect}
              autoFocus
            />
          </section>

          {/* Selected Article Display */}
          {selectedArticle && (
            <section className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                已選擇文章
              </h3>
              <p className="text-sm text-blue-700">
                {selectedArticle.title}
              </p>
            </section>
          )}

          {/* Boost Controls */}
          <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              執行設定
            </h2>

            <BoostControls
              article={selectedArticle}
              status={operation.status}
              defaultCount={currentChannel?.defaultCount || 200}
              defaultInterval={currentChannel?.defaultInterval || 300}
              onStart={handleStart}
              onPause={pause}
              onResume={resume}
              onReset={reset}
            />
          </section>

          {/* Progress Monitor */}
          <ProgressMonitor
            operation={operation}
            progress={getProgress()}
          />
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Sino Trade Article View Manager</p>
        </footer>
      </div>
    </div>
  );
}
