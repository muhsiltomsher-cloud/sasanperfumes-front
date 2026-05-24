import { NextResponse } from "next/server";
import { disableRuntimeCache } from "@/config/site";
import { API_BASE, backendHeaders } from "@/lib/utils/backendFetch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let cache: { data: unknown; ts: number } | null = null;
const TTL = 10 * 60 * 1000;

export async function GET() {
  if (!disableRuntimeCache && cache && Date.now() - cache.ts < TTL) return NextResponse.json(cache.data);
  try {
    const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/live-chat`, {
      headers: backendHeaders(),
      ...(disableRuntimeCache ? { cache: "no-store" as const } : { next: { revalidate: 600, tags: ["live-chat"] } }),
    });
    const data = await res.json();
    if (!disableRuntimeCache) cache = { data, ts: Date.now() };
    return NextResponse.json(data, {
      headers: { "Cache-Control": disableRuntimeCache ? "no-store, max-age=0" : "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
