"use client";

import { useState, useEffect, useMemo, useRef } from "react";

const categoryCache = new Map<number, string>();
const brandCache = new Map<number, string>();

interface ProductMeta {
  categories: Record<number, string>;
  brands: Record<number, string>;
}

export function useProductCategories(productIds: number[]): Record<number, string> {
  const meta = useProductMeta(productIds);
  return meta.categories;
}

export function useProductBrands(productIds: number[]): Record<number, string> {
  const meta = useProductMeta(productIds);
  return meta.brands;
}

export function useProductMeta(productIds: number[]): ProductMeta {
  const [fetchedData, setFetchedData] = useState<ProductMeta>({ categories: {}, brands: {} });
  const prevIdsRef = useRef<string>("");

  const cachedCategories = useMemo(() => {
    const result: Record<number, string> = {};
    for (const id of productIds) {
      const name = categoryCache.get(id);
      if (name) result[id] = name;
    }
    return result;
  }, [productIds]);

  const cachedBrands = useMemo(() => {
    const result: Record<number, string> = {};
    for (const id of productIds) {
      const name = brandCache.get(id);
      if (name) result[id] = name;
    }
    return result;
  }, [productIds]);

  const uncachedIds = useMemo(() => {
    return productIds.filter((id) => !categoryCache.has(id));
  }, [productIds]);

  useEffect(() => {
    if (uncachedIds.length === 0) return;

    const idsKey = [...uncachedIds].sort((a, b) => a - b).join(",");
    if (idsKey === prevIdsRef.current) return;
    prevIdsRef.current = idsKey;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`/api/product-categories?ids=${uncachedIds.join(",")}`);
        const data = await response.json();
        if (cancelled) return;

        const fetchedCategories: Record<number, string> = data.categories || {};
        const fetchedBrands: Record<number, string> = data.brands || {};

        for (const [id, name] of Object.entries(fetchedCategories)) {
          categoryCache.set(Number(id), name as string);
        }
        for (const [id, name] of Object.entries(fetchedBrands)) {
          brandCache.set(Number(id), name as string);
        }

        setFetchedData({ categories: fetchedCategories, brands: fetchedBrands });
      } catch {
        // silently fail
      }
    })();

    return () => { cancelled = true; };
  }, [uncachedIds]);

  return useMemo(() => ({
    categories: { ...cachedCategories, ...fetchedData.categories },
    brands: { ...cachedBrands, ...fetchedData.brands },
  }), [cachedCategories, cachedBrands, fetchedData]);
}
