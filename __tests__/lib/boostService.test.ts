/**
 * Unit tests for boost service
 * @module __tests__/lib/boostService.test
 */

import { startBoost, type BoostConfig, type BoostProgress } from '@/lib/boostService';
import type { Article } from '@/lib/types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock timing utility to avoid delays in tests
jest.mock('@/lib/utils/timing', () => ({
  scheduleAccurate: jest.fn((callback: () => void) => {
    // Execute immediately in tests
    setTimeout(callback, 0);
    return {
      cancel: jest.fn(),
    };
  }),
}));

describe('boostService', () => {
  const mockArticle: Article = {
    _id: '68e4a15046b10f98ffe2f4bc',
    title: '測試文章標題',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock backend proxy response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        statusCode: 200,
        responseTime: 150,
      }),
    });
  });

  describe('startBoost', () => {
    it('should execute configured number of requests', async () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 5,
        interval: 300,
      };

      const progressCalls: BoostProgress[] = [];

      await new Promise<void>((resolve) => {
        startBoost(config, {
          onProgress: (progress) => {
            progressCalls.push(progress);
          },
          onComplete: () => {
            resolve();
          },
        });
      });

      expect(progressCalls).toHaveLength(5);
      expect(progressCalls[0].current).toBe(0);
      expect(progressCalls[4].current).toBe(4);
    });

    it('should call onProgress with correct total count', async () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 10,
        interval: 300,
      };

      let firstProgressCall: BoostProgress | null = null;

      await new Promise<void>((resolve) => {
        startBoost(config, {
          onProgress: (progress) => {
            if (!firstProgressCall) {
              firstProgressCall = progress;
            }
          },
          onComplete: () => {
            resolve();
          },
        });
      });

      expect(firstProgressCall).not.toBeNull();
      expect(firstProgressCall?.total).toBe(10);
    });

    it('should report success for 2xx responses', async () => {
      // Mock should already be set in beforeEach, but let's be explicit
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          statusCode: 200,
          responseTime: 150,
        }),
      });

      const config: BoostConfig = {
        article: mockArticle,
        count: 1,
        interval: 300,
      };

      let capturedProgress: BoostProgress | null = null;

      await new Promise<void>((resolve) => {
        startBoost(config, {
          onProgress: (progress) => {
            capturedProgress = progress;
          },
          onComplete: () => {
            resolve();
          },
        });
      });

      expect(capturedProgress?.success).toBe(true);
      expect(capturedProgress?.statusCode).toBe(200);
    });

    it('should report failure for non-2xx responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          statusCode: 500,
          responseTime: 150,
          error: 'Internal Server Error',
        }),
      });

      const config: BoostConfig = {
        article: mockArticle,
        count: 1,
        interval: 300,
      };

      let capturedProgress: BoostProgress | null = null;

      await new Promise<void>((resolve) => {
        startBoost(config, {
          onProgress: (progress) => {
            capturedProgress = progress;
          },
          onComplete: () => {
            resolve();
          },
        });
      });

      expect(capturedProgress?.success).toBe(false);
      expect(capturedProgress?.statusCode).toBe(500);
    });

    it('should report failure for network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const config: BoostConfig = {
        article: mockArticle,
        count: 1,
        interval: 300,
      };

      let capturedProgress: BoostProgress | null = null;

      await new Promise<void>((resolve) => {
        startBoost(config, {
          onProgress: (progress) => {
            capturedProgress = progress;
          },
          onComplete: () => {
            resolve();
          },
        });
      });

      expect(capturedProgress?.success).toBe(false);
      expect(capturedProgress?.error).toContain('Network error');
    });

    it('should include response time in progress', async () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 1,
        interval: 300,
      };

      let capturedProgress: BoostProgress | null = null;

      await new Promise<void>((resolve) => {
        startBoost(config, {
          onProgress: (progress) => {
            capturedProgress = progress;
          },
          onComplete: () => {
            resolve();
          },
        });
      });

      expect(capturedProgress?.responseTime).toBeGreaterThanOrEqual(0);
      expect(typeof capturedProgress?.responseTime).toBe('number');
    });

    it('should call onComplete when all requests finish', async () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 3,
        interval: 300,
      };

      const onComplete = jest.fn();

      await new Promise<void>((resolve) => {
        startBoost(config, {
          onComplete: () => {
            onComplete();
            resolve();
          },
        });
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should send requests with random User-Agent headers', async () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 3,
        interval: 300,
      };

      await new Promise<void>((resolve) => {
        startBoost(config, {
          onComplete: () => {
            resolve();
          },
        });
      });

      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Check that requests are sent to backend proxy with User-Agent in body
      const calls = (global.fetch as jest.Mock).mock.calls;
      calls.forEach((call) => {
        expect(call[0]).toBe('/api/boost-view');
        const options = call[1];
        const body = JSON.parse(options.body);
        expect(body).toHaveProperty('userAgent');
        expect(typeof body.userAgent).toBe('string');
      });
    });

    it('should send requests to correct article URL via backend proxy', async () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 1,
        interval: 300,
      };

      await new Promise<void>((resolve) => {
        startBoost(config, {
          onComplete: () => {
            resolve();
          },
        });
      });

      const calls = (global.fetch as jest.Mock).mock.calls;
      expect(calls[0][0]).toBe('/api/boost-view');

      const options = calls[0][1];
      const body = JSON.parse(options.body);

      expect(body.url).toContain('https://www.sinotrade.com.tw/richclub/MacroExpert/');
      expect(body.url).toContain('--68e4a15046b10f98ffe2f4bc');
      expect(body.articleTitle).toBe('測試文章標題');
    });
  });

  describe('BoostController', () => {
    it('should pause operation', async () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 100,
        interval: 300,
      };

      const progressCalls: BoostProgress[] = [];

      const controller = startBoost(config, {
        onProgress: (progress) => {
          progressCalls.push(progress);

          // Pause after 5 requests
          if (progress.current === 4) {
            controller.pause();
          }
        },
      });

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      const state = controller.getState();
      expect(state.isPaused).toBe(true);
      expect(progressCalls.length).toBeLessThan(100);
    });

    it('should resume operation after pause', async () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 10,
        interval: 300,
      };

      let pauseTriggered = false;

      await new Promise<void>((resolve) => {
        const controller = startBoost(config, {
          onProgress: (progress) => {
            // Pause at request 3
            if (progress.current === 2 && !pauseTriggered) {
              pauseTriggered = true;
              controller.pause();

              // Resume after short delay
              setTimeout(() => {
                controller.resume();
              }, 50);
            }
          },
          onComplete: () => {
            resolve();
          },
        });
      });

      // Should complete all 10 requests even with pause/resume
      expect(global.fetch).toHaveBeenCalledTimes(10);
    });

    it('should cancel operation', async () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 100,
        interval: 300,
      };

      const controller = startBoost(config, {
        onProgress: (progress) => {
          // Cancel after 3 requests
          if (progress.current === 2) {
            controller.cancel();
          }
        },
      });

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      const state = controller.getState();
      expect(state.isCancelled).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should provide current state', () => {
      const config: BoostConfig = {
        article: mockArticle,
        count: 5,
        interval: 300,
      };

      const controller = startBoost(config);
      const state = controller.getState();

      expect(state).toHaveProperty('isPaused');
      expect(state).toHaveProperty('isCancelled');
      expect(state).toHaveProperty('currentIndex');
      expect(typeof state.isPaused).toBe('boolean');
      expect(typeof state.isCancelled).toBe('boolean');
      expect(typeof state.currentIndex).toBe('number');
    });
  });
});
