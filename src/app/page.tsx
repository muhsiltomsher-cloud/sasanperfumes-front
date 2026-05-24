import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { siteConfig } from "@/config/site";

function detectLocaleFromAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return siteConfig.defaultLocale;
  const locales = siteConfig.locales as readonly string[];
  const preferredLocale = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().substring(0, 2))
    .find((lang) => locales.includes(lang));
  return preferredLocale || siteConfig.defaultLocale;
}

export default async function Home() {
  const h = await headers();
  const acceptLanguage = h.get("accept-language");
  const locale = detectLocaleFromAcceptLanguage(acceptLanguage);
  redirect(`/${locale}`);
}
