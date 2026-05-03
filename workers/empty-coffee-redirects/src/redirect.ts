// Pure resolution logic for the empty.coffee → mike.lapidak.is/posts/
// 301 redirects. Kept separate from the Worker entrypoint so it can
// be unit-tested without a Workers runtime.

const SITE = 'https://mike.lapidak.is';

// empty.coffee slug → mike.lapidak.is slug, when they differ.
// All other post slugs are path-preserving from the original Ghost
// permalinks, so they don't need entries here.
const SLUG_REMAP: Record<string, string> = {
  'nextdns-cacheing-unifi-dream-machine': 'nextdns-caching-unifi-dream-machine',
};

const FEED_PATHS = new Set(['/rss', '/rss.xml', '/feed', '/feed.xml']);
const SITEMAP_PATHS = new Set(['/sitemap.xml', '/sitemap-index.xml', '/sitemap-0.xml']);
const FAVICON_PATHS = new Set(['/favicon.ico', '/apple-touch-icon.png']);

/**
 * Resolve the canonical mike.lapidak.is URL for a given empty.coffee
 * request path. Always returns a fully-qualified https URL.
 *
 * Rules:
 *   /                          → https://mike.lapidak.is/
 *   /<slug>/                   → https://mike.lapidak.is/posts/<slug>/
 *                                (with the cacheing → caching remap)
 *   /rss/, /rss.xml, /feed     → https://mike.lapidak.is/rss.xml
 *   /sitemap.xml, /sitemap-*   → https://mike.lapidak.is/sitemap-index.xml
 *   /favicon.ico, /apple-touch → equivalent at https://mike.lapidak.is
 *   /tag/x, /author/x, ...     → https://mike.lapidak.is/posts/
 *   anything else              → https://mike.lapidak.is/posts/
 *
 * `/robots.txt` is served as a 200 directly by the Worker (see
 * index.ts) — it's not a redirect — so crawlers can read it without
 * following the chain to another host.
 *
 * Trailing slashes and repeated slashes are normalised. Query strings
 * are dropped (they were Ghost-era tracking like ?ref=empty.coffee).
 */
export function resolveTarget(pathname: string): string {
  // Normalise: lowercase, collapse repeated slashes, strip trailing slash.
  const lowered = pathname.toLowerCase().replace(/\/+/g, '/').replace(/\/$/, '');

  // Root.
  if (lowered === '' || lowered === '/') {
    return `${SITE}/`;
  }

  // Feed paths.
  if (FEED_PATHS.has(lowered)) {
    return `${SITE}/rss.xml`;
  }

  // Sitemap paths → canonical sitemap-index.xml on the new site.
  if (SITEMAP_PATHS.has(lowered)) {
    return `${SITE}/sitemap-index.xml`;
  }

  // Favicon / apple-touch-icon → matching path on the new site
  // (rather than getting wrapped up as a /posts/ slug).
  if (FAVICON_PATHS.has(lowered)) {
    return `${SITE}${lowered}`;
  }

  // Strip the leading slash for slug analysis.
  const stripped = lowered.replace(/^\/+/, '');

  // Multi-segment paths (tag/<x>, author/<x>, anything nested) → /posts/.
  if (stripped.includes('/')) {
    return `${SITE}/posts/`;
  }

  // Single-segment: assume post slug. Apply remap if the source slug
  // differs from the target.
  const slug = SLUG_REMAP[stripped] ?? stripped;
  return `${SITE}/posts/${slug}/`;
}

/**
 * robots.txt content served directly by the Worker (200 response, no
 * redirect) so crawlers — including Google's Change of Address tool —
 * can read it without following any cross-host redirect chain.
 */
export const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap-index.xml
`;
