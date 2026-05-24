"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Loader2 } from "lucide-react";

interface MobileEnhancementsProps {
  children: React.ReactNode;
}

export function MobileEnhancements({ children }: MobileEnhancementsProps) {
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, [router]);

  const { pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  return (
    <>
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
    </>
  );
}
