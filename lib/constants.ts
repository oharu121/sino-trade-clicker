/**
 * Application constants and configuration
 * @module lib/constants
 */

import type { ArticleChannel } from './types';

/**
 * Sino Trade GraphQL API endpoint
 */
export const GRAPHQL_ENDPOINT = 'https://www.sinotrade.com.tw/richclub/api/graphql';

/**
 * Article channel configurations
 *
 * @see FR-002 - Channel IDs for GraphQL API
 * @see FR-007 - Default visit counts per channel
 * @see FR-008 - Default visit intervals
 */
export const CHANNELS: Record<string, ArticleChannel> = {
  MACRO_EXPERT: {
    id: 'macro-expert',
    label: '深談總經',
    channelId: '6514f8b3b13f2760605fcef1',
    defaultCount: 200,
    defaultInterval: 300,
  },
  STOCK_TALK: {
    id: 'stock-talk',
    label: '股市熱話',
    channelId: '630c2850c6435a2ff402ccfb',
    defaultCount: 2000,
    defaultInterval: 300,
  },
} as const;

/**
 * Array of channels for iteration
 */
export const CHANNEL_LIST: ArticleChannel[] = [
  CHANNELS.MACRO_EXPERT,
  CHANNELS.STOCK_TALK,
];

/**
 * Validation constraints
 */
export const VALIDATION = {
  /** Minimum visit count (FR-005) */
  MIN_COUNT: 1,

  /** Maximum visit count (FR-005) */
  MAX_COUNT: 10000,

  /** Minimum visit interval in milliseconds (FR-006) */
  MIN_INTERVAL: 300,

  /** Maximum timing variance allowed (5%) */
  MAX_TIMING_VARIANCE: 0.05,
} as const;

/**
 * Activity log configuration
 */
export const ACTIVITY_LOG = {
  /** Maximum number of log entries to keep */
  MAX_ENTRIES: 50,

  /** Log progress every N requests (FR-012) */
  PROGRESS_LOG_INTERVAL: 10,
} as const;

/**
 * API configuration
 */
export const API = {
  /** Request timeout in milliseconds */
  TIMEOUT: 5000,

  /** Number of retry attempts for failed requests */
  MAX_RETRIES: 3,

  /** Exponential backoff base delay in milliseconds */
  RETRY_DELAY: 1000,
} as const;
