import Image from "next/image";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { shouldUseUnoptimizedImage } from "@/lib/utils/image";

interface PageHeaderProps {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image?: string | null;
  isRTL?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  description,
  image,
  isRTL = false,
  className,
  children,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "bg-[#f8f3ef] px-5 pb-6 pt-8 text-brand-primary md:px-7 md:pb-8 md:pt-10 lg:px-12",
        className,
      )}
    >
      {image && (
        <div className="mb-6 max-w-[280px]">
          <Image
            src={image}
            alt={decodeHtmlEntities(title)}
            width={280}
            height={280}
            className="rounded-lg object-cover"
            unoptimized={shouldUseUnoptimizedImage(image)}
          />
        </div>
      )}
      <div className="max-w-[760px]">
        <h1 className="text-[36px] font-normal leading-none tracking-normal md:text-[48px]">
          {decodeHtmlEntities(title)}
        </h1>
        {subtitle && (
          <p className="mt-2 text-lg font-normal tracking-normal text-brand-primary/60">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="mt-4 max-w-[620px] text-[15px] leading-6 tracking-normal text-brand-primary md:text-base">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
