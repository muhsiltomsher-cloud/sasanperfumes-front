"use client";

import { useState } from "react";
import { Share2, X, Copy, Check, Facebook, Twitter, MessageCircle, Link2 } from "lucide-react";
import type { Locale } from "@/config/site";

interface SocialShareModalProps {
  url: string;
  title: string;
  locale?: Locale;
  className?: string;
}

export function SocialShareModal({ url, title, locale = "en", className = "" }: SocialShareModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isAr = locale === "ar";
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      color: "bg-[#1877F2] hover:bg-[#166fe5]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter / X",
      icon: <Twitter className="h-5 w-5" />,
      color: "bg-black hover:bg-gray-800",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-5 w-5" />,
      color: "bg-[#25D366] hover:bg-[#1ebe57]",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${className}`}
        aria-label={isAr ? "مشاركة" : "Share"}
      >
        <Share2 className="h-4 w-4" />
        <span>{isAr ? "مشاركة" : "Share"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" dir={isAr ? "rtl" : "ltr"}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{isAr ? "مشاركة المنتج" : "Share Product"}</h3>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 line-clamp-2 text-sm text-gray-500">{title}</p>

            <div className="flex gap-3 mb-4">
              {shareLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-white transition-colors ${s.color}`}
                  onClick={() => setOpen(false)}
                >
                  {s.icon}
                  <span className="text-xs font-medium">{s.name.split(" ")[0]}</span>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <Link2 className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="flex-1 truncate text-xs text-gray-500">{url}</span>
              <button
                onClick={copy}
                className="flex items-center gap-1 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-primary-dark transition-colors"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? (isAr ? "تم" : "Copied!") : (isAr ? "نسخ" : "Copy")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
