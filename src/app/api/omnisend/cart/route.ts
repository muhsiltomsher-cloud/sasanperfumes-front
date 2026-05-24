import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side API route to sync carts to Omnisend and fire the
 * "added product to cart" trigger event for the abandoned-cart workflow.
 *
 * Two separate Omnisend systems are involved:
 *   1. POST/PUT /v3/carts  — creates/updates the cart *object* (storage).
 *   2. POST    /v5/events — fires the trigger *event* that the automation
 *      workflow listens for ("Added product to cart (api)" trigger type).
 *
 * Both calls are required: the cart object alone does NOT fire the trigger,
 * and the trigger event alone does NOT create the cart object that the
 * email template pulls product data from.
 */

const OMNISEND_API_URL = "https://api.omnisend.com/v3/carts";
const OMNISEND_EVENTS_URL = "https://api.omnisend.com/v5/events";

function getApiKey(): string {
  return process.env.OMNISEND_API_KEY || "";
}

/**
 * Validate cartID to prevent SSRF via path traversal.
 * Only allows alphanumeric characters, hyphens, and underscores.
 */
function isValidCartID(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Generate a UUID v4 for the eventID required by Omnisend /v5/events.
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface OmnisendCartProduct {
  cartProductID: string;
  productID: string;
  variantID: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  productUrl?: string;
}

interface OmnisendCartPayload {
  cartID: string;
  email: string;
  currency: string;
  cartSum: number;
  cartRecoveryUrl: string;
  products: OmnisendCartProduct[];
}

export async function POST(request: NextRequest) {
  const apiKey = getApiKey();
  if (!apiKey) {
    // Silently fail if API key not configured — don't break the cart flow
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    const body: OmnisendCartPayload = await request.json();

    // Validate required fields
    if (!body.cartID || !body.email || !body.products?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: cartID, email, products" },
        { status: 400 }
      );
    }

    // Sanitize cartID to prevent SSRF via path traversal
    if (!isValidCartID(body.cartID)) {
      return NextResponse.json(
        { success: false, error: "Invalid cartID format" },
        { status: 400 }
      );
    }

    // Try to replace existing cart first, fall back to creating new one
    const replaceResponse = await fetch(`${OMNISEND_API_URL}/${encodeURIComponent(body.cartID)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        email: body.email,
        currency: body.currency,
        cartSum: body.cartSum,
        cartRecoveryUrl: body.cartRecoveryUrl,
        products: body.products,
      }),
    });

    let cartAction = "";

    if (replaceResponse.ok) {
      cartAction = "updated";
    }

    if (!cartAction) {
      // If replace fails (cart doesn't exist yet), create a new one
      const createResponse = await fetch(OMNISEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          cartID: body.cartID,
          email: body.email,
          currency: body.currency,
          cartSum: body.cartSum,
          cartRecoveryUrl: body.cartRecoveryUrl,
          products: body.products,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.text();
        console.error("[Omnisend Cart API] Failed to create cart:", errorData);
        // Don't fail the main cart flow — just log the error
        return NextResponse.json({ success: false, error: errorData }, { status: 200 });
      }

      cartAction = "created";
    }

    // --- Fire the "added product to cart" trigger event via /v5/events ---
    // This is what the Omnisend automation workflow actually listens for
    // (trigger type: "Added product to cart (api)").
    // Cart objects alone do NOT trigger the workflow.
    try {
      const firstProduct = body.products[0];
      await fetch(OMNISEND_EVENTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          eventName: "added product to cart",
          origin: "api",
          eventVersion: "",
          eventID: generateUUID(),
          contact: { email: body.email },
          properties: {
            abandonedCheckoutURL: body.cartRecoveryUrl,
            cartID: body.cartID,
            value: body.cartSum,
            currency: body.currency,
            addedItem: {
              productID: firstProduct.productID,
              productTitle: firstProduct.title,
              productPrice: firstProduct.price,
              productImageURL: firstProduct.imageUrl || "",
              productURL: firstProduct.productUrl || "",
            },
            lineItems: body.products.map((p) => ({
              productID: p.productID,
              productTitle: p.title,
              productPrice: p.price,
              productImageURL: p.imageUrl || "",
              productURL: p.productUrl || "",
            })),
          },
        }),
      });
    } catch (eventError) {
      // Non-blocking: don't break cart flow if event fails
      console.error("[Omnisend Cart API] Failed to send trigger event:", eventError);
    }

    return NextResponse.json({ success: true, action: cartAction });
  } catch (error) {
    console.error("[Omnisend Cart API] Error:", error);
    // Don't fail the main cart flow
    return NextResponse.json({ success: true, skipped: true });
  }
}

/**
 * DELETE handler to remove a cart from Omnisend when the user completes
 * an order or clears their cart.
 */
export async function DELETE(request: NextRequest) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    const { cartID } = await request.json();
    if (!cartID) {
      return NextResponse.json({ success: false, error: "Missing cartID" }, { status: 400 });
    }

    // Sanitize cartID to prevent SSRF via path traversal
    if (!isValidCartID(cartID)) {
      return NextResponse.json(
        { success: false, error: "Invalid cartID format" },
        { status: 400 }
      );
    }

    await fetch(`${OMNISEND_API_URL}/${encodeURIComponent(cartID)}`, {
      method: "DELETE",
      headers: { "X-API-KEY": apiKey },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Omnisend Cart API] Delete error:", error);
    return NextResponse.json({ success: true, skipped: true });
  }
}
