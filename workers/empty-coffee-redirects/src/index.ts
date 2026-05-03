// Cloudflare Worker bound to empty.coffee/*. Issues 301 redirects to
// the canonical mike.lapidak.is URLs computed in ./redirect.ts.
//
// Deploy:
//   cd workers/empty-coffee-redirects && npx wrangler deploy

import { resolveTarget } from './redirect';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const target = resolveTarget(url.pathname);
    return Response.redirect(target, 301);
  },
};
