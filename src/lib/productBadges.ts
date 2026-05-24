import type { Locale } from "@/config/site";

export interface ProductTagLike {
  slug: string;
  name?: string;
}

export interface ProductBadgeConfig {
  tag_slug: string;
  label_en: string;
  label_ar: string;
  color: string;
}

export interface ProductBadgeSettingsResponse {
  badge_tags?: ProductBadgeConfig[];
}

export interface ProductBadgeItem extends ProductBadgeConfig {
  slug: string;
  label: string;
  textColor: string;
}

export const DEFAULT_PRODUCT_BADGE_TAGS: ProductBadgeConfig[] = [
  { tag_slug: "ramadan-special", label_en: "Ramadan Special", label_ar: "\u0639\u0631\u0636 \u0631\u0645\u0636\u0627\u0646", color: "#4A1633" },
  { tag_slug: "new", label_en: "New", label_ar: "\u062c\u062f\u064a\u062f", color: "#22c55e" },
  { tag_slug: "hot", label_en: "Hot", label_ar: "\u0631\u0627\u0626\u062c", color: "#ef4444" },
  { tag_slug: "limited", label_en: "Limited", label_ar: "\u0645\u062d\u062f\u0648\u062f", color: "#f97316" },
  { tag_slug: "bestseller", label_en: "Bestseller", label_ar: "\u0627\u0644\u0623\u0643\u062b\u0631 \u0645\u0628\u064a\u0639\u0627\u064b", color: "#8b5cf6" },
  { tag_slug: "exclusive", label_en: "Exclusive", label_ar: "\u062d\u0635\u0631\u064a", color: "#4A1633" },
];

const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function normalizeBadgeColor(color: string | undefined): string {
  if (!color) return "#4A1633";
  const trimmed = color.trim();
  return HEX_COLOR_RE.test(trimmed) ? trimmed : "#4A1633";
}

export function getReadableBadgeTextColor(backgroundColor: string): string {
  const color = normalizeBadgeColor(backgroundColor).slice(1);
  const red = parseInt(color.slice(0, 2), 16);
  const green = parseInt(color.slice(2, 4), 16);
  const blue = parseInt(color.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? "#111111" : "#ffffff";
}

export function normalizeProductBadgeSettings(
  response?: ProductBadgeSettingsResponse | null
): ProductBadgeConfig[] {
  const merged = new Map<string, ProductBadgeConfig>();

  for (const badge of DEFAULT_PRODUCT_BADGE_TAGS) {
    merged.set(badge.tag_slug, badge);
  }

  for (const badge of response?.badge_tags ?? []) {
    const slug = normalizeSlug(String(badge.tag_slug || ""));
    if (!slug) continue;

    merged.set(slug, {
      tag_slug: slug,
      label_en: String(badge.label_en || slug),
      label_ar: String(badge.label_ar || badge.label_en || slug),
      color: normalizeBadgeColor(badge.color),
    });
  }

  return Array.from(merged.values());
}

export function getProductBadgeItems(
  tags: ProductTagLike[] | undefined,
  badgeSettings: ProductBadgeConfig[],
  locale: Locale,
  extraTagSlugs: string[] = []
): ProductBadgeItem[] {
  const tagSlugs = new Set<string>();

  for (const tag of tags ?? []) {
    const slug = normalizeSlug(tag.slug || "");
    if (slug) tagSlugs.add(slug);
  }

  for (const slug of extraTagSlugs) {
    const normalized = normalizeSlug(slug);
    if (normalized) tagSlugs.add(normalized);
  }

  if (tagSlugs.size === 0) return [];

  return badgeSettings.flatMap((badge) => {
    const slug = normalizeSlug(badge.tag_slug);
    if (!tagSlugs.has(slug)) return [];

    const color = normalizeBadgeColor(badge.color);
    return [{
      ...badge,
      tag_slug: slug,
      slug,
      color,
      label: locale === "ar" ? badge.label_ar : badge.label_en,
      textColor: getReadableBadgeTextColor(color),
    }];
  });
}
