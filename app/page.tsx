/**
 * Main application page - Sino Trade Article View Manager
 * @module app/page
 */

'use client';

import { useState } from 'react';
import { TabSelector } from '@/components/TabSelector';
import { ArticleSelector } from '@/components/ArticleSelector';
import { BoostControls } from '@/components/BoostControls';
import { useBoostOperation } from '@/hooks/useBoostOperation';
import { CHANNELS, CHANNEL_LIST } from '@/lib/constants';
import type { Article } from '@/lib/types';

/**
 * Home Page Component
 *
 * Main application interface for selecting articles and boosting view counts.
 * Implements User Story 1: Select and Boost Article Views.
 */
export default function Home() {
  // Channel selection state
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    CHANNELS.MACRO_EXPERT.id
  );
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Boost operation state
  const { state: operation, start, pause, resume, reset } = useBoostOperation();

  // Get current channel configuration
  const currentChannel = CHANNEL_LIST.find((ch) => ch.id === selectedChannelId);

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

          {/* Operation Status */}
          {operation.status !== 'idle' && (
            <section className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  執行狀態
                </h3>
                <span
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${
                      operation.status === 'running'
                        ? 'bg-green-100 text-green-800'
                        : operation.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : operation.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }
                  `.trim().replace(/\s+/g, ' ')}
                >
                  {operation.status === 'running' && '執行中'}
                  {operation.status === 'paused' && '已暫停'}
                  {operation.status === 'completed' && '已完成'}
                  {operation.status === 'error' && '錯誤'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {operation.metrics.current}
                  </div>
                  <div className="text-sm text-gray-500">進行中</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {operation.metrics.success}
                  </div>
                  <div className="text-sm text-gray-500">成功</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {operation.metrics.failed}
                  </div>
                  <div className="text-sm text-gray-500">失敗</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {operation.metrics.averageResponseTime}ms
                  </div>
                  <div className="text-sm text-gray-500">平均回應</div>
                </div>
              </div>

              {operation.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{operation.error}</p>
                </div>
              )}
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Sino Trade Article View Manager</p>
        </footer>
      </div>
    </div>
  );
}
