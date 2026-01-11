/**
 * Component tests for ProgressBar
 * @module __tests__/components/ui/ProgressBar.test
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/ui/ProgressBar';

describe('ProgressBar', () => {
  it('should render with basic props', () => {
    render(<ProgressBar value={50} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should display label when provided', () => {
    render(<ProgressBar value={50} label="Processing" />);

    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('should show percentage when showPercentage is true', () => {
    render(<ProgressBar value={75} label="Progress" showPercentage />);

    // Percentage appears in label area and potentially in bar
    const percentageTexts = screen.getAllByText('75%');
    expect(percentageTexts.length).toBeGreaterThan(0);
  });

  it('should not show percentage when showPercentage is false', () => {
    render(<ProgressBar value={75} label="Progress" showPercentage={false} />);

    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('should clamp value to 0-100 range', () => {
    const { rerender } = render(<ProgressBar value={150} />);

    let progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');

    rerender(<ProgressBar value={-50} />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('should apply primary variant by default', () => {
    const { container } = render(<ProgressBar value={50} />);

    const bar = container.querySelector('.from-blue-600');
    expect(bar).toBeInTheDocument();
  });

  it('should apply success variant', () => {
    const { container } = render(<ProgressBar value={100} variant="success" />);

    const bar = container.querySelector('.from-emerald-600');
    expect(bar).toBeInTheDocument();
  });

  it('should apply warning variant', () => {
    const { container } = render(<ProgressBar value={50} variant="warning" />);

    const bar = container.querySelector('.from-amber-600');
    expect(bar).toBeInTheDocument();
  });

  it('should apply error variant', () => {
    const { container } = render(<ProgressBar value={30} variant="error" />);

    const bar = container.querySelector('.from-red-600');
    expect(bar).toBeInTheDocument();
  });

  it('should apply medium size by default', () => {
    const { container } = render(<ProgressBar value={50} />);

    const bar = container.querySelector('.h-4');
    expect(bar).toBeInTheDocument();
  });

  it('should apply small size', () => {
    const { container } = render(<ProgressBar value={50} size="sm" />);

    const bar = container.querySelector('.h-2');
    expect(bar).toBeInTheDocument();
  });

  it('should apply large size', () => {
    const { container } = render(<ProgressBar value={50} size="lg" />);

    const bar = container.querySelector('.h-8');
    expect(bar).toBeInTheDocument();
  });

  it('should show percentage inside bar when size is large and value > 10', () => {
    render(<ProgressBar value={50} size="lg" showPercentage />);

    const percentageTexts = screen.getAllByText('50%');
    expect(percentageTexts.length).toBeGreaterThan(0);
  });

  it('should not show percentage inside bar when size is large but value <= 10', () => {
    const { container } = render(<ProgressBar value={5} size="lg" label="Test" showPercentage />);

    // Percentage shown in label area
    const labelPercentage = screen.getByText('5%');
    expect(labelPercentage).toBeInTheDocument();

    // The bar should not contain the percentage text (no white text inside)
    const bar = container.querySelector('.from-blue-600');
    expect(bar?.textContent).toBe('');
  });

  it('should have transition animation class', () => {
    const { container } = render(<ProgressBar value={50} />);

    const bar = container.querySelector('.transition-all');
    expect(bar).toBeInTheDocument();
  });

  it('should update value dynamically', () => {
    const { rerender } = render(<ProgressBar value={25} />);

    let progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '25');

    rerender(<ProgressBar value={75} />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
  });

  it('should have aria-label from label prop', () => {
    render(<ProgressBar value={50} label="Upload Progress" />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-label', 'Upload Progress');
  });

  it('should have default aria-label when no label provided', () => {
    render(<ProgressBar value={50} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-label', 'Progress');
  });
});
