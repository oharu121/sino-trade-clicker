/**
 * Component tests for BoostControls
 * @module __tests__/components/BoostControls.test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoostControls } from '@/components/BoostControls';
import type { Article } from '@/lib/types';

describe('BoostControls', () => {
  const mockArticle: Article = {
    _id: '68e4a15046b10f98ffe2f4bc',
    title: '測試文章標題',
  };

  const mockOnStart = jest.fn();
  const mockOnPause = jest.fn();
  const mockOnResume = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Idle State', () => {
    it('should render count and interval inputs with default values', () => {
      render(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      const countInput = screen.getByLabelText('瀏覽次數');
      const intervalInput = screen.getByLabelText(/間隔時間/);

      expect(countInput).toHaveValue(200);
      expect(intervalInput).toHaveValue(300);
    });

    it('should show start button when idle', () => {
      render(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      expect(screen.getByRole('button', { name: '開始執行' })).toBeInTheDocument();
    });

    it('should disable start button when no article selected', () => {
      render(
        <BoostControls
          article={null}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      const startButton = screen.getByRole('button', { name: '開始執行' });
      expect(startButton).toBeDisabled();
      expect(screen.getByText('請先選擇文章')).toBeInTheDocument();
    });

    it('should call onStart with correct values', async () => {
      const user = userEvent.setup();

      render(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      const startButton = screen.getByRole('button', { name: '開始執行' });
      await user.click(startButton);

      expect(mockOnStart).toHaveBeenCalledWith(200, 300);
    });
  });

  describe('Validation', () => {
    it('should show error for count below minimum', async () => {
      const user = userEvent.setup();

      render(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      const countInput = screen.getByLabelText('瀏覽次數');
      await user.clear(countInput);
      await user.type(countInput, '0');

      expect(screen.getByText('最小值為 1')).toBeInTheDocument();
    });

    it('should show error for count above maximum', async () => {
      const user = userEvent.setup();

      render(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      const countInput = screen.getByLabelText('瀏覽次數');
      await user.clear(countInput);
      await user.type(countInput, '20000');

      expect(screen.getByText('最大值為 10,000')).toBeInTheDocument();
    });

    it('should show error for interval below minimum', async () => {
      const user = userEvent.setup();

      render(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      const intervalInput = screen.getByLabelText(/間隔時間/);
      await user.clear(intervalInput);
      await user.type(intervalInput, '100');

      expect(screen.getByText('最小間隔為 300ms')).toBeInTheDocument();
    });

    it('should disable start button when validation fails', async () => {
      const user = userEvent.setup();

      render(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      const countInput = screen.getByLabelText('瀏覽次數');
      await user.clear(countInput);
      await user.type(countInput, '0');

      const startButton = screen.getByRole('button', { name: '開始執行' });
      expect(startButton).toBeDisabled();
    });

    it('should not call onStart when validation fails', async () => {
      const user = userEvent.setup();

      render(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      const countInput = screen.getByLabelText('瀏覽次數');
      await user.clear(countInput);
      await user.type(countInput, '0');

      const startButton = screen.getByRole('button', { name: '開始執行' });
      await user.click(startButton);

      expect(mockOnStart).not.toHaveBeenCalled();
    });
  });

  describe('Running State', () => {
    it('should show pause button when running', () => {
      render(
        <BoostControls
          article={mockArticle}
          status="running"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
          onPause={mockOnPause}
        />
      );

      expect(screen.getByRole('button', { name: '暫停' })).toBeInTheDocument();
    });

    it('should disable inputs when running', () => {
      render(
        <BoostControls
          article={mockArticle}
          status="running"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
          onPause={mockOnPause}
        />
      );

      const countInput = screen.getByLabelText('瀏覽次數');
      const intervalInput = screen.getByLabelText(/間隔時間/);

      expect(countInput).toBeDisabled();
      expect(intervalInput).toBeDisabled();
    });

    it('should call onPause when pause button clicked', async () => {
      const user = userEvent.setup();

      render(
        <BoostControls
          article={mockArticle}
          status="running"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
          onPause={mockOnPause}
        />
      );

      const pauseButton = screen.getByRole('button', { name: '暫停' });
      await user.click(pauseButton);

      expect(mockOnPause).toHaveBeenCalledTimes(1);
    });
  });

  describe('Paused State', () => {
    it('should show resume and reset buttons when paused', () => {
      render(
        <BoostControls
          article={mockArticle}
          status="paused"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
          onResume={mockOnResume}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByRole('button', { name: '繼續' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '重新開始' })).toBeInTheDocument();
    });

    it('should call onResume when resume button clicked', async () => {
      const user = userEvent.setup();

      render(
        <BoostControls
          article={mockArticle}
          status="paused"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
          onResume={mockOnResume}
          onReset={mockOnReset}
        />
      );

      const resumeButton = screen.getByRole('button', { name: '繼續' });
      await user.click(resumeButton);

      expect(mockOnResume).toHaveBeenCalledTimes(1);
    });

    it('should call onReset when reset button clicked', async () => {
      const user = userEvent.setup();

      render(
        <BoostControls
          article={mockArticle}
          status="paused"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
          onResume={mockOnResume}
          onReset={mockOnReset}
        />
      );

      const resetButton = screen.getByRole('button', { name: '重新開始' });
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Completed State', () => {
    it('should show reset button when completed', () => {
      render(
        <BoostControls
          article={mockArticle}
          status="completed"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByRole('button', { name: '重新開始' })).toBeInTheDocument();
    });
  });

  describe('Default Values Update', () => {
    it('should update form values when defaults change and status is idle', () => {
      const { rerender } = render(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={200}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      let countInput = screen.getByLabelText('瀏覽次數');
      expect(countInput).toHaveValue(200);

      rerender(
        <BoostControls
          article={mockArticle}
          status="idle"
          defaultCount={2000}
          defaultInterval={300}
          onStart={mockOnStart}
        />
      );

      countInput = screen.getByLabelText('瀏覽次數');
      expect(countInput).toHaveValue(2000);
    });
  });
});
