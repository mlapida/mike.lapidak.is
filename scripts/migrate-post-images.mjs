#!/usr/bin/env node
/**
 * One-shot migration: download all Ghost-hosted images referenced in
 * src/content/posts/*.md to public/post-images/<slug>/<filename>, then
 * rewrite the markdown image URLs to point at the local copies.
 *
 * Usage:
 *   node scripts/migrate-post-images.mjs            # migrate all
 *   node scripts/migrate-post-images.mjs --dry-run  # show what would change
 *
 * Idempotent: skips images already on disk. Safe to re-run.
 */
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '..', 'src', 'content', 'posts');
const IMAGES_DIR = join(__dirname, '..', 'public', 'post-images');

const HOSTS = ['media.empty.coffee', 'storage.ghost.io'];
const HOST_RE = HOSTS.map(h => h.replace(/\./g, '\\.')).join('|');
const IMAGE_MD_RE = new RegExp(
  `!\\[([^\\]]*)\\]\\((https?://(?:${HOST_RE})/[^)\\s]+)\\)`,
  'g'
);

const dryRun = process.argv.includes('--dry-run');

function getSlug(content) {
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const m = fm[1].match(/^slug:\s*(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

function urlToFilename(url) {
  const u = new URL(url);
  // Ghost image URLs sometimes include /size/wXXXX/ in the path; strip those
  // to land at the original filename.
  const cleaned = u.pathname.replace(/\/size\/w\d+\//, '/');
  return basename(cleaned);
}

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mike.lapidak.is migration' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) throw new Error(`not an image: content-type=${ct}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function processPost(filename) {
  const filepath = join(POSTS_DIR, filename);
  let content = await readFile(filepath, 'utf8');
  const slug = getSlug(content);
  if (!slug) {
    console.warn(`  ! ${filename}: no slug, skipping`);
    return { downloaded: 0, cached: 0, failed: 0, rewritten: 0 };
  }

  const matches = [...content.matchAll(IMAGE_MD_RE)];
  if (matches.length === 0) return { downloaded: 0, cached: 0, failed: 0, rewritten: 0 };

  const slugDir = join(IMAGES_DIR, slug);
  if (!dryRun) await mkdir(slugDir, { recursive: true });

  let downloaded = 0, cached = 0, failed = 0, rewritten = 0;
  // De-dup URLs within this post — same URL referenced multiple times only fetched once
  const seen = new Map();

  for (const match of matches) {
    const [fullMatch, alt, url] = match;
    let local;
    if (seen.has(url)) {
      local = seen.get(url);
    } else {
      const fname = urlToFilename(url);
      const dest = join(slugDir, fname);
      const publicPath = `/post-images/${slug}/${fname}`;
      local = publicPath;
      seen.set(url, publicPath);

      if (existsSync(dest)) {
        cached++;
      } else if (dryRun) {
        console.log(`  ↓ would download → ${publicPath}`);
        downloaded++;
      } else {
        try {
          const size = await downloadImage(url, dest);
          console.log(`  ↓ ${publicPath} (${(size / 1024).toFixed(0)} KB)`);
          downloaded++;
        } catch (err) {
          console.warn(`  ✗ ${url}: ${err.message}`);
          failed++;
          continue;
        }
      }
    }
    // Rewrite this occurrence
    content = content.replace(fullMatch, `![${alt}](${local})`);
    rewritten++;
  }

  if (!dryRun && rewritten > 0) {
    await writeFile(filepath, content);
  }

  return { downloaded, cached, failed, rewritten };
}

async function main() {
  if (!dryRun) await mkdir(IMAGES_DIR, { recursive: true });
  const files = (await readdir(POSTS_DIR)).filter(f => f.endsWith('.md')).sort();
  console.log(`processing ${files.length} posts${dryRun ? ' (dry-run)' : ''}...\n`);

  const totals = { downloaded: 0, cached: 0, failed: 0, rewritten: 0, postsTouched: 0 };
  for (const file of files) {
    const r = await processPost(file);
    if (r.rewritten > 0) {
      totals.postsTouched++;
      console.log(`${file}: ${r.rewritten} refs rewritten (${r.downloaded} downloaded, ${r.cached} cached, ${r.failed} failed)\n`);
    }
    for (const k of Object.keys(r)) totals[k] = (totals[k] || 0) + r[k];
  }

  console.log('---');
  console.log(`posts touched: ${totals.postsTouched}`);
  console.log(`refs rewritten: ${totals.rewritten}`);
  console.log(`downloads: ${totals.downloaded}, cached: ${totals.cached}, failed: ${totals.failed}`);
  if (dryRun) console.log('(dry-run; no files changed)');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
