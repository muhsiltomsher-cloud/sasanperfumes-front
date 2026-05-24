"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Gift } from "lucide-react";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import type { Locale } from "@/config/site";

interface GiftWrapConfig {
  enabled: boolean; price: number; label_en: string; label_ar: string;
  desc_en: string; desc_ar: string; image_url: string;
}

interface GiftWrapOptionProps {
  locale?: Locale;
  onChange?: (selected: boolean) => void;
}

export function GiftWrapOption({ locale = "en", onChange }: GiftWrapOptionProps) {
  const [config, setConfig] = useState<GiftWrapConfig | null>(null);
  const [selected, setSelected] = useState(false);
  const isAr = locale === "ar";

  useEffect(() => {
    fetch("/api/gift-wrap")
      .then((r) => r.json())
      .then((d: GiftWrapConfig) => {
        if (d?.enabled) {
          setConfig(d);
          return;
        }
        setConfig(null);
        setSelected(false);
        onChange?.(false);
      })
      .catch(() => {});
  }, [onChange]);

  const toggle = () => {
    const next = !selected;
    setSelected(next);
    onChange?.(next);
  };

  if (!config) return null;

  const label = isAr ? config.label_ar : config.label_en;
  const desc  = isAr ? config.desc_ar  : config.desc_en;

  return (
    <div className="border border-gray-100 bg-white p-5 md:p-6">
      <h2 className="mb-4 text-base md:text-lg font-semibold text-gray-900">
        {isAr ? "تغليف الهدايا" : "Gift Wrapping"}
      </h2>
      <button
        type="button"
        onClick={toggle}
        className={`w-full rounded-xl border-2 p-4 text-start transition-all ${
          selected ? "border-brand-primary bg-brand-primary/5" : "border-gray-200 bg-white hover:border-gray-300"
        }`}
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-3">
          {config.image_url ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
              <Image src={config.image_url} alt={label} fill className="object-cover" sizes="48px" />
            </div>
          ) : (
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-brand-primary" : "bg-gray-100"}`}>
              <Gift className={`h-5 w-5 ${selected ? "text-white" : "text-gray-500"}`} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`font-medium ${selected ? "text-brand-primary" : "text-gray-900"}`}>{label}</p>
              <span className="text-sm font-semibold text-brand-primary flex items-center gap-0.5">
                +<FormattedPrice price={config.price} iconSize="xs" />
              </span>
            </div>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
          <div className={`h-5 w-5 shrink-0 rounded-full border-2 ${selected ? "border-brand-primary bg-brand-primary" : "border-gray-300"} flex items-center justify-center`}>
            {selected && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
        </div>
      </button>
    </div>
  );
}
