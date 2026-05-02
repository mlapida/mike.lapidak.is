import { describe, it, expect, beforeAll } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR = join(process.cwd(), 'src/content/posts');

interface PostData {
  filename: string;
  slug: string;
  data: {
    type?: unknown;
    status?: unknown;
    title?: unknown;
    description?: unknown;
    publish_date?: unknown;
    modified_date?: unknown;
    slug?: unknown;
    author?: unknown;
    word_count?: unknown;
    feature_image?: unknown;
    tags?: unknown;
  };
}

let posts: PostData[] = [];
let published: PostData[] = [];

beforeAll(() => {
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  posts = files.map(file => {
    const content = readFileSync(join(POSTS_DIR, file), 'utf-8');
    const { data } = matter(content);
    return { filename: file, slug: basename(file, '.md'), data };
  });
  published = posts.filter(p => p.data.status === 'published');
});

describe('content/posts', () => {
  it('finds at least 23 post files', () => {
    expect(posts.length).toBeGreaterThanOrEqual(23);
  });

  it('all frontmatter slugs are unique', () => {
    const slugs = posts.map(p => p.data.slug as string).filter(Boolean);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every post has type "post"', () => {
    for (const p of posts) {
      expect(p.data.type).toBe('post');
    }
  });

  it('every post status is one of published, draft, idea', () => {
    const valid = new Set(['published', 'draft', 'idea']);
    for (const p of posts) {
      expect(valid.has(p.data.status as string)).toBe(true);
    }
  });

  it('every post has a non-empty title string', () => {
    for (const p of posts) {
      expect(typeof p.data.title).toBe('string');
      expect((p.data.title as string).length).toBeGreaterThan(0);
    }
  });

  it('every post has a non-empty slug string', () => {
    for (const p of posts) {
      expect(typeof p.data.slug).toBe('string');
      expect((p.data.slug as string).length).toBeGreaterThan(0);
    }
  });

  it('slugs are URL-safe (kebab-case lowercase letters/digits/dashes only)', () => {
    for (const p of posts) {
      expect(p.data.slug as string).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('every post has a non-empty author', () => {
    for (const p of posts) {
      expect(typeof p.data.author).toBe('string');
      expect((p.data.author as string).length).toBeGreaterThan(0);
    }
  });

  it('tags when present is an array of strings', () => {
    for (const p of posts) {
      if (p.data.tags !== undefined) {
        expect(Array.isArray(p.data.tags)).toBe(true);
        for (const t of p.data.tags as unknown[]) {
          expect(typeof t).toBe('string');
        }
      }
    }
  });

});

describe('content/posts: published posts', () => {
  it('has at least 23 published posts', () => {
    expect(published.length).toBeGreaterThanOrEqual(23);
  });

  it('every published post has a publish_date that parses to a valid Date', () => {
    for (const p of published) {
      expect(p.data.publish_date).toBeDefined();
      const d = new Date(p.data.publish_date as string | Date);
      expect(isNaN(d.getTime())).toBe(false);
    }
  });

  it('every published post has a feature_image starting with /post-images/', () => {
    for (const p of published) {
      expect(typeof p.data.feature_image).toBe('string');
      expect(p.data.feature_image as string).toMatch(/^\/post-images\/[^/]+\/feature\.(jpe?g|png)$/);
    }
  });

  it('feature_image slug segment matches the post slug', () => {
    for (const p of published) {
      const slug = p.data.slug as string;
      const featurePath = p.data.feature_image as string;
      expect(featurePath).toContain(`/post-images/${slug}/feature.`);
    }
  });

  it('word_count when present is a positive integer', () => {
    for (const p of published) {
      if (p.data.word_count !== undefined) {
        expect(Number.isInteger(p.data.word_count)).toBe(true);
        expect(p.data.word_count as number).toBeGreaterThan(0);
      }
    }
  });

  it('NextDNS post slug uses the typo-corrected "caching" form (not Ghost\'s "cacheing")', () => {
    const nextdns = published.find(p => (p.data.title as string).startsWith('NextDNS Part 2'));
    expect(nextdns).toBeDefined();
    expect(nextdns!.data.slug).toBe('nextdns-caching-unifi-dream-machine');
  });
});
