// Cloudflare Worker bound to empty.coffee/*. Issues 301 redirects to
// the canonical mike.lapidak.is URLs computed in ./redirect.ts. Serves
// /robots.txt directly (200) so crawlers can read it without following
// a cross-host chain.
//
// Deploy:
//   cd workers/empty-coffee-redirects && npx wrangler deploy

import { resolveTarget, ROBOTS_TXT } from './redirect';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // /robots.txt is served inline (200) so Google's Change of Address
    // tool and other crawlers can read crawl directives without a
    // cross-host redirect getting in the way.
    if (url.pathname.replace(/\/$/, '').toLowerCase() === '/robots.txt') {
      return new Response(ROBOTS_TXT, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const target = resolveTarget(url.pathname);
    return Response.redirect(target, 301);
  },
};
