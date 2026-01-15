# Site Performance, SEO, and Security TODO

This document tracks performance, SEO, and security improvements for mike.lapidak.is.

## High Priority Issues

### Performance

- [x] **Add resource hints** - ✅ Added preload hints for self-hosted FontAwesome and Source Sans Pro fonts
- [x] **Optimize font loading** - ✅ Added font-display: swap to all Source Sans Pro fonts
- [x] **Optimize FontAwesome loading** - ✅ Implemented self-hosted minimal CSS subset with only required icons (20 icons, ~3KB vs full CDN kit)
- [x] **Add preload for critical fonts** - ✅ Added preload for critical Source Sans Pro fonts

### SEO

- [x] **Add missing lang attribute** - ✅ Added lang="en" to HTML document
- [x] **Add JSON-LD structured data** - ✅ Implemented Person schema with job title, employer, social links
- [x] **Add XML sitemap generation** - ✅ Enabled Hugo's built-in sitemap with monthly refresh
- [x] **Add Twitter/X handle meta** - ✅ Added twitter:creator and twitter:site meta tags
- [x] **Add canonical URL** - ✅ Added canonical link tag

### Security

- [x] **Add Content Security Policy** - ✅ Added CSP header, updated to remove FontAwesome CDN after self-hosting
- [x] **Add Strict-Transport-Security** - ✅ Added HSTS header with 1 year max-age
- [x] **Add subresource integrity** - ✅ Removed external FontAwesome script, now using self-hosted fonts

## Medium Priority Issues

### Performance

- [x] **Image optimization** - ✅ Site already uses Cloudflare Images CDN (auto WebP/AVIF). Added responsive srcset and lazy loading
- [ ] **Critical CSS inlining** - Consider inlining above-the-fold CSS
- [ ] **JavaScript optimization** - Bundle size could be reduced by:
  - Tree-shaking unused jQuery/library code
  - Implementing lazy loading for non-critical scripts

### SEO

- [ ] **Meta description optimization** - Currently using site-wide description, consider page-specific
- [ ] **Add breadcrumb markup** - If site expands beyond single page

### Accessibility

- [x] **Empty alt attributes** - ✅ Verified all active templates use proper alt attributes from data
- [x] **Add ARIA labels** - ✅ Added aria-labelledby and role attributes to sections
- [ ] **Keyboard navigation** - Test and improve keyboard accessibility
- [ ] **Color contrast** - Audit color contrast ratios
- [ ] **Focus indicators** - Ensure visible focus indicators for keyboard users

## Low Priority Issues

### Performance

- [ ] **Service Worker** - Implement for offline functionality and caching
- [ ] **HTTP/2 Server Push** - For critical resources (if supported by hosting)
- [ ] **Optimize build process** - Review Hugo build pipeline for unused assets

### SEO

- [x] **RSS feed** - ❌ Disabled RSS generation (not needed for personal landing page)
- [ ] **Meta keywords** - Add relevant meta keywords (low SEO impact)

### Security

- [ ] **Review permissions policy** - Current policy is restrictive, ensure it doesn't break functionality
- [ ] **Add security.txt** - For responsible disclosure

## Cloudflare Worker Issues

### Security

- [x] **Replace placeholder worker** - ✅ Added proper routing with security headers and API endpoints
- [x] **Add request validation** - ✅ Implemented basic request handling and method validation
- [x] **Add rate limiting** - ✅ Added basic rate limiting framework (ready for expansion)
- [x] **Update compatibility date** - ✅ Updated to 2025-08-01

### Performance

- [ ] **Worker optimization** - Current worker is minimal but should handle routing efficiently if expanded

## Tools for Testing

- [ ] **Set up Lighthouse CI** - For automated performance monitoring
- [ ] **Add PageSpeed Insights monitoring** - Regular performance auditing
- [ ] **Security header testing** - Use securityheaders.com for verification
- [ ] **SEO audit tools** - Regular audits with tools like Screaming Frog

## Completed Items

- [x] Basic security headers configured in `_headers`
- [x] Favicon implementation complete
- [x] Basic Open Graph meta tags implemented
- [x] CSS/JS minification enabled for production builds
- [x] Responsive viewport meta tag configured