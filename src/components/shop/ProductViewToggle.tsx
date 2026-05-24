"use client";

import { useState } from "react";
import { Columns4, Grid2X2, Grid3X3, SlidersHorizontal, Check } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";
export type GridColumns = 2 | 3 | 4 | 5;
export type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "date-desc";

interface ProductViewToggleProps {
  viewMode: ViewMode;
  gridColumns: GridColumns;
  onViewModeChange: (mode: ViewMode) => void;
  onGridColumnsChange: (columns: GridColumns) => void;
  locale: "en" | "ar";
  className?: string;
  productCount?: number;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

const translations = {
  en: {
    columns: "columns",
    products: "products",
    product: "product",
    sortBy: "sort by",
    filterSort: "filter & sort",
    default: "featured",
    priceAsc: "price: low to high",
    priceDesc: "price: high to low",
    nameAsc: "name: a to z",
    nameDesc: "name: z to a",
    dateDesc: "newest first",
  },
  ar: {
    columns: "\u0627\u0644\u0623\u0639\u0645\u062f\u0629",
    products: "\u0645\u0646\u062a\u062c\u0627\u062a",
    product: "\u0645\u0646\u062a\u062c",
    sortBy: "\u062a\u0631\u062a\u064a\u0628 \u062d\u0633\u0628",
    filterSort: "\u062a\u0635\u0641\u064a\u0629 \u0648\u062a\u0631\u062a\u064a\u0628",
    default: "\u0627\u0644\u0645\u0645\u064a\u0632\u0629",
    priceAsc: "\u0627\u0644\u0633\u0639\u0631: \u0645\u0646 \u0627\u0644\u0623\u0642\u0644 \u0644\u0644\u0623\u0639\u0644\u0649",
    priceDesc: "\u0627\u0644\u0633\u0639\u0631: \u0645\u0646 \u0627\u0644\u0623\u0639\u0644\u0649 \u0644\u0644\u0623\u0642\u0644",
    nameAsc: "\u0627\u0644\u0627\u0633\u0645: \u0623 \u0625\u0644\u0649 \u064a",
    nameDesc: "\u0627\u0644\u0627\u0633\u0645: \u064a \u0625\u0644\u0649 \u0623",
    dateDesc: "\u0627\u0644\u0623\u062d\u062f\u062b \u0623\u0648\u0644\u0627",
  },
};

export function ProductViewToggle({
  viewMode,
  gridColumns,
  onViewModeChange,
  onGridColumnsChange,
  locale,
  className,
  productCount,
  sortBy = "default",
  onSortChange,
}: ProductViewToggleProps) {
  const isRTL = locale === "ar";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const t = translations[locale];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "default", label: t.default },
    { value: "price-asc", label: t.priceAsc },
    { value: "price-desc", label: t.priceDesc },
    { value: "name-asc", label: t.nameAsc },
    { value: "name-desc", label: t.nameDesc },
    { value: "date-desc", label: t.dateDesc },
  ];

  const gridOptions: { columns: GridColumns; icon: React.ReactNode; label: string }[] = [
    { columns: 2, icon: <Grid2X2 className="h-4 w-4" />, label: "2" },
    { columns: 3, icon: <Grid3X3 className="h-4 w-4" />, label: "3" },
    { columns: 4, icon: <Columns4 className="h-4 w-4" />, label: "4" },
  ];

  const handleSortClick = (value: SortOption) => {
    onSortChange?.(value);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "relative flex items-center justify-between gap-4 border-y border-[#e7ded7] bg-[#f8f3ef] px-5 py-3 text-brand-primary md:px-7 lg:px-12",
          className
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="hidden items-center md:flex">
          {productCount !== undefined && (
            <span className="text-[13px] font-normal tracking-normal text-brand-primary">
              {productCount} {productCount === 1 ? t.product : t.products}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={cn(
            "flex items-center gap-3 text-[13px] font-normal lowercase tracking-normal text-brand-primary transition-opacity hover:opacity-70 md:hidden",
            isRTL && "flex-row-reverse"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>
            {t.filterSort}
            {productCount !== undefined ? ` (${productCount})` : ""}
          </span>
        </button>

        <div className="flex items-center gap-5 md:ms-auto">
          {viewMode === "grid" && (
            <div className="hidden items-center gap-3 md:flex">
              {gridOptions.map((option) => (
                <button
                  key={option.columns}
                  type="button"
                  onClick={() => {
                    onViewModeChange("grid");
                    onGridColumnsChange(option.columns);
                  }}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70",
                    gridColumns === option.columns ? "text-brand-primary" : "text-brand-primary/35"
                  )}
                  aria-label={`${option.columns} ${t.columns}`}
                  title={`${option.columns} ${t.columns}`}
                >
                  {option.icon}
                </button>
              ))}
            </div>
          )}

          <span className="hidden h-5 w-px bg-[#e7ded7] md:block" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className={cn(
              "hidden items-center gap-3 text-[13px] font-normal lowercase tracking-normal text-brand-primary transition-opacity hover:opacity-70 md:flex",
              isRTL && "flex-row-reverse"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>{t.filterSort}</span>
          </button>
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position="right"
        size="sm"
        title={t.filterSort}
        dir={isRTL ? "rtl" : "ltr"}
        bodyClassName="p-0"
      >
        <div className="border-b border-brand-border/40 p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-primary/50">
            {t.sortBy}
          </p>
          <div className="space-y-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSortClick(option.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-[13px] font-normal tracking-normal transition-colors hover:bg-[#f8f3ef]",
                  sortBy === option.value
                    ? "bg-[#f8f3ef] text-brand-primary"
                    : "text-brand-primary/65"
                )}
              >
                <span>{option.label}</span>
                {sortBy === option.value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-primary/50">
            {t.columns}
          </p>
          <div className="flex gap-2">
            {gridOptions.map((option) => (
              <button
                key={option.columns}
                type="button"
                onClick={() => {
                  onViewModeChange("grid");
                  onGridColumnsChange(option.columns);
                  setIsDrawerOpen(false);
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md border text-sm transition-all",
                  gridColumns === option.columns
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-border/40 text-brand-primary hover:border-brand-primary/40"
                )}
                aria-label={`${option.columns} ${t.columns}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Drawer>
    </>
  );
}
