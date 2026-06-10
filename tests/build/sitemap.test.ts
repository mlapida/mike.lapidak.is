import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { requireDist, distPath } from '../helpers/dist.js';

const PHOTO_SLUGS = [
  'l1000444',
  'img-0273',
  'l1003968',
  'l1003807',
  'l1003743',
  'l1004275',
  'l1004181',
  'l1004166',
  'l1003908',
  'l1003683',
  'l1003565',
  'l1003364',
  'l1004462',
  'l1003243',
  'l1003144',
  'l1003111',
  'l1002868',
];

const COLLECTION_SLUGS = ['paris-2026', 'immich-test'];

const POST_SLUGS_SAMPLE = [
  'review-weatherflow-tempest-weather-station',
  'unifi-ppsk-guide-consolidate-multiple-ssids-with-private-pre-shared-keys',
  'nextdns-caching-unifi-dream-machine',
  'photo-backup-bakeoff-photoprism-vs-immich-review',
  'simple-joys-static-sites',
];

let sitemapIndex = '';
let sitemap0 = '';

beforeAll(() => {
  requireDist();
  sitemapIndex = readFileSync(distPath('sitemap-index.xml'), 'utf-8');
  sitemap0 = readFileSync(distPath('sitemap-0.xml'), 'utf-8');
});

describe('sitemap-index.xml', () => {
  it('starts with <?xml', () => {
    expect(sitemapIndex.trimStart()).toMatch(/^<\?xml/);
  });

  it('contains <sitemapindex', () => {
    expect(sitemapIndex).toContain('<sitemapindex');
  });

  it('references sitemap-0.xml', () => {
    expect(sitemapIndex).toContain('https://mike.lapidak.is/sitemap-0.xml');
  });
});

describe('sitemap-0.xml', () => {
  it('contains <urlset', () => {
    expect(sitemap0).toContain('<urlset');
  });

  it('contains homepage loc', () => {
    expect(sitemap0).toContain('<loc>https://mike.lapidak.is/</loc>');
  });

  it('contains photography loc', () => {
    expect(sitemap0).toContain('<loc>https://mike.lapidak.is/photography/</loc>');
  });

  it('contains work loc', () => {
    expect(sitemap0).toContain('<loc>https://mike.lapidak.is/work/</loc>');
  });

  it.each(PHOTO_SLUGS)('contains loc for photo %s', (slug) => {
    expect(sitemap0).toContain(
      `<loc>https://mike.lapidak.is/photography/${slug}/</loc>`
    );
  });

  it.each(COLLECTION_SLUGS)('contains loc for collection %s', (slug) => {
    expect(sitemap0).toContain(
      `<loc>https://mike.lapidak.is/photography/collection/${slug}/</loc>`
    );
  });

  it('contains posts index loc', () => {
    expect(sitemap0).toContain('<loc>https://mike.lapidak.is/posts/</loc>');
  });

  it('contains posts pagination locs (/posts/2/, /posts/3/)', () => {
    expect(sitemap0).toContain('<loc>https://mike.lapidak.is/posts/2/</loc>');
    expect(sitemap0).toContain('<loc>https://mike.lapidak.is/posts/3/</loc>');
  });

  it.each(POST_SLUGS_SAMPLE)('contains loc for post %s', (slug) => {
    expect(sitemap0).toContain(
      `<loc>https://mike.lapidak.is/posts/${slug}/</loc>`
    );
  });

  it('does NOT contain rss.xml, llms.txt, or .md companion routes', () => {
    expect(sitemap0).not.toContain('/rss.xml');
    expect(sitemap0).not.toContain('/llms.txt');
    expect(sitemap0).not.toMatch(/<loc>[^<]+\.md<\/loc>/);
  });

  it('total <loc> count is 49', () => {
    // 4 top-level (/, /photography/, /posts/, /work/)
    // + 17 photo details + 2 collection pages
    // + 24 post details + 2 pagination pages (/posts/2/, /posts/3/)
    const matches = sitemap0.match(/<loc>/g);
    expect(matches?.length).toBe(49);
  });

  it('all <loc> entries start with https://mike.lapidak.is', () => {
    const locs = [...sitemap0.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    for (const loc of locs) {
      expect(loc).toMatch(/^https:\/\/mike\.lapidak\.is/);
    }
  });

  it('no duplicate <loc> entries', () => {
    const locs = [...sitemap0.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    expect(new Set(locs).size).toBe(locs.length);
  });
});
