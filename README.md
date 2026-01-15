# Mike.Lapidak.is

Personal website for Mike Lapidakis built with Hugo using the hugo-story theme, deployed on Cloudflare Pages with a Cloudflare Worker for dynamic functionality.

## Project Structure

This is a hybrid architecture combining:
- **Hugo Static Site**: Main website built with Hugo static site generator
- **Cloudflare Worker**: TypeScript-based worker for handling dynamic requests

## Development

### Hugo Site
```bash
# Start development server
hugo server

# Build static site
hugo

# Build with drafts
hugo -D
```

### Cloudflare Worker
```bash
# Start local development
npm start
# or
wrangler dev

# Deploy to Cloudflare
npm run deploy
# or
wrangler publish
```

### TypeScript
```bash
# Type checking
tsc --noEmit
```

## Architecture

### Content Management
Site content is managed through YAML data files in the `data/` directory:
- `banner.yml`: Hero section with bio and social links
- `spotlight1.yml`, `spotlight2.yml`: Featured content sections
- `gallery.yml`: Photo gallery data

### Theme
Uses the [Hugo Story Theme](https://github.com/caressofsteel/hugo-story) located in `themes/hugo-story/` with custom layout overrides in the main `layouts/` directory.

## Deployment

The site is deployed on Cloudflare Pages with automatic builds from the main branch. The Cloudflare Worker handles any dynamic functionality.