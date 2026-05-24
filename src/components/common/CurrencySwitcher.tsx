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
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium transition-all hover:bg-gray-100",
          className
        )}
        aria-label={t.selectCurrency}
        aria-haspopup="dialog"
      >
        <CountryFlag currencyCode={currentCurrency?.code || "AED"} size={20} />
        {currentCurrency?.symbol && currentCurrency.symbol !== currentCurrency.code && (
          <span className="font-semibold text-brand-primary">{currentCurrency.symbol}</span>
        )}
        <span className="text-gray-600">{currentCurrency?.code}</span>
        <ChevronDown className="h-3 w-3 text-gray-400" />
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
            className="fixed left-1/2 top-1/2 z-[100] w-[420px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-2xl transition-all"
            dir={isRTL ? "rtl" : "ltr"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="currency-modal-title"
          >
            {/* Header with gradient background */}
            <div className="relative overflow-hidden border-b border-gray-100 px-6 py-6">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-brand-gold/10 p-2">
                    <Globe className="h-5 w-5 text-brand-gold" />
                  </div>
                  <h2 id="currency-modal-title" className="text-lg font-bold text-brand-primary">
                    {t.selectCurrency}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Currency Options */}
            <div className="p-6">
              {/* Main - AED & USD Featured */}
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-gold/70">
                  {t.popular}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* AED */}
                  {currencies.find(c => c.code === "AED") && (
                    <button
                      type="button"
                      onClick={() => handleSelect("AED" as Currency)}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all",
                        currency === "AED"
                          ? "border-brand-gold bg-gradient-to-r from-brand-gold/10 to-brand-beige/20 shadow-lg"
                          : "border-gray-200 bg-white hover:border-brand-gold/50 hover:bg-gray-50"
                      )}
                    >
                      <span className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm transition-all",
                        currency === "AED"
                          ? "bg-brand-gold/20 ring-2 ring-brand-gold"
                          : "bg-gray-100"
                      )}>
                        <CountryFlag currencyCode="AED" size={28} />
                      </span>
                      <div className="text-center">
                        <p className={cn(
                          "text-base font-bold",
                          currency === "AED" ? "text-brand-gold" : "text-gray-900"
                        )}>
                          AED
                        </p>
                        <p className="text-xs text-gray-500">UAE</p>
                      </div>
                      {currency === "AED" && (
                        <Check className="h-4 w-4 text-brand-gold" />
                      )}
                    </button>
                  )}

                  {/* USD */}
                  {usdCurrency && (
                    <button
                      type="button"
                      onClick={() => handleSelect(usdCurrency.code as Currency)}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all",
                        currency === usdCurrency.code
                          ? "border-brand-gold bg-gradient-to-r from-brand-gold/10 to-brand-beige/20 shadow-lg"
                          : "border-gray-200 bg-white hover:border-brand-gold/50 hover:bg-gray-50"
                      )}
                    >
                      <span className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm transition-all",
                        currency === usdCurrency.code
                          ? "bg-brand-gold/20 ring-2 ring-brand-gold"
                          : "bg-gray-100"
                      )}>
                        <CountryFlag currencyCode={usdCurrency.code} size={28} />
                      </span>
                      <div className="text-center">
                        <p className={cn(
                          "text-base font-bold",
                          currency === usdCurrency.code ? "text-brand-gold" : "text-gray-900"
                        )}>
                          USD
                        </p>
                        <p className="text-xs text-gray-500">USA</p>
                      </div>
                      {currency === usdCurrency.code && (
                        <Check className="h-4 w-4 text-brand-gold" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Other Currencies */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                  {locale === "ar" ? "جميع العملات" : "All Currencies"}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {otherCurrencies.filter(c => c.code !== "AED").map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleSelect(curr.code as Currency)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
                        currency === curr.code
                          ? "border-brand-primary bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all",
                        currency === curr.code
                          ? "bg-brand-primary/20 ring-2 ring-brand-primary"
                          : "bg-gray-100"
                      )}>
                        <CountryFlag currencyCode={curr.code} size={24} />
                      </span>
                      <p className={cn(
                        "text-sm font-semibold",
                        currency === curr.code ? "text-brand-primary" : "text-gray-900"
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
