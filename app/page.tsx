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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center animate-fade-in">
          <div className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
            <span className="text-xs font-semibold text-white tracking-wide uppercase">
              Sino Trade Platform
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight">
            文章瀏覽管理器
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
            選擇文章並自動增加瀏覽次數，支援多頻道智能管理
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {/* Channel Tab Selector */}
          <section className="animate-slide-in">
            <TabSelector
              channels={CHANNEL_LIST}
              selectedChannelId={selectedChannelId}
              onChannelChange={handleChannelChange}
            />
          </section>

          {/* Article Selector */}
          <section className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
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
            <section className="relative overflow-hidden animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10"></div>
              <div className="relative p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      已選擇文章
                    </h3>
                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedArticle.title}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Boost Controls */}
          <section className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5"></div>
              <div className="relative p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    執行設定
                  </h2>
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
            </div>
          </section>

          {/* Progress Monitor */}
          <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <ProgressMonitor
              operation={operation}
              progress={getProgress()}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
            Sino Trade Article View Manager
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            © 2025 Sino Trade. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
