# mike.lapidak.is — Claude Context

Personal/professional site for Mike Lapidakis. Static Astro 5 site deployed to Cloudflare Pages.

## Stack

- **Astro 5** (static output, no adapter)
- **Tailwind CSS v4** via `@tailwindcss/vite` Vite plugin
- **@astrojs/sitemap** — auto-generates `sitemap-index.xml` + `sitemap-0.xml` at build
- **Leaflet** — GPS mini-map on photo detail pages
- **Content Collections** — photo metadata in `src/content/photos/*.md`

## Dev Server

```bash
astro dev --host 0.0.0.0 --port 4321
```

Accessible via Tailscale at port 4321.

## Key Files

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Vite Tailwind plugin, sitemap integration, `site` URL, static output |
| `src/styles/global.css` | CSS custom properties palette — retheme by editing `:root {}` block |
| `src/layouts/Base.astro` | Base layout, OG/Twitter meta, JSON-LD slot, Google Fonts |
| `src/config/site.ts` | Single source of truth: site metadata, `socials`, `heroSocials`, `footerSocials` |
| `src/components/Nav.astro` | Fixed nav, backdrop blur, active page dot, ML monogram mark |
| `src/components/Footer.astro` | Social links from `footerSocials`, copyright |
| `src/pages/index.astro` | Homepage: hero + empty.coffee RSS (build-time fetch) + section cards |
| `src/pages/photography.astro` | Justified-row photo grid + collection stack cards |
| `src/pages/photography/[slug].astro` | Per-photo detail page: split layout, EXIF, Leaflet map, prev/next |
| `src/pages/photography/collection/[slug].astro` | Per-collection grid page with justified row layout |
| `src/pages/work.astro` | Professional background + Spotlight (AWS publications) |
| `src/content.config.ts` | Photo collection schema |

## Content

**Photos:** `src/content/photos/*.md` — frontmatter fields:
`title`, `date`, `location`, `gps.{lat,lng}`, `camera`, `lens`, `aperture`, `shutter`, `iso`, `image`, `featured`, `collection`, `orientation`, `imgWidth`, `imgHeight`

**Images:** `public/photos/` — referenced as `/photos/filename.jpg` in frontmatter

**Profile photo:** `public/profile.jpg`

## Photography Architecture

- PhotoSwipe was removed (broken, root cause unknown). Replaced with static per-photo pages.
- Photo grid uses a **justified row layout**: greedy packing algorithm in client-side JS, `data-aspect` attribute on each item computed from `imgWidth`/`imgHeight`. Script runs on load + debounced resize.
- `collectionSlug(name)` utility is exported from `collection/[slug].astro` and imported by `[slug].astro` for breadcrumb links.
- Collection cards on the photography page show a stacked photo preview (3 images with CSS rotation/transform).
- Photo slugs: `photo.id` includes `.md` extension in Astro 5 — always strip with `.replace(/\.md$/, '')` when building URLs.

## Site Config

`src/config/site.ts` exports:
- `site` — name, url, description, role
- `socials` — full list of social links
- `heroSocials` — subset shown in homepage hero
- `footerSocials` — subset shown in footer

## Fonts

- **Display:** Fraunces (Google Fonts) — italic serif for headings
- **Body:** DM Sans (Google Fonts) — `var(--font-body)`
- **Adobe Fonts placeholder:** Uncomment `<link rel="stylesheet" href="https://use.typekit.net/YOURKITID.css" />` in `Base.astro` when kit ID is available

## Color System

All colors are CSS custom properties in `src/styles/global.css`:
- `--color-bg` / `--color-bg-glass` — page background / nav blur background
- `--color-surface` / `--color-border` — cards, dividers
- `--color-text` / `--color-text-muted`
- `--color-accent` / `--color-accent-hover` — forest green `#3a6347`

## SEO

- `astro.config.mjs` has `site: 'https://mike.lapidak.is'` — enables `Astro.site` and sitemap URLs
- `Base.astro` accepts optional `image` prop (defaults to `/profile.jpg`); emits full OG + Twitter Card meta, `author` meta, `rel="sitemap"` link
- `public/robots.txt` — `Allow: *` with sitemap pointer
- Homepage: Person JSON-LD (`schema.org/Person`) with `sameAs` social URLs
- Photo detail pages: Photograph JSON-LD (`schema.org/Photograph`) with absolute `contentUrl`, GPS `GeoCoordinates`, creator
- Photo page descriptions: `"Title — Location · Date · Camera"`

## Deployment

- Build: `npm run build` → output: `./dist`
- Cloudflare Pages: build command `npm run build`, output directory `dist`
- `wrangler.toml` present

## Astro Script Rules

- `<script>` tags **must be inside** the `<Base>` component slot — placing them after `</Base>` puts them outside `<html>`
- Scripts run as ES modules (`type="module"`) — automatically deferred, DOM is ready when they execute
- Use frontmatter `import '../styles/global.css'` in layouts, not `<style is:global>@import`
- JSON-LD: use `<script type="application/ld+json" set:html={JSON.stringify(data)} />` inside Base slot

## Touch / Hover

All `:hover` rules are wrapped in `@media (hover: hover)` sitewide to prevent double-tap issues on touch devices.

## RSS Feed

`index.astro` fetches `https://empty.coffee/rss/` at build time (posts frozen at deploy). Parses `media:content` for thumbnails and `category` CDATA for tags. Gracefully degrades if feed unavailable.

## Pending

- Task #7: Bump grain texture opacity from 0.032 to 0.05
- Task #10: Improve homepage section nav cards (Photography card with lead photo background)
- Task #4: Build photo management script/app (post-v1)
