import { NextRequest, NextResponse } from "next/server";
import { disableRuntimeCache } from "@/config/site";
import { API_BASE, backendHeaders, noCacheUrl, safeJsonResponse } from "@/lib/utils/backendFetch";

interface StoreApiProduct {
  id: number;
  categories: Array<{ id: number; name: string; slug: string }>;
  brands?: Array<{ id: number; name: string; slug: string }>;
}

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ categories: {} });
  }

  try {
    const url = `${API_BASE}/wp-json/wc/store/v1/products?include=${encodeURIComponent(ids)}&per_page=100`;
    const response = await fetch(noCacheUrl(url), {
      method: "GET",
      headers: backendHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json({ categories: {} });
    }

    const data = await safeJsonResponse(response);
    const products = Array.isArray(data) ? (data as unknown as StoreApiProduct[]) : [];
    const categories: Record<number, string> = {};
    const brands: Record<number, string> = {};

    for (const product of products) {
      if (product.categories?.[0]?.name) {
        categories[product.id] = product.categories[0].name;
      }
      if (product.brands?.[0]?.name) {
        brands[product.id] = product.brands[0].name;
      }
    }

    return NextResponse.json({ categories, brands }, {
      headers: {
        "Cache-Control": disableRuntimeCache ? "no-store, max-age=0" : "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ categories: {} });
  }
}
