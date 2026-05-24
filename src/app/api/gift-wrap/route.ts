import { NextResponse } from "next/server";
import { disableRuntimeCache } from "@/config/site";
import { API_BASE, backendHeaders } from "@/lib/utils/backendFetch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let cache: { data: unknown; ts: number } | null = null;
const TTL = 5 * 60 * 1000;

export async function GET() {
  if (!disableRuntimeCache && cache && Date.now() - cache.ts < TTL) return NextResponse.json(cache.data);
  try {
    const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/gift-wrap`, {
      headers: backendHeaders(),
      ...(disableRuntimeCache ? { cache: "no-store" as const } : { next: { revalidate: 300, tags: ["gift-wrap"] } }),
    });
    const data = await res.json();
    if (!disableRuntimeCache) cache = { data, ts: Date.now() };
    return NextResponse.json(data, {
      headers: { "Cache-Control": disableRuntimeCache ? "no-store, max-age=0" : "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
