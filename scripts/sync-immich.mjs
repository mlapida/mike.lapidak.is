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
import sharp from 'sharp';

// Maximum pixels on the longest edge for web-optimised uploads.
// 3200px ensures 2× retina sharpness at the 60% panel width on a 2560px display.
const MAX_LONG_EDGE = 3200;

// Known RAW file extensions — warn and skip rather than attempting to process
const RAW_EXTENSIONS = new Set([
  'nef', 'nrw',           // Nikon
  'cr2', 'cr3',           // Canon
  'arw', 'srf', 'sr2',   // Sony
  'raf',                  // Fujifilm
  'orf',                  // Olympus
  'rw2',                  // Panasonic
  'pef', 'ptx',           // Pentax
  'dng',                  // Adobe DNG (may be RAW)
  'rwl',                  // Leica
  '3fr', 'fff',           // Hasselblad
  'iiq',                  // Phase One
  'cap', 'eip',           // Capture One
]);

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
function buildFrontmatter(asset, album, resized = null) {
  const exif = asset.exifInfo ?? {};

  // title: description from Immich, or cleaned filename
  const rawName = (asset.originalFileName ?? '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  const title = (exif.description?.trim() || toTitleCase(rawName)) || 'Untitled';

  // date: prefer localDateTime
  const date = (asset.localDateTime ?? asset.fileCreatedAt ?? '').slice(0, 10);

  // location
  const locationParts = [exif.city, exif.country].filter(Boolean);
  const location = locationParts.join(', ') || 'Unknown';

  // image URL on CDN — always stored as .jpg after resize
  const image = `${PHOTOS_CDN_URL}/${asset.id}.jpg`;

  // dimensions — prefer actual resized output over EXIF (which may reflect original RAW)
  const imgWidth  = resized?.width  ?? exif.exifImageWidth  ?? null;
  const imgHeight = resized?.height ?? exif.exifImageHeight ?? null;
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
  if (exif.fNumber  != null) lines.push(`aperture: ${JSON.stringify(String(exif.fNumber))}`);
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

      const fileExt = (asset.originalFileName ?? '').split('.').pop().toLowerCase();
      if (RAW_EXTENSIONS.has(fileExt)) {
        console.warn(`  ⚠  SKIPPED RAW: ${asset.originalFileName} — export a JPEG from Immich and re-add it to the album`);
        continue;
      }

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
    const r2Key = `${asset.id}.jpg`;
    const slug = toSlug(asset.originalFileName ?? asset.id);
    const mdPath = join(PHOTOS_DIR, `${slug}.md`);

    console.log(`→ ${asset.originalFileName} (${album.albumName})`);

    // Upload to R2
    let resized = null;
    const r2KeyExists = !DRY_RUN && await r2Exists(r2Key);
    if (!r2KeyExists || FORCE) {
      console.log(`  Downloading original...`);
      if (!DRY_RUN) {
        const raw = await immichDownload(asset.id);
        console.log(`  Resizing to max ${MAX_LONG_EDGE}px...`);
        const buf = await sharp(raw)
          .rotate()  // auto-apply EXIF orientation before resize
          .resize(MAX_LONG_EDGE, MAX_LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer({ resolveWithObject: true });
        resized = { width: buf.info.width, height: buf.info.height };
        console.log(`  ${buf.info.width}×${buf.info.height} (${Math.round(buf.data.length / 1024)}kB) → R2: ${r2Key}`);
        await r2Upload(r2Key, buf.data, 'image/jpeg');
      } else {
        console.log(`  [dry] Would download + resize + upload to R2: ${r2Key}`);
      }
    } else {
      console.log(`  R2 key already exists, skipping upload`);
    }

    // Fetch full EXIF (asset list may be partial)
    const fullAsset = DRY_RUN ? asset : await immichGet(`/api/assets/${asset.id}`);
    const fm = buildFrontmatter(fullAsset, album, resized);

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
