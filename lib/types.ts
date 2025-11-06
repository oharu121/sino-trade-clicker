/**
 * Core type definitions for Sino Trade Article View Manager
 * @module lib/types
 */

/**
 * Article entity from Sino Trade GraphQL API
 */
export interface Article {
  /** MongoDB ObjectId from API */
  _id: string;

  /** Article title in Chinese (may contain special characters) */
  title: string;

  /** Channel ID for determining URL path */
  channelId?: string;

  /** Computed article URL for view boosting */
  url?: string;

  /** Total view count from media analytics */
  totalView?: number;
}

/**
 * Article channel configuration for GraphQL queries
 */
export interface ArticleChannel {
  /** Internal channel identifier */
  id: 'macro-expert' | 'stock-talk' | 'trump-topic';

  /** Display name in Chinese for tab label */
  label: '深談總經' | '股市熱話' | '川普專題';

  /** GraphQL channel ID for API query */
  channelId: string;

  /** Default visit count for this channel (FR-007) */
  defaultCount: number;

  /** Default visit interval in milliseconds (FR-008) */
  defaultInterval: number;

  /** Optional title filter - only show articles whose title contains this string */
  titleFilter?: string;
}

/**
 * Boost operation state machine status
 */
export type BoostStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

/**
 * Boost operation state and metrics
 */
export interface BoostOperation {
  /** Current operation status */
  status: BoostStatus;

  /** Selected article being boosted */
  article: Article | null;

  /** Configuration */
  config: {
    /** Total number of requests to send */
    count: number;

    /** Interval between requests in milliseconds */
    interval: number;
  };

  /** Progress metrics */
  metrics: {
    /** Current request number (0-based index) */
    current: number;

    /** Successful requests (2xx responses) */
    success: number;

    /** Failed requests (errors, non-2xx) */
    failed: number;

    /** Array of response times in milliseconds */
    responseTimes: number[];

    /** Average response time in milliseconds */
    averageResponseTime: number;
  };

  /** Timing tracking */
  timing: {
    /** Operation start timestamp (ms since epoch) */
    startTime: number | null;

    /** Operation end timestamp (ms since epoch) */
    endTime: number | null;

    /** Total elapsed time in seconds (excluding paused time) */
    duration: number;

    /** Accumulated paused duration in milliseconds */
    pausedDuration: number;
  };

  /** Error state */
  error: string | null;
}

/**
 * Activity log entry type
 */
export type LogType = 'info' | 'success' | 'warning' | 'error';

/**
 * Activity log entry for operation timeline
 */
export interface ActivityLogEntry {
  /** Unique entry ID (timestamp + random) */
  id: string;

  /** Entry timestamp (ms since epoch) */
  timestamp: number;

  /** Log level / type */
  type: LogType;

  /** Human-readable message in Chinese */
  message: string;

  /** Optional associated data (e.g., HTTP status code) */
  metadata?: Record<string, unknown>;
}
