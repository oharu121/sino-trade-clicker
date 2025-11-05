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
      className="flex gap-2 p-1 bg-gray-100 rounded-lg"
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
              min-h-[44px]
              px-4 py-2
              rounded-md
              font-medium
              text-base
              transition-all
              duration-150
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-blue-500
              ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
