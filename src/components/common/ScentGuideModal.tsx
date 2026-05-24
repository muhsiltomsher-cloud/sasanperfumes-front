"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import NextImage from "next/image";
import { X, ChevronDown } from "lucide-react";
import type { Locale } from "@/config/site";

interface GuideSection { title_en: string; title_ar: string; content_en: string; content_ar: string; }
interface SizeRow { size: string; ml: string; description_en: string; description_ar: string; }

// New nested shape (API v2)
interface ScentGuideData { enabled: boolean; title: string; titleAr: string; imageUrl: string; sections: GuideSection[]; }
interface SizeGuideData  { enabled: boolean; title: string; titleAr: string; sizeChart: SizeRow[]; }
interface GuideDataV2 { scentGuide: ScentGuideData; sizeGuide: SizeGuideData; }

// Old flat shape (API v1 — transition fallback)
interface GuideDataV1 { enabled: boolean; title_en: string; title_ar: string; sections: GuideSection[]; size_chart: SizeRow[]; image_url: string; }

type RawGuideData = GuideDataV2 | GuideDataV1;

function isV2(d: RawGuideData): d is GuideDataV2 {
  return "scentGuide" in d && "sizeGuide" in d;
}

function normalise(raw: RawGuideData): GuideDataV2 {
  if (isV2(raw)) return raw;
  // Map old flat shape → new nested shape
  return {
    scentGuide: {
      enabled:  raw.enabled,
      title:    raw.title_en  ?? "Scent Guide",
      titleAr:  raw.title_ar  ?? "دليل العطور",
      imageUrl: raw.image_url ?? "",
      sections: raw.sections  ?? [],
    },
    sizeGuide: {
      enabled:  raw.enabled,
      title:    "Size Guide",
      titleAr:  "دليل المقاسات",
      sizeChart: raw.size_chart ?? [],
    },
  };
}

interface ScentGuideModalProps { locale?: Locale; className?: string; }

export function ScentGuideModal({ locale = "en", className = "" }: ScentGuideModalProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<GuideDataV2 | null>(null);
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [tab, setTab] = useState<"scent" | "size">("scent");
  const isAr = locale === "ar";

  useEffect(() => {
    if (!open || data) return;
    fetch("/api/scent-guide")
      .then((r) => r.json())
      .then((raw: RawGuideData) => {
        const normalised = normalise(raw);
        // Only store if at least one guide is enabled
        if (normalised.scentGuide.enabled || normalised.sizeGuide.enabled) {
          setData(normalised);
          // Default tab to whichever guide is enabled
          if (!normalised.scentGuide.enabled && normalised.sizeGuide.enabled) setTab("size");
          else setTab("scent");
        } else {
          setData(normalised); // store so we know both are disabled
        }
      })
      .catch(() => {});
  }, [open, data]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  // After data loads: if both guides are disabled, hide the button entirely
  if (data !== null && !data.scentGuide.enabled && !data.sizeGuide.enabled) return null;

  const showScent = !data || data.scentGuide.enabled;
  const showSize  = !data || data.sizeGuide.enabled;
  const bothVisible = showScent && showSize;

  // Button label reflects which guides are active
  const buttonLabel = isAr
    ? (bothVisible ? "دليل العطور والأحجام" : showScent ? "دليل العطور" : "دليل المقاسات")
    : (bothVisible ? "Scent & Size Guide"   : showScent ? "Scent Guide"  : "Size Guide");

  // Modal header title
  const modalTitle = isAr
    ? (data ? (tab === "scent" ? data.scentGuide.titleAr : data.sizeGuide.titleAr) : buttonLabel)
    : (data ? (tab === "scent" ? data.scentGuide.title   : data.sizeGuide.title)   : buttonLabel);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs font-medium text-brand-primary underline underline-offset-2 hover:text-brand-primary-dark ${className}`}
      >
        {buttonLabel}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[2147483000] isolate flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          dir={isAr ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="relative my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">{modalTitle}</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs — only shown when both guides are enabled */}
            {bothVisible && (
              <div className="flex border-b border-gray-100">
                {[
                  { key: "scent" as const, label_en: data?.scentGuide.title ?? "Scent Guide", label_ar: data?.scentGuide.titleAr ?? "دليل العطور" },
                  { key: "size"  as const, label_en: data?.sizeGuide.title  ?? "Size Guide",  label_ar: data?.sizeGuide.titleAr  ?? "دليل المقاسات" },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      tab === t.key
                        ? "border-b-2 border-brand-primary text-brand-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {isAr ? t.label_ar : t.label_en}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!data ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                </div>
              ) : (tab === "scent" && showScent) ? (
                <div className="space-y-2">
                  {data.scentGuide.imageUrl && (
                    <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
                      <NextImage
                        src={data.scentGuide.imageUrl}
                        alt={isAr ? data.scentGuide.titleAr : data.scentGuide.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 480px"
                      />
                    </div>
                  )}
                  {(data.scentGuide.sections ?? []).map((s, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-gray-100">
                      <button
                        type="button"
                        onClick={() => setActiveSection(activeSection === i ? null : i)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <span className="font-medium text-gray-900">{isAr ? s.title_ar : s.title_en}</span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${activeSection === i ? "rotate-180" : ""}`} />
                      </button>
                      {activeSection === i && (
                        <div className="border-t border-gray-100 px-4 py-3">
                          <p className="text-sm leading-relaxed text-gray-600">{isAr ? s.content_ar : s.content_en}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!data.scentGuide.sections || data.scentGuide.sections.length === 0) && (
                    <p className="text-center text-sm text-gray-400">{isAr ? "لا يوجد محتوى بعد" : "No guide content yet"}</p>
                  )}
                </div>
              ) : (tab === "size" || !showScent) && showSize ? (
                <div>
                  {(data.sizeGuide.sizeChart ?? []).length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-brand-primary/10">
                          <th className="pb-3 text-start font-semibold text-gray-700">{isAr ? "الحجم" : "Size"}</th>
                          <th className="pb-3 text-start font-semibold text-gray-700">{isAr ? "المل" : "ML"}</th>
                          <th className="pb-3 text-start font-semibold text-gray-700">{isAr ? "الوصف" : "Description"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.sizeGuide.sizeChart.map((row, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-3 font-medium text-gray-900">{row.size}</td>
                            <td className="py-3 text-gray-600">{row.ml}</td>
                            <td className="py-3 text-gray-500">{isAr ? row.description_ar : row.description_en}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-sm text-gray-400">{isAr ? "لا يوجد جدول أحجام بعد" : "No size chart yet"}</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
