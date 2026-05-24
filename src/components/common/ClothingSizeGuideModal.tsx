"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import NextImage from "next/image";
import { X, ChevronDown, Ruler } from "lucide-react";
import type { Locale } from "@/config/site";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SizeColumn { key: string; label_en: string; label_ar: string; type: "text" | "measurement"; }
interface SizeCell { cm?: string; in?: string; text?: string; }
interface SizeRow { [key: string]: SizeCell | string; }
interface SizeChart { columns: SizeColumn[]; rows: SizeRow[]; }
interface MeasureSection { title_en: string; title_ar: string; desc_en: string; desc_ar: string; image_url: string; }
interface SizeTemplate {
  id: number;
  title: { en: string; ar: string };
  default_unit: "cm" | "in";
  fit_type: "slim" | "regular" | "oversized";
  note: { en: string; ar: string };
  product_chart: SizeChart | null;
  body_chart: SizeChart | null;
  measurement_sections: MeasureSection[];
}
interface SizeGuideResponse { enabled: boolean; template: SizeTemplate | null; }

// ---------------------------------------------------------------------------
// Fit scale
// ---------------------------------------------------------------------------

const FIT_LABELS: Record<string, { en: string; ar: string }> = {
  slim:      { en: "Slim / Skinny", ar: "ضيق / سكيني" },
  regular:   { en: "Regular",       ar: "عادي" },
  oversized: { en: "Oversized",     ar: "واسع" },
};

function FitScale({ fitType, isAr }: { fitType: string; isAr: boolean }) {
  const steps = ["slim", "regular", "oversized"] as const;
  const activeIdx = steps.indexOf(fitType as typeof steps[number]);
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`h-2 w-10 rounded-full transition-colors ${
                i === activeIdx ? "bg-brand-primary" : "bg-gray-200"
              }`}
            />
            <span className={`text-[10px] ${i === activeIdx ? "font-semibold text-brand-primary" : "text-gray-400"}`}>
              {isAr ? FIT_LABELS[step].ar : FIT_LABELS[step].en}
            </span>
          </div>
          {i < steps.length - 1 && <div className="mb-3 h-px w-4 bg-gray-200" />}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart table
// ---------------------------------------------------------------------------

function SizeTable({ chart, unit, isAr }: { chart: SizeChart; unit: "cm" | "in"; isAr: boolean }) {
  function cellValue(row: SizeRow, col: SizeColumn): string {
    const val = row[col.key];
    if (col.type === "text") return typeof val === "string" ? val : (val as SizeCell)?.text ?? "";
    if (!val || typeof val === "string") return "";
    const c = val as SizeCell;
    if (unit === "in") {
      if (c.in) return c.in;
      if (c.cm) return (parseFloat(c.cm) / 2.54).toFixed(1);
      return "";
    }
    return c.cm ?? "";
  }

  if (!chart.columns.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px] text-sm">
        <thead>
          <tr className="border-b-2 border-brand-primary/10">
            {chart.columns.map(col => (
              <th key={col.key} className="pb-3 pe-4 text-start font-semibold text-gray-700 whitespace-nowrap">
                {isAr ? col.label_ar : col.label_en}
                {col.type === "measurement" && (
                  <span className="ms-1 text-[10px] font-normal text-gray-400">({unit})</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
              {chart.columns.map(col => (
                <td key={col.key} className="py-2.5 pe-4 text-gray-700 whitespace-nowrap">
                  {col.key === chart.columns[0].key ? (
                    <span className="font-semibold text-gray-900">{cellValue(row, col)}</span>
                  ) : (
                    cellValue(row, col)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props { productId: number; locale?: Locale; className?: string; }

export function ClothingSizeGuideModal({ productId, locale = "en", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SizeGuideResponse | null>(null);
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [tab, setTab] = useState<"product" | "body">("product");
  const [openSection, setOpenSection] = useState<number | null>(0);
  const isAr = locale === "ar";

  // Fetch guide info on mount to determine button visibility
  useEffect(() => {
    if (data !== null) return;
    fetch(`/api/clothing-size-guide?product_id=${productId}`)
      .then(r => r.json())
      .then((res: SizeGuideResponse) => {
        setData(res);
        if (res.template) {
          setUnit(res.template.default_unit || "cm");
          if (!res.template.product_chart && res.template.body_chart) setTab("body");
        }
      })
      .catch(() => setData({ enabled: false, template: null }));
  }, [productId, data]);

  // Lock scroll + ESC handler when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  // Hide if no guide
  if (!data || !data.enabled || !data.template) return null;

  const tmpl = data.template;
  const hasProduct = Boolean(tmpl.product_chart?.columns.length);
  const hasBody = Boolean(tmpl.body_chart?.columns.length);
  const hasBoth = hasProduct && hasBody;
  const title = isAr ? tmpl.title.ar : tmpl.title.en;
  const note = isAr ? tmpl.note.ar : tmpl.note.en;

  const t = {
    product_chart: isAr ? "جدول المنتج" : "Product Chart",
    body_chart:    isAr ? "قياسات الجسم" : "Body Chart",
    how_to_measure:isAr ? "كيفية القياس" : "How to Measure",
    cm: "CM",
    in: "IN",
    fit: isAr ? "القصة" : "Fit",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary underline underline-offset-2 hover:text-brand-primary-dark ${className}`}
      >
        <Ruler className="h-3.5 w-3.5" />
        {isAr ? "دليل المقاسات" : "Size Guide"}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[2147483000] isolate flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          dir={isAr ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="relative my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Controls: unit toggle + fit scale */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-3">
              {/* CM / IN toggle */}
              <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1">
                {(["cm", "in"] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`rounded-full px-4 py-1 text-xs font-semibold transition-all ${
                      unit === u
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Fit scale */}
              {tmpl.fit_type && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">{t.fit}:</span>
                  <FitScale fitType={tmpl.fit_type} isAr={isAr} />
                </div>
              )}
            </div>

            {/* Tabs (only if both charts present) */}
            {hasBoth && (
              <div className="flex border-b border-gray-100">
                {[
                  { key: "product" as const, label: t.product_chart },
                  { key: "body"    as const, label: t.body_chart },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      tab === item.key
                        ? "border-b-2 border-brand-primary text-brand-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Chart */}
              {tab === "product" && hasProduct && (
                <SizeTable chart={tmpl.product_chart!} unit={unit} isAr={isAr} />
              )}
              {(tab === "body" || (!hasProduct && hasBody)) && hasBody && (
                <SizeTable chart={tmpl.body_chart!} unit={unit} isAr={isAr} />
              )}

              {/* Measurement note */}
              {note && (
                <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
                  {note}
                </p>
              )}

              {/* How to Measure */}
              {tmpl.measurement_sections.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900">
                    {t.how_to_measure}
                  </h3>
                  <div className="space-y-2">
                    {tmpl.measurement_sections.map((sec, i) => (
                      <div key={i} className="overflow-hidden rounded-xl border border-gray-100">
                        <button
                          type="button"
                          onClick={() => setOpenSection(openSection === i ? null : i)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {isAr ? sec.title_ar : sec.title_en}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${openSection === i ? "rotate-180" : ""}`}
                          />
                        </button>
                        {openSection === i && (
                          <div className="border-t border-gray-100 px-4 py-3">
                            <p className="text-sm leading-relaxed text-gray-600">
                              {isAr ? sec.desc_ar : sec.desc_en}
                            </p>
                            {sec.image_url && (
                              <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg">
                                <NextImage
                                  src={sec.image_url}
                                  alt={isAr ? sec.title_ar : sec.title_en}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 640px) 100vw, 480px"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
