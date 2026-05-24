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
    <div className="mb-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
        {backLabel}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
        {title}
      </h1>
    </div>
  );
}
