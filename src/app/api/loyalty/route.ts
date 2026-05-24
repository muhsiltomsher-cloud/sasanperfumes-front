import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { API_BASE, backendHeaders, backendPostHeaders } from "@/lib/utils/backendFetch";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");

  if (action === "settings") {
    try {
      const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/loyalty/settings`, {
        headers: backendHeaders(),
      });
      return NextResponse.json(await res.json());
    } catch {
      return NextResponse.json({ enabled: false });
    }
  }

  if (action === "history") {
    const customer_id = searchParams.get("customer_id");
    try {
      const res = await fetch(
        `${API_BASE}/wp-json/sasanperfumes/v1/loyalty/history?customer_id=${customer_id || ""}`,
        { headers: { ...backendHeaders(), ...(authHeader ? { Authorization: authHeader } : {}) } }
      );
      if (!res.ok) return NextResponse.json([]);
      return NextResponse.json(await res.json());
    } catch {
      return NextResponse.json([]);
    }
  }

  const customer_id = searchParams.get("customer_id");
  try {
    const res = await fetch(
      `${API_BASE}/wp-json/sasanperfumes/v1/loyalty?customer_id=${customer_id || ""}`,
      { headers: { ...backendHeaders(), ...(authHeader ? { Authorization: authHeader } : {}) } }
    );
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ points: 0, value_aed: 0, can_redeem: false }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/loyalty/redeem`, {
      method: "POST",
      headers: { ...backendPostHeaders(), ...(authHeader ? { Authorization: authHeader } : {}) },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Network error" }, { status: 500 });
  }
}
