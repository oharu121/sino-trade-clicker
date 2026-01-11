/**
 * Unit tests for article service
 * @module __tests__/lib/articleService.test
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { fetchArticlesByChannel, filterArticlesByTitle } from '@/lib/articleService';
import type { Article } from '@/lib/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('articleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchArticlesByChannel', () => {
    const mockArticles: Article[] = [
      { _id: '68ff23fb032bb6011632bed5', title: '中國四中全會落幕' },
      { _id: '68f5ca6d032bb601160a9f8e', title: '美國區域銀行暴雷' },
      { _id: '68e4a15046b10f98ffe2f4bc', title: '美股依舊續創新高' },
    ];

    it('should fetch articles successfully', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ articles: mockArticles, total: 3 }),
      });

      const articles = await fetchArticlesByChannel('6514f8b3b13f2760605fcef1');

      expect(articles).toEqual(mockArticles);
      expect(global.fetch).toHaveBeenCalledWith('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: '6514f8b3b13f2760605fcef1',
          limit: 100,
          page: 0,
          skip: 1,
        }),
      });
    });

    it('should use custom options', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ articles: [], total: 0 }),
      });

      await fetchArticlesByChannel('630c2850c6435a2ff402ccfb', {
        limit: 50,
        page: 2,
        skip: 5,
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: '630c2850c6435a2ff402ccfb',
          limit: 50,
          page: 2,
          skip: 5,
        }),
      });
    });

    it('should throw error on API failure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error', details: 'Database connection failed' }),
      });

      await expect(fetchArticlesByChannel('6514f8b3b13f2760605fcef1')).rejects.toThrow(
        'API request failed with status 500'
      );
    });

    it('should throw error for network failure', async () => {
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      await expect(fetchArticlesByChannel('6514f8b3b13f2760605fcef1')).rejects.toThrow('Network error');
    });

    it('should throw error for missing articles array', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ total: 0 }), // Missing articles array
      });

      await expect(fetchArticlesByChannel('6514f8b3b13f2760605fcef1')).rejects.toThrow(
        'Invalid API response: articles array missing'
      );
    });

    it('should throw error for non-array articles', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ articles: 'not-an-array' }),
      });

      await expect(fetchArticlesByChannel('6514f8b3b13f2760605fcef1')).rejects.toThrow(
        'Invalid API response: articles array missing'
      );
    });

    it('should validate article structure', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          articles: [
            { _id: '68ff23fb032bb6011632bed5', title: 'Valid Article' },
            { _id: null, title: 'Invalid Article' }, // Invalid _id
          ],
        }),
      });

      await expect(fetchArticlesByChannel('6514f8b3b13f2760605fcef1')).rejects.toThrow(
        'Invalid article: _id field missing or invalid'
      );
    });

    it('should validate article title', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          articles: [
            { _id: '68ff23fb032bb6011632bed5', title: 123 }, // Invalid title type
          ],
        }),
      });

      await expect(fetchArticlesByChannel('6514f8b3b13f2760605fcef1')).rejects.toThrow(
        'Invalid article: title field missing or invalid'
      );
    });

    it('should handle empty response', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ articles: [], total: 0 }),
      });

      const articles = await fetchArticlesByChannel('6514f8b3b13f2760605fcef1');

      expect(articles).toEqual([]);
    });
  });

  describe('filterArticlesByTitle', () => {
    const articles: Article[] = [
      { _id: '1', title: '中國四中全會落幕，通過十五五年規劃' },
      { _id: '2', title: '美國區域銀行暴雷，會演變為系統性金融危機嗎?' },
      { _id: '3', title: '美股依舊續創新高，背後的底氣是什麼？' },
      { _id: '4', title: '深談總經：中國政策與美股展望' },
    ];

    it('should filter articles by Chinese characters', () => {
      const filtered = filterArticlesByTitle(articles, '美');

      expect(filtered).toHaveLength(3);
      expect(filtered[0]._id).toBe('2');
      expect(filtered[1]._id).toBe('3');
      expect(filtered[2]._id).toBe('4');
    });

    it('should filter articles case-insensitively', () => {
      const filtered = filterArticlesByTitle(articles, '美股');

      expect(filtered).toHaveLength(2);
      expect(filtered[0]._id).toBe('3');
      expect(filtered[1]._id).toBe('4');
    });

    it('should return all articles for empty search term', () => {
      const filtered = filterArticlesByTitle(articles, '');

      expect(filtered).toEqual(articles);
    });

    it('should return all articles for whitespace-only search term', () => {
      const filtered = filterArticlesByTitle(articles, '   ');

      expect(filtered).toEqual(articles);
    });

    it('should return empty array for no matches', () => {
      const filtered = filterArticlesByTitle(articles, '不存在的關鍵字');

      expect(filtered).toEqual([]);
    });

    it('should filter by partial match', () => {
      const filtered = filterArticlesByTitle(articles, '危機');

      expect(filtered).toHaveLength(1);
      expect(filtered[0]._id).toBe('2');
    });

    it('should trim search term', () => {
      const filtered = filterArticlesByTitle(articles, '  中國  ');

      expect(filtered).toHaveLength(2);
      expect(filtered[0]._id).toBe('1');
      expect(filtered[1]._id).toBe('4');
    });

    it('should handle multiple word search', () => {
      const filtered = filterArticlesByTitle(articles, '深談總經');

      // Should match the specific title containing "深談總經"
      expect(filtered).toHaveLength(1);
      expect(filtered[0]._id).toBe('4');
    });
  });
});
