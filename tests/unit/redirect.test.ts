import { describe, it, expect } from 'vitest';
import { resolveTarget } from '../../workers/empty-coffee-redirects/src/redirect';

const SITE = 'https://mike.lapidak.is';

describe('empty.coffee redirect resolution', () => {
  describe('root', () => {
    it('/ → site root', () => {
      expect(resolveTarget('/')).toBe(`${SITE}/`);
    });
    it('empty path → site root', () => {
      expect(resolveTarget('')).toBe(`${SITE}/`);
    });
  });

  describe('post slugs', () => {
    it('single-segment slug → /posts/<slug>/', () => {
      expect(resolveTarget('/replacing-pi-hole-with-nextdns/')).toBe(
        `${SITE}/posts/replacing-pi-hole-with-nextdns/`,
      );
    });

    it('handles missing trailing slash', () => {
      expect(resolveTarget('/replacing-pi-hole-with-nextdns')).toBe(
        `${SITE}/posts/replacing-pi-hole-with-nextdns/`,
      );
    });

    it('handles repeated trailing slashes', () => {
      expect(resolveTarget('/replacing-pi-hole-with-nextdns///')).toBe(
        `${SITE}/posts/replacing-pi-hole-with-nextdns/`,
      );
    });

    it('lowercases incoming paths', () => {
      expect(resolveTarget('/Replacing-Pi-Hole-With-NextDNS/')).toBe(
        `${SITE}/posts/replacing-pi-hole-with-nextdns/`,
      );
    });

    it('preserves slugs that have no remap entry', () => {
      const slugs = [
        'review-weatherflow-tempest-weather-station',
        'unifi-ppsk-guide-consolidate-multiple-ssids-with-private-pre-shared-keys',
        'home-assistant-cloudflare-zero-trust-setup',
      ];
      for (const slug of slugs) {
        expect(resolveTarget(`/${slug}/`)).toBe(`${SITE}/posts/${slug}/`);
      }
    });
  });

  describe('slug remap', () => {
    it('cacheing → caching for the NextDNS URL', () => {
      expect(resolveTarget('/nextdns-cacheing-unifi-dream-machine/')).toBe(
        `${SITE}/posts/nextdns-caching-unifi-dream-machine/`,
      );
    });

    it('the corrected slug also resolves to itself', () => {
      expect(resolveTarget('/nextdns-caching-unifi-dream-machine/')).toBe(
        `${SITE}/posts/nextdns-caching-unifi-dream-machine/`,
      );
    });
  });

  describe('feed paths', () => {
    it.each(['/rss', '/rss.xml', '/feed', '/feed.xml', '/rss/', '/feed/'])(
      '%s → /rss.xml',
      (path) => {
        expect(resolveTarget(path)).toBe(`${SITE}/rss.xml`);
      },
    );
  });

  describe('multi-segment paths fall back to the posts index', () => {
    it.each([
      '/tag/dns/',
      '/tag/aws/multiple/levels/',
      '/author/mike/',
      '/page/2/',
      '/2024/01/01/some-post/',
    ])('%s → /posts/', (path) => {
      expect(resolveTarget(path)).toBe(`${SITE}/posts/`);
    });
  });
});
