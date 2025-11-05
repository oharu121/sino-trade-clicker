/**
 * User-Agent randomization utility
 * @module lib/utils/userAgents
 *
 * Provides random User-Agent strings for request diversity
 * to simulate different browsers and devices
 */

/**
 * Pool of User-Agent strings covering major browsers and devices
 *
 * Mix of desktop and mobile browsers to simulate realistic traffic patterns.
 * Updated to current browser versions as of 2025.
 */
const USER_AGENTS: readonly string[] = [
  // Chrome Desktop (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',

  // Chrome Desktop (macOS)
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',

  // Firefox Desktop (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',

  // Firefox Desktop (macOS)
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',

  // Safari Desktop (macOS)
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',

  // Edge Desktop (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',

  // Chrome Mobile (Android - Pixel)
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',

  // Chrome Mobile (Android - Samsung)
  'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',

  // Safari Mobile (iPhone)
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',

  // Safari Mobile (iPad)
  'Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',

  // Chrome Mobile (iPhone)
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/131.0.0.0 Mobile/15E148 Safari/604.1',

  // Firefox Mobile (Android)
  'Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0',

  // Samsung Internet (Android)
  'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36',

  // Opera Desktop (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/116.0.0.0',

  // Opera Mobile (Android)
  'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 OPR/85.0.0.0',
] as const;

/**
 * Get a random User-Agent string from the pool
 *
 * Uses cryptographically secure random number generation if available,
 * falls back to Math.random() otherwise.
 *
 * @returns A random User-Agent string
 *
 * @example
 * ```typescript
 * const userAgent = getRandomUserAgent();
 *
 * fetch(url, {
 *   headers: {
 *     'User-Agent': userAgent
 *   }
 * });
 * ```
 */
export function getRandomUserAgent(): string {
  // Use crypto.getRandomValues for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const index = randomBytes[0] % USER_AGENTS.length;
    return USER_AGENTS[index];
  }

  // Fallback to Math.random()
  const index = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[index];
}

/**
 * Get all available User-Agent strings (for testing)
 *
 * @returns Array of all User-Agent strings in the pool
 */
export function getAllUserAgents(): readonly string[] {
  return USER_AGENTS;
}
