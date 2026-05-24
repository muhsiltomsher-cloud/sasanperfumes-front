"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SwipeBackOptions {
  edgeThreshold?: number;
  minSwipeDistance?: number;
  enabled?: boolean;
}

export function useSwipeBack({
  edgeThreshold = 30,
  minSwipeDistance = 100,
  enabled = true,
}: SwipeBackOptions = {}) {
  const router = useRouter();
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isSwipingRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    if (touch.clientX <= edgeThreshold) {
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      isSwipingRef.current = true;
    }
  }, [enabled, edgeThreshold]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isSwipingRef.current || !enabled) return;
    isSwipingRef.current = false;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = Math.abs(touch.clientY - startYRef.current);

    if (deltaX > minSwipeDistance && deltaY < deltaX * 0.5) {
      router.back();
    }
  }, [enabled, minSwipeDistance, router]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);
}
