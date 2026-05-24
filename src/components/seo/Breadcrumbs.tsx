import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { generateBreadcrumbJsonLd } from "@/lib/utils/seo";
import { siteConfig, type Locale } from "@/config/site";
import { cn, decodeHtmlEntities } from "@/lib/utils";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  locale: Locale;
  className?: string;
  contained?: boolean;
}

export function Breadcrumbs({ items, locale, className, contained = true }: BreadcrumbsProps) {
  const isRTL = locale === "ar";
  const isVisuallyHidden = typeof className === "string" && className.split(/\s+/).includes("sr-only");

  const allItems = [
    { name: isRTL ? "الرئيسية" : "Home", href: `/${locale}` },
    ...items,
  ];

  const jsonLdItems = allItems.map((item) => ({
    name: decodeHtmlEntities(item.name),
    url: `${siteConfig.url}${item.href}`,
  }));

  return (
    <>
      <JsonLd data={generateBreadcrumbJsonLd(jsonLdItems)} />
      <nav
        aria-label="Breadcrumb"
        className={cn(
          contained && !isVisuallyHidden && "bg-[#f8f3ef] px-5 pb-6 pt-8 text-brand-primary md:px-7 md:pb-8 md:pt-10 lg:px-12",
          !contained && !isVisuallyHidden && "py-3 md:py-4",
          className
        )}
      >
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <li key={item.href} className="flex items-center">
                {index === 0 ? (
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-500 hover:text-gray-900"
                    aria-label={decodeHtmlEntities(item.name)}
                  >
                    <Home className="h-4 w-4" />
                  </Link>
                ) : isLast ? (
                  <span className="font-medium text-gray-900" aria-current="page">
                    {decodeHtmlEntities(item.name)}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    {decodeHtmlEntities(item.name)}
                  </Link>
                )}
                {!isLast && (
                  <ChevronRight
                    className={cn(
                      "mx-1 h-4 w-4 text-gray-400",
                      isRTL && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
