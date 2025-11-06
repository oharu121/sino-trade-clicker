/**
 * Boost controls component for configuring and starting operations
 * @module components/BoostControls
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { Article, BoostStatus } from '@/lib/types';
import { VALIDATION } from '@/lib/constants';

/**
 * BoostControls props
 */
export interface BoostControlsProps {
  /** Selected article to boost */
  article: Article | null;
  /** Current operation status */
  status: BoostStatus;
  /** Default count value */
  defaultCount: number;
  /** Default interval value */
  defaultInterval: number;
  /** Start operation handler */
  onStart: (count: number, interval: number) => void;
  /** Pause operation handler */
  onPause?: () => void;
  /** Resume operation handler */
  onResume?: () => void;
  /** Reset operation handler */
  onReset?: () => void;
}

/**
 * Boost Controls Component
 *
 * Form for configuring and controlling boost operations.
 * Includes validation, start/pause/resume/reset buttons.
 *
 * @example
 * ```tsx
 * <BoostControls
 *   article={selectedArticle}
 *   status={operation.status}
 *   defaultCount={200}
 *   defaultInterval={300}
 *   onStart={(count, interval) => start(article, count, interval)}
 *   onPause={pause}
 *   onResume={resume}
 *   onReset={reset}
 * />
 * ```
 */
export function BoostControls({
  article,
  status,
  defaultCount,
  defaultInterval,
  onStart,
  onPause,
  onResume,
  onReset,
}: BoostControlsProps) {
  const [count, setCount] = useState<string>(defaultCount.toString());
  const [interval, setInterval] = useState<string>(defaultInterval.toString());
  const [countError, setCountError] = useState<string>('');
  const [intervalError, setIntervalError] = useState<string>('');

  // Update form values when defaults change (e.g., tab switch)
  useEffect(() => {
    if (status === 'idle') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(defaultCount.toString());
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInterval(defaultInterval.toString());
    }
  }, [defaultCount, defaultInterval, status]);

  /**
   * Validate count value
   */
  const validateCount = (value: string): boolean => {
    const num = parseInt(value, 10);

    if (isNaN(num)) {
      setCountError('請輸入有效的數字');
      return false;
    }

    if (num < VALIDATION.MIN_COUNT) {
      setCountError(`最小值為 ${VALIDATION.MIN_COUNT}`);
      return false;
    }

    if (num > VALIDATION.MAX_COUNT) {
      setCountError(`最大值為 ${VALIDATION.MAX_COUNT.toLocaleString()}`);
      return false;
    }

    setCountError('');
    return true;
  };

  /**
   * Validate interval value
   */
  const validateInterval = (value: string): boolean => {
    const num = parseInt(value, 10);

    if (isNaN(num)) {
      setIntervalError('請輸入有效的數字');
      return false;
    }

    if (num < VALIDATION.MIN_INTERVAL) {
      setIntervalError(`最小間隔為 ${VALIDATION.MIN_INTERVAL}ms`);
      return false;
    }

    setIntervalError('');
    return true;
  };

  /**
   * Handle form submission
   */
  const handleStart = () => {
    const isCountValid = validateCount(count);
    const isIntervalValid = validateInterval(interval);

    if (!article) {
      return;
    }

    if (isCountValid && isIntervalValid) {
      onStart(parseInt(count, 10), parseInt(interval, 10));
    }
  };

  /**
   * Handle count input change
   */
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCount(value);
    if (value) {
      validateCount(value);
    } else {
      setCountError('');
    }
  };

  /**
   * Handle interval input change
   */
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInterval(value);
    if (value) {
      validateInterval(value);
    } else {
      setIntervalError('');
    }
  };

  const isIdle = status === 'idle';
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isDisabled = !article || status === 'running';

  // Check if currently running - controls should be sticky
  const shouldBeSticky = isRunning || isPaused;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="瀏覽次數"
          type="number"
          value={count}
          onChange={handleCountChange}
          error={countError}
          helperText={`${VALIDATION.MIN_COUNT} - ${VALIDATION.MAX_COUNT.toLocaleString()}`}
          min={VALIDATION.MIN_COUNT}
          max={VALIDATION.MAX_COUNT}
          disabled={!isIdle}
          fullWidth
        />

        <Input
          label="間隔時間 (ms)"
          type="number"
          value={interval}
          onChange={handleIntervalChange}
          error={intervalError}
          helperText={`最小 ${VALIDATION.MIN_INTERVAL}ms`}
          min={VALIDATION.MIN_INTERVAL}
          disabled={!isIdle}
          fullWidth
        />
      </div>

      {/* Sticky control buttons on mobile when operation is running */}
      <div className={shouldBeSticky ? 'sm:relative sm:z-auto' : ''}>
        <div className={`flex flex-col sm:flex-row gap-2 ${shouldBeSticky ? 'fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-slate-800 border-t-2 border-blue-500 dark:border-blue-600 shadow-2xl sm:relative sm:p-0 sm:bg-transparent sm:dark:bg-transparent sm:border-t-0 sm:shadow-none' : ''}`}>
          {isIdle && (
            <Button
              variant="primary"
              onClick={handleStart}
              disabled={isDisabled || !!countError || !!intervalError}
              fullWidth
            >
              開始執行
            </Button>
          )}

          {isRunning && onPause && (
            <Button
              variant="secondary"
              onClick={onPause}
              fullWidth
            >
              暫停
            </Button>
          )}

          {isPaused && onResume && (
            <Button
              variant="primary"
              onClick={onResume}
              fullWidth
            >
              繼續
            </Button>
          )}

          {(isPaused || status === 'completed' || status === 'error') && onReset && (
            <Button
              variant="secondary"
              onClick={onReset}
              fullWidth
            >
              重新開始
            </Button>
          )}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind sticky buttons on mobile */}
      {shouldBeSticky && <div className="h-16 sm:h-0" />}

      {!article && isIdle && (
        <p className="text-sm text-gray-500 text-center">
          請先選擇文章
        </p>
      )}
    </div>
  );
}
