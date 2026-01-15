# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website for Mike Lapidakis (mike.lapidak.is) built with Hugo using the hugo-story theme. The project has a hybrid architecture:

- **Hugo Static Site**: Main website built with Hugo static site generator using the hugo-story theme
- **Cloudflare Worker**: TypeScript-based worker for handling dynamic requests (currently minimal)

## Development Commands

### Hugo Site
```bash
# Start Hugo development server
hugo server

# Build static site
hugo

# Build with drafts
hugo -D
```

### Cloudflare Worker
```bash
# Start local development server
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
# Type checking (no build output due to noEmit: true)
tsc --noEmit
```

## Architecture

### Hugo Site Structure
- **config.toml**: Hugo configuration with site metadata, theme settings, and social links
- **layouts/index.html**: Main page template that orchestrates site sections (banner, spotlights, gallery)
- **data/**: YAML files containing content data:
  - `banner.yml`: Hero section with bio and social links
  - `spotlight1.yml`, `spotlight2.yml`: Featured content sections
  - `gallery.yml`: Photo gallery data
- **themes/hugo-story/**: Complete Hugo theme with layouts, assets, and styling
- **static/**: Static assets including favicons, fonts, and site headers

### Cloudflare Worker
- **src/index.ts**: Basic worker entry point (currently returns "Hello World!")
- **wrangler.toml**: Cloudflare worker configuration
- **tsconfig.json**: TypeScript configuration for Cloudflare Workers environment

## Content Management

Site content is managed through YAML data files in the `data/` directory. The main page template references these files to build sections dynamically. Social links are configured in both the main config.toml and banner.yml.

## Theme Integration

The project uses the hugo-story theme located in `themes/hugo-story/`. Custom layouts override theme defaults, and the site leverages the theme's component system for modular content sections.