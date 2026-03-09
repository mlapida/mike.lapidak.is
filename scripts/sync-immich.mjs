#!/usr/bin/env node
/**
 * sync-immich.mjs
 *
 * Syncs photos from Immich albums ending in "-share" to:
 *   - Cloudflare R2 (original images)
 *   - src/content/photos/*.md (Astro content collection metadata)
 *   - git commit + push (triggers Cloudflare Pages rebuild)
 *
 * Usage:
 *   node scripts/sync-immich.mjs [options]
 *
 * Options:
 *   --dry-run         Log actions only, no writes or commits
 *   --album <name>    Sync one specific album only
 *   --no-push         Write files but skip git push
 *   --force           Re-download all assets (ignore existing)
 *
 * Required env vars (see .env.example):
 *   IMMICH_URL, IMMICH_API_KEY,
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME,
 *   PHOTOS_CDN_URL, SITE_REPO_PATH
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

// ─── CLI flags ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN  = args.includes('--dry-run');
const NO_PUSH  = args.includes('--no-push');
const FORCE    = args.includes('--force');
const albumIdx = args.indexOf('--album');
const ONLY_ALBUM = albumIdx !== -1 ? args[albumIdx + 1] : null;

// ─── Config ──────────────────────────────────────────────────────────────────
const {
  IMMICH_URL,
  IMMICH_API_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME    = 'site-photos',
  PHOTOS_CDN_URL,
  SITE_REPO_PATH    = '.',
  GIT_USER_EMAIL    = 'sync@mike.lapidak.is',
  GIT_USER_NAME     = 'photo-sync',
} = process.env;

for (const [key, val] of Object.entries({ IMMICH_URL, IMMICH_API_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, PHOTOS_CDN_URL })) {
  if (!val) { console.error(`Missing required env var: ${key}`); process.exit(1); }
}

const REPO    = resolve(SITE_REPO_PATH);
const PHOTOS_DIR = join(REPO, 'src/content/photos');

// ─── Immich API helpers ───────────────────────────────────────────────────────
async function immichGet(path) {
  const res = await fetch(`${IMMICH_URL}${path}`, {
    headers: { 'x-api-key': IMMICH_API_KEY, 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`Immich GET ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

async function immichDownload(assetId) {
  const res = await fetch(`${IMMICH_URL}/api/assets/${assetId}/original`, {
    headers: { 'x-api-key': IMMICH_API_KEY },
  });
  if (!res.ok) throw new Error(`Immich download ${assetId} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ─── R2 helpers ───────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function r2Exists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function r2Upload(key, body, contentType = 'image/jpeg') {
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

// ─── String utilities ─────────────────────────────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/\.[^.]+$/, '')          // strip extension
    .replace(/[^a-z0-9]+/g, '-')      // non-alnum → dash
    .replace(/^-+|-+$/g, '');         // trim dashes
}

function toTitleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

/** Parse collection name from album description "Title: Foo Bar" → "Foo Bar", no match → null (singles) */
function albumToCollection(album) {
  const match = (album.description ?? '').match(/Title:\s*(.+)/i);
  return match ? match[1].trim() : null;
}

// ─── Frontmatter builder ──────────────────────────────────────────────────────
function buildFrontmatter(asset, album) {
  const exif = asset.exifInfo ?? {};

  // title: description from Immich, or cleaned filename
  const rawName = (asset.originalFileName ?? '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  const title = (exif.description?.trim() || toTitleCase(rawName)) || 'Untitled';

  // date: prefer localDateTime
  const date = (asset.localDateTime ?? asset.fileCreatedAt ?? '').slice(0, 10);

  // location
  const locationParts = [exif.city, exif.country].filter(Boolean);
  const location = locationParts.join(', ') || 'Unknown';

  // image URL on CDN
  const ext = (asset.originalFileName ?? 'photo.jpg').split('.').pop().toLowerCase();
  const r2Key = `${asset.id}.${ext}`;
  const image = `${PHOTOS_CDN_URL}/${r2Key}`;

  // dimensions + orientation
  const imgWidth  = exif.exifImageWidth  ?? null;
  const imgHeight = exif.exifImageHeight ?? null;
  let orientation = 'landscape';
  if (imgWidth && imgHeight) {
    if (imgWidth < imgHeight) orientation = 'portrait';
    else if (imgWidth === imgHeight) orientation = 'square';
  }

  // collection
  const collection = albumToCollection(album);

  const lines = ['---'];
  lines.push(`title: ${JSON.stringify(title)}`);
  lines.push(`date: ${date}`);
  lines.push(`location: ${JSON.stringify(location)}`);
  if (exif.latitude != null && exif.longitude != null) {
    lines.push(`gps:`);
    lines.push(`  lat: ${JSON.stringify(exif.latitude)}`);
    lines.push(`  lng: ${JSON.stringify(exif.longitude)}`);
  }
  if (exif.make || exif.model) {
    const camera = [exif.make, exif.model].filter(Boolean).join(' ');
    lines.push(`camera: ${JSON.stringify(camera)}`);
  }
  if (exif.lensModel) lines.push(`lens: ${JSON.stringify(exif.lensModel)}`);
  if (exif.fNumber  != null) lines.push(`aperture: ${JSON.stringify(`f/${exif.fNumber}`)}`);
  if (exif.exposureTime != null) lines.push(`shutter: ${JSON.stringify(String(exif.exposureTime))}`);
  if (exif.iso      != null) lines.push(`iso: ${JSON.stringify(exif.iso)}`);
  lines.push(`image: ${JSON.stringify(image)}`);
  if (imgWidth  != null) lines.push(`imgWidth: ${JSON.stringify(imgWidth)}`);
  if (imgHeight != null) lines.push(`imgHeight: ${JSON.stringify(imgHeight)}`);
  lines.push(`featured: ${asset.isFavorite ? 'true' : 'false'}`);
  lines.push(`orientation: ${orientation}`);
  if (collection) lines.push(`collection: ${JSON.stringify(collection)}`);
  lines.push(`immichId: ${JSON.stringify(asset.id)}`);
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

// ─── Existing .md index ───────────────────────────────────────────────────────
function loadExistingMd() {
  /** Map<immichId, { slug, filePath }> */
  const map = new Map();
  if (!existsSync(PHOTOS_DIR)) return map;
  for (const file of readdirSync(PHOTOS_DIR)) {
    if (!file.endsWith('.md')) continue;
    const filePath = join(PHOTOS_DIR, file);
    const content = readFileSync(filePath, 'utf8');
    const match = content.match(/^immichId:\s*["']?([a-f0-9-]{36})["']?/m);
    if (match) {
      const slug = file.replace(/\.md$/, '');
      map.set(match[1], { slug, filePath });
    }
  }
  return map;
}

// ─── Git helpers ──────────────────────────────────────────────────────────────
function git(...args) {
  console.log(`  $ git -C ${REPO} ${args.join(' ')}`);
  if (!DRY_RUN) execFileSync('git', ['-C', REPO, ...args], { stdio: 'inherit' });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== Immich → Site Photo Sync${DRY_RUN ? ' [DRY RUN]' : ''} ===\n`);

  // 1. Get all albums, filter to -share
  console.log('Fetching albums from Immich...');
  const allAlbums = await immichGet('/api/albums');
  const shareAlbums = allAlbums.filter(a =>
    a.albumName.endsWith('-share') &&
    (!ONLY_ALBUM || a.albumName === ONLY_ALBUM)
  );

  if (shareAlbums.length === 0) {
    console.log('No matching -share albums found. Exiting.');
    return;
  }
  console.log(`Found ${shareAlbums.length} album(s): ${shareAlbums.map(a => a.albumName).join(', ')}\n`);

  // 2. Load existing .md files
  const existing = loadExistingMd();
  console.log(`Found ${existing.size} existing photo(s) with immichId\n`);

  // 3. Build set of all asset IDs that should exist
  const activeImmichIds = new Set();
  const seenAssetIds = new Set(); // deduplicate assets appearing in multiple albums
  const writes = []; // { asset, album }

  for (const albumSummary of shareAlbums) {
    console.log(`Processing album: ${albumSummary.albumName}`);
    const album = await immichGet(`/api/albums/${albumSummary.id}`);
    const assets = album.assets ?? [];
    console.log(`  ${assets.length} asset(s)`);

    for (const asset of assets) {
      if (asset.type !== 'IMAGE') continue;
      activeImmichIds.add(asset.id);

      if (seenAssetIds.has(asset.id)) {
        console.log(`  [skip] ${asset.originalFileName} (duplicate across albums)`);
        continue;
      }
      seenAssetIds.add(asset.id);

      const alreadyExists = existing.has(asset.id);
      if (alreadyExists && !FORCE) {
        console.log(`  [skip] ${asset.originalFileName} (already synced)`);
        continue;
      }
      writes.push({ asset, album });
    }
  }

  // 4. Process new/updated assets
  console.log(`\n${writes.length} asset(s) to sync...\n`);
  for (const { asset, album } of writes) {
    const ext = (asset.originalFileName ?? 'photo.jpg').split('.').pop().toLowerCase();
    const r2Key = `${asset.id}.${ext}`;
    const slug = toSlug(asset.originalFileName ?? asset.id);
    const mdPath = join(PHOTOS_DIR, `${slug}.md`);

    console.log(`→ ${asset.originalFileName} (${album.albumName})`);

    // Upload to R2
    const r2KeyExists = !DRY_RUN && await r2Exists(r2Key);
    if (!r2KeyExists || FORCE) {
      console.log(`  Downloading original...`);
      if (!DRY_RUN) {
        const buf = await immichDownload(asset.id);
        console.log(`  Uploading to R2: ${r2Key}`);
        await r2Upload(r2Key, buf, `image/${ext === 'jpg' ? 'jpeg' : ext}`);
      } else {
        console.log(`  [dry] Would download + upload to R2: ${r2Key}`);
      }
    } else {
      console.log(`  R2 key already exists, skipping upload`);
    }

    // Fetch full EXIF (asset list may be partial)
    const fullAsset = DRY_RUN ? asset : await immichGet(`/api/assets/${asset.id}`);
    const fm = buildFrontmatter(fullAsset, album);

    console.log(`  Writing ${mdPath}`);
    if (!DRY_RUN) writeFileSync(mdPath, fm, 'utf8');
    else console.log(`  [dry] Would write:\n${fm}`);
  }

  // 5. Remove stale .md files
  console.log('\nChecking for stale photos...');
  let removedCount = 0;
  for (const [immichId, { slug, filePath }] of existing) {
    if (!activeImmichIds.has(immichId)) {
      console.log(`  Removing stale: ${slug}.md (immichId: ${immichId})`);
      if (!DRY_RUN) unlinkSync(filePath);
      removedCount++;
    }
  }
  if (removedCount === 0) console.log('  None.');

  // 6. Git commit + push
  if (writes.length === 0 && removedCount === 0) {
    console.log('\nNo changes. Skipping git commit.');
    return;
  }

  console.log('\nCommitting changes...');
  git('config', 'user.email', JSON.stringify(GIT_USER_EMAIL));
  git('config', 'user.name', JSON.stringify(GIT_USER_NAME));
  git('add', 'src/content/photos/');
  git('commit', '-m', '"chore: sync photos from immich"');

  if (!NO_PUSH && !DRY_RUN) {
    console.log('Pushing...');
    git('push');
  } else {
    console.log('Skipping push (--no-push or --dry-run).');
  }

  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
