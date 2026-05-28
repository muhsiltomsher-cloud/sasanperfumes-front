/**
 * Static Menu Configuration
 *
 * This file contains the static menu data for the site.
 * Update this file to change navigation items and mega menu categories.
 *
 * The menu supports both English (en) and Arabic (ar) locales.
 */

import type { Locale } from "@/config/site";
import { decodeHtmlEntities } from "@/lib/utils";

/**
 * Navigation Item Type
 */
export interface NavigationItem {
  name: {
    en: string;
    ar: string;
  };
  href: string;
  /** If true, this item triggers the mega menu on hover (desktop) */
  hasMegaMenu?: boolean;
}

/**
 * Static Navigation Items
 *
 * Main navigation links displayed in the header.
 * The href should NOT include the locale prefix - it will be added automatically.
 */
export const navigationItems: NavigationItem[] = [];

/**
 * Static Header Category Links
 *
 * Category links displayed in the header navigation.
 * Order: Oils, Gift Sets, Perfumes, Personal Care, Home Fragrances
 */
export const headerCategoryLinks: NavigationItem[] = [];

/**
 * Get navigation items for a specific locale
 */
export function getNavigationItems(locale: Locale) {
  return navigationItems.map((item) => ({
    name: item.name[locale],
    href: `/${locale}${item.href}`,
    hasMegaMenu: item.hasMegaMenu,
  }));
}

/**
 * Get header category links for a specific locale
 */
export function getHeaderCategoryLinks(locale: Locale) {
  return headerCategoryLinks.map((item, index) => ({
    id: index + 1,
    name: item.name[locale],
    href: `/${locale}${item.href}`,
    hasMegaMenu: item.hasMegaMenu ?? false,
    hasBrandsMegaMenu: false,
  }));
}

const menuArabicTranslations: Record<string, string> = {
  "shop all": "تسوق الكل",
  "shop": "تسوق",
  "categories": "الفئات",
  "home fragrances": "عطور المنزل",
  "perfumes": "العطور",
  "personal care": "العناية الشخصية",
  "gifts set": "مجموعات الهدايا",
  "gift sets": "مجموعات الهدايا",
  "oils": "الزيوت",
  "fragrance oils": "زيوت العطور",
  "perfumes & oils": "العطور والزيوت",
  "hair mist": "معطر الشعر",
  "hair & body mist": "بخاخ الشعر والجسم",
  "hand & body lotion": "لوشن اليدين والجسم",
  "reed diffusers": "موزعات العطر",
  "candles": "الشموع",
  "diffusers": "موزعات العطر",
  "room sprays": "بخاخات الغرف",
  "incense": "البخور",
  "for him": "له",
  "for her": "لها",
  "luxury sets": "مجموعات فاخرة",
  "men's perfumes": "عطور رجالية",
  "women's perfumes": "عطور نسائية",
  "unisex perfumes": "عطور للجنسين",
  "oud perfumes": "عطور العود",
  "all over spray": "سبراي للجسم",
  "air fresheners": "معطرات الجو",
  "home": "الرئيسية",
  "about": "من نحن",
  "contact": "اتصل بنا",
  "faq": "الأسئلة الشائعة",
  "brands": "العلامات التجارية",
  "services": "الخدمات",
  "blog": "المدونة",
  "private labeling": "التصنيع الخاص",
  "what we do": "ماذا نفعل",
};

export function translateToArabic(englishTitle: string): string {
  const decoded = decodeHtmlEntities(englishTitle);
  const key = decoded.toLowerCase().trim();
  return menuArabicTranslations[key] || decoded;
}

/**
 * Navigation item type for dynamic WordPress menu
 */
export interface DynamicNavigationItem {
  id: number;
  name: string;
  href: string;
  hasMegaMenu: boolean;
  hasBrandsMegaMenu?: boolean;
}

/**
 * Check if a menu item should have a mega menu
 * Only "Shop All" / "Shop" / "تسوق" items should have mega menu
 */
function shouldHaveMegaMenu(title: string): boolean {
  const megaMenuTitles = ["shop all", "shop", "تسوق", "تسوق الكل"];
  return megaMenuTitles.includes(title.toLowerCase().trim());
}

export function shouldHaveBrandsMegaMenu(title: string): boolean {
  const brandTitles = ["brands", "العلامات التجارية", "الماركات"];
  return brandTitles.includes(title.toLowerCase().trim());
}

/**
 * Normalize WordPress URL to locale-aware frontend route
 */
function normalizeMenuUrl(url: string, locale: Locale): string {
  if (!url || url === "#") return `/${locale}`;
  
  let normalizedUrl = url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const urlObj = new URL(url);
      normalizedUrl = urlObj.pathname;
    } catch {
      normalizedUrl = url;
    }
  }
  
  normalizedUrl = normalizedUrl.replace(/^\/?(en|ar)\//, "/");
  
  if (normalizedUrl === "/" || normalizedUrl === "") {
    return `/${locale}`;
  }
  
  if (normalizedUrl.startsWith("/category/")) {
    const slug = normalizedUrl.replace("/category/", "");
    return `/${locale}/category/${slug}`;
  }
  
  if (normalizedUrl.startsWith("/shop")) {
    return `/${locale}/shop`;
  }
  
  if (!normalizedUrl.startsWith("/")) {
    normalizedUrl = "/" + normalizedUrl;
  }
  
  return `/${locale}${normalizedUrl}`;
}

/**
 * Get dynamic navigation items from WordPress menu
 * Only top-level items are returned, with mega menu flag for Shop All
 */
export function getDynamicNavigationItems(
  menuItems: Array<{ id: number; title: string; url: string; parent: number }> | null | undefined,
  locale: Locale
): DynamicNavigationItem[] {
  if (!menuItems || menuItems.length === 0) {
    return navigationItems.map((item, index) => ({
      id: index + 1,
      name: item.name[locale],
      href: `/${locale}${item.href}`,
      hasMegaMenu: item.hasMegaMenu ?? false,
      hasBrandsMegaMenu: false,
    }));
  }
  
  const topLevelItems = menuItems.filter((item) => item.parent === 0);
  
  if (topLevelItems.length === 0) {
    return navigationItems.map((item, index) => ({
      id: index + 1,
      name: item.name[locale],
      href: `/${locale}${item.href}`,
      hasMegaMenu: item.hasMegaMenu ?? false,
      hasBrandsMegaMenu: false,
    }));
  }
  
  return topLevelItems.map((item) => ({
    id: item.id,
    name: locale === "ar" ? translateToArabic(item.title) : decodeHtmlEntities(item.title),
    href: normalizeMenuUrl(item.url, locale),
    hasMegaMenu: shouldHaveMegaMenu(item.title),
    hasBrandsMegaMenu: shouldHaveBrandsMegaMenu(item.title),
  }));
}

/**
 * Menu Category Type
 *
 * Represents a category in the mega menu.
 * Categories can have subcategories (children).
 */
export interface MenuCategory {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  /** Optional image URL for the category */
  image?: string;
  /** Subcategories */
  children?: MenuSubcategory[];
}

export interface MenuSubcategory {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
}

/**
 * Static Mega Menu Categories
 *
 * Categories displayed in the mega menu dropdown.
 * Each category can have subcategories.
 *
 * To update categories:
 * 1. Add/remove/modify items in this array
 * 2. Each category needs a unique id, name (en/ar), and slug
 * 3. Subcategories are optional - add them to the children array
 * 4. The slug should match your shop URL parameter (e.g., /shop?category=perfumes)
 */
export const megaMenuCategories: MenuCategory[] = [];

/**
 * Get mega menu categories formatted for display
 *
 * Returns categories with localized names ready for rendering.
 */
export function getMegaMenuCategories(locale: Locale) {
  return megaMenuCategories.map((category) => ({
    id: category.id,
    name: category.name[locale],
    slug: category.slug,
    image: category.image ? { src: category.image } : null,
    parent: 0,
    count: category.children?.length || 0,
    children: (category.children || []).map((child) => ({
      id: child.id,
      name: child.name[locale],
      slug: child.slug,
      parent: category.id,
      count: 0,
    })),
  }));
}

/**
 * Get flat list of all categories (for mobile menu compatibility)
 *
 * Returns all categories and subcategories in a flat array format
 * compatible with the existing WCCategory type structure.
 */
export function getFlatCategories(locale: Locale) {
  const flatList: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    parent: number;
    count: number;
    image: { src: string } | null;
    review_count: number;
    permalink: string;
  }> = [];

  megaMenuCategories.forEach((category) => {
    // Add parent category
    flatList.push({
      id: category.id,
      name: category.name[locale],
      slug: category.slug,
      description: "",
      parent: 0,
      count: category.children?.length || 0,
      image: category.image ? { src: category.image } : null,
      review_count: 0,
      permalink: `/shop?category=${category.slug}`,
    });

    // Add children
    (category.children || []).forEach((child) => {
      flatList.push({
        id: child.id,
        name: child.name[locale],
        slug: child.slug,
        description: "",
        parent: category.id,
        count: 0,
        image: null,
        review_count: 0,
        permalink: `/shop?category=${child.slug}`,
      });
    });
  });

  return flatList;
}
