/**
 * Progress monitor component with stats and activity log
 * @module components/ProgressMonitor
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ProgressBar } from './ui/ProgressBar';
import type { BoostOperation, ActivityLogEntry, LogType } from '@/lib/types';

/**
 * ProgressMonitor props
 */
export interface ProgressMonitorProps {
  /** Boost operation state */
  operation: BoostOperation;
  /** Progress percentage (0-100) */
  progress: number;
}

/**
 * Progress Monitor Component
 *
 * Displays real-time progress with stats grid, progress bar, and activity log.
 * Auto-scrolls to view when operation starts.
 * Activity log shows timestamped entries with color coding.
 *
 * @example
 * ```tsx
 * <ProgressMonitor
 *   operation={boostOperationState}
 *   progress={75}
 * />
 * ```
 */
export function ProgressMonitor({
  operation,
  progress,
}: ProgressMonitorProps) {
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const monitorRef = useRef<HTMLDivElement>(null);
  const lastCurrentRef = useRef<number>(0);
  const lastStatusRef = useRef<string>('idle');

  // Auto-scroll to monitor when operation starts
  useEffect(() => {
    if (operation.status === 'running' && monitorRef.current) {
      monitorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [operation.status]);

  // Auto-scroll activity log to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activityLog]);

  // Generate activity log entries
  useEffect(() => {
    const { status, metrics, article, config, error } = operation;

    // Operation start
    if (status === 'running' && activityLog.length === 0) {
      const timestamp = Date.now();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActivityLog([{
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        type: 'info',
        message: `開始執行：${article?.title || '未知文章'}`,
        metadata: { count: config.count, interval: config.interval },
      }]);
      lastCurrentRef.current = 0;
      return;
    }

    // Progress updates (every 10 requests or on error)
    if (status === 'running' && metrics.current > lastCurrentRef.current) {
      const shouldLog = metrics.current % 10 === 0 ||
                       metrics.failed > 0 && metrics.current === lastCurrentRef.current + 1;

      if (shouldLog) {
        const logType: LogType = metrics.failed > metrics.success * 0.2 ? 'warning' : 'success';
        const timestamp = Date.now();
        setActivityLog(prev => [
          ...prev.slice(-49), // Keep last 49 entries + new one = 50 total
          {
            id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp,
            type: logType,
            message: `已完成 ${metrics.current}/${config.count} 次請求 (成功: ${metrics.success}, 失敗: ${metrics.failed})`,
            metadata: {
              current: metrics.current,
              success: metrics.success,
              failed: metrics.failed,
              avgResponseTime: metrics.averageResponseTime,
            },
          },
        ]);
      }

      lastCurrentRef.current = metrics.current;
    }

    // Operation complete (only log once on status change)
    if (status === 'completed' && lastStatusRef.current !== 'completed') {
      const timestamp = Date.now();
      setActivityLog(prev => [
        ...prev,
        {
          id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          type: 'success',
          message: `執行完成！總計 ${metrics.success} 次成功，${metrics.failed} 次失敗`,
          metadata: {
            duration: operation.timing.duration,
            avgResponseTime: metrics.averageResponseTime,
          },
        },
      ]);
    }

    // Operation error (only log once on status change)
    if (status === 'error' && error && lastStatusRef.current !== 'error') {
      const timestamp = Date.now();
      setActivityLog(prev => [
        ...prev,
        {
          id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          type: 'error',
          message: `執行錯誤：${error}`,
          metadata: { error },
        },
      ]);
    }

    // Operation paused (only log once on status change)
    if (status === 'paused' && lastStatusRef.current !== 'paused') {
      const timestamp = Date.now();
      setActivityLog(prev => [
        ...prev,
        {
          id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          type: 'warning',
          message: '操作已暫停',
        },
      ]);
    }

    // Track last status
    lastStatusRef.current = status;
  }, [operation, activityLog.length]);

  // Reset log when operation resets
  useEffect(() => {
    if (operation.status === 'idle' && activityLog.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActivityLog([]);
      lastCurrentRef.current = 0;
      lastStatusRef.current = 'idle';
    }
  }, [operation.status, activityLog.length]);

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // Log type colors
  const logColors: Record<LogType, string> = {
    info: 'text-blue-700 bg-blue-50 border-blue-200',
    success: 'text-green-700 bg-green-50 border-green-200',
    warning: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    error: 'text-red-700 bg-red-50 border-red-200',
  };

  if (operation.status === 'idle') {
    return null;
  }

  return (
    <div ref={monitorRef} className="space-y-6 p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl">
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            執行進度
          </h3>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {operation.status === 'running' ? '運行中' : operation.status === 'paused' ? '已暫停' : operation.status === 'completed' ? '已完成' : '錯誤'}
          </span>
        </div>
        <ProgressBar
          value={progress}
          label=""
          showPercentage
          variant={
            operation.status === 'completed' ? 'success' :
            operation.status === 'error' ? 'error' :
            operation.status === 'paused' ? 'warning' :
            'primary'
          }
          size="lg"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-slate-600/10 rounded-xl"></div>
          <div className="relative text-center p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
            <div className="text-3xl font-extrabold bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
              {operation.metrics.current}
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 uppercase tracking-wide">進行中</div>
          </div>
        </div>

        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl"></div>
          <div className="relative text-center p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-emerald-200 dark:border-emerald-800 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
            <div className="text-3xl font-extrabold bg-gradient-to-br from-emerald-600 to-green-700 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
              {operation.metrics.success}
            </div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-2 uppercase tracking-wide">成功</div>
          </div>
        </div>

        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-600/10 rounded-xl"></div>
          <div className="relative text-center p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-red-200 dark:border-red-800 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
            <div className="text-3xl font-extrabold bg-gradient-to-br from-red-600 to-rose-700 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
              {operation.metrics.failed}
            </div>
            <div className="text-xs font-semibold text-red-700 dark:text-red-400 mt-2 uppercase tracking-wide">失敗</div>
          </div>
        </div>

        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-xl"></div>
          <div className="relative text-center p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-blue-200 dark:border-blue-800 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
            <div className="text-3xl font-extrabold bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {operation.metrics.averageResponseTime}ms
            </div>
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-2 uppercase tracking-wide">平均回應</div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">活動記錄</h3>
          <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
            {activityLog.length} 條記錄
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto space-y-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-inner">
          {activityLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm text-slate-500 dark:text-slate-400">暫無活動記錄</p>
            </div>
          ) : (
            activityLog.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:shadow-md ${logColors[entry.type]}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-current opacity-20 flex items-center justify-center">
                    {entry.type === 'success' && (
                      <svg className="w-4 h-4 opacity-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {entry.type === 'error' && (
                      <svg className="w-4 h-4 opacity-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {entry.type === 'warning' && (
                      <svg className="w-4 h-4 opacity-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {entry.type === 'info' && (
                      <svg className="w-4 h-4 opacity-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold whitespace-nowrap opacity-75">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    <span className="text-sm font-medium leading-relaxed">{entry.message}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Error Message */}
      {operation.error && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 opacity-10"></div>
          <div className="relative p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-red-500 dark:border-red-600 rounded-xl shadow-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-1">發生錯誤</h4>
                <p className="text-sm text-red-700 dark:text-red-400">{operation.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
