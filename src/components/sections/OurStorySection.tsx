import Image from "next/image";
import { shouldUseUnoptimizedImage } from "@/lib/utils/image";

interface OurStoryStat {
  value: string;
  label: string;
}

interface OurStorySectionProps {
  eyebrow?: string;
  title?: string;
  description1?: string;
  description2?: string;
  image?: string;
  stats?: OurStoryStat[];
}

export function OurStorySection({
  eyebrow,
  title,
  description1,
  description2,
  image,
  stats,
}: OurStorySectionProps) {
  const visibleStats = stats?.filter((stat) => stat.value || stat.label) ?? [];
  const hasText = eyebrow || title || description1 || description2 || visibleStats.length > 0;

  if (!hasText && !image) return null;

  return (
    <section className="bg-white pt-10 pb-0 md:pt-12 lg:pt-16">
      <div className="mx-4 sm:mx-6 lg:mx-8">
        <div className="relative overflow-hidden border-y border-[#e5e5e5] bg-[#f7f7f5]">
          <div className={`grid ${image ? "lg:grid-cols-12" : ""}`}>
            {hasText && (
              <div className={`${image ? "lg:col-span-5" : "mx-auto max-w-4xl"} px-6 py-10 md:px-10 md:py-14 lg:px-14 xl:px-16`}>
                {eyebrow && (
                  <p className="mb-5 max-w-fit border-b border-brand-gold/50 pb-2 text-[11px] font-normal uppercase tracking-[0.22em] text-brand-primary/55">
                    {eyebrow}
                  </p>
                )}

                {title && (
                  <h2 className="max-w-xl text-3xl font-normal leading-[1.08] text-brand-primary md:text-4xl lg:text-[2.75rem]">
                    {title}
                  </h2>
                )}

                {(description1 || description2) && (
                  <div className="mt-7 space-y-4 border-s border-brand-primary/10 ps-5 md:mt-8 md:ps-6">
                    {description1 && (
                      <p className="text-sm leading-7 text-brand-primary/70 md:text-[15px] md:leading-8">
                        {description1}
                      </p>
                    )}
                    {description2 && (
                      <p className="text-sm leading-7 text-brand-primary/65 md:text-[15px] md:leading-8">
                        {description2}
                      </p>
                    )}
                  </div>
                )}

                {visibleStats.length > 0 && (
                  <div className="mt-9 grid overflow-hidden border border-[#dedede] bg-white/70 sm:grid-cols-3">
                    {visibleStats.map((stat, i) => (
                      <div
                        key={`${stat.value}-${stat.label}-${i}`}
                        className="border-b border-[#dedede] px-4 py-5 text-start last:border-b-0 sm:border-b-0 sm:border-e sm:last:border-e-0"
                      >
                        {stat.value && (
                          <p className="text-2xl font-normal leading-none text-brand-primary md:text-3xl">
                            {stat.value}
                          </p>
                        )}
                        {stat.label && (
                          <p className="mt-2 text-[10px] uppercase leading-4 tracking-[0.14em] text-brand-primary/50">
                            {stat.label}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {image && (
              <div className={`${hasText ? "lg:col-span-7" : ""} relative px-4 pb-4 md:px-8 md:pb-8 lg:p-8`}>
                <div className="relative min-h-[360px] overflow-hidden border border-white bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)] md:min-h-[480px] lg:min-h-[560px]">
                  <Image
                    src={image}
                    alt={title || ""}
                    fill
                    loading="lazy"
                    sizes={hasText ? "(max-width: 1024px) 100vw, 58vw" : "100vw"}
                    className="object-cover"
                    unoptimized={shouldUseUnoptimizedImage(image)}
                  />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/25" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
