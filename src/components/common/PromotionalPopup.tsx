"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Copy, Check } from "lucide-react";
import { shouldUseUnoptimizedImage } from "@/lib/utils/image";
import type { Locale } from "@/config/site";

interface PopupSettings {
  enabled: boolean;
  trigger: "timed" | "exit_intent" | "both";
  delay: number;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  btn_text_en: string;
  btn_text_ar: string;
  btn_url: string;
  image_url: string;
  coupon_code: string;
  frequency: "once" | "session" | "always";
}

const STORAGE_KEY = "sasanperfumes_popup_seen";
const DISMISS_KEY = "sasanperfumes_popup_dismissed";

function hasSeenPopup(frequency: string): boolean {
  if (typeof window === "undefined") return true;
  // Always check session-level dismiss first — user closed the popup this session
  if (sessionStorage.getItem(DISMISS_KEY)) return true;
  if (frequency === "always") return false;
  const store = frequency === "session" ? sessionStorage : localStorage;
  return !!store.getItem(STORAGE_KEY);
}

function markPopupSeen(frequency: string) {
  if (typeof window === "undefined") return;
  const store = frequency === "session" ? sessionStorage : localStorage;
  store.setItem(STORAGE_KEY, "1");
}

function markPopupDismissed() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DISMISS_KEY, "1");
}

export function PromotionalPopup({ locale }: { locale: Locale }) {
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isAr = locale === "ar";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    fetch("/api/popup")
      .then((r) => r.json())
      .then((data: PopupSettings) => {
        if (data?.enabled) setSettings(data);
      })
      .catch(() => {});
  }, [isMobile]);

  const showPopup = useCallback(() => {
    if (isMobile || !settings || hasSeenPopup(settings.frequency)) return;
    setOpen(true);
    markPopupSeen(settings.frequency);
  }, [isMobile, settings]);

  useEffect(() => {
    if (isMobile || !settings) return;
    const trigger = settings.trigger;

    if (trigger === "timed" || trigger === "both") {
      const timer = setTimeout(showPopup, (settings.delay || 5) * 1000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, settings, showPopup]);

  useEffect(() => {
    if (isMobile || !settings) return;
    if (settings.trigger !== "exit_intent" && settings.trigger !== "both") return;
    const handleMouse = (e: MouseEvent) => {
      if (e.clientY <= 5) showPopup();
    };
    document.addEventListener("mouseleave", handleMouse);
    return () => document.removeEventListener("mouseleave", handleMouse);
  }, [isMobile, settings, showPopup]);

  const copyCoupon = async () => {
    if (!settings?.coupon_code) return;
    await navigator.clipboard.writeText(settings.coupon_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isMobile || !open || !settings) return null;

  const title = isAr ? settings.title_ar : settings.title_en;
  const body = isAr ? settings.body_ar : settings.body_en;
  const btnText = isAr ? settings.btn_text_ar : settings.btn_text_en;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { markPopupDismissed(); setOpen(false); }}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          onClick={() => { markPopupDismissed(); setOpen(false); }}
          className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1.5 text-gray-500 hover:bg-white hover:text-gray-900"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {settings.image_url && (
          <div className="relative h-48 w-full">
            <Image src={settings.image_url} alt={title} fill className="object-cover" unoptimized={shouldUseUnoptimizedImage(settings.image_url)} />
          </div>
        )}

        <div className={`p-6 ${isAr ? "text-right" : "text-left"}`} dir={isAr ? "rtl" : "ltr"}>
          {title && (
            <h2 className="mb-2 text-xl font-bold text-gray-900">{title}</h2>
          )}
          {body && (
            <p className="mb-4 text-sm text-gray-600">{body}</p>
          )}

          {settings.coupon_code && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-brand-primary/30 bg-brand-primary/5 px-4 py-3">
              <span className="flex-1 font-mono text-lg font-bold tracking-widest text-brand-primary">
                {settings.coupon_code}
              </span>
              <button
                onClick={copyCoupon}
                className="flex items-center gap-1 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-primary-dark transition-colors"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? (isAr ? "تم النسخ" : "Copied!") : (isAr ? "نسخ" : "Copy")}
              </button>
            </div>
          )}

          {btnText && settings.btn_url && (
            <Link
              href={settings.btn_url}
              onClick={() => setOpen(false)}
              className="block w-full rounded-xl bg-brand-primary py-3 text-center text-sm font-semibold text-white hover:bg-brand-primary-dark transition-colors"
            >
              {btnText}
            </Link>
          )}

          <button
            onClick={() => { markPopupDismissed(); setOpen(false); }}
            className="mt-3 block w-full text-center text-xs text-gray-400 hover:text-gray-600"
          >
            {isAr ? "لا شكراً" : "No thanks"}
          </button>
        </div>
      </div>
    </div>
  );
}
