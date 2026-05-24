# Local Development

## Running the Dev Server

```bash
npm run dev
```

The app runs on http://localhost:3000.

## Testing Product Pages

Product pages are at `/en/product/{slug}` (English) and `/ar/product/{slug}` (Arabic).

To verify SEO metadata, use the browser console:
```js
console.log('TITLE:', document.title)
console.log('DESC:', document.querySelector('meta[name="description"]')?.content)
```

Or use curl to inspect the raw HTML:
```bash
curl -s http://localhost:3000/en/product/{slug} | grep -E '<title>|<meta name="description"'
```

## Product API

Products are fetched from WooCommerce at `https://sasanperfumes.example/wp-json/wc/store/v1/products`.

Product attributes available: "Olfactory Family", "Notes", "Item Volume", "HS Code", "What's In The Box".

## Important: HTML Entity Handling

WooCommerce returns HTML-encoded strings (e.g., `&amp;` for `&`, `&#8217;` for smart quotes). Always use `decodeHtmlEntities()` from `src/lib/utils/index.ts` when displaying or processing WooCommerce text data in metadata, titles, or descriptions.

## Next.js Metadata

The layout at `src/app/[locale]/layout.tsx` uses a `template: '%s | {brand}'` pattern that appends brand name to page titles. To bypass this for pages that need full title control, use `{ absolute: title }` in the metadata return.
