"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/common/Button";

interface AccountEmptyStateProps {
  icon: LucideIcon;
  title?: string;
  message: string;
  actionLabel: string;
  actionHref: string;
}

export function AccountEmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionHref,
}: AccountEmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-brand-border/70 bg-brand-ivory shadow-[0_12px_28px_rgba(20,15,10,0.08)] md:h-24 md:w-24">
          <Icon className="h-10 w-10 text-brand-muted md:h-12 md:w-12" />
        </div>
      </div>
      {title && (
        <h3 className="mb-2 text-lg font-semibold text-brand-primary">{title}</h3>
      )}
      <p className="mb-8 text-brand-muted">{message}</p>
      <Button asChild variant="primary" size="lg">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
