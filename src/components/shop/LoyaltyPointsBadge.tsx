"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface LoyaltySettings {
  enabled: boolean;
  points_per_aed: number;
  aed_per_point?: number;
  min_redeem_points?: number;
  label_en: string;
  label_ar: string;
}

interface Props {
  priceAed: number;
  isAr?: boolean;
}

export function LoyaltyPointsBadge({ priceAed, isAr }: Props) {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);

  useEffect(() => {
    fetch("/api/loyalty?action=settings")
      .then((r) => r.json())
      .then((d: LoyaltySettings) => {
        if (d?.enabled) setSettings(d);
      })
      .catch(() => {});
  }, []);

  if (!settings || priceAed <= 0) return null;

  const points = Math.floor(priceAed * settings.points_per_aed);
  if (points <= 0) return null;

  const label = isAr ? settings.label_ar : settings.label_en;
  const defaultText = isAr
    ? `اكسب ${points.toLocaleString()} نقطة`
    : `Earn ${points.toLocaleString()} points`;
  const displayText = label
    ? `${label} — ${isAr ? `اكسب ${points.toLocaleString()} نقطة` : `Earn ${points.toLocaleString()} points`}`
    : defaultText;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1">
      <Star className="h-3.5 w-3.5 text-brand-primary" fill="currentColor" />
      <span className="text-xs font-medium text-brand-primary">
        {displayText}
      </span>
    </div>
  );
}
