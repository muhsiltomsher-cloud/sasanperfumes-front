import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendHeaders, backendPostHeaders } from "@/lib/utils/backendFetch";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const product_id = searchParams.get("product_id");
  const email = searchParams.get("email");
  try {
    const res = await fetch(
      `${API_BASE}/wp-json/sasanperfumes/v1/stock-alerts/check?product_id=${product_id}&email=${encodeURIComponent(email || "")}`,
      { headers: backendHeaders() }
    );
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ subscribed: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/stock-alerts`, {
      method: "POST",
      headers: backendPostHeaders(),
      body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Network error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/stock-alerts`, {
      method: "DELETE",
      headers: backendPostHeaders(),
      body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Network error" }, { status: 500 });
  }
}
