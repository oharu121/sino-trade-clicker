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
    <div ref={monitorRef} className="space-y-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Progress Bar */}
      <div>
        <ProgressBar
          value={progress}
          label="執行進度"
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
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {operation.metrics.current}
          </div>
          <div className="text-sm text-gray-500">進行中</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {operation.metrics.success}
          </div>
          <div className="text-sm text-gray-500">成功</div>
        </div>

        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {operation.metrics.failed}
          </div>
          <div className="text-sm text-gray-500">失敗</div>
        </div>

        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {operation.metrics.averageResponseTime}ms
          </div>
          <div className="text-sm text-gray-500">平均回應</div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">活動記錄</h3>
        <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
          {activityLog.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">暫無記錄</p>
          ) : (
            activityLog.map((entry) => (
              <div
                key={entry.id}
                className={`p-2 rounded border ${logColors[entry.type]}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono whitespace-nowrap">
                    {formatTime(entry.timestamp)}
                  </span>
                  <span className="text-sm flex-1">{entry.message}</span>
                </div>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Error Message */}
      {operation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{operation.error}</p>
        </div>
      )}
    </div>
  );
}
