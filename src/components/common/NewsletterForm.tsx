"use client";

import { useState } from "react";

interface NewsletterFormProps {
  locale: string;
  dictionary: {
    emailPlaceholder: string;
    subscribe: string;
  };
}

export function NewsletterForm({ locale, dictionary }: NewsletterFormProps) {
  const isRTL = locale === "ar";
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setEmail("");
      } else {
        setError(
          data.error?.message ||
            (isRTL
              ? "فشل في الاشتراك. يرجى المحاولة مرة أخرى."
              : "Failed to subscribe. Please try again.")
        );
      }
    } catch {
      setError(
        isRTL
          ? "حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى."
          : "A network error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
        {isRTL
          ? "شكراً لاشتراكك في نشرتنا الإخبارية!"
          : "Thank you for subscribing to our newsletter!"}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder={dictionary.emailPlaceholder}
          required
          className="flex-1 border border-white/30 px-3 py-2.5 text-sm bg-white/5 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/50"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? isRTL
              ? "جاري الإرسال..."
              : "Subscribing..."
            : dictionary.subscribe}
        </button>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </form>
  );
}
