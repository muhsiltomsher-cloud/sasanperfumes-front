"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AccountPageHeaderProps {
  locale: string;
  title: string;
  backHref: string;
  backLabel: string;
}

export function AccountPageHeader({
  locale,
  title,
  backHref,
  backLabel,
}: AccountPageHeaderProps) {
  const isRTL = locale === "ar";

  return (
    <div className="mb-5 md:mb-8">
      <Link
        href={backHref}
        className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-border/70 bg-brand-ivory/90 px-3 py-1.5 text-sm text-brand-muted shadow-[0_8px_18px_rgba(20,15,10,0.06)] transition hover:border-brand-primary/35 hover:text-brand-primary md:mb-4"
      >
        <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
        {backLabel}
      </Link>
      <h1 className="font-title text-[30px] leading-none text-brand-primary md:text-4xl">
        {title}
      </h1>
    </div>
  );
}
