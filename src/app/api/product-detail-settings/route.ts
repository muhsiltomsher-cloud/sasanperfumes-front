import { NextResponse } from "next/server";
import { disableRuntimeCache } from "@/config/site";
import { API_BASE, backendHeaders } from "@/lib/utils/backendFetch";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/product-detail`, {
      headers: backendHeaders(),
      ...(disableRuntimeCache ? { cache: "no-store" as const } : { next: { revalidate: 300, tags: ["product-detail-settings"] } }),
    });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ variationStockBadge: true });
  }
}
