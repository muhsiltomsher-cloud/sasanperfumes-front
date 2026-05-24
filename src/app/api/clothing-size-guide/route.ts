import { NextRequest, NextResponse } from "next/server";
import { disableRuntimeCache } from "@/config/site";
import { API_BASE, backendHeaders } from "@/lib/utils/backendFetch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DISABLED = { enabled: false, template: null };

export async function GET(request: NextRequest) {
  const product_id = request.nextUrl.searchParams.get("product_id");
  if (!product_id) return NextResponse.json(DISABLED);

  try {
    const res = await fetch(
      `${API_BASE}/wp-json/sasanperfumes/v1/size-guide?product_id=${product_id}`,
      {
        headers: backendHeaders() as HeadersInit,
        ...(disableRuntimeCache ? { cache: "no-store" as const } : { next: { revalidate: 300, tags: [`size-guide-${product_id}`] } }),
      }
    );
    if (!res.ok) return NextResponse.json(DISABLED);
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": disableRuntimeCache ? "no-store, max-age=0" : "public, s-maxage=300, stale-while-revalidate=900" },
    });
  } catch {
    return NextResponse.json(DISABLED);
  }
}
