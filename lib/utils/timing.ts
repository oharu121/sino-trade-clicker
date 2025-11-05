/**
 * Precision timer utility with drift compensation
 * @module lib/utils/timing
 *
 * Provides accurate timing for request intervals with <5% variance
 * per FR-016 (timing accuracy requirement)
 */

/**
 * Timer handle for cancellation
 */
export interface TimerHandle {
  /** Cancel the pending timer */
  cancel: () => void;
}

/**
 * Schedule a callback with drift compensation
 *
 * Uses setTimeout with drift tracking to maintain accurate intervals
 * over long-running operations. Ensures <5% timing variance per FR-016.
 *
 * @param callback - Function to execute after delay
 * @param intervalMs - Target interval in milliseconds
 * @param expectedTime - Expected execution timestamp (for drift compensation)
 * @returns TimerHandle for cancellation
 *
 * @example
 * ```typescript
 * let requestCount = 0;
 * const interval = 300; // 300ms between requests
 * let expectedTime = Date.now() + interval;
 *
 * function sendRequest() {
 *   console.log(`Request ${++requestCount}`);
 *
 *   if (requestCount < 100) {
 *     expectedTime += interval;
 *     scheduleAccurate(sendRequest, interval, expectedTime);
 *   }
 * }
 *
 * // Start first request
 * scheduleAccurate(sendRequest, interval, expectedTime);
 * ```
 */
export function scheduleAccurate(
  callback: () => void,
  intervalMs: number,
  expectedTime: number
): TimerHandle {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let cancelled = false;

  function execute() {
    if (cancelled) return;

    const now = Date.now();
    const drift = now - expectedTime;

    // Log excessive drift for debugging (>5% variance)
    if (Math.abs(drift) > intervalMs * 0.05) {
      console.warn(
        `Timer drift detected: ${drift}ms (${((drift / intervalMs) * 100).toFixed(1)}% of ${intervalMs}ms interval)`
      );
    }

    // Execute callback
    callback();
  }

  // Calculate adjusted delay to compensate for drift
  const now = Date.now();
  const drift = now - (expectedTime - intervalMs);
  const adjustedDelay = Math.max(0, intervalMs - drift);

  timeoutId = setTimeout(execute, adjustedDelay);

  return {
    cancel: () => {
      cancelled = true;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}

/**
 * Calculate timing variance percentage
 *
 * @param actualInterval - Measured interval in milliseconds
 * @param targetInterval - Target interval in milliseconds
 * @returns Variance as percentage (0.0 to 1.0)
 *
 * @example
 * ```typescript
 * const variance = calculateVariance(305, 300);
 * console.log(variance); // 0.0167 (1.67%)
 * ```
 */
export function calculateVariance(actualInterval: number, targetInterval: number): number {
  if (targetInterval === 0) return 0;
  return Math.abs(actualInterval - targetInterval) / targetInterval;
}

/**
 * Validate if timing variance is within acceptable range (<5%)
 *
 * @param actualInterval - Measured interval in milliseconds
 * @param targetInterval - Target interval in milliseconds
 * @returns true if variance is <5%, false otherwise
 *
 * @example
 * ```typescript
 * isVarianceAcceptable(302, 300); // true (0.67% variance)
 * isVarianceAcceptable(320, 300); // false (6.67% variance)
 * ```
 */
export function isVarianceAcceptable(actualInterval: number, targetInterval: number): boolean {
  const variance = calculateVariance(actualInterval, targetInterval);
  return variance < 0.05; // <5% variance per FR-016
}
