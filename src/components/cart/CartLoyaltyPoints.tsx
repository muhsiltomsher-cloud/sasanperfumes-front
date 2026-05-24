"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoyaltySettings {
  enabled: boolean;
  points_per_aed: number;
  label_en: string;
  label_ar: string;
}

export function CartLoyaltyPoints({
  subtotal,
  isRTL,
  divisor,
}: {
  subtotal: string;
  isRTL: boolean;
  divisor: number;
}) {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);

  useEffect(() => {
    fetch("/api/loyalty?action=settings")
      .then((r) => r.json())
      .then((d: LoyaltySettings) => {
        if (d?.enabled) setSettings(d);
      })
      .catch(() => {});
  }, []);

  if (!settings) return null;

  const pointsPerAed = settings.points_per_aed ?? 1;
  const subtotalNum = parseFloat(subtotal);
  const earnedPoints = Math.floor((subtotalNum / divisor) * pointsPerAed);
  if (earnedPoints <= 0) return null;

  const label = isRTL ? settings.label_ar : settings.label_en;

  return (
    <div className="mb-3 flex items-center gap-2 rounded-sm border border-brand-primary/20 bg-brand-primary/5 p-3">
      <Star className="h-4 w-4 flex-shrink-0 text-brand-primary" fill="currentColor" />
      <div className="text-xs text-brand-primary">
        {label && <span className="font-medium">{label} &mdash; </span>}
        {isAuthenticated
          ? isRTL
            ? `اكسب ${earnedPoints.toLocaleString()} نقطة على هذا الطلب`
            : `Earn ${earnedPoints.toLocaleString()} points on this order`
          : isRTL
            ? `سجل دخولك لكسب ${earnedPoints.toLocaleString()} نقطة`
            : `Sign in to earn ${earnedPoints.toLocaleString()} points`}
      </div>
    </div>
  );
}
