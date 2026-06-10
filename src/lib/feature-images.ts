import type { ImageMetadata } from 'astro';

// Feature/hero images live in src/assets so they run through Astro's
// image pipeline (resized, WebP, hashed). Post frontmatter keeps the
// stable "/post-images/<slug>/feature.<ext>" path as an identifier;
// this maps it to the imported asset.
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/post-images/*/feature.{jpg,jpeg,png}',
  { eager: true },
);

export function featureAsset(featureImagePath: string | undefined): ImageMetadata | undefined {
  if (!featureImagePath) return undefined;
  const suffix = featureImagePath.replace(/^\/post-images\//, '');
  for (const [path, mod] of Object.entries(modules)) {
    if (path.endsWith(`/post-images/${suffix}`)) return mod.default;
  }
  return undefined;
}
