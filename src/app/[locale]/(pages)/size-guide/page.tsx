import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { disableRuntimeCache, siteConfig } from "@/config/site";

interface SizeGuidePageProps {
  params: Promise<{ locale: string }>;
}

async function isSizeGuideEnabled(): Promise<boolean> {
  try {
    const res = await fetch(
      `${siteConfig.apiUrl}/wp-json/sasanperfumes/v1/advanced/scent-size-guide`,
      disableRuntimeCache ? { cache: "no-store" } : { next: { revalidate: 300 } }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data?.sizeGuide?.enabled === true;
  } catch {
    return false;
  }
}

export default async function SizeGuidePage({ params }: SizeGuidePageProps) {
  const { locale } = await params;
  const enabled = await isSizeGuideEnabled();
  if (!enabled) notFound();

  // When re-enabled in the future, CMS content will render here.
  // For now redirect to shop since no CMS content template exists yet.
  redirect(`/${locale}/shop`);
}
