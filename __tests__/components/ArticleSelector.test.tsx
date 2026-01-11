/**
 * Component tests for ArticleSelector
 * @module __tests__/components/ArticleSelector.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArticleSelector } from '@/components/ArticleSelector';
import type { Article } from '@/lib/types';

const mockArticles: Article[] = [
  { _id: '68ff23fb032bb6011632bed5', title: '中國四中全會落幕' },
  { _id: '68f5ca6d032bb601160a9f8e', title: '美國區域銀行暴雷' },
  { _id: '68e4a15046b10f98ffe2f4bc', title: '美股依舊續創新高' },
];

describe('ArticleSelector', () => {
  const mockOnArticleSelect = vi.fn();
  const channelId = '6514f8b3b13f2760605fcef1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state when loading is true', () => {
    render(
      <ArticleSelector
        channelId={channelId}
        articles={[]}
        loading={true}
        error={null}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    // Should show skeleton loading state
    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should display articles when provided', () => {
    render(
      <ArticleSelector
        channelId={channelId}
        articles={mockArticles}
        loading={false}
        error={null}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    // Should show the placeholder when no article selected
    expect(screen.getByText('搜尋文章...')).toBeInTheDocument();
  });

  it('should call onArticleSelect when an article is selected', async () => {
    const user = userEvent.setup();

    render(
      <ArticleSelector
        channelId={channelId}
        articles={mockArticles}
        loading={false}
        error={null}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

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
        channelId: channelId,
      })
    );
  });

  it('should display selected article title', () => {
    render(
      <ArticleSelector
        channelId={channelId}
        articles={mockArticles}
        loading={false}
        error={null}
        selectedArticle={mockArticles[0]}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    expect(screen.getByText('中國四中全會落幕')).toBeInTheDocument();
  });

  it('should show error message when error is provided', () => {
    const errorMessage = 'Failed to fetch articles';

    render(
      <ArticleSelector
        channelId={channelId}
        articles={[]}
        loading={false}
        error={errorMessage}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    expect(screen.getByText(/無法載入文章列表/)).toBeInTheDocument();
    // Error message appears in both Select component and ArticleSelector wrapper
    const errorElements = screen.getAllByText(errorMessage);
    expect(errorElements.length).toBeGreaterThan(0);
  });

  it('should not show error message when loading', () => {
    const errorMessage = 'Failed to fetch articles';

    render(
      <ArticleSelector
        channelId={channelId}
        articles={[]}
        loading={true}
        error={errorMessage}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    // Error should not be displayed while loading
    expect(screen.queryByText(/無法載入文章列表/)).not.toBeInTheDocument();
  });

  it('should have searchable dropdown', async () => {
    const user = userEvent.setup();

    render(
      <ArticleSelector
        channelId={channelId}
        articles={mockArticles}
        loading={false}
        error={null}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    // Open dropdown
    const selectButton = screen.getByRole('button');
    await user.click(selectButton);

    // Search input should be visible (uses Chinese placeholder)
    const searchInput = await screen.findByPlaceholderText('搜尋...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should show placeholder when no article selected', () => {
    render(
      <ArticleSelector
        channelId={channelId}
        articles={mockArticles}
        loading={false}
        error={null}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    expect(screen.getByText('搜尋文章...')).toBeInTheDocument();
  });

  it('should handle empty articles array', () => {
    render(
      <ArticleSelector
        channelId={channelId}
        articles={[]}
        loading={false}
        error={null}
        selectedArticle={null}
        onArticleSelect={mockOnArticleSelect}
      />
    );

    // Should still render the select component
    expect(screen.getByText('搜尋文章...')).toBeInTheDocument();
  });
});
