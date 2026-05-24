"use client";

import { WCProductVariation } from "@/types/woocommerce";

interface Props {
  variation: WCProductVariation;
  isAr?: boolean;
}

export default function VariationStockBadge({ variation, isAr }: Props) {
  const { stock_status, low_stock_remaining } = variation;

  if (!stock_status || stock_status === "instock") {
    if (low_stock_remaining != null && low_stock_remaining <= 5 && low_stock_remaining > 0) {
      return (
        <span className="inline-block text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
          {isAr ? `${low_stock_remaining} متبقية فقط` : `Only ${low_stock_remaining} left`}
        </span>
      );
    }
    return null;
  }

  if (stock_status === "onbackorder") {
    return (
      <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">
        {isAr ? "متاح للطلب المسبق" : "Available on backorder"}
      </span>
    );
  }

  // outofstock
  return (
    <span className="inline-block text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">
      {isAr ? "نفد من المخزون" : "Out of stock"}
    </span>
  );
}
