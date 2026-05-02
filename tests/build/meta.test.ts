import { describe, it, expect, beforeAll } from 'vitest';
import { requireDist } from '../helpers/dist.js';
import { loadHtml } from '../helpers/parse-html.js';

beforeAll(() => {
  requireDist();
});

describe('Homepage meta tags', () => {
  it('<title> is "Mike Lapidakis"', () => {
    const $ = loadHtml('index.html');
    expect($('title').text()).toBe('Mike Lapidakis');
  });

  it('og:title is "Mike Lapidakis"', () => {
    const $ = loadHtml('index.html');
    expect($('meta[property="og:title"]').attr('content')).toBe('Mike Lapidakis');
  });

  it('og:description is non-empty (length > 20)', () => {
    const $ = loadHtml('index.html');
    const desc = $('meta[property="og:description"]').attr('content') ?? '';
    expect(desc.length).toBeGreaterThan(20);
  });

  it('og:image starts with https://', () => {
    const $ = loadHtml('index.html');
    expect($('meta[property="og:image"]').attr('content')).toMatch(/^https:\/\//);
  });

  it('canonical href is https://mike.lapidak.is/', () => {
    const $ = loadHtml('index.html');
    expect($('link[rel="canonical"]').attr('href')).toBe('https://mike.lapidak.is/');
  });

  it('sitemap link href is /sitemap-index.xml', () => {
    const $ = loadHtml('index.html');
    expect($('link[rel="sitemap"]').attr('href')).toBe('/sitemap-index.xml');
  });

  it('meta author is Mike Lapidakis', () => {
    const $ = loadHtml('index.html');
    expect($('meta[name="author"]').attr('content')).toBe('Mike Lapidakis');
  });

  it('twitter:card is summary_large_image', () => {
    const $ = loadHtml('index.html');
    expect($('meta[name="twitter:card"]').attr('content')).toBe('summary_large_image');
  });
});

describe('Work page meta tags', () => {
  it('<title> is "Work · Mike Lapidakis"', () => {
    const $ = loadHtml('work/index.html');
    expect($('title').text()).toBe('Work · Mike Lapidakis');
  });

  it('canonical href is https://mike.lapidak.is/work/', () => {
    const $ = loadHtml('work/index.html');
    expect($('link[rel="canonical"]').attr('href')).toBe('https://mike.lapidak.is/work/');
  });

  it('og:image falls back to /social-card.jpg', () => {
    const $ = loadHtml('work/index.html');
    expect($('meta[property="og:image"]').attr('content')).toBe(
      'https://mike.lapidak.is/social-card.jpg'
    );
  });
});

describe('Photo detail meta tags (l1003743)', () => {
  it('<title> is "L1003743 · Mike Lapidakis"', () => {
    const $ = loadHtml('photography/l1003743/index.html');
    expect($('title').text()).toBe('L1003743 · Mike Lapidakis');
  });

  it('og:description contains location, year, and camera brand', () => {
    const $ = loadHtml('photography/l1003743/index.html');
    const desc = $('meta[property="og:description"]').attr('content') ?? '';
    expect(desc).toContain('Quinze-Vingts, France');
    expect(desc).toContain('2026');
    expect(desc).toContain('LEICA');
  });

  it('og:image contains r2.dev and starts with https://', () => {
    const $ = loadHtml('photography/l1003743/index.html');
    const img = $('meta[property="og:image"]').attr('content') ?? '';
    expect(img).toMatch(/^https:\/\//);
    expect(img).toContain('r2.dev');
  });

  it('canonical href is https://mike.lapidak.is/photography/l1003743/', () => {
    const $ = loadHtml('photography/l1003743/index.html');
    expect($('link[rel="canonical"]').attr('href')).toBe(
      'https://mike.lapidak.is/photography/l1003743/'
    );
  });
});

describe('RSS auto-discovery', () => {
  it('homepage <head> includes <link rel="alternate" type="application/rss+xml" href="/rss.xml">', () => {
    const $ = loadHtml('index.html');
    const link = $('link[rel="alternate"][type="application/rss+xml"]');
    expect(link.length).toBe(1);
    expect(link.attr('href')).toBe('/rss.xml');
  });

  it('post detail <head> includes the same RSS alternate link', () => {
    const $ = loadHtml('posts/review-weatherflow-tempest-weather-station/index.html');
    const link = $('link[rel="alternate"][type="application/rss+xml"]');
    expect(link.length).toBe(1);
    expect(link.attr('href')).toBe('/rss.xml');
  });
});

describe('Posts index meta tags', () => {
  it('<title> is "Writing · Mike Lapidakis" on page 1', () => {
    const $ = loadHtml('posts/index.html');
    expect($('title').text()).toBe('Writing · Mike Lapidakis');
  });

  it('<title> is "Writing · page 2 · Mike Lapidakis" on page 2', () => {
    const $ = loadHtml('posts/2/index.html');
    expect($('title').text()).toBe('Writing · page 2 · Mike Lapidakis');
  });

  it('canonical href on page 1 is /posts/', () => {
    const $ = loadHtml('posts/index.html');
    expect($('link[rel="canonical"]').attr('href')).toBe('https://mike.lapidak.is/posts/');
  });

  it('the RSS callout link in the page header points to /rss.xml', () => {
    const $ = loadHtml('posts/index.html');
    expect($('.page-rss').attr('href')).toBe('/rss.xml');
  });
});

describe('Post detail meta tags (review-weatherflow-tempest-weather-station)', () => {
  const path = 'posts/review-weatherflow-tempest-weather-station/index.html';

  it('<title> uses · separator (no em-dash)', () => {
    const $ = loadHtml(path);
    expect($('title').text()).toBe('A Month with the Tempest Weather Station · Mike Lapidakis');
  });

  it('og:image is the absolute feature image URL', () => {
    const $ = loadHtml(path);
    expect($('meta[property="og:image"]').attr('content')).toBe(
      'https://mike.lapidak.is/post-images/review-weatherflow-tempest-weather-station/feature.jpeg',
    );
  });

  it('twitter:image matches og:image', () => {
    const $ = loadHtml(path);
    const og = $('meta[property="og:image"]').attr('content');
    const tw = $('meta[name="twitter:image"]').attr('content');
    expect(tw).toBe(og);
  });
});

describe('No em-dash in any rendered page <title>', () => {
  const pages = [
    'index.html',
    'work/index.html',
    'photography/index.html',
    'posts/index.html',
    'posts/2/index.html',
    'posts/review-weatherflow-tempest-weather-station/index.html',
    'photography/l1003743/index.html',
  ];

  it.each(pages)('%s title uses no em-dash or en-dash', (page) => {
    const $ = loadHtml(page);
    expect($('title').text()).not.toMatch(/[—–]/);
  });
});

describe('Nav active state', () => {
  it('homepage: exactly 1 active link, href is /', () => {
    const $ = loadHtml('index.html');
    const active = $('.nav__link--active');
    expect(active.length).toBe(1);
    expect(active.attr('href')).toBe('/');
  });

  it('work page: exactly 1 active link, href is /work', () => {
    const $ = loadHtml('work/index.html');
    const active = $('.nav__link--active');
    expect(active.length).toBe(1);
    expect(active.attr('href')).toBe('/work');
  });

  it('photo detail: exactly 1 active link, href is /photography', () => {
    const $ = loadHtml('photography/l1003743/index.html');
    const active = $('.nav__link--active');
    expect(active.length).toBe(1);
    expect(active.attr('href')).toBe('/photography');
  });
});

describe('Footer (homepage)', () => {
  it('.footer__copy contains 2026 and Mike Lapidakis', () => {
    const $ = loadHtml('index.html');
    const copy = $('.footer__copy').text();
    expect(copy).toContain('2026');
    expect(copy).toContain('Mike Lapidakis');
  });

  it('.footer__link count is 7 (6 socials + RSS)', () => {
    const $ = loadHtml('index.html');
    expect($('.footer__link').length).toBe(7);
  });

  it('footer contains an RSS link to /rss.xml', () => {
    const $ = loadHtml('index.html');
    const rss = $('.footer__link').filter((_, el) => $(el).attr('href') === '/rss.xml');
    expect(rss.length).toBe(1);
  });

  it('Mastodon footer link has rel containing "me"', () => {
    const $ = loadHtml('index.html');
    const mastodon = $('.footer__link').filter((_, el) => {
      return ($(el).attr('href') ?? '').includes('lap.social');
    });
    expect(mastodon.length).toBe(1);
    expect(mastodon.attr('rel')).toContain('me');
  });
});
