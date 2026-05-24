"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/config/site";

interface GuideSection {
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
}

interface ScentGuideData {
  enabled: boolean;
  title: string;
  titleAr: string;
  imageUrl: string;
  sections: GuideSection[];
}

interface SizeRow {
  size: string;
  ml: string;
  description_en: string;
  description_ar: string;
}

interface SizeGuideData {
  enabled: boolean;
  title: string;
  titleAr: string;
  sizeChart: SizeRow[];
}

interface GuideDataV2 {
  scentGuide: ScentGuideData;
  sizeGuide: SizeGuideData;
}

interface GuideDataV1 {
  enabled: boolean;
  title_en: string;
  title_ar: string;
  sections: GuideSection[];
  size_chart: SizeRow[];
  image_url: string;
}

type RawGuideData = GuideDataV2 | GuideDataV1;

function isV2(d: RawGuideData): d is GuideDataV2 {
  return "scentGuide" in d && "sizeGuide" in d;
}

function normalise(raw: RawGuideData): GuideDataV2 {
  if (isV2(raw)) return raw;
  return {
    scentGuide: {
      enabled: raw.enabled,
      title: raw.title_en ?? "Scent Guide",
      titleAr: raw.title_ar ?? "دليل العطور",
      imageUrl: raw.image_url ?? "",
      sections: raw.sections ?? [],
    },
    sizeGuide: {
      enabled: raw.enabled,
      title: "Size Guide",
      titleAr: "دليل المقاسات",
      sizeChart: raw.size_chart ?? [],
    },
  };
}

export function ScentGuideContent({ locale = "en" }: { locale?: Locale }) {
  const [data, setData] = useState<GuideDataV2 | null>(null);
  const isAr = locale === "ar";

  useEffect(() => {
    fetch("/api/scent-guide")
      .then((r) => r.json())
      .then((raw: RawGuideData) => {
        const normalised = normalise(raw);
        if (normalised.scentGuide.enabled) {
          setData(normalised);
        }
      })
      .catch(() => {});
  }, []);

  if (!data || !data.scentGuide.enabled || data.scentGuide.sections.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        {isAr ? data.scentGuide.titleAr : data.scentGuide.title}
      </h3>
      <div className="space-y-4">
        {data.scentGuide.sections.map((section, idx) => (
          <div key={idx}>
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              {isAr ? section.title_ar : section.title_en}
            </h4>
            <p className="text-sm text-gray-600">
              {isAr ? section.content_ar : section.content_en}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
