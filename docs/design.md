# Design system rules

The actionable rules. Tokens live in `src/styles/global.css`; this file
documents the *decisions* — what to do, what not to do, why.

When adding a component or writing copy, check this file first. If a new
surface needs something not covered here, treat the addition as a design
decision, not a default.

## Voice and copy

- **First person, plain present.** "I've spent 10 years at AWS." Never
  corporate "we" for personal work.
- **Specific over generic.** Numbers are concrete: "Grew the org from 7
  to over 35," not "leveraged synergies."
- **Long-form thinking, short-form copy.** Hero bio is two sentences.
  Page descriptions are ~30 words. Job descriptions are one paragraph.
- **No em-dashes (—) in any output under Mike's name.** Site copy,
  page titles, OG/Twitter meta, RSS feed titles, commit messages, PR
  bodies. Use middle dot (·) or rephrase. Mike flags em-dashes as an
  AI tell. Original imported post markdown is exempt (his own writing).
  Enforced by `tests/build/meta.test.ts` (sweeps all rendered titles).
- **En-dashes (–) only for date ranges.** "2025 – present" is correct.
- **Sentence case for headings**, never Title Case. "Get in touch", not
  "Get In Touch".
- **Ampersand (&) in section labels.** "Skills & Tools", not "Skills
  and Tools".
- **No emoji anywhere.** Not in copy, not in CTAs, not in nav, not in
  cards. Unicode `→ · …` is the entire icon vocabulary in body text.

## Type

Two families, one role each:

- **Display + body:** `parisine-std` (Adobe Fonts kit `mjy4jau`).
  Used at every weight. Body text defaults to 400.
- **Italic accent:** `adobe-caslon-pro` italic. Used **only italic, only
  as accent**: pull quotes, year labels in the writing list, post
  blockquotes, post ledes, photo captions (grid overlays and the
  detail-page location line), tier-3 labels (see Label system), the
  hero role line, pager direction labels, the ML monogram. Never
  roman, never body — emphasized words inside running prose stay
  Parisine italic.

CSS variables: `--font-display`, `--font-body`, `--font-accent` (in
`global.css`). Don't hardcode font-family values in component CSS;
reference the variables.

### Body weight rules

| Weight | Use |
|---|---|
| 300 (light) | Hero bio, page descriptions, post excerpts. Anywhere ≤3 sentences in a calm reading context. |
| 400 (regular) | Long-form articles, mobile, form labels, anywhere the reader has work to do. |
| 500 (medium) | Nav active link, buttons, link emphasis. |
| 600 (semibold) | H3, spotlight + collection card titles. |
| 700 (bold) | H1, H2, hero name, page titles. Structural and confident. |

300 looks fragile on a phone in sunlight; the rule above keeps it where
it works. The `.display` class defaults to 700.

### Microtext floor

**No text below 0.75rem (12px).** The old 0.65–0.7rem tracked-caps
microlabels were both a legibility problem over the grain texture and
the single strongest generated-site tell. If a label wants to be
quieter, change its voice (tier 3 below), not its size.

## Label system

Three tiers. The uppercase eyebrow used to do every labeling job on
the site (~24 instances); that monoculture is gone. Don't reintroduce
it — pick the right tier:

1. **Eyebrow** (`.page-eyebrow`): uppercase, tracked, muted.
   **Page headers only.**
2. **Métro line disc** (`.line-disc` in `global.css`): filled ink
   circle, Parisine numeral, paper-colored digit. Ordinal/sectional
   wayfinding — the numbered section labels on `/work`. Single digits
   only; if you need two digits, the page has too many sections.
3. **Script label** (`.label-script` in `global.css`): Caslon italic,
   lowercase, muted (or accent green when it tags a link surface).
   Soft metadata: "writing" on the homepage, "recently shot",
   "collection" on collection cards, spotlight/talk types, skill
   group labels, pager direction words, the `/posts/` year labels.

EXIF labels on photo detail pages keep uppercase at 0.75rem — they
read as camera-plate engraving there, which is the point.

## Plates

The enamel station plate is the brand surface, scaled from the ML
monogram in the nav: ink ground, paper letters, squared corners, a
hairline frame inset (the double-edge of a RATP plate). Used by:

- The nav monogram (the origin of the language)
- Favicons and the default OG card

**Keep plates small.** A full-size hero name plate was tried and
rejected: at heading scale the box reads as a UI element, not
signage, and it breaks the heading-size relationship between the
homepage and the page headers. The hero name stays large open type
(`clamp(3rem, 7vw, 5rem)`, bigger than any `.page-title`).

Cards share the squared-corner half of this language: section cards,
collection cards, spotlight cards, talk items, and post pager plates
all have **no border-radius**. Rounded corners survive only on small
utilitarian surfaces (thumbnails `--radius-xs`/`--radius-sm`, buttons,
tags `--radius-pill`, the photo-detail map).

## Wayfinding

Parisine was drawn for Métro signage; exactly **two** wayfinding
devices spend that heritage (resist adding more — the gimmick risk is
real):

1. **Direction plates**: post detail prev/next pagers. Arrow set
   large at the plate edge, Caslon lowercase direction word, title in
   Parisine medium. Arrow translates along its direction on hover —
   the one motion the system allows.
2. **Line discs**: the numbered section labels on `/work`.

No RATP color-coding; the single forest accent is part of the
identity.

## Color

Modern earth tones. No gradients-as-decoration, no rainbow palettes.

Semantic tokens in `global.css`:
- `--color-bg` / `--color-surface` / `--color-border`
- `--color-text` / `--color-text-muted`
- `--color-accent` / `--color-accent-hover` (forest green `#3a6347`)

Dark mode is a real parallel system, not an inversion. Every token has
a dark counterpart under `[data-theme="dark"]`.

Don't hardcode hex values; use the semantic tokens.

## Spacing, radii, shadows

All tokens defined in `global.css`. Use them — don't introduce raw
`rem` values for things that have a token.

- Spacing: `--space-1` through `--space-20` (4px grid).
- Radii: `--radius-xs` (thumbs, monogram), `--radius-sm` (buttons,
  nav links), `--radius-md` (cards), `--radius-lg` (section cards),
  `--radius-pill` (tags only).
- Shadows: **three named roles, not a scale.** Most surfaces have NO
  shadow. Don't invent a fourth.
  - `--shadow-soft` — profile photo, gentle resting lift
  - `--shadow-hover` — section card hover only
  - `--shadow-photo` — polaroid stacks (the one place shadow speaks)

## Hover and focus

- **All `:hover` rules wrapped in `@media (hover: hover)`** so touch
  doesn't accidentally trigger them.
- **Card hover: three things, no more.** `border-color: var(--color-accent)`,
  `transform: translateY(-2px)`, `box-shadow: var(--shadow-hover)`. No
  diagonal gradients, no glow. (The diagonal accent gradient on section
  cards was removed for this reason.)
- **`:focus-visible` ring on every interactive element.** 2px accent,
  3px offset. Defined globally in `global.css`. Don't override per-component.
- **`prefers-reduced-motion`** short-circuits all animation/transition.
  Respected globally.

## Tags

**One tag style, used everywhere.** Skill tags, post categories, job
tags, talk types — all share the same `--color-surface` fill, 1px
border, muted text, `--radius-pill`. The flatness is **the rule, not an
oversight**: tags are scannable metadata, never hierarchy.

If something needs to feel weighty, **promote it out of a tag** — into
a heading, a label, or prose. Never style a tag by importance.

On list views (homepage Writing feed, /posts/), cap tags shown to
**one** per row. Multiple tags wrap and break the meta-line rhythm.

## Polaroid stack

The polaroid stack on photography collection cards is the **only**
place this system uses rotation, white borders, or `--shadow-photo`.
It speaks loudly; use it sparingly.

- ✅ Photography collection cards (current)
- ✅ "Recently shot" homepage block (current — the Photography section
  card carries a 3-photo stack of the latest shots)
- ✅ Talk thumbnails on the work page (approved, not yet built — needs
  session/venue imagery)
- ❌ Generic image cards, article hero, post thumbnails
- ❌ Avatars, logos, decorative imagery
- ❌ Anywhere the rotation is purely aesthetic

Rotations: `-5° / -2° / 0°` at rest, `-8° / -3° / 1°` on hover. White
border 2px.

## Iconography

Deliberately minimal. No icons in body copy. Chrome only.

- **Used today:** sun + moon SVGs hand-inlined in `Nav.astro`. RSS
  icon in the writing-page header. Favicons.
- **The ML monogram** in italic Adobe Caslon Pro serves as the brand
  mark. In the nav it's pure type; the favicons, SVG favicon, and the
  default OG card carry rendered glyph-outline versions of the same
  mark (italic serif on the ink plate), regenerated by script — see
  the git history of `public/favicon.svg` for provenance.
- **No emoji.** Not anywhere.
- **No icon font.** No Font Awesome, no Material Icons.
- **No filled / duotone icons.** Stroke icons only.
- **No social-media glyphs.** Social links are plain text labels.

If a new surface genuinely needs more icons, the pre-approved Lucide
subset is: `sun`, `moon`, `arrow-right`, `external-link`, `rss`, `mail`,
`search`, `camera`, `map-pin`, `x`. Outline only, stroke 1.5–2px,
`stroke="currentColor"`. Anything outside this list is a design
conversation.

## Layout

- Container widths: `--container-narrow` (900px, default `.container`),
  `--container-wide` (1200px, `.container--wide` for photography grids).
- Section vertical padding: `2.75rem – 4.5rem`.
- Card inner padding: `1.5rem – 1.75rem`.
- Mobile breakpoint: `640px`. Hero stacks vertically and section cards
  go one-per-row at this width.

## Page header

`/work/`, `/photography/`, `/posts/`, and `/photography/collection/<slug>/`
all use the shared `.page-header` block defined in `global.css`. Don't
re-implement it per-page; if a tweak is needed, override the specific
property in scoped styles. The collection page already does this for
the smaller desc and accent-colored eyebrow.

## iOS Safari and the safe-area zone

Long-running pain documented for posterity:

- **Body must have `background-color`.** iOS samples it for the safe-area
  zone above the layout viewport. Without it, scrolling page content
  bleeds under the Dynamic Island.
- **Don't add `position: fixed; inset: 0;` overlays on `html` or `body`.**
  They break the safe-area paint sampling. The grain texture is on
  body's own `background-image` for this reason.
- **Don't set `viewport-fit=cover`** unless you're prepared to handle
  every safe-area inset yourself. The default is correct here; iOS
  paints the dynamic-island zone using the body bg.
- **`env(safe-area-inset-top)` returns 0 on iOS 18.x** even on devices
  with a Dynamic Island. Don't depend on it.

Refs: WebKit "Designing Websites for iPhone X"; zulip/zulip#37367.

## Accessibility floor

- Contrast: all text-token pairs hit WCAG AA. Muted text (`--ink-450`
  `#6e6760`) measures 5.15:1 on the paper bg and 4.63:1 on surface.
  Never stack `opacity` on muted text to make it quieter; that's how
  the old 2.6:1 footer happened. If a token reads too loud, darken or
  lighten the token.
- Focus: `:focus-visible` rings on every interactive element.
- Reduced motion: collapses all animations to 0.01ms.
- `<img>` alt text required. Decorative images use `alt=""` explicitly.
