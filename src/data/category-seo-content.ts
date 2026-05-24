// Category-specific SEO content displayed at the bottom of each category page.
// All content is now managed via the CMS — add/edit in WP Admin → Categories.

interface CategorySeoContent {
  title: { en: string; ar: string };
  description: { en: string; ar: string };
}

export const categorySeoContent: Record<string, CategorySeoContent> = {};
