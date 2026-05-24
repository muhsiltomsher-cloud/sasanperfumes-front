"use client";

import { useMemo } from "react";
import useSWR from "swr";
import {
  DEFAULT_PRODUCT_BADGE_TAGS,
  normalizeProductBadgeSettings,
  type ProductBadgeConfig,
  type ProductBadgeSettingsResponse,
} from "@/lib/productBadges";

const FALLBACK_RESPONSE: ProductBadgeSettingsResponse = {
  badge_tags: DEFAULT_PRODUCT_BADGE_TAGS,
};

async function fetchBadgeSettings(url: string): Promise<ProductBadgeSettingsResponse> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return FALLBACK_RESPONSE;
  return response.json() as Promise<ProductBadgeSettingsResponse>;
}

export function useProductBadgeSettings(): ProductBadgeConfig[] {
  const { data } = useSWR<ProductBadgeSettingsResponse>(
    "/api/badge-tags",
    fetchBadgeSettings,
    {
      fallbackData: FALLBACK_RESPONSE,
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  return useMemo(() => normalizeProductBadgeSettings(data), [data]);
}
