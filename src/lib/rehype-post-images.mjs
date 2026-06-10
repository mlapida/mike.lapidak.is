// Rehype plugin for markdown body images served from public/post-images.
// They stay in public/ so the /posts/<slug>.md companion routes keep
// stable URLs, which means Astro's pipeline never sees them. This adds
// what the pipeline would have: width/height (no CLS), lazy loading,
// and async decode. Dimensions are probed once per file via sharp.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = fileURLToPath(new URL('../../public', import.meta.url));
const dimsCache = new Map();

async function probe(src) {
  if (dimsCache.has(src)) return dimsCache.get(src);
  const file = path.join(PUBLIC_DIR, src);
  let dims = null;
  if (existsSync(file)) {
    try {
      const meta = await sharp(file).metadata();
      if (meta.width && meta.height) dims = { width: meta.width, height: meta.height };
    } catch {
      dims = null;
    }
  }
  dimsCache.set(src, dims);
  return dims;
}

function collectImgs(node, out) {
  if (node.type === 'element' && node.tagName === 'img') out.push(node);
  for (const child of node.children ?? []) collectImgs(child, out);
}

export default function rehypePostImages() {
  return async (tree) => {
    const imgs = [];
    collectImgs(tree, imgs);
    for (const img of imgs) {
      const src = img.properties?.src;
      if (typeof src !== 'string' || !src.startsWith('/post-images/')) continue;
      img.properties.loading ??= 'lazy';
      img.properties.decoding ??= 'async';
      if (!img.properties.width || !img.properties.height) {
        const dims = await probe(src);
        if (dims) {
          img.properties.width = dims.width;
          img.properties.height = dims.height;
        }
      }
    }
  };
}
