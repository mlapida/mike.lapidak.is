import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import { distPath } from './dist.js';

export function loadHtml(relativePath: string): CheerioAPI {
  const fullPath = distPath(relativePath);
  const html = readFileSync(fullPath, 'utf-8');
  return cheerio.load(html);
}

export function extractJsonLd(relativePath: string): unknown[] {
  const $ = loadHtml(relativePath);
  const results: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      results.push(JSON.parse($(el).html() ?? ''));
    } catch {
      // skip invalid blocks
    }
  });
  return results;
}
