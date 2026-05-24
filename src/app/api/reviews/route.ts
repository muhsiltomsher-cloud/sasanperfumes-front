import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendHeaders, backendPostHeaders } from "@/lib/utils/backendFetch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

type MetaEntry = { key: string; value: unknown };

function extractImageIds(metaData: unknown): string[] {
  if (!Array.isArray(metaData)) return [];
  const entry = (metaData as MetaEntry[]).find(m => m.key === "_review_images");
  if (!entry?.value) return [];
  return String(entry.value).split(",").map(id => id.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const product_id = searchParams.get("product_id");
  const per_page = searchParams.get("per_page") || "10";
  const page = searchParams.get("page") || "1";

  if (!product_id) return NextResponse.json({ reviews: [], total: 0 });

  try {
    const wcKey = process.env.WC_CONSUMER_KEY;
    const wcSecret = process.env.WC_CONSUMER_SECRET;
    const hasWcAuth = Boolean(wcKey && wcSecret);

    if (hasWcAuth) {
      // WC REST API v3: returns meta_data so we can surface _review_images
      const basicAuth = `Basic ${Buffer.from(`${wcKey}:${wcSecret}`).toString("base64")}`;
      const res = await fetch(
        `${API_BASE}/wp-json/wc/v3/products/reviews?product=${product_id}&per_page=${per_page}&page=${page}&status=approved`,
        {
          headers: { ...backendHeaders() as Record<string, string>, Authorization: basicAuth },
          cache: "no-store",
        }
      );

      if (!res.ok) return NextResponse.json({ reviews: [], total: 0 });

      const raw = await res.json();
      const totalHeader = res.headers.get("x-wp-total");
      const total = totalHeader ? parseInt(totalHeader, 10) : (Array.isArray(raw) ? raw.length : 0);
      const reviews: Record<string, unknown>[] = Array.isArray(raw) ? raw : [];

      // Collect all unique image attachment IDs across all reviews
      const allImageIds: string[] = [];
      for (const r of reviews) {
        extractImageIds(r.meta_data).forEach(id => {
          if (!allImageIds.includes(id)) allImageIds.push(id);
        });
      }

      // Resolve IDs → URLs via WP media REST API (published media is public)
      const imageUrlMap: Record<string, string> = {};
      if (allImageIds.length > 0) {
        try {
          const mediaRes = await fetch(
            `${API_BASE}/wp-json/wp/v2/media?include=${allImageIds.join(",")}&per_page=100`,
            { headers: backendHeaders() as HeadersInit }
          );
          const mediaData = await mediaRes.json();
          if (Array.isArray(mediaData)) {
            for (const m of mediaData as { id: number; source_url?: string }[]) {
              if (m.id && m.source_url) imageUrlMap[String(m.id)] = m.source_url;
            }
          }
        } catch {
          // image resolution is non-fatal
        }
      }

      const mapped = reviews.map(r => {
        const imgIds = extractImageIds(r.meta_data);
        return {
          id: r.id,
          date_created: r.date_created,
          formatted_date_created: formatDate(String(r.date_created || "")),
          product_id: r.product_id,
          reviewer: r.reviewer,
          review: r.review,
          rating: r.rating,
          verified: r.verified,
          reviewer_avatar_urls: r.reviewer_avatar_urls || {},
          images: imgIds.map(id => imageUrlMap[id]).filter(Boolean),
        };
      });

      return NextResponse.json({ reviews: mapped, total });
    }

    // Fallback: Store API v1 (no meta_data, no images, but corrected product_id param)
    const res = await fetch(
      `${API_BASE}/wp-json/wc/store/v1/products/reviews?product_id=${product_id}&per_page=${per_page}&page=${page}`,
      { headers: backendHeaders() as HeadersInit, cache: "no-store" }
    );
    const data = await res.json();
    const totalHeader = res.headers.get("x-wp-total");
    const total = totalHeader ? parseInt(totalHeader, 10) : (Array.isArray(data) ? data.length : 0);
    const reviews = (Array.isArray(data) ? data : []).map((r: Record<string, unknown>) => ({
      ...r,
      images: [],
      formatted_date_created: formatDate(String(r.date_created || "")),
    }));
    return NextResponse.json({ reviews, total });
  } catch {
    return NextResponse.json({ reviews: [], total: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_ids, title, ...reviewBody } = body;
    const meta_data = [
      ...(image_ids?.length ? [{ key: "_review_images", value: image_ids.join(",") }] : []),
      ...(title ? [{ key: "_review_title", value: title }] : []),
    ];

    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    const wcKey = process.env.WC_CONSUMER_KEY;
    const wcSecret = process.env.WC_CONSUMER_SECRET;

    const hasBearer = Boolean(authHeader);
    const hasWcAuth = Boolean(wcKey && wcSecret);

    if (!hasBearer && !hasWcAuth) {
      return NextResponse.json(
        { success: false, message: "Reviews are not configured on the server." },
        { status: 500 }
      );
    }

    const basicAuth = hasWcAuth
      ? `Basic ${Buffer.from(`${wcKey}:${wcSecret}`).toString("base64")}`
      : null;

    const makeRequest = async (authorization: string | null) => {
      const res = await fetch(`${API_BASE}/wp-json/wc/v3/products/reviews`, {
        method: "POST",
        headers: backendPostHeaders(authorization ? { Authorization: authorization } : undefined),
        body: JSON.stringify({ ...reviewBody, meta_data }),
      });
      const data = await res.json();
      return { res, data };
    };

    let result = await makeRequest(hasBearer ? (authHeader as string) : basicAuth);

    if ((result.res.status === 401 || result.res.status === 403) && hasBearer && basicAuth) {
      result = await makeRequest(basicAuth);
    }

    if (!result.res.ok) {
      return NextResponse.json(
        { success: false, message: result.data?.message || "Failed to submit review" },
        { status: result.res.status }
      );
    }
    return NextResponse.json({ success: true, review: result.data });
  } catch {
    return NextResponse.json({ success: false, message: "Network error" }, { status: 500 });
  }
}
