"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle, Loader2, Send } from "lucide-react";

interface PrivateLabelingFormContent {
  fullNameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  serviceLabel?: string;
  messageLabel?: string;
  submitLabel?: string;
  sendingLabel?: string;
  successTitle?: string;
  successMessage?: string;
  selectServiceLabel?: string;
  consentLabel?: string;
  errorMessage?: string;
  networkErrorMessage?: string;
  services?: string[];
}

interface PrivateLabelingFormProps {
  locale: string;
  content?: PrivateLabelingFormContent;
}

export function PrivateLabelingForm({ locale, content }: PrivateLabelingFormProps) {
  const isRTL = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const services = content?.services || [];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("website")) return;

    const payload = {
      fullName: data.get("fullName"),
      email: data.get("email"),
      phone: data.get("phone"),
      service: data.get("service"),
      message: data.get("message"),
      website: data.get("website"),
      locale,
    };

    try {
      const res = await fetch("/api/private-labeling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        form.reset();
      } else {
        setError(result.message || content?.errorMessage || "");
      }
    } catch {
      setError(content?.networkErrorMessage || "");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="border border-brand-primary/10 bg-[#f8f3ef] p-10 text-center">
        <CheckCircle className="mx-auto mb-5 h-12 w-12 text-brand-gold" />
        {content?.successTitle && (
          <h3 className="mb-3 text-2xl font-normal text-brand-primary">
            {content.successTitle}
          </h3>
        )}
        {content?.successMessage && (
          <p className="text-sm leading-7 text-brand-primary/70">
            {content.successMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary/55">
            {content?.fullNameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            name="fullName"
            required
            type="text"
            className="w-full border border-brand-primary/15 bg-white px-4 py-3 text-sm text-brand-primary transition focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary/55">
            {content?.emailLabel} <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            required
            type="email"
            className="w-full border border-brand-primary/15 bg-white px-4 py-3 text-sm text-brand-primary transition focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary/55">
            {content?.phoneLabel} <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            required
            type="tel"
            className="w-full border border-brand-primary/15 bg-white px-4 py-3 text-sm text-brand-primary transition focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary/55">
            {content?.serviceLabel}
          </label>
          <select
            name="service"
            className="w-full border border-brand-primary/15 bg-white px-4 py-3 text-sm text-brand-primary transition focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          >
            <option value="">{content?.selectServiceLabel}</option>
            {services.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary/55">
          {content?.messageLabel} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full border border-brand-primary/15 bg-white px-4 py-3 text-sm text-brand-primary transition focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
      </div>

      <label className="flex items-start gap-3 text-sm leading-6 text-brand-primary/62">
        <input type="checkbox" required className="mt-1 h-4 w-4 border-brand-primary/25 text-brand-primary focus:ring-brand-gold" />
        <span>{content?.consentLabel}</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-brand-primary px-8 text-sm font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-50 md:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {content?.sendingLabel}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {content?.submitLabel}
          </>
        )}
      </button>
    </form>
  );
}
