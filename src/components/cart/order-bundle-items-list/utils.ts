import type { OrderLineItem, OrderLineItemMetaData } from "@/lib/api/customer";
import type { BundleItem } from "./types";

export function getOrderBundleItems(item: OrderLineItem): BundleItem[] | null {
  try {
    const metaData = item.meta_data;
    if (!metaData || !Array.isArray(metaData)) return null;

    const bundleItemsMeta = metaData.find(
      (meta: OrderLineItemMetaData) => meta.key === "_bundle_items" || meta.key === "bundle_items"
    );

    if (!bundleItemsMeta) return null;

    let bundleItems = bundleItemsMeta.value;

    if (typeof bundleItems === "string") {
      try {
        bundleItems = JSON.parse(bundleItems);
      } catch {
        return null;
      }
    }

    if (!Array.isArray(bundleItems) || bundleItems.length === 0) {
      return null;
    }

    const parsed = bundleItems
      .filter((bi: unknown): bi is BundleItem => 
        typeof bi === "object" && 
        bi !== null && 
        typeof (bi as BundleItem).product_id === "number"
      )
      .map((bi) => ({
        product_id: bi.product_id,
        name: typeof bi.name === "string" ? bi.name : undefined,
        price: typeof bi.price === "number" || typeof bi.price === "string" ? bi.price : undefined,
        quantity: typeof bi.quantity === "number" ? bi.quantity : undefined,
        is_addon: typeof bi.is_addon === "boolean" ? bi.is_addon : undefined,
        is_free: typeof bi.is_free === "boolean" ? bi.is_free : undefined,
        is_fixed: typeof bi.is_fixed === "boolean" ? bi.is_fixed : undefined,
      }));

    // Detect free items for older orders that don't have is_free flag stored.
    // Compare sum of bundle item prices to order line item total — if the sum
    // exceeds the charged total, mark trailing items as free (add-on slots).
    return detectBundleItemFreeStatus(parsed, item);
  } catch {
    return null;
  }
}

/**
 * Detect free bundle items by comparing the sum of all bundle item prices
 * against the actual order line item total. If the sum exceeds what was
 * charged, items are marked as free starting from the last item backwards
 * (add-on / optional slots are typically at the end of the list).
 */
function detectBundleItemFreeStatus(items: BundleItem[], orderItem: OrderLineItem): BundleItem[] {
  // If any item already has is_free explicitly set, the data is complete
  const hasExplicitFreeFlag = items.some(bi => bi.is_free === true || bi.is_free === false);
  if (hasExplicitFreeFlag) return items;

  const lineItemTotal = parseFloat(orderItem.total) || 0;
  if (lineItemTotal <= 0) return items;

  // Multiply by parent order quantity since orderItem.total already includes it
  const orderQty = orderItem.quantity || 1;
  const allItemsSum = items.reduce((sum, bi) => {
    const price = typeof bi.price === "string" ? parseFloat(bi.price) : Number(bi.price || 0);
    const qty = bi.quantity || 1;
    return sum + (price * qty * orderQty);
  }, 0);

  // If the sum of bundle item prices exceeds the line item total,
  // the difference represents free items
  const freeAmount = allItemsSum - lineItemTotal;
  if (freeAmount <= 0.01) return items;

  // Mark items as free starting from the last item backwards
  let remainingFree = freeAmount;
  const enriched = [...items];
  for (let i = enriched.length - 1; i >= 0 && remainingFree > 0.01; i--) {
    const price = typeof enriched[i].price === "string" ? parseFloat(enriched[i].price as string) : Number(enriched[i].price || 0);
    const qty = enriched[i].quantity || 1;
    const itemTotal = price * qty * orderQty;
    if (itemTotal > 0 && itemTotal <= remainingFree + 0.01) {
      enriched[i] = { ...enriched[i], is_free: true, is_addon: true };
      remainingFree -= itemTotal;
    }
  }

  return enriched;
}

export function getOrderBundleItemsTotal(bundleItems: BundleItem[]): number {
  return bundleItems.reduce((total, item) => {
    if (item.is_free) return total;
    const price = typeof item.price === "string" ? parseFloat(item.price) : Number(item.price || 0);
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
}

export function getOrderBoxPrice(item: OrderLineItem, bundleItemsTotal?: number): number | null {
  try {
    const metaData = item.meta_data;
    if (!metaData || !Array.isArray(metaData)) return null;

    const boxPriceMeta = metaData.find(
      (meta: OrderLineItemMetaData) => meta.key === "_box_price" || meta.key === "box_price"
    );

    if (boxPriceMeta) {
      const boxPrice = boxPriceMeta.value;
      if (typeof boxPrice === "number" && boxPrice > 0) return boxPrice;
      if (typeof boxPrice === "string" && parseFloat(boxPrice) > 0) return parseFloat(boxPrice);
    }

    if (bundleItemsTotal !== undefined && bundleItemsTotal > 0) {
      const itemTotal = parseFloat(item.total);
      if (itemTotal > bundleItemsTotal) {
        const calculatedBoxPrice = itemTotal - bundleItemsTotal;
        if (calculatedBoxPrice > 0) {
          return calculatedBoxPrice;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function isOrderFreeGift(item: OrderLineItem): boolean {
  try {
    const metaData = item.meta_data;
    if (!metaData || !Array.isArray(metaData)) return false;

    const freeGiftMeta = metaData.find(
      (meta: OrderLineItemMetaData) => 
        meta.key === "_sasanperfumes_free_gift" || 
        meta.key === "sasanperfumes_free_gift" ||
        meta.key === "_is_free_gift" ||
        meta.key === "is_free_gift"
    );

    if (freeGiftMeta) {
      const value = freeGiftMeta.value;
      return value === true || value === "1" || value === "yes" || value === 1;
    }

    const itemTotal = parseFloat(item.total);
    if (itemTotal === 0) {
      const nameLower = item.name.toLowerCase();
      if (nameLower.includes("free") || nameLower.includes("gift")) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function isOrderBundleProduct(item: OrderLineItem): boolean {
  const bundleItems = getOrderBundleItems(item);
  return bundleItems !== null && bundleItems.length > 0;
}

export function getOrderPricingMode(item: OrderLineItem): "sum" | "fixed" {
  try {
    const metaData = item.meta_data;
    if (!metaData || !Array.isArray(metaData)) return "sum";

    const pricingModeMeta = metaData.find(
      (meta: OrderLineItemMetaData) => meta.key === "_pricing_mode" || meta.key === "pricing_mode"
    );

    if (pricingModeMeta) {
      const value = pricingModeMeta.value;
      if (value === "fixed" || value === "sum") return value;
    }

    return "sum";
  } catch {
    return "sum";
  }
}

export function getOrderFixedPrice(item: OrderLineItem): number | null {
  try {
    const metaData = item.meta_data;
    if (!metaData || !Array.isArray(metaData)) return null;

    const fixedPriceMeta = metaData.find(
      (meta: OrderLineItemMetaData) => meta.key === "_fixed_price" || meta.key === "fixed_price"
    );

    if (fixedPriceMeta) {
      const fixedPrice = fixedPriceMeta.value;
      if (typeof fixedPrice === "number" && fixedPrice > 0) return fixedPrice;
      if (typeof fixedPrice === "string" && parseFloat(fixedPrice) > 0) return parseFloat(fixedPrice);
    }

    return null;
  } catch {
    return null;
  }
}

export function getOrderBundleTotal(item: OrderLineItem): number | null {
  try {
    const metaData = item.meta_data;
    if (!metaData || !Array.isArray(metaData)) return null;

    const bundleTotalMeta = metaData.find(
      (meta: OrderLineItemMetaData) => meta.key === "_bundle_total" || meta.key === "bundle_total"
    );

    if (bundleTotalMeta) {
      const bundleTotal = bundleTotalMeta.value;
      if (typeof bundleTotal === "number" && bundleTotal > 0) return bundleTotal;
      if (typeof bundleTotal === "string" && parseFloat(bundleTotal) > 0) return parseFloat(bundleTotal);
    }

    return null;
  } catch {
    return null;
  }
}
