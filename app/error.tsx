/**
 * Custom error page for application errors
 * @module app/error
 */

'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          發生錯誤
        </h2>
        <p className="text-gray-600 mb-8">
          應用程式遇到了一個錯誤。請嘗試重新載入頁面。
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新嘗試
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            返回首頁
          </button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-500">
            錯誤代碼: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
