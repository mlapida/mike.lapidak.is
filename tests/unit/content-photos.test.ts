import { describe, it, expect, beforeAll } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';

const PHOTOS_DIR = join(process.cwd(), 'src/content/photos');

interface PhotoData {
  slug: string;
  data: {
    title?: unknown;
    date?: unknown;
    location?: unknown;
    image?: unknown;
    orientation?: unknown;
    imgWidth?: unknown;
    imgHeight?: unknown;
    gps?: { lat?: unknown; lng?: unknown };
    immichId?: unknown;
  };
}

let photos: PhotoData[] = [];

beforeAll(() => {
  const files = readdirSync(PHOTOS_DIR).filter(f => f.endsWith('.md'));
  photos = files.map(file => {
    const content = readFileSync(join(PHOTOS_DIR, file), 'utf-8');
    const { data } = matter(content);
    return { slug: basename(file, '.md'), data };
  });
});

describe('content/photos', () => {
  it('finds at least 1 photo file', () => {
    expect(photos.length).toBeGreaterThanOrEqual(1);
  });

  it('all slugs are unique', () => {
    const slugs = photos.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every photo has non-empty title string', () => {
    for (const p of photos) {
      expect(typeof p.data.title).toBe('string');
      expect((p.data.title as string).length).toBeGreaterThan(0);
    }
  });

  it('every photo has a date that parses to a valid Date', () => {
    for (const p of photos) {
      const d = new Date(p.data.date as string | Date);
      expect(isNaN(d.getTime())).toBe(false);
    }
  });

  it('every photo has non-empty location string', () => {
    for (const p of photos) {
      expect(typeof p.data.location).toBe('string');
      expect((p.data.location as string).length).toBeGreaterThan(0);
    }
  });

  it('every photo image starts with https://', () => {
    for (const p of photos) {
      expect(typeof p.data.image).toBe('string');
      expect(p.data.image as string).toMatch(/^https:\/\//);
    }
  });

  it('orientation when present is one of landscape, portrait, square', () => {
    const valid = new Set(['landscape', 'portrait', 'square']);
    for (const p of photos) {
      if (p.data.orientation !== undefined) {
        expect(valid.has(p.data.orientation as string)).toBe(true);
      }
    }
  });

  it('imgWidth and imgHeight when present are positive integers', () => {
    for (const p of photos) {
      if (p.data.imgWidth !== undefined) {
        expect(Number.isInteger(p.data.imgWidth)).toBe(true);
        expect(p.data.imgWidth as number).toBeGreaterThan(0);
      }
      if (p.data.imgHeight !== undefined) {
        expect(Number.isInteger(p.data.imgHeight)).toBe(true);
        expect(p.data.imgHeight as number).toBeGreaterThan(0);
      }
    }
  });

  it('aspect ratio when both dimensions present is between 0.2 and 5.0', () => {
    for (const p of photos) {
      if (p.data.imgWidth !== undefined && p.data.imgHeight !== undefined) {
        const ratio = (p.data.imgWidth as number) / (p.data.imgHeight as number);
        expect(ratio).toBeGreaterThan(0.2);
        expect(ratio).toBeLessThan(5.0);
      }
    }
  });

  it('GPS lat in [-90, 90] and lng in [-180, 180] when present', () => {
    for (const p of photos) {
      if (p.data.gps) {
        const { lat, lng } = p.data.gps;
        if (lat !== undefined) {
          expect(lat as number).toBeGreaterThanOrEqual(-90);
          expect(lat as number).toBeLessThanOrEqual(90);
        }
        if (lng !== undefined) {
          expect(lng as number).toBeGreaterThanOrEqual(-180);
          expect(lng as number).toBeLessThanOrEqual(180);
        }
      }
    }
  });

  it('immichId when present matches loose UUID pattern', () => {
    for (const p of photos) {
      if (p.data.immichId !== undefined) {
        expect(p.data.immichId as string).toMatch(/^[0-9a-f-]{36}$/);
      }
    }
  });

  it('landscape photos have imgWidth > imgHeight', () => {
    for (const p of photos) {
      if (
        p.data.orientation === 'landscape' &&
        p.data.imgWidth !== undefined &&
        p.data.imgHeight !== undefined
      ) {
        expect(p.data.imgWidth as number).toBeGreaterThan(p.data.imgHeight as number);
      }
    }
  });

  it('portrait photos have imgHeight > imgWidth', () => {
    for (const p of photos) {
      if (
        p.data.orientation === 'portrait' &&
        p.data.imgWidth !== undefined &&
        p.data.imgHeight !== undefined
      ) {
        expect(p.data.imgHeight as number).toBeGreaterThan(p.data.imgWidth as number);
      }
    }
  });
});
