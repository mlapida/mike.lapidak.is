import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
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

beforeAll(() => {
  requireDist();
});

describe('top-level routes', () => {
  it('dist/index.html exists', () => {
    expect(existsSync(distPath('index.html'))).toBe(true);
  });

  it('dist/work/index.html exists', () => {
    expect(existsSync(distPath('work', 'index.html'))).toBe(true);
  });

  it('dist/photography/index.html exists', () => {
    expect(existsSync(distPath('photography', 'index.html'))).toBe(true);
  });
});

describe('photo detail routes', () => {
  it.each(PHOTO_SLUGS)('dist/photography/%s/index.html exists', (slug) => {
    expect(existsSync(distPath('photography', slug, 'index.html'))).toBe(true);
  });

  it('exactly 17 photo directories under dist/photography/ (excluding collection/)', () => {
    const entries = readdirSync(distPath('photography'), { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory() && e.name !== 'collection');
    expect(dirs.length).toBe(17);
  });
});

describe('collection routes', () => {
  it('dist/photography/collection/paris-2026/index.html exists', () => {
    expect(existsSync(distPath('photography', 'collection', 'paris-2026', 'index.html'))).toBe(true);
  });

  it('dist/photography/collection/immich-test/index.html exists', () => {
    expect(existsSync(distPath('photography', 'collection', 'immich-test', 'index.html'))).toBe(true);
  });

  it('exactly 2 collection directories under dist/photography/collection/', () => {
    const entries = readdirSync(distPath('photography', 'collection'), { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory());
    expect(dirs.length).toBe(2);
  });
});

describe('static files', () => {
  it('dist/sitemap-index.xml exists', () => {
    expect(existsSync(distPath('sitemap-index.xml'))).toBe(true);
  });

  it('dist/sitemap-0.xml exists', () => {
    expect(existsSync(distPath('sitemap-0.xml'))).toBe(true);
  });

  it('dist/robots.txt exists', () => {
    expect(existsSync(distPath('robots.txt'))).toBe(true);
  });
});
