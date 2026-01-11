/**
 * Tab selector component for switching between article channels
 * @module components/TabSelector
 */

'use client';

import React from 'react';
import type { ArticleChannel } from '@/lib/types';

/**
 * TabSelector props
 */
export interface TabSelectorProps {
  /** Available channels */
  channels: ArticleChannel[];
  /** Currently selected channel ID */
  selectedChannelId: string;
  /** Change handler */
  onChannelChange: (channelId: string) => void;
}

/**
 * Tab Selector Component
 *
 * Mobile-first tab navigation for switching between article channels.
 * Displays Chinese channel labels with active state styling.
 *
 * @example
 * ```tsx
 * <TabSelector
 *   channels={[CHANNELS.MACRO_EXPERT, CHANNELS.STOCK_TALK]}
 *   selectedChannelId="macro-expert"
 *   onChannelChange={(id) => setSelectedChannel(id)}
 * />
 * ```
 */
export function TabSelector({
  channels,
  selectedChannelId,
  onChannelChange,
}: TabSelectorProps) {
  return (
    <div
      role="tablist"
      className="flex gap-3 p-2 bg-linear-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-inner"
      aria-label="Article Channel Selection"
    >
      {channels.map((channel) => {
        const isActive = channel.id === selectedChannelId;

        return (
          <button
            key={channel.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${channel.id}`}
            onClick={() => onChannelChange(channel.id)}
            className={`
              flex-1
              min-h-[48px]
              px-5 py-3
              rounded-xl
              font-semibold
              text-base
              transition-all
              duration-300
              transform
              focus:outline-none
              focus:ring-4
              focus:ring-offset-2
              focus:ring-blue-500/50
              ${
                isActive
                  ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-md hover:scale-[1.02]'
              }
            `.trim().replace(/\s+/g, ' ')}
          >
            {channel.label}
          </button>
        );
      })}
    </div>
  );
}
