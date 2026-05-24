/**
 * Omnisend tracking utility for headless WooCommerce frontend.
 *
 * Omnisend's "added product to cart" automation trigger relies on
 * the browser snippet receiving contact-identify + cart events.
 * Because the site is headless Next.js, the WooCommerce plugin
 * cannot inject these automatically -- we fire them from the client.
 *
 * Event names and payloads follow the official Omnisend JavaScript
 * snippet API documented at:
 * @see https://api-docs.omnisend.com/docs/how-to-enable-cart-abandonment
 * @see https://api-docs.omnisend.com/docs/how-to-track-cart-events-snippet
 */

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

export interface OmnisendLineItem {
  productID: string;
  productTitle: string;
  productDescription?: string;
  productPrice: number;
  productImageURL?: string;
  productURL?: string;
}

export interface OmnisendCartEventPayload {
  /** The item that was just added (for addedToCart events). */
  addedItem: OmnisendLineItem;
  /** All items currently in the cart. */
  lineItems: OmnisendLineItem[];
  /** Cart total value (in major currency units, e.g. 19.99). */
  value: number;
  /** ISO 4217 currency code, e.g. "AED". */
  currency: string;
  /** Unique cart identifier from CoCart (cart_key). */
  cartID: string;
  /** URL to recover the abandoned cart. */
  abandonedCheckoutURL?: string;
  /** Contact email so Omnisend can associate the event with a person. */
  email?: string;
}

export interface OmnisendCheckoutEventPayload {
  /** All items currently in the cart. */
  lineItems: OmnisendLineItem[];
  /** Cart total value (in major currency units, e.g. 19.99). */
  value: number;
  /** ISO 4217 currency code, e.g. "AED". */
  currency: string;
  /** Unique cart identifier from CoCart (cart_key). */
  cartID: string;
  /** URL to recover the abandoned checkout. */
  abandonedCheckoutURL?: string;
  /** Contact email so Omnisend can associate the event with a person. */
  email?: string;
}

// Extend Window to include omnisend global
declare global {
  interface Window {
    omnisend?: Array<unknown[]>;
  }
}

// ---------------------------------------------------------------------------
// Low-level push helper
// ---------------------------------------------------------------------------

function push(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.omnisend = window.omnisend || [];
  window.omnisend.push(args);
}

/** Generate a simple unique event ID (UUID v4-like). */
function generateEventID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Identify the current visitor so Omnisend can associate events with
 * an email address. Call this after login or when the user's email
 * becomes known (e.g. at checkout).
 */
export function omnisendIdentify(email: string): void {
  if (!email) return;
  push("track", "$identify", { email });
}

/**
 * Track an "added product to cart" event using the official Omnisend
 * JavaScript snippet format. This is the event that triggers the
 * Omnisend "Abandoned Cart" workflow.
 *
 * @see https://api-docs.omnisend.com/docs/how-to-track-cart-events-snippet
 */
export function omnisendTrackAddToCart(
  payload: OmnisendCartEventPayload
): void {
  const eventData: Record<string, unknown> = {
    origin: "api",
    eventID: generateEventID(),
    eventVersion: "",
    properties: {
      abandonedCheckoutURL:
        payload.abandonedCheckoutURL ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/en/cart`,
      cartID: payload.cartID,
      value: payload.value,
      currency: payload.currency,
      addedItem: {
        productID: payload.addedItem.productID,
        productTitle: payload.addedItem.productTitle,
        productDescription: payload.addedItem.productDescription || "",
        productPrice: payload.addedItem.productPrice,
        productImageURL: payload.addedItem.productImageURL || "",
        productURL: payload.addedItem.productURL || "",
      },
      lineItems: payload.lineItems.map((item) => ({
        productID: item.productID,
        productTitle: item.productTitle,
        productDescription: item.productDescription || "",
        productPrice: item.productPrice,
        productImageURL: item.productImageURL || "",
        productURL: item.productURL || "",
      })),
    },
  };

  // Include contact info so Omnisend can associate the event with a person
  // (critical for guest users who haven't gone through $identify).
  if (payload.email) {
    eventData.contact = { email: payload.email };
  }

  push("track", "added product to cart", eventData);
}

/**
 * Track a "started checkout" event using the official Omnisend format.
 * This cancels the "Abandoned Cart" flow and starts "Abandoned Checkout".
 */
export function omnisendTrackStartedCheckout(
  payload: OmnisendCheckoutEventPayload
): void {
  const eventData: Record<string, unknown> = {
    origin: "api",
    eventID: generateEventID(),
    eventVersion: "",
    properties: {
      abandonedCheckoutURL:
        payload.abandonedCheckoutURL ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/en/checkout`,
      cartID: payload.cartID,
      value: payload.value,
      currency: payload.currency,
      lineItems: payload.lineItems.map((item) => ({
        productID: item.productID,
        productTitle: item.productTitle,
        productDescription: item.productDescription || "",
        productPrice: item.productPrice,
        productImageURL: item.productImageURL || "",
        productURL: item.productURL || "",
      })),
    },
  };

  if (payload.email) {
    eventData.contact = { email: payload.email };
  }

  push("track", "started checkout", eventData);
}

// ---------------------------------------------------------------------------
// Wishlist tracking
// ---------------------------------------------------------------------------

export interface OmnisendWishlistEventPayload {
  /** The product that was added to the wishlist. */
  productID: string;
  productTitle: string;
  productPrice: number;
  productImageURL?: string;
  productURL?: string;
  /** Contact email so Omnisend can associate the event with a person. */
  email?: string;
}

/**
 * Track an "added to wishlist" custom event.
 * This fires when a logged-in user adds a product to their wishlist.
 * Used as the trigger for the "Wishlist Reminder" automation workflow.
 */
export function omnisendTrackAddedToWishlist(
  payload: OmnisendWishlistEventPayload
): void {
  const eventData: Record<string, unknown> = {
    origin: "api",
    eventID: generateEventID(),
    eventVersion: "",
    properties: {
      productID: payload.productID,
      productTitle: payload.productTitle,
      productPrice: payload.productPrice,
      productImageURL: payload.productImageURL || "",
      productURL: payload.productURL || "",
    },
  };

  if (payload.email) {
    eventData.contact = { email: payload.email };
  }

  push("track", "added to wishlist", eventData);
}

// ---------------------------------------------------------------------------
// Page / product view tracking
// ---------------------------------------------------------------------------

/**
 * Track a page view.
 */
export function omnisendTrackPageView(): void {
  push("track", "$pageViewed");
}

/**
 * Track a product view.
 */
export function omnisendTrackProductViewed(
  productID: string,
  productTitle: string,
  productPrice: number,
  productUrl?: string,
  productImageUrl?: string
): void {
  push("track", "$productViewed", {
    productID,
    productTitle,
    productPrice,
    productUrl: productUrl || "",
    productImageUrl: productImageUrl || "",
  });
}
