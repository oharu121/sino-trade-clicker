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
        skip: 0,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-linear-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/30 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 py-8 sm:py-12 sm:px-6">
        {/* Header */}
        <header className="mb-8 sm:mb-10 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 tracking-wide">
              Sino Trade Platform
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            文章瀏覽管理器
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            選擇文章並自動增加瀏覽次數，支援多頻道智能管理
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-5">
          {/* Channel Tab Selector */}
          <section className="animate-slide-in">
            <TabSelector
              channels={CHANNEL_LIST}
              selectedChannelId={selectedChannelId}
              onChannelChange={handleChannelChange}
            />
          </section>

          {/* Article Selector */}
          <section className="relative z-10 animate-slide-in" style={{ animationDelay: '0.05s' }}>
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <ArticleSelector
                channelId={currentChannel?.channelId || ''}
                articles={articles}
                loading={loading}
                error={error}
                selectedArticle={selectedArticle}
                onArticleSelect={handleArticleSelect}
                autoFocus
              />
            </div>
          </section>

          {/* Selected Article Display */}
          {selectedArticle && (
            <section className="animate-scale-in">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">
                    已選擇文章
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {selectedArticle.title}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Boost Controls */}
          <section className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="shrink-0 w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    執行設定
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    配置瀏覽次數與間隔時間
                  </p>
                </div>
              </div>

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
            </div>
          </section>

          {/* Progress Monitor */}
          <section className="animate-slide-in" style={{ animationDelay: '0.15s' }}>
            <ProgressMonitor
              operation={operation}
              progress={getProgress()}
            />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Sino Trade Article View Manager · © 2025
          </p>
        </footer>
      </div>
    </div>
  );
}
