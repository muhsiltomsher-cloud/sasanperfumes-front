"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

interface ContactFormProps {
  locale: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export function ContactForm({ locale }: ContactFormProps) {
  const isRTL = locale === "ar";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const namePattern = /^[a-zA-Z\u0600-\u06FF\s'-]*$/;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "firstName" || name === "lastName") {
      if (!namePattern.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: isRTL
            ? "يرجى إدخال أحرف أبجدية فقط"
            : "Only alphabetic characters are allowed",
        }));
        return;
      }
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const firstNameValid = namePattern.test(formData.firstName) && formData.firstName.trim().length > 0;
    const lastNameValid = namePattern.test(formData.lastName) && formData.lastName.trim().length > 0;
    const newFieldErrors: { firstName?: string; lastName?: string } = {};
    if (!firstNameValid) {
      newFieldErrors.firstName = isRTL
        ? "يرجى إدخال أحرف أبجدية فقط"
        : "Only alphabetic characters are allowed";
    }
    if (!lastNameValid) {
      newFieldErrors.lastName = isRTL
        ? "يرجى إدخال أحرف أبجدية فقط"
        : "Only alphabetic characters are allowed";
    }
    if (!firstNameValid || !lastNameValid) {
      setFieldErrors(newFieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        setError(
          data.error?.message ||
            (isRTL
              ? "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى."
              : "Failed to send message. Please try again.")
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
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-beige">
          <svg
            className="h-8 w-8 text-brand-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          {isRTL ? "شكراً لتواصلك!" : "Thank you for reaching out!"}
        </h3>
        <p className="text-gray-600">
          {isRTL
            ? "سنرد عليك في أقرب وقت ممكن."
            : "We'll get back to you as soon as possible."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={isRTL ? "الاسم" : "Name"}
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={fieldErrors.firstName}
          required
          className="rounded-full border-brand-primary/20 bg-[#f5f5f0] px-5 py-3 placeholder:text-brand-primary/40"
        />
        <Input
          label={isRTL ? "البريد الإلكتروني" : "E-mail"}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="rounded-full border-brand-primary/20 bg-[#f5f5f0] px-5 py-3 placeholder:text-brand-primary/40"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-normal text-brand-primary">
          {isRTL ? "الموضوع" : "Subject"}
        </label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="flex h-12 w-full rounded-full border border-brand-primary/20 bg-[#f5f5f0] px-5 py-3 text-sm text-brand-primary placeholder:text-brand-primary/40 focus:border-brand-primary/40 focus:outline-none focus:ring-0"
        >
          <option value="">
            {isRTL ? "اختر الموضوع" : "Select a subject"}
          </option>
          <option value="General Inquiry">
            {isRTL ? "استفسار عام" : "General Inquiry"}
          </option>
          <option value="Order Inquiry">
            {isRTL ? "استفسار عن طلب" : "Order Inquiry"}
          </option>
          <option value="Product Inquiry">
            {isRTL ? "استفسار عن منتج" : "Product Inquiry"}
          </option>
          <option value="Feedback & Suggestions">
            {isRTL ? "ملاحظات واقتراحات" : "Feedback & Suggestions"}
          </option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-normal text-brand-primary">
          {isRTL ? "الرسالة" : "Message"}
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-lg border border-brand-primary/20 bg-[#f5f5f0] p-4 text-sm text-brand-primary placeholder:text-brand-primary/40 focus:border-brand-primary/40 focus:outline-none focus:ring-0"
          rows={6}
          required
          placeholder={
            isRTL ? "اكتب رسالتك هنا..." : "Message"
          }
        />
      </div>
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brand-primary px-16 py-3 text-sm font-normal text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
        >
          {isRTL ? "إرسال الرسالة" : "send message"}
        </button>
      </div>
    </form>
  );
}
