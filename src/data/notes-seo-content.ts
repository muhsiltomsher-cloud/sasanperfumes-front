// SEO content for fragrance note pages.
// All content is now managed via the CMS.

export interface NoteSeoContent {
  name: { en: string; ar: string };
  title: { en: string; ar: string };
  description: { en: string; ar: string };
}

export const notesSeoContent: Record<string, NoteSeoContent> = {};

// List of all known note slugs for static generation
export const ALL_NOTE_SLUGS = Object.keys(notesSeoContent);
