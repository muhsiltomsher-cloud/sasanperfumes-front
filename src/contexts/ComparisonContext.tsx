"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { WCProduct } from "@/types/woocommerce";

const MAX = 3;

interface ComparisonContextValue {
  items: WCProduct[];
  add: (product: WCProduct) => void;
  remove: (id: number) => void;
  has: (id: number) => boolean;
  clear: () => void;
  isFull: boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WCProduct[]>([]);

  const add = useCallback((product: WCProduct) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id) || prev.length >= MAX) return prev;
      return [...prev, product];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const has = useCallback((id: number) => items.some((p) => p.id === id), [items]);
  const clear = useCallback(() => setItems([]), []);

  return (
    <ComparisonContext.Provider value={{ items, add, remove, has, clear, isFull: items.length >= MAX }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error("useComparison must be used inside ComparisonProvider");
  return ctx;
}
