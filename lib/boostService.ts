/**
 * Boost service - core logic for article view boosting
 * @module lib/boostService
 *
 * Executes view boost operations with precise timing and progress tracking
 */

import type { Article } from './types';
import { buildArticleUrl } from './utils/urlBuilder';
import { getRandomUserAgent } from './utils/userAgents';
import { scheduleAccurate, type TimerHandle } from './utils/timing';

/**
 * Boost operation configuration
 */
export interface BoostConfig {
  /** Article to boost */
  article: Article;
  /** Total number of requests to send */
  count: number;
  /** Interval between requests in milliseconds */
  interval: number;
}

/**
 * Progress callback data
 */
export interface BoostProgress {
  /** Current request index (0-based) */
  current: number;
  /** Total requests configured */
  total: number;
  /** Whether this request succeeded */
  success: boolean;
  /** Response time in milliseconds */
  responseTime: number;
  /** HTTP status code (if available) */
  statusCode?: number;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Boost operation callbacks
 */
export interface BoostCallbacks {
  /** Called on each request completion */
  onProgress?: (progress: BoostProgress) => void;
  /** Called when operation completes successfully */
  onComplete?: () => void;
  /** Called on critical error */
  onError?: (error: string) => void;
}

/**
 * Boost operation controller
 */
export interface BoostController {
  /** Pause the operation */
  pause: () => void;
  /** Resume the operation */
  resume: () => void;
  /** Cancel the operation */
  cancel: () => void;
  /** Get current state */
  getState: () => {
    isPaused: boolean;
    isCancelled: boolean;
    currentIndex: number;
  };
}

/**
 * Send a single view request to article URL via backend proxy
 *
 * Uses backend API proxy to bypass CORS and verify article page loaded correctly.
 * The proxy checks if the response contains the article title to ensure the view
 * was actually counted.
 *
 * @param url - Article URL to request
 * @param articleTitle - Article title to verify in response
 * @param userAgent - User-Agent header value
 * @returns Response time in milliseconds, status code, and success status
 */
async function sendViewRequest(
  url: string,
  articleTitle: string,
  userAgent: string
): Promise<{ responseTime: number; statusCode: number; success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/boost-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        articleTitle,
        userAgent,
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    return {
      responseTime: data.responseTime,
      statusCode: data.statusCode,
      success: data.success,
      error: data.error,
    };
  } catch (error) {
    throw {
      responseTime: 0,
      statusCode: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Start a boost operation
 *
 * Executes a series of HTTP requests to the article URL with precise timing.
 * Uses drift compensation to maintain <5% timing variance.
 *
 * @param config - Boost operation configuration
 * @param callbacks - Progress and completion callbacks
 * @returns BoostController for pause/resume/cancel
 *
 * @example
 * ```typescript
 * const controller = startBoost(
 *   {
 *     article: { _id: '...', title: '...' },
 *     count: 200,
 *     interval: 300
 *   },
 *   {
 *     onProgress: (progress) => {
 *       console.log(`Request ${progress.current + 1}/${progress.total}: ${progress.success ? 'OK' : 'FAIL'}`);
 *     },
 *     onComplete: () => {
 *       console.log('Boost operation completed!');
 *     },
 *     onError: (error) => {
 *       console.error('Critical error:', error);
 *     }
 *   }
 * );
 *
 * // Pause after 5 seconds
 * setTimeout(() => controller.pause(), 5000);
 * ```
 */
export function startBoost(config: BoostConfig, callbacks: BoostCallbacks = {}): BoostController {
  const { article, count, interval } = config;
  const { onProgress, onComplete, onError } = callbacks;

  // Build article URL with channel ID for correct path
  const articleUrl = buildArticleUrl(article, article.channelId);

  // State tracking
  let currentIndex = 0;
  let isPaused = false;
  let isCancelled = false;
  let currentTimer: TimerHandle | null = null;
  let expectedTime = Date.now() + interval;

  /**
   * Execute a single request
   */
  async function executeRequest(): Promise<void> {
    if (isCancelled) return;

    const requestIndex = currentIndex;
    const userAgent = getRandomUserAgent();

    try {
      const { responseTime, statusCode, success, error } = await sendViewRequest(
        articleUrl,
        article.title,
        userAgent
      );

      if (isCancelled) return;

      onProgress?.({
        current: requestIndex,
        total: count,
        success,
        responseTime,
        statusCode,
        error,
      });
    } catch (err: unknown) {
      if (isCancelled) return;

      const errorData = err as { responseTime: number; error: string; success: boolean };

      onProgress?.({
        current: requestIndex,
        total: count,
        success: errorData.success || false,
        responseTime: errorData.responseTime,
        error: errorData.error,
      });
    }

    // Schedule next request
    currentIndex++;

    if (currentIndex < count && !isCancelled && !isPaused) {
      expectedTime += interval;
      currentTimer = scheduleAccurate(executeRequest, interval, expectedTime);
    } else if (currentIndex >= count && !isCancelled) {
      onComplete?.();
    }
  }

  /**
   * Start the operation
   */
  function start(): void {
    if (currentIndex === 0) {
      expectedTime = Date.now() + interval;
    }
    currentTimer = scheduleAccurate(executeRequest, interval, expectedTime);
  }

  // Start immediately
  start();

  // Return controller
  return {
    pause: () => {
      if (!isPaused && !isCancelled) {
        isPaused = true;
        currentTimer?.cancel();
        currentTimer = null;
      }
    },

    resume: () => {
      if (isPaused && !isCancelled) {
        isPaused = false;
        // Recalculate expected time from current time
        expectedTime = Date.now() + interval;
        start();
      }
    },

    cancel: () => {
      isCancelled = true;
      isPaused = false;
      currentTimer?.cancel();
      currentTimer = null;
    },

    getState: () => ({
      isPaused,
      isCancelled,
      currentIndex,
    }),
  };
}
