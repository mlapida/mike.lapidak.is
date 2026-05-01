# Nav / Dynamic Island debug notes

Written 2026-04-30 evening, after three failed attempts to make the nav
properly cover the safe-area inset on iPhone with Dynamic Island.

## What's broken

On iPhone with Dynamic Island, viewing any page on the
`posts-collection` preview deployment, content from the page is visible
in the strip between the iPhone status bar and where the nav bar
visibly starts. The nav's solid background isn't covering the safe-area
inset zone.

Confirmed not a cache issue — Mike screenshot showed the caption fix
applied (latest deploy) but the nav still broken.

## What I've tried, in order

### Attempt 1 — split element with mismatched colors

Original code (pre-this branch):

```html
<nav class="nav">
  <div class="nav__safe-fill"></div>  <!-- height: env(), bg: --color-bg -->
  <div class="nav__bar">              <!-- bg: --color-bg-glass + blur -->
```

**Result:** visible seam between the solid safe-fill and the glass bar.
Mike flagged this in screenshot 1.

### Attempt 2 — unified glass with padding-top

```css
.nav {
  position: fixed; top: 0;
  padding-top: env(safe-area-inset-top, 0px);
  background-color: var(--color-bg-glass);
  backdrop-filter: blur(12px);
}
```

**Result:** content bleeding through the safe area when scrolled.
Glass blurred the content, but the user saw text leaking through.
Mike flagged this in screenshot 2.

### Attempt 3 — solid bg with padding-top

Dropped the glass:

```css
.nav {
  padding-top: env(safe-area-inset-top, 0px);
  background-color: var(--color-bg);  /* solid, no glass */
}
```

**Result:** still showed content in the safe area zone.
Mike's screenshot proved the latest deploy was active (caption styling
worked) so this wasn't a cache issue. The padded area apparently isn't
painting the bg on his iOS.

### Attempt 4 — ::before pseudo for safe area

```css
.nav { background: var(--color-bg); /* no padding */ }
.nav::before {
  content: ''; display: block;
  height: env(safe-area-inset-top, 0px);
  background: var(--color-bg);
}
```

**Result:** also failed (per Mike). Same symptom.

### Attempt 5 (currently shipped on `posts-collection`) — sibling fixed

Two separate fixed elements:

```html
<div class="nav__safe-fill"></div>  <!-- fixed, top:0, height: env() -->
<nav class="nav">                    <!-- fixed, top: env() -->
```

```css
.nav__safe-fill {
  position: fixed; top: 0; left: 0; right: 0;
  height: env(safe-area-inset-top, 0px);
  background-color: var(--color-bg);
  z-index: 100;
}
.nav {
  position: fixed; top: env(safe-area-inset-top, 0px);
  left: 0; right: 0; z-index: 100;
  background-color: var(--color-bg);
}
```

**Status:** UNTESTED on Mike's device. Pushed the night of 2026-04-30.

## Hypotheses for what's going wrong

Most likely → least likely:

1. **`env(safe-area-inset-top)` is returning 0 on Mike's device.** This
   would explain why padding/pseudo/element heights all collapse and
   show content. Could be:
   - A specific iOS version bug
   - In-app browser (Twitter, Slack, etc.) that doesn't honor
     `viewport-fit=cover`
   - An old cached HTML page without `viewport-fit=cover` (but we
     verified deployed HTML has it)
   - PWA standalone mode behaving differently

2. **A parent element creates a containing block for the fixed nav.**
   If `<body>` or `<html>` has `transform`, `filter`, `perspective`,
   `will-change`, or `contain: paint`, then `position: fixed` becomes
   relative to that ancestor, not the viewport. None of these are set
   in our CSS that I can see, but Tailwind's preflight or some
   inherited rule might be doing it.

3. **`body { padding-top: ... }` is being applied wrong.** If the body
   has padding-top but the html doesn't, and content overflow isn't
   contained right, scrolled content might render differently than
   expected.

4. **iOS Safari rendering bug specific to a configuration.** Possibly
   related to `:root { color-scheme: dark }` or theme-color meta
   handling.

## How to figure it out (Mike: do this in the morning)

I shipped a diagnostic page at:

  https://posts-collection.mike-lapidak-is.pages.dev/debug-nav/

Open it on your iPhone. The page shows three colored nav variants
(red = padding-top, blue = ::before pseudo, green = sibling fixed) and
a debug overlay with raw env() values plus device info.

**What to check:**

1. Look at the **info overlay** at the bottom. Find the
   `probe.height (computed env top)` line. If it says `0px`, that's
   our smoking gun — env() isn't returning a real value on your
   device. If it says something like `47px` or `59px`, env() works
   and the bug is somewhere else.
2. Tap the **A / B / C buttons** to switch between approaches. The
   colored band (red, blue, green) should completely cover the
   safe-area zone above the page content stripes.
3. Screenshot whichever variant works (or all three if none do) and
   send to me.

If GREEN (variant C) works, the currently-shipped fix on the
`posts-collection` branch is correct and a hard reload should make it
work. If GREEN doesn't work either, we need a different approach
entirely — probably a JS-driven measurement that sets a CSS variable.

## Cleanup later

Once the nav is confirmed fixed, delete:
- `src/pages/debug-nav.astro`
- `NAV-DEBUG-NOTES.md` (this file)
