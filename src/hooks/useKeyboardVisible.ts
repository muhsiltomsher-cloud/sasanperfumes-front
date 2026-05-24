"use client";

import { useState, useEffect } from "react";

export function useKeyboardVisible(): boolean {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const threshold = 150;

    const handleResize = () => {
      const heightDiff = window.innerHeight - (viewport?.height ?? window.innerHeight);
      setIsKeyboardVisible(heightDiff > threshold);
    };

    viewport.addEventListener("resize", handleResize);
    viewport.addEventListener("scroll", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", handleResize);
    };
  }, []);

  return isKeyboardVisible;
}
