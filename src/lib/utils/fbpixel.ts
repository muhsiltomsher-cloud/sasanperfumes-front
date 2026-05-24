/**
 * Facebook Pixel event tracking utility for headless WooCommerce frontend.
 *
 * Fires standard Meta commerce events (ViewContent, AddToCart, InitiateCheckout,
 * Purchase) with the correct `content_ids` and `content_type` so that the
 * Meta catalog match rate is maintained above 90%.
 *
 * The `content_ids` sent here must match the product IDs in the Meta catalog
 * (synced from WooCommerce via the Facebook for WooCommerce plugin).
 *
 * @see https://developers.facebook.com/docs/meta-pixel/reference
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq(...args);
}

// ---------------------------------------------------------------------------
// ViewContent — fired on product detail pages
// ---------------------------------------------------------------------------

export interface FbViewContentParams {
  productId: number;
  productName: string;
  /** Product category name (e.g. "Perfumes") */
  category?: string;
  /** Price in major currency units (e.g. 19.99) */
  value?: number;
  /** ISO 4217 currency code (e.g. "AED") */
  currency?: string;
}

export function fbTrackViewContent(params: FbViewContentParams): void {
  fbq("track", "ViewContent", {
    content_ids: [String(params.productId)],
    content_type: "product",
    content_name: params.productName,
    content_category: params.category || "",
    value: params.value ?? 0,
    currency: params.currency || "AED",
  });
}

// ---------------------------------------------------------------------------
// AddToCart — fired when a product is added to the cart
// ---------------------------------------------------------------------------

export interface FbAddToCartParams {
  productId: number;
  productName: string;
  /** Price in major currency units (e.g. 19.99) */
  value?: number;
  /** ISO 4217 currency code (e.g. "AED") */
  currency?: string;
  quantity?: number;
}

export function fbTrackAddToCart(params: FbAddToCartParams): void {
  fbq("track", "AddToCart", {
    content_ids: [String(params.productId)],
    content_type: "product",
    content_name: params.productName,
    value: params.value ?? 0,
    currency: params.currency || "AED",
    num_items: params.quantity ?? 1,
  });
}

// ---------------------------------------------------------------------------
// InitiateCheckout — fired when the user starts checkout
// ---------------------------------------------------------------------------

export interface FbInitiateCheckoutParams {
  /** All product IDs in the cart */
  contentIds: string[];
  /** Total cart value in major currency units */
  value: number;
  /** ISO 4217 currency code (e.g. "AED") */
  currency?: string;
  /** Number of items in cart */
  numItems?: number;
}

export function fbTrackInitiateCheckout(params: FbInitiateCheckoutParams): void {
  fbq("track", "InitiateCheckout", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    currency: params.currency || "AED",
    num_items: params.numItems ?? params.contentIds.length,
  });
}

// ---------------------------------------------------------------------------
// Purchase — fired on order confirmation (successful payment)
// ---------------------------------------------------------------------------

export interface FbPurchaseParams {
  /** All product IDs in the order */
  contentIds: string[];
  /** Order total in major currency units */
  value: number;
  /** ISO 4217 currency code (e.g. "AED") */
  currency: string;
  /** Number of items purchased */
  numItems?: number;
}

export function fbTrackPurchase(params: FbPurchaseParams): void {
  fbq("track", "Purchase", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    currency: params.currency,
    num_items: params.numItems ?? params.contentIds.length,
  });
}
