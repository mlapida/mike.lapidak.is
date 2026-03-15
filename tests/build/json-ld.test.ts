import { describe, it, expect, beforeAll } from 'vitest';
import { requireDist } from '../helpers/dist.js';
import { extractJsonLd } from '../helpers/parse-html.js';

beforeAll(() => {
  requireDist();
});

describe('Homepage Person JSON-LD', () => {
  it('has @context, @type, name, url, sameAs, jobTitle', () => {
    const blocks = extractJsonLd('index.html');
    const person = blocks.find((b: any) => b['@type'] === 'Person') as any;
    expect(person).toBeDefined();
    expect(person['@context']).toBe('https://schema.org');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Mike Lapidakis');
    expect(person.url).toBe('https://mike.lapidak.is');
  });

  it('sameAs is array with >= 1 https:// URL and includes linkedin.com and github.com', () => {
    const blocks = extractJsonLd('index.html');
    const person = blocks.find((b: any) => b['@type'] === 'Person') as any;
    expect(Array.isArray(person.sameAs)).toBe(true);
    expect(person.sameAs.length).toBeGreaterThanOrEqual(1);
    for (const url of person.sameAs) {
      expect(url).toMatch(/^https:\/\//);
    }
    expect(person.sameAs.some((u: string) => u.includes('linkedin.com'))).toBe(true);
    expect(person.sameAs.some((u: string) => u.includes('github.com'))).toBe(true);
  });

  it('jobTitle is non-empty string', () => {
    const blocks = extractJsonLd('index.html');
    const person = blocks.find((b: any) => b['@type'] === 'Person') as any;
    expect(typeof person.jobTitle).toBe('string');
    expect(person.jobTitle.length).toBeGreaterThan(0);
  });
});

describe('Photo detail JSON-LD (l1003743)', () => {
  it('@type is Photograph', () => {
    const blocks = extractJsonLd('photography/l1003743/index.html');
    const photo = blocks.find((b: any) => b['@type'] === 'Photograph') as any;
    expect(photo).toBeDefined();
  });

  it('name is L1003743', () => {
    const blocks = extractJsonLd('photography/l1003743/index.html');
    const photo = blocks.find((b: any) => b['@type'] === 'Photograph') as any;
    expect(photo.name).toBe('L1003743');
  });

  it('contentUrl starts with https://', () => {
    const blocks = extractJsonLd('photography/l1003743/index.html');
    const photo = blocks.find((b: any) => b['@type'] === 'Photograph') as any;
    expect(photo.contentUrl).toMatch(/^https:\/\//);
  });

  it('url is https://mike.lapidak.is/photography/l1003743 (no trailing slash)', () => {
    const blocks = extractJsonLd('photography/l1003743/index.html');
    const photo = blocks.find((b: any) => b['@type'] === 'Photograph') as any;
    expect(photo.url).toBe('https://mike.lapidak.is/photography/l1003743');
  });

  it('dateCreated matches YYYY-MM-DD format', () => {
    const blocks = extractJsonLd('photography/l1003743/index.html');
    const photo = blocks.find((b: any) => b['@type'] === 'Photograph') as any;
    expect(photo.dateCreated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('locationCreated has @type Place and correct name', () => {
    const blocks = extractJsonLd('photography/l1003743/index.html');
    const photo = blocks.find((b: any) => b['@type'] === 'Photograph') as any;
    expect(photo.locationCreated['@type']).toBe('Place');
    expect(photo.locationCreated.name).toBe('Quinze-Vingts, France');
  });

  it('locationCreated.geo has @type GeoCoordinates with correct lat/lng', () => {
    const blocks = extractJsonLd('photography/l1003743/index.html');
    const photo = blocks.find((b: any) => b['@type'] === 'Photograph') as any;
    const geo = photo.locationCreated.geo;
    expect(geo['@type']).toBe('GeoCoordinates');
    expect(geo.latitude).toBeCloseTo(48.851028, 4);
    expect(geo.longitude).toBeCloseTo(2.362378, 4);
  });

  it('creator is Person with name Mike Lapidakis and site url', () => {
    const blocks = extractJsonLd('photography/l1003743/index.html');
    const photo = blocks.find((b: any) => b['@type'] === 'Photograph') as any;
    expect(photo.creator['@type']).toBe('Person');
    expect(photo.creator.name).toBe('Mike Lapidakis');
    expect(photo.creator.url).toBe('https://mike.lapidak.is');
  });
});

describe('Photo pages each have exactly 1 Photograph JSON-LD block', () => {
  const slugs = ['img-0273', 'l1000444', 'l1002868', 'l1003743', 'l1004462'];

  it.each(slugs)('photography/%s has 1 Photograph block', (slug) => {
    const blocks = extractJsonLd(`photography/${slug}/index.html`);
    const photoBlocks = blocks.filter((b: any) => b['@type'] === 'Photograph');
    expect(photoBlocks.length).toBe(1);
  });
});
