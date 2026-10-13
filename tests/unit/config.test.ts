import { describe, it, expect } from 'vitest';
import { site, socials, heroSocials, footerSocials } from '../../src/config/site.js';

const expectedDisplaySocials = [
  { label: 'Threads', href: 'https://www.threads.net/@mikelapidakis' },
  { label: 'X', href: 'https://x.com/MikeLapidakis' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/mikelapidakis' },
  { label: 'GitHub', href: 'https://github.com/mlapida' },
  { label: 'glass', href: 'https://glass.photo/lap' },
];

describe('site metadata', () => {
  it('name is Mike Lapidakis', () => {
    expect(site.name).toBe('Mike Lapidakis');
  });

  it('url starts with https://', () => {
    expect(site.url).toMatch(/^https:\/\//);
  });

  it('description length > 10', () => {
    expect(site.description.length).toBeGreaterThan(10);
  });

  it('role is non-empty string', () => {
    expect(typeof site.role).toBe('string');
    expect(site.role.length).toBeGreaterThan(0);
  });

  it('bio is non-empty string', () => {
    expect(typeof site.bio).toBe('string');
    expect(site.bio.length).toBeGreaterThan(0);
  });
});

describe('socials', () => {
  it('has at least 5 entries', () => {
    expect(socials.length).toBeGreaterThanOrEqual(5);
  });

  it('every entry has non-empty label and https:// href', () => {
    for (const s of socials) {
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.href).toMatch(/^https:\/\//);
    }
  });

  it('contains LinkedIn', () => {
    expect(socials.some(s => s.label === 'LinkedIn')).toBe(true);
  });

  it('contains GitHub', () => {
    expect(socials.some(s => s.label === 'GitHub')).toBe(true);
  });

  it('contains Mastodon', () => {
    expect(socials.some(s => s.label === 'Mastodon')).toBe(true);
  });

  it('contains Bluesky', () => {
    expect(socials.some(s => s.label === 'Bluesky')).toBe(true);
  });

  it('preserves Mastodon verification', () => {
    expect(socials.find(s => s.label === 'Mastodon')?.rel).toBe('me');
  });
});

describe('heroSocials', () => {
  it('has exactly 5 entries', () => {
    expect(heroSocials).toHaveLength(5);
  });

  it('uses the requested labels, verified destinations, and order', () => {
    expect(heroSocials).toEqual(expectedDisplaySocials);
  });

  it('does not contain empty.coffee', () => {
    const labels = heroSocials.map(s => s.label);
    expect(labels).not.toContain('empty.coffee');
  });

  it('does not contain Mastodon or Bluesky', () => {
    const labels = heroSocials.map(s => s.label);
    expect(labels).not.toContain('Mastodon');
    expect(labels).not.toContain('Bluesky');
  });

  it('is a strict subset of socials', () => {
    const socialHrefs = new Set(socials.map(s => s.href));
    for (const h of heroSocials) {
      expect(socialHrefs.has(h.href)).toBe(true);
    }
  });
});

describe('footerSocials', () => {
  it('has exactly 5 entries', () => {
    expect(footerSocials).toHaveLength(5);
  });

  it('uses the requested labels, verified destinations, and order', () => {
    expect(footerSocials).toEqual(expectedDisplaySocials);
  });

  it('does not contain empty.coffee', () => {
    const labels = footerSocials.map(s => s.label);
    expect(labels).not.toContain('empty.coffee');
  });

  it('is a strict subset of socials', () => {
    const socialHrefs = new Set(socials.map(s => s.href));
    for (const f of footerSocials) {
      expect(socialHrefs.has(f.href)).toBe(true);
    }
  });
});
