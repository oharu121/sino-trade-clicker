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
      className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl"
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
              relative
              flex-1
              cursor-pointer
              min-h-11
              px-4 py-2.5
              rounded-lg
              font-medium
              text-sm sm:text-base
              transition-all
              duration-200
              ease-out
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/50
              focus:ring-offset-2
              focus:ring-offset-slate-100
              dark:focus:ring-offset-slate-800
              ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }
            `.trim().replace(/\s+/g, ' ')}
          >
            {isActive && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
            {channel.label}
          </button>
        );
      })}
    </div>
  );
}
