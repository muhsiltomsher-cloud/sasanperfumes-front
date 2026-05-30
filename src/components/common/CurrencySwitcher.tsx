"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronDown, Check, X, Globe } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { type Currency } from "@/config/site";
import { cn } from "@/lib/utils";

const currencyCountryCodes: Record<string, string> = {
  AED: "ae",
  SAR: "sa",
  QAR: "qa",
  KWD: "kw",
  BHD: "bh",
  OMR: "om",
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  INR: "in",
  PKR: "pk",
  EGP: "eg",
  JOD: "jo",
  LBP: "lb",
  IQD: "iq",
  YER: "ye",
  SYP: "sy",
  TRY: "tr",
  MAD: "ma",
  TND: "tn",
  DZD: "dz",
  LYD: "ly",
  SDG: "sd",
};

function CountryFlag({ currencyCode, size = 20 }: { currencyCode: string; size?: number }) {
  const countryCode = currencyCountryCodes[currencyCode] || "un";
  const height = Math.round(size * 0.75);
  return (
    <Image
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      alt={currencyCode}
      width={size}
      height={height}
      className="object-cover"
      unoptimized
      style={{ width: size, height: height }}
    />
  );
}

interface CurrencySwitcherProps {
  className?: string;
  locale?: "en" | "ar";
}

export function CurrencySwitcher({ className, locale = "en" }: CurrencySwitcherProps) {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = locale === "ar";

  const currentCurrency = currencies.find((c) => c.code === currency);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleEscapeKey]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelect = (code: Currency) => {
    setCurrency(code);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    setIsOpen(true);
  };

  const translations = {
    en: {
      selectCurrency: "Choose Currency",
      popular: "Popular",
    },
    ar: {
      selectCurrency: "اختر العملة",
      popular: "الأكثر استخداماً",
    },
  };

  const t = translations[locale];

  // Separate USD and other currencies
  const usdCurrency = currencies.find((c) => c.code === "USD");
  const otherCurrencies = currencies.filter((c) => c.code !== "USD");

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-brand-border/70 bg-brand-ivory/95 px-2.5 py-1 text-sm font-semibold text-brand-primary shadow-[0_8px_18px_rgba(20,15,10,0.08)] transition-all hover:border-brand-primary/35 hover:bg-white",
          className
        )}
        aria-label={t.selectCurrency}
        aria-haspopup="dialog"
      >
        <CountryFlag currencyCode={currentCurrency?.code || "AED"} size={20} />
        {currentCurrency?.symbol && currentCurrency.symbol !== currentCurrency.code && (
          <span className="font-semibold text-brand-primary">{currentCurrency.symbol}</span>
        )}
        <span>{currentCurrency?.code}</span>
        <ChevronDown className="h-3 w-3 text-brand-muted" />
      </button>

      {/* Premium Currency Modal */}
      {isOpen && typeof window !== "undefined" && createPortal(
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal - Premium centered design */}
          <div
            className="fixed left-1/2 top-1/2 z-[100] w-[420px] max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-brand-border/70 bg-brand-ivory/98 shadow-[0_28px_80px_rgba(20,15,10,0.2)] transition-all"
            dir={isRTL ? "rtl" : "ltr"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="currency-modal-title"
          >
            <div className="border-b border-brand-border/70 bg-brand-beige/45 px-4 py-4 md:px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-brand-border/70 bg-brand-ivory p-2 text-brand-primary shadow-[0_8px_18px_rgba(20,15,10,0.08)]">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h2 id="currency-modal-title" className="text-base font-bold text-brand-primary md:text-lg">
                    {t.selectCurrency}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-transparent p-2 text-brand-muted transition-all hover:border-brand-border/70 hover:bg-brand-ivory hover:text-brand-primary"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Currency Options */}
            <div className="p-4 md:p-5">
              {/* Main - AED & USD Featured */}
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold uppercase text-brand-muted">
                  {t.popular}
                </p>
                <div className="mb-5 grid grid-cols-2 gap-2.5 md:gap-3">
                  {/* AED */}
                  {currencies.find(c => c.code === "AED") && (
                    <button
                      type="button"
                      onClick={() => handleSelect("AED" as Currency)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border p-3 transition-all",
                        currency === "AED"
                          ? "border-brand-primary bg-brand-beige shadow-[0_10px_22px_rgba(20,15,10,0.08)]"
                          : "border-brand-border/70 bg-white/75 hover:border-brand-primary/45 hover:bg-white"
                      )}
                    >
                      <span className={cn(
                        "flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border text-2xl shadow-sm transition-all",
                        currency === "AED"
                          ? "border-brand-primary bg-brand-ivory ring-2 ring-brand-primary/15"
                          : "border-brand-border/70 bg-brand-beige"
                      )}>
                        <CountryFlag currencyCode="AED" size={28} />
                      </span>
                      <div className="text-center">
                        <p className={cn(
                          "text-sm font-bold",
                          currency === "AED" ? "text-brand-primary" : "text-brand-primary"
                        )}>
                          AED
                        </p>
                        <p className="text-xs text-brand-muted">UAE</p>
                      </div>
                      {currency === "AED" && (
                        <Check className="h-4 w-4 text-brand-primary" />
                      )}
                    </button>
                  )}

                  {/* USD */}
                  {usdCurrency && (
                    <button
                      type="button"
                      onClick={() => handleSelect(usdCurrency.code as Currency)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border p-3 transition-all",
                        currency === usdCurrency.code
                          ? "border-brand-primary bg-brand-beige shadow-[0_10px_22px_rgba(20,15,10,0.08)]"
                          : "border-brand-border/70 bg-white/75 hover:border-brand-primary/45 hover:bg-white"
                      )}
                    >
                      <span className={cn(
                        "flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border text-2xl shadow-sm transition-all",
                        currency === usdCurrency.code
                          ? "border-brand-primary bg-brand-ivory ring-2 ring-brand-primary/15"
                          : "border-brand-border/70 bg-brand-beige"
                      )}>
                        <CountryFlag currencyCode={usdCurrency.code} size={28} />
                      </span>
                      <div className="text-center">
                        <p className={cn(
                          "text-sm font-bold",
                          currency === usdCurrency.code ? "text-brand-primary" : "text-brand-primary"
                        )}>
                          USD
                        </p>
                        <p className="text-xs text-brand-muted">USA</p>
                      </div>
                      {currency === usdCurrency.code && (
                        <Check className="h-4 w-4 text-brand-primary" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Other Currencies */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase text-brand-muted">
                  {locale === "ar" ? "جميع العملات" : "All Currencies"}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {otherCurrencies.filter(c => c.code !== "AED").map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleSelect(curr.code as Currency)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border p-2.5 transition-all",
                        currency === curr.code
                          ? "border-brand-primary bg-brand-beige shadow-[0_8px_18px_rgba(20,15,10,0.08)]"
                          : "border-brand-border/70 bg-white/75 hover:border-brand-primary/45 hover:bg-white"
                      )}
                    >
                      <span className={cn(
                        "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border text-lg transition-all",
                        currency === curr.code
                          ? "border-brand-primary bg-brand-ivory ring-2 ring-brand-primary/15"
                          : "border-brand-border/70 bg-brand-beige"
                      )}>
                        <CountryFlag currencyCode={curr.code} size={24} />
                      </span>
                      <p className={cn(
                        "text-xs font-semibold",
                        currency === curr.code ? "text-brand-primary" : "text-brand-primary"
                      )}>
                        {curr.code}
                      </p>
                      {currency === curr.code && (
                        <Check className="h-3.5 w-3.5 text-brand-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
