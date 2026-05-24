import { NextResponse } from "next/server";
import { API_BASE, backendHeaders, fetchBackend } from "@/lib/utils/backendFetch";
import {
  normalizeProductBadgeSettings,
  type ProductBadgeSettingsResponse,
} from "@/lib/productBadges";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetchBackend(`${API_BASE}/wp-json/sasanperfumes/v1/badge-tags`, {
      headers: backendHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Badge tags request failed: ${response.status}`);
    }

    const data = await response.json() as ProductBadgeSettingsResponse;
    return NextResponse.json(
      { badge_tags: normalizeProductBadgeSettings(data) },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { badge_tags: normalizeProductBadgeSettings(null) },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
