export type BundleType = 
  | "birthday"
  | "special_events"
  | "gift_sets"
  | "seasonal"
  | "corporate"
  | "wedding"
  | "custom";

export type ShippingFeeOption = 
  | "apply_to_each_bundled_product"
  | "apply_once_per_bundle"
  | "free_shipping"
  | "calculated_at_checkout";

export type SortOption = "price" | "name" | "date" | "popularity";
export type SortOrder = "asc" | "desc";
export type DiscountType = "percent" | "fixed";

// Pricing mode for bundles - controls how the final price is calculated
export type PricingMode = 
  | "box_fixed_price"           // Scenario 1: Box price only, products included
  | "products_only"             // Scenario 2: No box price, sum of product prices
  | "box_plus_products"         // Scenario 3: Box price + sum of product prices
  | "included_items_with_extras"; // Scenario 4: Box includes X items, extras charged

// How extra items are charged in Scenario 4
export type ExtraItemChargingMethod = 
  | "cheapest_first"            // Cheapest items are charged first (recommended)
  | "most_expensive_first";     // Most expensive items are charged first

// Pricing configuration for bundles
export interface BundlePricing {
  mode: PricingMode;
  boxPrice: number;                           // Price of the box/bundle itself
  includedItemsCount: number;                 // For Scenario 4: number of items included in box price
  extraItemChargingMethod: ExtraItemChargingMethod; // For Scenario 4: how to charge extras
  showProductPrices: boolean;                 // Whether to show individual product prices on frontend
}

export interface BundleItemRule {
  categories: number[];
  excludeCategories: number[];
  tags: number[];
  excludeTags: number[];
  products: number[];
  productVariations: number[];
  excludeProducts: number[];
  excludeProductVariations: number[];
}

export interface BundleItemDisplay {
  customTitle: string;
  sortBy: SortOption;
  sortOrder: SortOrder;
  isDefault: boolean;
  defaultProductId: number | null;
  quantity: number;
  quantityMin: number;
  quantityMax: number;
  discountType: DiscountType;
  discountValue: number;
  isOptional: boolean;
  isFree: boolean;
  showPrice: boolean;
}

export interface BundleItem {
  id: string;
  title: string;
  isExpanded: boolean;
  rule: BundleItemRule;
  display: BundleItemDisplay;
}

export interface BundleConfiguration {
  id: string;
  productId: number | null;
  title: string;
  bundleType: BundleType;
  shippingFee: ShippingFeeOption;
  pricing: BundlePricing;
  isEnabled: boolean;
  items: BundleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BundleTypeOption {
  value: BundleType;
  label: string;
  labelAr: string;
}

export const BUNDLE_TYPES: BundleTypeOption[] = [
  { value: "birthday", label: "Birthday", labelAr: "عيد ميلاد" },
  { value: "special_events", label: "Special Events", labelAr: "مناسبات خاصة" },
  { value: "gift_sets", label: "Gift Sets", labelAr: "مجموعات هدايا" },
  { value: "seasonal", label: "Seasonal", labelAr: "موسمي" },
  { value: "corporate", label: "Corporate", labelAr: "شركات" },
  { value: "wedding", label: "Wedding", labelAr: "زفاف" },
  { value: "custom", label: "Custom", labelAr: "مخصص" },
];

export const SHIPPING_FEE_OPTIONS: { value: ShippingFeeOption; label: string; labelAr: string }[] = [
  { value: "apply_to_each_bundled_product", label: "Apply to each bundled product", labelAr: "تطبيق على كل منتج مجمع" },
  { value: "apply_once_per_bundle", label: "Apply once per bundle", labelAr: "تطبيق مرة واحدة لكل حزمة" },
  { value: "free_shipping", label: "Free shipping", labelAr: "شحن مجاني" },
  { value: "calculated_at_checkout", label: "Calculated at checkout", labelAr: "يحسب عند الدفع" },
];

export const SORT_OPTIONS: { value: SortOption; label: string; labelAr: string }[] = [
  { value: "price", label: "Price", labelAr: "السعر" },
  { value: "name", label: "Name", labelAr: "الاسم" },
  { value: "date", label: "Date", labelAr: "التاريخ" },
  { value: "popularity", label: "Popularity", labelAr: "الشعبية" },
];

export const SORT_ORDER_OPTIONS: { value: SortOrder; label: string; labelAr: string }[] = [
  { value: "asc", label: "ASC", labelAr: "تصاعدي" },
  { value: "desc", label: "DESC", labelAr: "تنازلي" },
];

export const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string; labelAr: string }[] = [
  { value: "percent", label: "Percent of total (%)", labelAr: "نسبة من الإجمالي (%)" },
  { value: "fixed", label: "Fixed amount", labelAr: "مبلغ ثابت" },
];

export const PRICING_MODE_OPTIONS: { value: PricingMode; label: string; labelAr: string; description: string; descriptionAr: string }[] = [
  { 
    value: "box_fixed_price", 
    label: "Box with Fixed Price (Products Included)", 
    labelAr: "صندوق بسعر ثابت (المنتجات مشمولة)",
    description: "Box has its own fixed price. Products inside are for selection only - their prices are not counted.",
    descriptionAr: "الصندوق له سعر ثابت خاص به. المنتجات بالداخل للاختيار فقط - أسعارها لا تُحتسب."
  },
  { 
    value: "products_only", 
    label: "Box Without Price (Products Priced Individually)", 
    labelAr: "صندوق بدون سعر (المنتجات مسعرة فردياً)",
    description: "Box has no price. Final price is the sum of selected product prices.",
    descriptionAr: "الصندوق ليس له سعر. السعر النهائي هو مجموع أسعار المنتجات المختارة."
  },
  { 
    value: "box_plus_products", 
    label: "Box with Price + Product Prices", 
    labelAr: "صندوق بسعر + أسعار المنتجات",
    description: "Box has a base price, plus products add their individual prices.",
    descriptionAr: "الصندوق له سعر أساسي، بالإضافة إلى أسعار المنتجات الفردية."
  },
  { 
    value: "included_items_with_extras", 
    label: "Box Price Includes X Items, Extras Paid", 
    labelAr: "سعر الصندوق يشمل X عناصر، الإضافات مدفوعة",
    description: "Box price includes a set number of items. Additional items beyond that are charged.",
    descriptionAr: "سعر الصندوق يشمل عدداً محدداً من العناصر. العناصر الإضافية تُحتسب."
  },
];

export const EXTRA_ITEM_CHARGING_OPTIONS: { value: ExtraItemChargingMethod; label: string; labelAr: string }[] = [
  { value: "cheapest_first", label: "Cheapest items charged first (recommended)", labelAr: "الأرخص يُحتسب أولاً (موصى به)" },
  { value: "most_expensive_first", label: "Most expensive items charged first", labelAr: "الأغلى يُحتسب أولاً" },
];

export function createDefaultBundlePricing(): BundlePricing {
  return {
    mode: "box_fixed_price",
    boxPrice: 0,
    includedItemsCount: 3,
    extraItemChargingMethod: "cheapest_first",
    showProductPrices: false,
  };
}

export function createDefaultBundleItem(id: string): BundleItem {
  return {
    id,
    title: `Bundle item ${id}`,
    isExpanded: true,
    rule: {
      categories: [],
      excludeCategories: [],
      tags: [],
      excludeTags: [],
      products: [],
      productVariations: [],
      excludeProducts: [],
      excludeProductVariations: [],
    },
    display: {
      customTitle: "",
      sortBy: "price",
      sortOrder: "asc",
      isDefault: false,
      defaultProductId: null,
      quantity: 1,
      quantityMin: 1,
      quantityMax: 10,
      discountType: "percent",
      discountValue: 0,
      isOptional: false,
      isFree: false,
      showPrice: true,
    },
  };
}

export function createDefaultBundleConfiguration(): BundleConfiguration {
  return {
    id: crypto.randomUUID(),
    productId: null,
    title: "",
    bundleType: "custom",
    shippingFee: "apply_to_each_bundled_product",
    pricing: createDefaultBundlePricing(),
    isEnabled: false,
    items: [createDefaultBundleItem("1")],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
