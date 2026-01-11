/**
 * Custom hook for managing boost operation state
 * @module hooks/useBoostOperation
 */

'use client';

import { useReducer, useCallback, useRef, useEffect } from 'react';
import type { Article, BoostOperation } from '@/lib/types';
import { startBoost, type BoostController, type BoostProgress } from '@/lib/boostService';

/**
 * Action types for boost operation reducer
 */
type BoostAction =
  | { type: 'START'; payload: { article: Article; count: number; interval: number } }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'UPDATE_PROGRESS'; payload: BoostProgress }
  | { type: 'COMPLETE' }
  | { type: 'ERROR'; payload: string }
  | { type: 'AUTO_STOP'; payload: { reason: string; consecutiveFailures: number } };

/**
 * Initial boost operation state
 */
const initialState: BoostOperation = {
  status: 'idle',
  article: null,
  config: {
    count: 200,
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
};

/**
 * Calculate average response time
 */
function calculateAverageResponseTime(responseTimes: number[]): number {
  if (responseTimes.length === 0) return 0;
  const sum = responseTimes.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / responseTimes.length);
}

/**
 * Boost operation reducer
 */
function boostReducer(state: BoostOperation, action: BoostAction): BoostOperation {
  switch (action.type) {
    case 'START':
      return {
        ...initialState,
        status: 'running',
        article: action.payload.article,
        config: {
          count: action.payload.count,
          interval: action.payload.interval,
        },
        timing: {
          ...initialState.timing,
          startTime: Date.now(),
        },
      };

    case 'PAUSE':
      return {
        ...state,
        status: 'paused',
      };

    case 'RESUME':
      return {
        ...state,
        status: 'running',
      };

    case 'RESET':
      return initialState;

    case 'UPDATE_PROGRESS': {
      const { current, success: isSuccess, responseTime, consecutiveFailures } = action.payload;

      const newResponseTimes = [...state.metrics.responseTimes, responseTime];
      const newSuccess = state.metrics.success + (isSuccess ? 1 : 0);
      const newFailed = state.metrics.failed + (isSuccess ? 0 : 1);

      return {
        ...state,
        metrics: {
          current: current + 1, // Increment current count
          success: newSuccess,
          failed: newFailed,
          consecutiveFailures,
          responseTimes: newResponseTimes,
          averageResponseTime: calculateAverageResponseTime(newResponseTimes),
        },
      };
    }

    case 'COMPLETE': {
      const endTime = Date.now();
      const duration = state.timing.startTime
        ? (endTime - state.timing.startTime - state.timing.pausedDuration) / 1000
        : 0;

      return {
        ...state,
        status: 'completed',
        timing: {
          ...state.timing,
          endTime,
          duration,
        },
      };
    }

    case 'ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload,
        timing: {
          ...state.timing,
          endTime: Date.now(),
        },
      };

    case 'AUTO_STOP':
      return {
        ...state,
        status: 'error',
        error: `自動停止：${action.payload.reason} (連續失敗 ${action.payload.consecutiveFailures} 次)`,
        timing: {
          ...state.timing,
          endTime: Date.now(),
        },
      };

    default:
      return state;
  }
}

/**
 * Hook return interface
 */
export interface UseBoostOperationReturn {
  /** Current operation state */
  state: BoostOperation;

  /** Start boost operation */
  start: (article: Article, count: number, interval: number) => void;

  /** Pause operation */
  pause: () => void;

  /** Resume operation */
  resume: () => void;

  /** Reset operation to initial state */
  reset: () => void;

  /** Get current progress percentage (0-100) */
  getProgress: () => number;
}

/**
 * Custom hook for managing boost operation state
 *
 * Provides state management for article view boosting with start, pause, resume, and reset actions.
 * Tracks metrics including success/fail counts, response times, and operation timing.
 *
 * @returns Boost operation state and control functions
 *
 * @example
 * ```tsx
 * function BoostController() {
 *   const { state, start, pause, resume, reset, getProgress } = useBoostOperation();
 *
 *   const handleStart = () => {
 *     if (state.article) {
 *       start(state.article, 200, 300);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <div>Progress: {getProgress()}%</div>
 *       <button onClick={handleStart} disabled={state.status === 'running'}>
 *         Start
 *       </button>
 *       <button onClick={pause} disabled={state.status !== 'running'}>
 *         Pause
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBoostOperation(): UseBoostOperationReturn {
  const [state, dispatch] = useReducer(boostReducer, initialState);
  const controllerRef = useRef<BoostController | null>(null);
  const pauseStartTimeRef = useRef<number | null>(null);

  // Cleanup controller on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.cancel();
    };
  }, []);

  /**
   * Start boost operation
   */
  const start = useCallback((article: Article, count: number, interval: number) => {
    // Cancel any existing operation
    if (controllerRef.current) {
      controllerRef.current.cancel();
    }

    // Dispatch START action
    dispatch({ type: 'START', payload: { article, count, interval } });

    // Start boost service
    const controller = startBoost(
      { article, count, interval },
      {
        onProgress: (progress: BoostProgress) => {
          dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
        },
        onComplete: () => {
          dispatch({ type: 'COMPLETE' });
          controllerRef.current = null;
        },
        onError: (error: string) => {
          dispatch({ type: 'ERROR', payload: error });
          controllerRef.current = null;
        },
        onAutoStop: (reason: string, consecutiveFailures: number) => {
          dispatch({ type: 'AUTO_STOP', payload: { reason, consecutiveFailures } });
          controllerRef.current = null;
        },
      }
    );

    controllerRef.current = controller;
  }, []);

  /**
   * Pause operation
   */
  const pause = useCallback(() => {
    if (controllerRef.current && state.status === 'running') {
      controllerRef.current.pause();
      pauseStartTimeRef.current = Date.now();
      dispatch({ type: 'PAUSE' });
    }
  }, [state.status]);

  /**
   * Resume operation
   */
  const resume = useCallback(() => {
    if (controllerRef.current && state.status === 'paused') {
      controllerRef.current.resume();

      // Reset pause tracking
      pauseStartTimeRef.current = null;

      dispatch({ type: 'RESUME' });
    }
  }, [state.status]);

  /**
   * Reset operation
   */
  const reset = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.cancel();
      controllerRef.current = null;
    }
    pauseStartTimeRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  /**
   * Get current progress percentage
   */
  const getProgress = useCallback(() => {
    if (state.config.count === 0) return 0;
    return Math.round((state.metrics.current / state.config.count) * 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.config.count, state.metrics.current]);

  return {
    state,
    start,
    pause,
    resume,
    reset,
    getProgress,
  };
}
