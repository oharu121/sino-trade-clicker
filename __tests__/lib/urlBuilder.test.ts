/**
 * Unit tests for URL builder utility
 * @module __tests__/lib/urlBuilder.test
 */

import { sanitizeTitle, buildArticleUrl } from '@/lib/utils/urlBuilder';
import type { Article } from '@/lib/types';

describe('urlBuilder', () => {
  describe('sanitizeTitle', () => {
    it('should replace Chinese commas with hyphens', () => {
      const input = '美股依舊續創新高，背後的底氣是什麼？';
      const expected = '美股依舊續創新高-背後的底氣是什麼-';
      expect(sanitizeTitle(input)).toBe(expected);
    });

    it('should replace English commas with hyphens', () => {
      const input = 'Market trends, analysis, and predictions';
      const expected = 'Market-trends--analysis--and-predictions';
      expect(sanitizeTitle(input)).toBe(expected);
    });

    it('should replace spaces with hyphens', () => {
      const input = '美股 依舊 續創 新高';
      const expected = '美股-依舊-續創-新高';
      expect(sanitizeTitle(input)).toBe(expected);
    });

    it('should replace question marks with hyphens', () => {
      const input = '美股會漲嗎？背後的原因是什麼?';
      const expected = '美股會漲嗎-背後的原因是什麼-';
      expect(sanitizeTitle(input)).toBe(expected);
    });

    it('should keep consecutive hyphens from consecutive special characters', () => {
      const input = '美股，  會漲嗎？？？  背後的原因';
      const expected = '美股---會漲嗎-----背後的原因';
      expect(sanitizeTitle(input)).toBe(expected);
    });

    it('should NOT trim leading hyphens', () => {
      const input = '，，美股會漲嗎';
      const expected = '--美股會漲嗎';
      expect(sanitizeTitle(input)).toBe(expected);
    });

    it('should NOT trim trailing hyphens', () => {
      const input = '美股會漲嗎？？？';
      const expected = '美股會漲嗎---';
      expect(sanitizeTitle(input)).toBe(expected);
    });

    it('should handle titles with all special characters replaced', () => {
      const input = 'A, B? C，D？';
      const expected = 'A--B--C-D-';
      expect(sanitizeTitle(input)).toBe(expected);
    });

    it('should preserve Chinese characters', () => {
      const input = '深談總經：中國政策與美股展望';
      const expected = '深談總經-中國政策與美股展望';
      expect(sanitizeTitle(input)).toBe(expected);
    });

    it('should handle empty strings', () => {
      expect(sanitizeTitle('')).toBe('');
    });
  });

  describe('buildArticleUrl', () => {
    it('should build MacroExpert URL for 深談總經 channel', () => {
      const article: Article = {
        _id: '68e4a15046b10f98ffe2f4bc',
        title: '不畏政府關門，美股依舊續創新高，背後的底氣是什麼？',
      };

      const url = buildArticleUrl(article, '6514f8b3b13f2760605fcef1');

      expect(url).toBe(
        'https://www.sinotrade.com.tw/richclub/MacroExpert/不畏政府關門-美股依舊續創新高-背後的底氣是什麼---68e4a15046b10f98ffe2f4bc'
      );
    });

    it('should build hotstock URL for 股市熱話 channel', () => {
      const article: Article = {
        _id: '68e4a15046b10f98ffe2f4bc',
        title: '美股依舊續創新高',
      };

      const url = buildArticleUrl(article, '630c2850c6435a2ff402ccfb');

      expect(url).toBe(
        'https://www.sinotrade.com.tw/richclub/hotstock/美股依舊續創新高--68e4a15046b10f98ffe2f4bc'
      );
    });

    it('should use double-dash separator before article ID', () => {
      const article: Article = {
        _id: '68ff23fb032bb6011632bed5',
        title: '簡單標題',
      };

      const url = buildArticleUrl(article);

      expect(url).toContain('--68ff23fb032bb6011632bed5');
      expect(url).not.toContain('---'); // Should not have triple dash
    });

    it('should preserve Chinese characters in URL', () => {
      const article: Article = {
        _id: '68e4a15046b10f98ffe2f4bc',
        title: '中國四中全會落幕',
      };

      const url = buildArticleUrl(article);

      expect(url).toContain('中國四中全會落幕');
    });

    it('should throw error for invalid article ID format', () => {
      const article: Article = {
        _id: 'invalid-id',
        title: 'Test Title',
      };

      expect(() => buildArticleUrl(article)).toThrow(
        'Invalid article ID format: invalid-id. Must be 24-character hex string.'
      );
    });

    it('should throw error for short article ID', () => {
      const article: Article = {
        _id: '68e4a1504', // Too short
        title: 'Test Title',
      };

      expect(() => buildArticleUrl(article)).toThrow('Invalid article ID format');
    });

    it('should throw error for empty article ID', () => {
      const article: Article = {
        _id: '',
        title: 'Test Title',
      };

      expect(() => buildArticleUrl(article)).toThrow('Invalid article ID format');
    });

    it('should throw error for empty title', () => {
      const article: Article = {
        _id: '68e4a15046b10f98ffe2f4bc',
        title: '',
      };

      expect(() => buildArticleUrl(article)).toThrow('Article title cannot be empty');
    });

    it('should throw error for whitespace-only title', () => {
      const article: Article = {
        _id: '68e4a15046b10f98ffe2f4bc',
        title: '   ',
      };

      expect(() => buildArticleUrl(article)).toThrow('Article title cannot be empty');
    });

    it('should accept uppercase hex characters in article ID', () => {
      const article: Article = {
        _id: '68E4A15046B10F98FFE2F4BC',
        title: 'Test Title',
      };

      const url = buildArticleUrl(article);

      expect(url).toContain('--68E4A15046B10F98FFE2F4BC');
    });

    it('should handle complex Chinese titles with punctuation', () => {
      const article: Article = {
        _id: '68ff23fb032bb6011632bed5',
        title: '中國四中全會落幕，通過十五五年規劃，美中角力下，科技自立自強成為中國政策核心，陸港股能否複製美股AI行情？',
      };

      const url = buildArticleUrl(article);

      expect(url).toContain('中國四中全會落幕');
      expect(url).toContain('--68ff23fb032bb6011632bed5');
      expect(url).not.toContain('，'); // Chinese commas should be replaced
      expect(url).not.toContain('？'); // Question marks should be replaced
    });

    it('should default to MacroExpert when no channelId provided', () => {
      const article: Article = {
        _id: '68e4a15046b10f98ffe2f4bc',
        title: 'Test',
      };

      const url = buildArticleUrl(article);

      expect(url).toContain('MacroExpert');
    });

    it('should handle percent signs in title', () => {
      const article: Article = {
        _id: '68e4a15046b10f98ffe2f4bc',
        title: '股價上漲10%，市場看好未來',
      };

      const url = buildArticleUrl(article);

      expect(url).toContain('股價上漲10-');
      expect(url).not.toContain('%');
    });

    it('should handle complex title with multiple special characters', () => {
      const article: Article = {
        _id: '68e4a15046b10f98ffe2f4bc',
        title: '川習會落幕，美中談成什麼？一年休兵協議背後誰才是真贏家？具體協議內容一表整理！【川普政策整理】',
      };

      const url = buildArticleUrl(article);

      // Should replace all special characters with hyphens
      expect(url).not.toContain('，');
      expect(url).not.toContain('？');
      expect(url).not.toContain('！');
      expect(url).not.toContain('【');
      expect(url).not.toContain('】');
      // Should contain the Chinese text
      expect(url).toContain('川習會落幕');
      expect(url).toContain('川普政策整理');
    });

    it('should handle parentheses and enumeration comma', () => {
      const article: Article = {
        _id: '68e4a15046b10f98ffe2f4bc',
        title: '股市分析（重要）、市場預測*注意事項',
      };

      const url = buildArticleUrl(article);

      expect(url).not.toContain('（');
      expect(url).not.toContain('）');
      expect(url).not.toContain('(');
      expect(url).not.toContain(')');
      expect(url).not.toContain('、');
      expect(url).not.toContain('*');
      expect(url).toContain('股市分析');
      expect(url).toContain('市場預測');
      expect(url).toContain('注意事項');
    });

    it('should handle periods in decimal numbers', () => {
      const article: Article = {
        _id: '690b0db1c34df711570aecba',
        title: '三大法人買賣超 – 外資買超(2327)國巨*、(3711)日月光投控，投信買超(2330)台積電、(8358)金居，法人合計賣超649.46億元 (1105)',
      };

      const url = buildArticleUrl(article);

      // Period in title should be replaced with hyphen (649.46 -> 649-46)
      expect(url).toContain('649-46億元');
      expect(url).not.toContain('649.46'); // Original decimal shouldn't be in URL
      // Should contain the sanitized title portion
      expect(url).toContain('三大法人買賣超');
      expect(url).toContain('--690b0db1c34df711570aecba');
    });
  });
});
