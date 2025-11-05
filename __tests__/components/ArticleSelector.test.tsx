/**
 * Component tests for ArticleSelector
 * @module __tests__/components/ArticleSelector.test
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArticleSelector } from '@/components/ArticleSelector';
import * as articleService from '@/lib/articleService';
import type { Article } from '@/lib/types';

// Mock the articleService
jest.mock('@/lib/articleService');

const mockArticles: Article[] = [
  { _id: '68ff23fb032bb6011632bed5', title: '中國四中全會落幕' },
  { _id: '68f5ca6d032bb601160a9f8e', title: '美國區域銀行暴雷' },
  { _id: '68e4a15046b10f98ffe2f4bc', title: '美股依舊續創新高' },
];

describe('ArticleSelector', () => {
  const mockOnArticleSelect = jest.fn();
  const channelId = '6514f8b3b13f2760605fcef1';

  beforeEach(() => {
    jest.clearAllMocks();
    (articleService.fetchArticlesByChannel as jest.Mock).mockResolvedValue(mockArticles);
    (articleService.filterArticlesByTitle as jest.Mock).mockImplementation((articles, term) => {
      if (!term) return articles;
      return articles.filter((a) => a.title.includes(term));
    });
  });

  it('should show loading state initially', () => {
    render(
      <ArticleSelector
        channelId={channelId}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch and display articles', async () => {
    render(
      <ArticleSelector
        channelId={channelId}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    await waitFor(() => {
      expect(articleService.fetchArticlesByChannel).toHaveBeenCalledWith(channelId, {
        limit: 100,
        page: 0,
        skip: 1,
      });
    });
  });

  it('should call onArticleSelect when an article is selected', async () => {
    const user = userEvent.setup();

    render(
      <ArticleSelector
        channelId={channelId}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    // Wait for articles to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Open dropdown
    const selectButton = screen.getByRole('button', { name: /選擇文章/i });
    await user.click(selectButton);

    // Select an article
    const option = await screen.findByText('中國四中全會落幕');
    await user.click(option);

    expect(mockOnArticleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: '68ff23fb032bb6011632bed5',
        title: '中國四中全會落幕',
      })
    );
  });

  it('should display selected article title', async () => {
    render(
      <ArticleSelector
        channelId={channelId}
        selectedArticle={mockArticles[0]}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('中國四中全會落幕')).toBeInTheDocument();
    });
  });

  it('should show error message on fetch failure', async () => {
    const errorMessage = 'Failed to fetch articles';
    (articleService.fetchArticlesByChannel as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    render(
      <ArticleSelector
        channelId={channelId}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText(/無法載入文章列表/)).toBeInTheDocument();
        // Error message appears in both Select component and ArticleSelector wrapper
        const errorElements = screen.getAllByText(errorMessage);
        expect(errorElements.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it('should refetch articles when channelId changes', async () => {
    const { rerender } = render(
      <ArticleSelector
        channelId={channelId}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    await waitFor(() => {
      expect(articleService.fetchArticlesByChannel).toHaveBeenCalledWith(channelId, expect.any(Object));
    });

    const newChannelId = '630c2850c6435a2ff402ccfb';
    rerender(
      <ArticleSelector
        channelId={newChannelId}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    await waitFor(() => {
      expect(articleService.fetchArticlesByChannel).toHaveBeenCalledWith(newChannelId, expect.any(Object));
    });
  });

  it('should have searchable dropdown', async () => {
    const user = userEvent.setup();

    render(
      <ArticleSelector
        channelId={channelId}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    // Wait for articles to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Open dropdown
    const selectButton = screen.getByRole('button');
    await user.click(selectButton);

    // Search input should be visible
    const searchInput = await screen.findByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should show placeholder when no article selected', async () => {
    render(
      <ArticleSelector
        channelId={channelId}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('搜尋文章...')).toBeInTheDocument();
    });
  });
});
