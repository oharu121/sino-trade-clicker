/**
 * Component tests for ProgressMonitor
 * @module __tests__/components/ProgressMonitor.test
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressMonitor } from '@/components/ProgressMonitor';
import type { BoostOperation } from '@/lib/types';

// Mock scrollIntoView which is not available in jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const createMockOperation = (overrides?: Partial<BoostOperation>): BoostOperation => ({
  status: 'idle',
  article: null,
  config: {
    count: 100,
    interval: 300,
  },
  metrics: {
    current: 0,
    success: 0,
    failed: 0,
    consecutiveFailures: 0,
    responseTimes: [],
    averageResponseTime: 0,
  },
  timing: {
    startTime: null,
    endTime: null,
    duration: 0,
    pausedDuration: 0,
  },
  error: null,
  ...overrides,
});

describe('ProgressMonitor', () => {
  it('should not render when status is idle', () => {
    const operation = createMockOperation();
    const { container } = render(<ProgressMonitor operation={operation} progress={0} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render progress bar when operation is running', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
    });

    render(<ProgressMonitor operation={operation} progress={50} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
  });

  it('should display stats grid with metrics', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
      metrics: {
        current: 50,
        success: 45,
        failed: 5,
        consecutiveFailures: 0,
        responseTimes: [],
        averageResponseTime: 250,
      },
    });

    render(<ProgressMonitor operation={operation} progress={50} />);

    expect(screen.getByText('50')).toBeInTheDocument(); // current
    expect(screen.getByText('45')).toBeInTheDocument(); // success
    expect(screen.getByText('5')).toBeInTheDocument();  // failed
    // Response time is split: "250" and "ms" are separate elements
    expect(screen.getByText('250')).toBeInTheDocument(); // avg response time value
    expect(screen.getByText('ms')).toBeInTheDocument(); // avg response time unit
  });

  it('should show activity log section', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
    });

    render(<ProgressMonitor operation={operation} progress={0} />);

    expect(screen.getByText('活動記錄')).toBeInTheDocument();
  });

  it('should display pause message when paused', () => {
    const operation = createMockOperation({
      status: 'paused',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
    });

    render(<ProgressMonitor operation={operation} progress={25} />);

    // When paused, should show "操作已暫停" message
    expect(screen.getByText('操作已暫停')).toBeInTheDocument();
  });

  it('should apply primary variant to progress bar when running', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
    });

    const { container } = render(<ProgressMonitor operation={operation} progress={50} />);

    // Primary variant uses blue gradient
    const progressBar = container.querySelector('.from-blue-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('should apply success variant to progress bar when completed', () => {
    const operation = createMockOperation({
      status: 'completed',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
      metrics: {
        current: 100,
        success: 100,
        failed: 0,
        consecutiveFailures: 0,
        responseTimes: [],
        averageResponseTime: 250,
      },
    });

    const { container } = render(<ProgressMonitor operation={operation} progress={100} />);

    // Success variant uses emerald/green gradient
    const progressBar = container.querySelector('.from-emerald-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('should apply warning variant to progress bar when paused', () => {
    const operation = createMockOperation({
      status: 'paused',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
    });

    const { container } = render(<ProgressMonitor operation={operation} progress={25} />);

    // Warning variant uses amber/orange gradient
    const progressBar = container.querySelector('.from-amber-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('should apply error variant to progress bar when error occurred', () => {
    const operation = createMockOperation({
      status: 'error',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
      error: 'Test error message',
    });

    const { container } = render(<ProgressMonitor operation={operation} progress={15} />);

    // Error variant uses red gradient
    const progressBar = container.querySelector('.from-red-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('should display error message when error status', () => {
    const errorMessage = 'Network connection failed';
    const operation = createMockOperation({
      status: 'error',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
      error: errorMessage,
    });

    render(<ProgressMonitor operation={operation} progress={15} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show progress label', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
    });

    render(<ProgressMonitor operation={operation} progress={50} />);

    expect(screen.getByText('執行進度')).toBeInTheDocument();
  });

  it('should show stat labels in Chinese', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
    });

    render(<ProgressMonitor operation={operation} progress={50} />);

    expect(screen.getByText('進行中')).toBeInTheDocument();
    expect(screen.getByText('成功')).toBeInTheDocument();
    expect(screen.getByText('失敗')).toBeInTheDocument();
    expect(screen.getByText('回應')).toBeInTheDocument(); // Label was shortened from '平均回應'
  });

  it('should update metrics when operation progresses', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
      metrics: {
        current: 25,
        success: 20,
        failed: 5,
        consecutiveFailures: 0,
        responseTimes: [],
        averageResponseTime: 300,
      },
    });

    const { rerender } = render(<ProgressMonitor operation={operation} progress={25} />);

    expect(screen.getByText('25')).toBeInTheDocument(); // current

    // Update operation
    const updatedOperation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
      metrics: {
        current: 75,
        success: 70,
        failed: 5,
        consecutiveFailures: 0,
        responseTimes: [],
        averageResponseTime: 280,
      },
    });

    rerender(<ProgressMonitor operation={updatedOperation} progress={75} />);

    expect(screen.getByText('75')).toBeInTheDocument(); // updated current
    expect(screen.getByText('70')).toBeInTheDocument(); // updated success
  });

  it('should not render error message box when no error', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
    });

    const { container } = render(<ProgressMonitor operation={operation} progress={50} />);

    // Should not have error message box with border-red-500
    const errorMessageBox = container.querySelector('.border-red-500');
    expect(errorMessageBox).not.toBeInTheDocument();
  });

  it('should render all stat cards', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
    });

    const { container } = render(<ProgressMonitor operation={operation} progress={50} />);

    // Check for stat cards using their background colors (updated from gradient classes)
    expect(container.querySelector('.bg-slate-50')).toBeInTheDocument();
    expect(container.querySelector('.bg-emerald-50')).toBeInTheDocument();
    expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
  });

  it('should display zero values correctly', () => {
    const operation = createMockOperation({
      status: 'running',
      article: { _id: '123', title: 'Test Article', channelId: 'test' },
      metrics: {
        current: 0,
        success: 0,
        failed: 0,
        consecutiveFailures: 0,
        responseTimes: [],
        averageResponseTime: 0,
      },
    });

    render(<ProgressMonitor operation={operation} progress={0} />);

    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
    // Response time "0" and "ms" are split across elements
    expect(screen.getByText('ms')).toBeInTheDocument();
  });
});
