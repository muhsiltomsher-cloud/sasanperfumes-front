import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { API_BASE, backendHeaders } from "@/lib/utils/backendFetch";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/wp-json/sasanperfumes/v1/scent-guide`, {
      headers: backendHeaders(),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      scentGuide: { enabled: false, title: "Scent Guide", titleAr: "دليل العطور", imageUrl: "", sections: [] },
      sizeGuide:  { enabled: false, title: "Size Guide",  titleAr: "دليل المقاسات", sizeChart: [] },
    });
  }
}
