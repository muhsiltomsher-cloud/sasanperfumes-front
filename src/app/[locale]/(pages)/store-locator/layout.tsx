import type { Metadata } from "next";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { type Locale } from "@/config/site";

interface StoreLocatorLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isRTL = locale === "ar";

  return generateSeoMetadata({
    title: isRTL ? "ساسان للعطور | التواصل والخدمات" : "Sasan Perfumes | Contact & Services",
    description: isRTL
      ? "تواصل مع ساسان للعطور لمعرفة المزيد عن العطور، معطرات الشعر، بخاخات الجسم، أطقم الهدايا، وخدمات التصنيع الخاص."
      : "Contact Sasan Perfumes for perfumes, hair mist, all over sprays, gift sets, and private-label perfume services.",
    locale: locale as Locale,
    pathname: "/store-locator",
    keywords: isRTL
      ? ["ساسان للعطور", "متجر عطور الإمارات", "عطور", "معطر الشعر", "بخاخ الجسم", "أطقم هدايا", "تصنيع عطور خاص", "تواصل معنا"]
      : ["Sasan Perfumes", "UAE perfume store", "perfumes", "hair mist", "all over spray", "gift sets", "private labeling", "contact Sasan Perfumes"],
  });
}

export default function StoreLocatorLayout({ children }: StoreLocatorLayoutProps) {
  return <>{children}</>;
}
