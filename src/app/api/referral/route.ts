import { NextRequest, NextResponse } from "next/server";
import { disableRuntimeCache } from "@/config/site";
import { API_BASE, backendHeaders, backendPostHeaders } from "@/lib/utils/backendFetch";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");

  if (action === "settings") {
    try {
      const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/referral/settings`, {
        headers: backendHeaders(),
        ...(disableRuntimeCache ? { cache: "no-store" as const } : { next: { revalidate: 300, tags: ["referral"] } }),
      });
      if (!res.ok) return NextResponse.json({ enabled: false });
      return NextResponse.json(await res.json());
    } catch {
      return NextResponse.json({ enabled: false });
    }
  }

  const customer_id = searchParams.get("customer_id");
  try {
    const res = await fetch(
      `${API_BASE}/wp-json/sasanperfumes/v1/referral?customer_id=${customer_id || ""}`,
      { headers: { ...backendHeaders(), ...(authHeader ? { Authorization: authHeader } : {}) } }
    );
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ referral_code: "", referral_url: "", referral_count: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/referral/register`, {
      method: "POST",
      headers: backendPostHeaders(),
      body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Network error" }, { status: 500 });
  }
}
