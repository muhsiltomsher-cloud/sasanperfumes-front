"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check, Loader2 } from "lucide-react";
import type { Locale } from "@/config/site";

interface BackInStockAlertProps {
  productId: number;
  locale?: Locale;
}

export function BackInStockAlert({ productId, locale = "en" }: BackInStockAlertProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed" | "error">("idle");
  const [error, setError] = useState("");
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const isAr = locale === "ar";

  // Check existing subscription on mount
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      const stored = localStorage.getItem(`sasanperfumes_stock_alert_${productId}`);
      setAlreadySubscribed(Boolean(stored));
    });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(isAr ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, email, locale }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("subscribed");
        localStorage.setItem(`sasanperfumes_stock_alert_${productId}`, email);
      } else {
        setError(data.message || (isAr ? "حدث خطأ، يرجى المحاولة مرة أخرى" : "Something went wrong, please try again"));
        setStatus("idle");
      }
    } catch {
      setError(isAr ? "خطأ في الشبكة، يرجى المحاولة مرة أخرى" : "Network error, please try again");
      setStatus("idle");
    }
  };

  if (alreadySubscribed || status === "subscribed") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3" dir={isAr ? "rtl" : "ltr"}>
        <Check className="h-4 w-4 shrink-0 text-green-500" />
        <p className="text-sm text-green-700">
          {isAr ? "سنخبرك عند توفر المنتج!" : "We'll notify you when this product is back in stock!"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-brand-primary" />
        <p className="text-sm font-medium text-gray-900">
          {isAr ? "أخطرني عند التوفر" : "Notify me when available"}
        </p>
      </div>
      <p className="mb-3 text-xs text-gray-500">
        {isAr
          ? "أدخل بريدك الإلكتروني وسنرسل لك إشعاراً فور توفر المنتج"
          : "Enter your email and we'll notify you as soon as this product is back in stock"}
      </p>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isAr ? "بريدك الإلكتروني" : "Your email address"}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark disabled:opacity-60 transition-colors"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          {isAr ? "تنبيه" : "Notify"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
