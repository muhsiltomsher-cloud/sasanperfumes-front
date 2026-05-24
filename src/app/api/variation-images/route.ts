import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendHeaders } from "@/lib/utils/backendFetch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("product_id");
  if (!productId) return NextResponse.json([]);
  try {
    const res = await fetch(
      `${API_BASE}/wp-json/sasanperfumes/v1/product-variation-images?product_id=${productId}`,
      {
        headers: backendHeaders(),
        cache: "no-store",
      }
    );
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json([]);
  }
}
