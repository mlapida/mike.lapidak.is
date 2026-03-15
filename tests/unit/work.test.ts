import { describe, it, expect } from 'vitest';
import { spotlight, experience, talks, skillGroups } from '../../src/data/work.js';

describe('spotlight', () => {
  it('is non-empty array', () => {
    expect(spotlight.length).toBeGreaterThan(0);
  });

  it('every entry has type, title, desc, meta, and at least 1 link', () => {
    for (const item of spotlight) {
      expect(typeof item.type).toBe('string');
      expect(item.type.length).toBeGreaterThan(0);
      expect(typeof item.title).toBe('string');
      expect(item.title.length).toBeGreaterThan(0);
      expect(typeof item.desc).toBe('string');
      expect(item.desc.length).toBeGreaterThan(0);
      expect(typeof item.meta).toBe('string');
      expect(item.meta.length).toBeGreaterThan(0);
      expect(Array.isArray(item.links)).toBe(true);
      expect(item.links.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every link has non-empty label and https:// href', () => {
    for (const item of spotlight) {
      for (const link of item.links) {
        expect(link.label.length).toBeGreaterThan(0);
        expect(link.href).toMatch(/^https:\/\//);
      }
    }
  });
});

describe('experience', () => {
  it('is non-empty array', () => {
    expect(experience.length).toBeGreaterThan(0);
  });

  it('every entry has required fields and at least 1 tag', () => {
    for (const item of experience) {
      expect(typeof item.company).toBe('string');
      expect(item.company.length).toBeGreaterThan(0);
      expect(typeof item.role).toBe('string');
      expect(item.role.length).toBeGreaterThan(0);
      expect(typeof item.period).toBe('string');
      expect(item.period.length).toBeGreaterThan(0);
      expect(typeof item.location).toBe('string');
      expect(item.location.length).toBeGreaterThan(0);
      expect(typeof item.description).toBe('string');
      expect(item.description.length).toBeGreaterThan(0);
      expect(Array.isArray(item.tags)).toBe(true);
      expect(item.tags.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('first entry period contains "present"', () => {
    expect(experience[0].period.toLowerCase()).toContain('present');
  });

  it('first entry company is Amazon Web Services', () => {
    expect(experience[0].company).toBe('Amazon Web Services');
  });

  it('start years are in descending order', () => {
    const startYears = experience.map(e => {
      const match = e.period.match(/\d{4}/);
      return match ? parseInt(match[0], 10) : 0;
    });
    for (let i = 1; i < startYears.length; i++) {
      expect(startYears[i]).toBeLessThanOrEqual(startYears[i - 1]);
    }
  });
});

describe('talks', () => {
  it('is non-empty array', () => {
    expect(talks.length).toBeGreaterThan(0);
  });

  it('every entry has type, title, event, 4-digit year, and links array', () => {
    for (const talk of talks) {
      expect(typeof talk.type).toBe('string');
      expect(talk.type.length).toBeGreaterThan(0);
      expect(typeof talk.title).toBe('string');
      expect(talk.title.length).toBeGreaterThan(0);
      expect(typeof talk.event).toBe('string');
      expect(talk.event.length).toBeGreaterThan(0);
      expect(talk.year).toMatch(/^\d{4}$/);
      expect(Array.isArray(talk.links)).toBe(true);
    }
  });

  it('every link href uses https://', () => {
    for (const talk of talks) {
      for (const link of talk.links) {
        expect(link.href).toMatch(/^https:\/\//);
      }
    }
  });
});

describe('skillGroups', () => {
  it('has exactly 4 groups', () => {
    expect(skillGroups).toHaveLength(4);
  });

  it('labels are Leadership, Technical Domains, Cloud & Infrastructure, Compliance & Risk', () => {
    const labels = skillGroups.map(g => g.label);
    expect(labels).toEqual([
      'Leadership',
      'Technical Domains',
      'Cloud & Infrastructure',
      'Compliance & Risk',
    ]);
  });

  it('every group has at least 3 skills', () => {
    for (const group of skillGroups) {
      expect(group.skills.length).toBeGreaterThanOrEqual(3);
    }
  });
});
