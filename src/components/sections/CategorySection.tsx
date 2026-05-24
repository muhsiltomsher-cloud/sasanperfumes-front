"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import { SectionHeaderSkeleton, Skeleton } from "@/components/common/Skeleton";
import type { WCCategory } from "@/types/woocommerce";
import type { Locale } from "@/config/site";
import type { CategorySectionSettings } from "@/types/wordpress";
import { decodeHtmlEntities, BLUR_DATA_URL } from "@/lib/utils";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ExtraCategoryItem {
  id: string;
  name: { en: string; ar: string };
  slug: string;
  href: string;
  image?: string;
}

interface CategorySectionProps {
  settings: CategorySectionSettings;
  categories: WCCategory[];
  locale: Locale;
  isRTL?: boolean;
  viewAllText?: string;
  productsText?: string;
  className?: string;
  isLoading?: boolean;
  englishCategorySlugs?: Record<number, string>;
  extraItems?: ExtraCategoryItem[];
  fallbackImages?: Record<number, { src: string; alt: string } | undefined>;
}

function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="mt-3 space-y-2 p-1">
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function CategorySectionSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="bg-[#f8f3ef] pt-8 md:pt-10 lg:pt-12 pb-0">
      <div className="mb-8 px-5 md:px-7 lg:px-12 md:mb-10">
        <SectionHeaderSkeleton />
      </div>
      <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: count }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function CategorySection({
  settings,
  categories,
  locale,
  isRTL = false,
  className = "",
  isLoading = false,
  englishCategorySlugs = {},
  extraItems = [],
  fallbackImages = {},
}: CategorySectionProps) {
  if (isLoading) {
    return <CategorySectionSkeleton count={settings.categories_count || 6} />;
  }

  if (!settings.enabled || categories.length === 0) {
    return null;
  }

  const selectedIds = settings.selected_category_ids;
  let displayCategories: WCCategory[];
  if (selectedIds && selectedIds.length > 0) {
    const categoryById = new Map<number, WCCategory>();
    categories.forEach((cat) => categoryById.set(cat.id, cat));
    displayCategories = selectedIds
      .map((id) => categoryById.get(id))
      .filter((cat): cat is WCCategory => cat !== undefined);
  } else {
    displayCategories = categories
      .filter((cat) => cat.parent === 0 && cat.slug !== "uncategorized")
      .slice(0, settings.categories_count);
  }

  if (displayCategories.length === 0) {
    return null;
  }

  const allItems = [
    ...displayCategories.map((cat) => ({ type: "category" as const, data: cat })),
    ...extraItems.map((item) => ({ type: "extra" as const, data: item })),
  ];

  const navPrefix = `category-slider-${settings.section_title?.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "") || "default"}`;
  const cols = settings.responsive_columns ?? { desktop: 5, tablet: 4, mobile: 2 };

  const getVisibilityClass = () => {
    if (settings.hide_on_mobile && settings.hide_on_desktop) return "hidden";
    if (settings.hide_on_mobile) return "hidden md:block";
    if (settings.hide_on_desktop) return "md:hidden";
    return "";
  };

  return (
    <section className={`bg-[#f8f3ef] pt-8 md:pt-10 lg:pt-12 pb-0 ${className} ${getVisibilityClass()}`}>
      <div className="mb-6 flex items-end justify-between gap-4 px-5 md:px-7 lg:px-12 md:mb-8">
        <div className={`${isRTL ? "text-right" : "text-left"}`}>
          <h2 className="font-normal text-2xl text-brand-primary md:text-3xl">
            {settings.section_title}
          </h2>
          {settings.section_subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-brand-primary/70 md:text-base">
              {settings.section_subtitle}
            </p>
          )}
        </div>

        {/* Navigation Arrows — inline with title */}
        {allItems.length > 2 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`${navPrefix}-prev flex h-9 w-9 items-center justify-center border border-[#e7ded7] bg-white text-brand-primary transition-colors hover:bg-brand-primary hover:text-white md:h-10 md:w-10`}
              aria-label="Previous"
            >
              <ChevronLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            </button>
            <button
              type="button"
              className={`${navPrefix}-next flex h-9 w-9 items-center justify-center border border-[#e7ded7] bg-white text-brand-primary transition-colors hover:bg-brand-primary hover:text-white md:h-10 md:w-10`}
              aria-label="Next"
            >
              <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* Swiper Slider */}
      <div className="relative category-section-slider">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={cols.mobile}
            navigation={{
              prevEl: `.${navPrefix}-prev`,
              nextEl: `.${navPrefix}-next`,
            }}
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet swiper-bullet-brown",
              bulletActiveClass: "swiper-pagination-bullet-active swiper-bullet-brown-active",
            }}
            breakpoints={{
              640:  { slidesPerView: cols.mobile,  spaceBetween: 0 },
              768:  { slidesPerView: cols.tablet,  spaceBetween: 0 },
              1024: { slidesPerView: cols.desktop, spaceBetween: 0 },
            }}
            loop={allItems.length > 5}
            className="!pb-12"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {allItems.map((item) => {
              if (item.type === "category") {
                const category = item.data as WCCategory;
                const categorySlugForUrl = englishCategorySlugs[category.id] || category.slug;
                const categoryImage = category.image?.src
                  ? { src: category.image.src, alt: category.image.alt || decodeHtmlEntities(category.name) }
                  : fallbackImages[category.id];
                return (
                  <SwiperSlide key={category.slug}>
                    <Link
                      href={`/${locale}/category/${categorySlugForUrl}`}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-white border border-[#e7ded7]">
                        {categoryImage?.src ? (
                          <Image
                            src={categoryImage.src}
                            alt={categoryImage.alt || decodeHtmlEntities(category.name)}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL={BLUR_DATA_URL}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-stone-200">
                            <span className="text-stone-400">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <h3 className="text-sm font-normal text-brand-primary lowercase">
                          {decodeHtmlEntities(category.name)}
                        </h3>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              }

              const extra = item.data as ExtraCategoryItem;
              return (
                <SwiperSlide key={extra.id}>
                  <Link href={extra.href} className="group flex flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden bg-white border border-[#e7ded7]">
                      {extra.image ? (
                        <Image
                          src={extra.image}
                          alt={extra.name[locale]}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-200">
                          <span className="text-stone-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm font-normal text-brand-primary lowercase">
                        {extra.name[locale]}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

      </div>
    </section>
  );
}
