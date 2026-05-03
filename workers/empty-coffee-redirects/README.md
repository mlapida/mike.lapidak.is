# empty.coffee redirects

Cloudflare Worker that 301-redirects every `empty.coffee` request to
the equivalent canonical URL on `mike.lapidak.is`.

## Deploy

From this directory:

```bash
npx wrangler deploy
```

`wrangler` is installed as a devDependency at the repo root, so the
above runs from a Mac that's logged into the right Cloudflare account
(`npx wrangler login` if not). The first deploy publishes the Worker;
subsequent deploys overwrite.

## What it does

| Source path on `empty.coffee` | Redirects to |
|---|---|
| `/` | `https://mike.lapidak.is/` |
| `/<slug>/` | `https://mike.lapidak.is/posts/<slug>/` |
| `/nextdns-cacheing-unifi-dream-machine/` | `https://mike.lapidak.is/posts/nextdns-caching-unifi-dream-machine/` (typo correction) |
| `/rss/`, `/rss.xml`, `/feed/`, `/feed.xml` | `https://mike.lapidak.is/rss.xml` |
| `/tag/<x>/`, `/author/<x>/`, anything multi-segment | `https://mike.lapidak.is/posts/` |
| anything else | `https://mike.lapidak.is/posts/` |

All redirects are HTTP 301. Query strings are dropped (the tracking
params like `?ref=empty.coffee` don't carry over).

## Routes

Bound via `wrangler.toml`:

- `empty.coffee/*`
- `www.empty.coffee/*`

The `empty.coffee` zone must exist in this Cloudflare account for the
binding to attach. DNS for the apex/www should be proxied through
Cloudflare so the Worker intercepts requests.

## Logic + tests

The resolution rule is `src/redirect.ts` (pure function, no Worker
runtime). Tests live alongside the rest of the site's vitest suite
at `tests/unit/redirect.test.ts` and run with `npx vitest run`.

## Adding a new post slug remap

If a future post needs a non-path-preserving redirect (the way
`cacheing → caching` did), add an entry to `SLUG_REMAP` in
`src/redirect.ts`, add a test case to `tests/unit/redirect.test.ts`,
then redeploy.
