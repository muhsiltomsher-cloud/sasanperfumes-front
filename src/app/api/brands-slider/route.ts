import { NextResponse } from "next/server";
import { API_BASE, backendHeaders } from "@/lib/utils/backendFetch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/brands-slider`, {
      headers: backendHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ enabled: false, brands: [] });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ enabled: false, brands: [] });
  }
}
