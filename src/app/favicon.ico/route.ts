import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/api/wordpress";

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#2b1f18"/>
  <path d="M18 46V18h30v7H27v7h18v7H27v7h-9Z" fill="#f4eadf"/>
</svg>`;

export async function GET(request: NextRequest) {
  const siteSettings = await getSiteSettings(siteConfig.defaultLocale);
  const faviconUrl = siteSettings.favicon?.url;

  if (faviconUrl) {
    const proxiedFaviconUrl = faviconUrl.replace(
      /^https?:\/\/[^/]+\/wp-content\/uploads\//,
      "/cms-media/"
    );
    const redirectUrl = new URL(proxiedFaviconUrl, request.url);

    if (siteSettings.favicon?.id) {
      redirectUrl.searchParams.set("v", String(siteSettings.favicon.id));
    }

    return NextResponse.redirect(redirectUrl, {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  return new NextResponse(faviconSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
