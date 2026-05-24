/**
 * Detect if an image URL is from WordPress and should use unoptimized rendering.
 * Vercel's /_next/image optimization service cannot reach external WordPress servers,
 * so we bypass optimization for those URLs.
 */
export function isWordPressMediaUrl(src?: string): boolean {
  if (!src || typeof src !== 'string') return false;
  return (
    src.includes('/wp-content/uploads') ||
    src.includes('cms.sasanperfumes.ae') ||
    src.includes('.stagingndemo.com')
  );
}

/**
 * Determine if an image should use unoptimized rendering.
 * Use this to pass to Next Image's `unoptimized` prop.
 */
export function shouldUseUnoptimizedImage(src?: string): boolean {
  return isWordPressMediaUrl(src);
}
