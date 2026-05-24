"use client";

import { useCustomerTracking } from "@/hooks/useCustomerTracking";

/**
 * Invisible component that initializes customer tracking.
 * Captures landing page, referrer, UTM params, device info on first visit.
 * Tracks page navigations throughout the session.
 * Must be placed inside a Suspense boundary since it uses useSearchParams.
 */
export function CustomerTracker() {
  useCustomerTracking();
  return null;
}
