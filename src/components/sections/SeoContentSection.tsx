import Image from "next/image";
import { BLUR_DATA_URL, cn } from "@/lib/utils";
import { shouldUseUnoptimizedImage } from "@/lib/utils/image";

interface SeoContentSectionProps {
  title?: string;
  paragraphs: string[];
  backgroundImage?: string;
  isRTL?: boolean;
}

export function SeoContentSection({ title, paragraphs, backgroundImage, isRTL = false }: SeoContentSectionProps) {
  const splitWords = (text: string) =>
    text.split(" ").map((word, i) => (
      <span
        key={`${word}-${i}`}
        aria-hidden="true"
        className={cn("inline-block overflow-hidden", isRTL ? "ml-[0.3em]" : "mr-[0.3em]")}
      >
        {word}
      </span>
    ));

  return (
    <section
      data-section="seo-content"
      className="relative overflow-hidden bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_50%,#0f3460_100%)] py-16 md:py-20 lg:py-24"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          unoptimized={shouldUseUnoptimizedImage(backgroundImage)}
        />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-brand-primary/55" />

      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

      {/* Content - Title top, content mirrored at bottom for RTL */}
      <div className="relative w-full px-5 md:px-7 lg:px-12 py-8 md:py-10 lg:py-12">
        <div className="flex flex-col min-h-90 lg:min-h-110">
          {title && (
            <div
              className={cn(
                "flex flex-col justify-start pt-2 pb-6 lg:pt-3 lg:pb-8",
                isRTL ? "items-end" : "items-start"
              )}
            >
              <div className="mb-4 h-2 w-2 rounded-full bg-brand-gold" />

              <h2
                aria-label={title}
                className={cn(
                  "max-w-xl text-3xl font-semibold leading-tight tracking-wide text-white sm:text-4xl md:text-5xl lg:text-6xl",
                  isRTL ? "text-right" : "text-left"
                )}
              >
                {splitWords(title)}
              </h2>

              <div
                className={cn("mt-6 h-0.5 w-20 bg-brand-gold", isRTL ? "origin-right" : "origin-left")}
              />

              <div className={cn("mt-6 flex flex-col space-y-2", isRTL ? "items-end" : "items-start")}>
                <div className="h-px w-12 bg-brand-gold/40" />
                <div className="h-px w-8 bg-brand-gold/20" />
              </div>
            </div>
          )}

          <div
            className={cn(
              "flex max-w-xl flex-col justify-end space-y-0 pb-4 lg:pb-6",
              isRTL ? "mr-auto items-start" : "ml-auto items-end"
            )}
          >
            {paragraphs.map((p, idx) => (
              <div key={idx} className="group w-full">
                <p
                  className={cn(
                    "text-base leading-[1.8] text-white/80 transition-all duration-300 group-hover:text-white/95 md:text-lg md:leading-[1.95]",
                    isRTL ? "text-right" : "text-left"
                  )}
                >
                  {p}
                </p>
                {idx < paragraphs.length - 1 && (
                  <div
                    className={cn(
                      "mt-4 mb-4 h-px w-12",
                      isRTL
                        ? "bg-gradient-to-l from-brand-gold/40 to-transparent"
                        : "bg-gradient-to-r from-brand-gold/40 to-transparent"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "pointer-events-none absolute bottom-0 h-40 w-40 rounded-full bg-brand-gold/5 blur-3xl",
            isRTL ? "left-0" : "right-0"
          )}
        />
      </div>
    </section>
  );
}
