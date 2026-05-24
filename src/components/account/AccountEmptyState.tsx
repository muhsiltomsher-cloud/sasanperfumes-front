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
    <div className="text-center py-12">
      <div className="mb-6 flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      </div>
      {title && (
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      )}
      <p className="mb-8 text-gray-500">{message}</p>
      <Button asChild variant="primary" size="lg">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
