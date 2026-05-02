import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { requireDist, distPath } from '../helpers/dist.js';

let rss = '';

beforeAll(() => {
  requireDist();
  rss = readFileSync(distPath('rss.xml'), 'utf-8');
});

describe('rss.xml channel', () => {
  it('starts with <?xml', () => {
    expect(rss.trimStart()).toMatch(/^<\?xml/);
  });

  it('declares <rss version="2.0">', () => {
    expect(rss).toContain('<rss version="2.0">');
  });

  it('channel <link> is the site URL', () => {
    expect(rss).toMatch(/<link>https:\/\/mike\.lapidak\.is\/?<\/link>/);
  });

  it('channel <title> mentions Mike Lapidakis and Writing', () => {
    const titleMatch = rss.match(/<channel>[\s\S]*?<title>([^<]+)<\/title>/);
    expect(titleMatch).toBeTruthy();
    expect(titleMatch![1]).toContain('Mike Lapidakis');
    expect(titleMatch![1]).toContain('Writing');
  });

  it('channel <title> contains no em-dash or en-dash', () => {
    const titleMatch = rss.match(/<channel>[\s\S]*?<title>([^<]+)<\/title>/);
    expect(titleMatch![1]).not.toMatch(/[—–]/);
  });

  it('declares <language>en-us</language>', () => {
    expect(rss).toContain('<language>en-us</language>');
  });
});

describe('rss.xml items', () => {
  it('contains at least 23 <item> entries', () => {
    const matches = rss.match(/<item>/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(23);
  });

  it('every item link points to a /posts/<slug>/ URL on the site', () => {
    const links = [...rss.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map(m => m[1]);
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toMatch(/^https:\/\/mike\.lapidak\.is\/posts\/[a-z0-9-]+\/$/);
    }
  });

  it('every item has an <enclosure> with a feature image URL', () => {
    const items = [...rss.matchAll(/<item>[\s\S]*?<\/item>/g)].map(m => m[0]);
    for (const item of items) {
      expect(item).toMatch(
        /<enclosure url="https:\/\/mike\.lapidak\.is\/post-images\/[^/]+\/feature\.(jpe?g|png)"[^>]*\/>/,
      );
    }
  });

  it('enclosure types are image/jpeg or image/png', () => {
    const types = [...rss.matchAll(/<enclosure[^>]+type="([^"]+)"/g)].map(m => m[1]);
    expect(types.length).toBeGreaterThan(0);
    for (const t of types) {
      expect(['image/jpeg', 'image/png']).toContain(t);
    }
  });

  it('every item has a pubDate that parses to a valid Date', () => {
    const dates = [...rss.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map(m => m[1]);
    expect(dates.length).toBeGreaterThan(0);
    for (const d of dates) {
      expect(isNaN(new Date(d).getTime())).toBe(false);
    }
  });

  it('items are ordered newest first by pubDate', () => {
    const dates = [...rss.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map(m => new Date(m[1]).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
    }
  });

  it('drafts are not included (no draft slugs in any link)', () => {
    expect(rss).not.toMatch(/posts\/my-openclaw-setup/);
  });

  it('does not include the "draft" or "published" tag literals as <category>', () => {
    const categories = [...rss.matchAll(/<category>([^<]+)<\/category>/g)].map(m => m[1]);
    for (const c of categories) {
      expect(['draft', 'published', 'idea', 'empty-coffee']).not.toContain(c);
    }
  });
});
