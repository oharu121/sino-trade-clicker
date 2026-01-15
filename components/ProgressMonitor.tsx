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
  const hasScrolledToMonitorRef = useRef<boolean>(false);

  // Auto-scroll to monitor ONCE when operation starts
  useEffect(() => {
    if (operation.status === 'running' && !hasScrolledToMonitorRef.current && monitorRef.current) {
      monitorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      hasScrolledToMonitorRef.current = true;
    } else if (operation.status === 'idle') {
      // Reset flag when operation is reset
      hasScrolledToMonitorRef.current = false;
    }
  }, [operation.status]);

  // Disable auto-scroll activity log during execution to prevent fighting user scrolling
  // Only auto-scroll when operation completes or errors
  useEffect(() => {
    const shouldAutoScroll = operation.status === 'completed' || operation.status === 'error';

    if (shouldAutoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activityLog, operation.status]);

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
        const failureRate = metrics.current > 0 ? metrics.failed / metrics.current : 0;
        let logType: LogType = 'success';
        let message = `已完成 ${metrics.current}/${config.count} 次請求 (成功: ${metrics.success}, 失敗: ${metrics.failed})`;

        // Determine log type based on consecutive failures and failure rate
        if (metrics.consecutiveFailures >= 2) {
          logType = 'error';
          message = `⚠️ 連續失敗 ${metrics.consecutiveFailures} 次！已完成 ${metrics.current}/${config.count} (成功: ${metrics.success}, 失敗: ${metrics.failed})`;
        } else if (failureRate > 0.5) {
          logType = 'error';
          message = `❌ 失敗率過高！已完成 ${metrics.current}/${config.count} (成功: ${metrics.success}, 失敗: ${metrics.failed})`;
        } else if (failureRate > 0.2 || metrics.consecutiveFailures >= 1) {
          logType = 'warning';
          message = `⚠️ 已完成 ${metrics.current}/${config.count} 次請求 (成功: ${metrics.success}, 失敗: ${metrics.failed})`;
        }

        const timestamp = Date.now();
        setActivityLog(prev => [
          ...prev.slice(-49), // Keep last 49 entries + new one = 50 total
          {
            id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp,
            type: logType,
            message,
            metadata: {
              current: metrics.current,
              success: metrics.success,
              failed: metrics.failed,
              consecutiveFailures: metrics.consecutiveFailures,
              avgResponseTime: metrics.averageResponseTime,
              failureRate: Math.round(failureRate * 100),
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

  // Status badge configuration
  const statusConfig = {
    running: { label: '運行中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', dot: 'bg-blue-500 animate-pulse' },
    paused: { label: '已暫停', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', dot: 'bg-amber-500' },
    completed: { label: '已完成', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', dot: 'bg-emerald-500' },
    error: { label: '錯誤', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', dot: 'bg-red-500' },
    idle: { label: '待機', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300', dot: 'bg-slate-500' },
  };

  const currentStatus = statusConfig[operation.status];

  return (
    <div ref={monitorRef} className="space-y-6 p-6 sm:p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl">
      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            執行進度
          </h3>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentStatus.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
            {currentStatus.label}
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

      {/* Consecutive Failures Warning */}
      {operation.status === 'running' && operation.metrics.consecutiveFailures >= 2 && (
        <div className="relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-linear-to-r from-yellow-500 to-orange-600 opacity-10"></div>
          <div className="relative p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-yellow-500 dark:border-yellow-600 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                警告：連續失敗 {operation.metrics.consecutiveFailures} 次 (達到 3 次將自動停止)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Progress */}
        <div className="group p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">進行中</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {operation.metrics.current}
          </div>
        </div>

        {/* Success Count */}
        <div className="group p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all duration-200 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">成功</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
            {operation.metrics.success}
          </div>
        </div>

        {/* Failed Count */}
        <div className="group p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 transition-all duration-200 hover:shadow-md hover:border-red-300 dark:hover:border-red-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-red-200 dark:bg-red-800 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">失敗</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-300 tabular-nums">
            {operation.metrics.failed}
          </div>
        </div>

        {/* Average Response Time */}
        <div className="group p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">回應</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">
            {operation.metrics.averageResponseTime}<span className="text-sm font-medium ml-0.5">ms</span>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">活動記錄</h3>
          <span className="ml-auto inline-flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full tabular-nums">
            {activityLog.length} 條記錄
          </span>
        </div>
        <div className="max-h-72 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
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
                  <div className="shrink-0 w-6 h-6 rounded-full bg-current opacity-20 flex items-center justify-center">
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
          <div className="absolute inset-0 bg-linear-to-r from-red-500 to-rose-600 opacity-10"></div>
          <div className="relative p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-red-500 dark:border-red-600 rounded-xl shadow-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-1">發生錯誤</h4>
                <p className="text-sm text-red-700 dark:text-red-400 mb-2">{operation.error}</p>

                {/* Helpful suggestions based on error type */}
                {operation.error.includes('404') && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-800 dark:text-red-300">💡 建議：文章可能已被刪除或URL不正確</p>
                  </div>
                )}
                {operation.error.includes('429') && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-800 dark:text-red-300">💡 建議：請求頻率過高，請增加間隔時間（建議 &gt;500ms）</p>
                  </div>
                )}
                {(operation.error.includes('WAF') || operation.error.includes('防火牆')) && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-800 dark:text-red-300">💡 建議：被防火牆阻擋，請稍後再試或聯繫管理員</p>
                  </div>
                )}
                {(operation.error.includes('timeout') || operation.error.includes('超時')) && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-800 dark:text-red-300">💡 建議：網路連線逾時，請檢查網路狀態或增加間隔時間</p>
                  </div>
                )}
                {operation.error.includes('連續失敗') && !operation.error.includes('404') && !operation.error.includes('429') && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-800 dark:text-red-300">💡 建議：連續失敗可能表示伺服器問題或網路不穩定，請稍後再試</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
