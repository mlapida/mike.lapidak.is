#!/usr/bin/env node
/**
 * Pull feature/hero images for published posts from the Ghost Content API,
 * download them to public/post-images/<slug>/feature.<ext>, and write a
 * `feature_image: /post-images/<slug>/feature.<ext>` line into each post's
 * frontmatter.
 *
 * Reads credentials from ~/.config/empty-coffee-publish/content-api
 * (GHOST_CONTENT_URL, GHOST_CONTENT_KEY).
 *
 * Usage:
 *   node scripts/migrate-feature-images.mjs            # migrate all
 *   node scripts/migrate-feature-images.mjs --dry-run  # show what would change
 *   node scripts/migrate-feature-images.mjs --force    # re-download even if cached
 *
 * Idempotent: skips images already on disk and posts already containing a
 * feature_image frontmatter entry (unless --force is passed).
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '..', 'src', 'content', 'posts');
const IMAGES_DIR = join(__dirname, '..', 'public', 'post-images');
const CONFIG_PATH = join(homedir(), '.config', 'empty-coffee-publish', 'content-api');

// Local slugs that don't match the Ghost slug 1:1. Local slug → Ghost slug.
const SLUG_REMAP = {
  'nextdns-caching-unifi-dream-machine': 'nextdns-cacheing-unifi-dream-machine',
};

const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

function loadConfig() {
  const raw = readFileSync(CONFIG_PATH, 'utf8');
  const out = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  if (!out.GHOST_CONTENT_URL || !out.GHOST_CONTENT_KEY) {
    throw new Error(`missing GHOST_CONTENT_URL/GHOST_CONTENT_KEY in ${CONFIG_PATH}`);
  }
  return out;
}

async function fetchAllGhostPosts({ GHOST_CONTENT_URL, GHOST_CONTENT_KEY }) {
  const all = [];
  let page = 1;
  for (;;) {
    const url = `${GHOST_CONTENT_URL}/ghost/api/content/posts/?key=${GHOST_CONTENT_KEY}&fields=id,slug,feature_image&limit=50&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Ghost API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    all.push(...data.posts);
    if (page >= data.meta.pagination.pages) break;
    page++;
  }
  return all;
}

function getFrontmatter(content) {
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return { fm: null, body: content, raw: null };
  return { fm: fm[1], body: content.slice(fm[0].length), raw: fm[0] };
}

function getSlug(fm) {
  const m = fm.match(/^slug:\s*(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

function hasFeatureImage(fm) {
  return /^feature_image:\s*\S/m.test(fm);
}

function setFeatureImage(fm, value) {
  if (hasFeatureImage(fm)) {
    return fm.replace(/^feature_image:.*$/m, `feature_image: ${value}`);
  }
  // Insert after `source_url:` if present, otherwise after `slug:`, otherwise at end.
  const insertAfter = (regex) => {
    const m = fm.match(regex);
    if (!m) return null;
    const idx = m.index + m[0].length;
    return fm.slice(0, idx) + `\nfeature_image: ${value}` + fm.slice(idx);
  };
  return (
    insertAfter(/^source_url:.*$/m) ||
    insertAfter(/^slug:.*$/m) ||
    fm + `\nfeature_image: ${value}`
  );
}

function urlToExt(url) {
  const u = new URL(url);
  const ext = extname(u.pathname).toLowerCase();
  // Strip a possible trailing dot artifact like `.jpeg.` from Ghost
  return ext.replace(/\.+$/, '') || '.jpg';
}

async function downloadImage(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'mike.lapidak.is migration' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) throw new Error(`not an image: content-type=${ct}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function main() {
  const config = loadConfig();
  console.log('fetching Ghost posts…');
  const ghostPosts = await fetchAllGhostPosts(config);
  const bySlug = new Map(ghostPosts.map(p => [p.slug, p]));
  console.log(`Ghost returned ${ghostPosts.length} posts (${ghostPosts.filter(p => p.feature_image).length} with feature images)\n`);

  if (!dryRun) await mkdir(IMAGES_DIR, { recursive: true });

  const files = (await readdir(POSTS_DIR)).filter(f => f.endsWith('.md')).sort();
  let downloaded = 0, cached = 0, skipped = 0, missing = 0, updated = 0, failed = 0;

  for (const file of files) {
    const filepath = join(POSTS_DIR, file);
    const content = await readFile(filepath, 'utf8');
    const { fm, body, raw } = getFrontmatter(content);
    if (!fm) { console.warn(`  ! ${file}: no frontmatter, skipping`); continue; }

    const localSlug = getSlug(fm);
    if (!localSlug) { console.warn(`  ! ${file}: no slug, skipping`); continue; }

    const ghostSlug = SLUG_REMAP[localSlug] || localSlug;
    const ghost = bySlug.get(ghostSlug);

    if (!ghost) {
      console.log(`  - ${localSlug}: not on Ghost, skipping`);
      skipped++;
      continue;
    }

    if (!ghost.feature_image) {
      console.log(`  - ${localSlug}: no feature_image on Ghost`);
      missing++;
      continue;
    }

    if (hasFeatureImage(fm) && !force) {
      cached++;
      continue;
    }

    const ext = urlToExt(ghost.feature_image);
    const slugDir = join(IMAGES_DIR, localSlug);
    const dest = join(slugDir, `feature${ext}`);
    const publicPath = `/post-images/${localSlug}/feature${ext}`;

    if (!dryRun) await mkdir(slugDir, { recursive: true });

    if (existsSync(dest) && !force) {
      console.log(`  ◦ ${localSlug}: image cached → ${publicPath}`);
    } else if (dryRun) {
      console.log(`  ↓ would download ${ghost.feature_image} → ${publicPath}`);
      downloaded++;
    } else {
      try {
        const size = await downloadImage(ghost.feature_image, dest);
        console.log(`  ↓ ${localSlug}: ${publicPath} (${(size / 1024).toFixed(0)} KB)`);
        downloaded++;
      } catch (err) {
        console.warn(`  ✗ ${localSlug}: ${err.message}`);
        failed++;
        continue;
      }
    }

    const newFm = setFeatureImage(fm, publicPath);
    if (newFm !== fm) {
      if (!dryRun) {
        await writeFile(filepath, `---\n${newFm}\n---${body}`);
      }
      updated++;
    }
  }

  console.log('\n---');
  console.log(`updated frontmatter: ${updated}`);
  console.log(`downloads: ${downloaded}, already cached: ${cached}, no Ghost match: ${skipped}, no feature_image on Ghost: ${missing}, failed: ${failed}`);
  if (dryRun) console.log('(dry-run; no files changed)');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
