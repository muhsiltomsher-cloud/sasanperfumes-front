import { NextResponse } from "next/server";
import { API_BASE, backendHeaders, fetchBackend, safeJsonResponse } from "@/lib/utils/backendFetch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const fallbackHomeSettings = {
  hero: null,
  newProducts: null,
  bestseller: null,
  categories: null,
  featured: null,
  collections: null,
  banners: null,
  brandSlider: {
    enabled: true,
    title_en: "More from {brand}",
    title_ar: "المزيد من {brand}",
    count: 12,
    cols_desktop: 4,
    cols_tablet: 3,
    cols_mobile: 2,
    fallback: "category",
  },
};

function fallbackResponse() {
  return NextResponse.json(fallbackHomeSettings, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function GET() {
  try {
    const response = await fetchBackend(`${API_BASE}/wp-json/sasanperfumes/v1/home-settings`, {
      headers: backendHeaders(),
    });
    let data = await safeJsonResponse(response);

    if (!response.ok && (response.status === 403 || response.status === 404)) {
      const legacy = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/home-settings`);
      const legacyData = await safeJsonResponse(legacy);
      if (legacy.ok) {
        return NextResponse.json(legacyData, {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        });
      }
      return fallbackResponse();
    }

    if (!response.ok && data.code === "invalid_response") {
      const retry = await fetchBackend(`${API_BASE}/wp-json/sasanperfumes/v1/home-settings`);
      data = await safeJsonResponse(retry);

      if (!retry.ok) {
        return fallbackResponse();
      }
    } else if (!response.ok) {
      return fallbackResponse();
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.warn("Home settings fallback used:", error instanceof Error ? error.message : error);
    return fallbackResponse();
  }
}
