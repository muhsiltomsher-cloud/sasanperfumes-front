"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { WCProductCard } from "./WCProductCard";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface RelatedProductsProps {
  products: WCProduct[];
  currentProductId: number;
  locale: Locale;
  bundleProductSlugs?: string[];
  title?: string;
  subtitle?: string;
}

export function RelatedProducts({
  products,
  currentProductId,
  locale,
  bundleProductSlugs = [],
  title,
  subtitle,
}: RelatedProductsProps) {
  const isRTL = locale === "ar";

  const filteredProducts = products.filter((p) => p.id !== currentProductId);

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-brand-primary/15 pt-12">
      <div className="mb-8 flex items-center justify-between px-5 md:px-7 lg:px-12">
        <div>
          <h2 className="text-2xl font-bold text-brand-primary">
            {title || (isRTL ? "منتجات ذات صلة" : "Related Products")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {subtitle || (isRTL ? "قد يعجبك أيضاً" : "You may also like")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="related-slider-prev border border-brand-border/40 bg-white p-2 text-brand-primary transition-all hover:border-brand-border/60 hover:bg-brand-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={isRTL ? "التالي" : "Previous"}
          >
            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="related-slider-next border border-brand-border/40 bg-white p-2 text-brand-primary transition-all hover:border-brand-border/60 hover:bg-brand-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={isRTL ? "السابق" : "Next"}
          >
            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden border-t border-l border-[#e7ded7]">
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={0}
          slidesPerView={1.5}
          freeMode={{
            enabled: true,
            sticky: false,
            momentumRatio: 0.5,
            momentumVelocityRatio: 0.5,
          }}
          navigation={{
            prevEl: ".related-slider-prev",
            nextEl: ".related-slider-next",
          }}
          breakpoints={{
            480: {
              slidesPerView: 2,
              spaceBetween: 0,
            },
            640: {
              slidesPerView: 2.5,
              spaceBetween: 0,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 0,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 0,
            },
          }}
          className="related-products-slider"
        >
          {filteredProducts.slice(0, 8).map((product) => (
            <SwiperSlide key={product.id}>
              <WCProductCard product={product} locale={locale} bundleProductSlugs={bundleProductSlugs} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
