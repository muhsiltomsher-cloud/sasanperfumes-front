"use client";

import { useCallback } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      window.location.reload();
    }
  }, [onRefresh]);

  const { pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  return (
    <div className="relative">
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed left-0 right-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-200"
          style={{
            top: Math.min(pullDistance - 40, 60),
            opacity: progress,
          }}
        >
          <div className="rounded-full bg-white p-2 shadow-lg">
            {isRefreshing ? (
              <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
            ) : (
              <svg
                className="h-6 w-6 text-brand-gold transition-transform duration-200"
                style={{ transform: `rotate(${progress * 180}deg)` }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12l7-7 7 7" />
              </svg>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
