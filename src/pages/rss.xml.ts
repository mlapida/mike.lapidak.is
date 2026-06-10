import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import { site } from '../config/site';
import { displayableTags } from '../lib/posts';
import { featureAsset } from '../lib/feature-images';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const all = await getCollection('posts');
  const published = all
    .filter(p => p.data.status === 'published' && p.data.publish_date)
    .sort((a, b) => b.data.publish_date!.valueOf() - a.data.publish_date!.valueOf());

  const siteUrl = (context.site ?? new URL(site.url)).toString().replace(/\/$/, '');

  return rss({
    title: `${site.name} · Writing`,
    description: 'Notes from the homelab, AWS, and the tools I\'m using to think.',
    site: context.site ?? site.url,
    items: await Promise.all(published.map(async post => {
      const link = `/posts/${post.data.slug}/`;
      // Same transform as the post page's OG image, so the two share
      // one generated file in dist.
      const asset = featureAsset(post.data.feature_image);
      const optimized = asset
        ? await getImage({ src: asset, width: 1200, format: 'jpeg', quality: 80 })
        : undefined;
      const enclosure = optimized
        ? {
            url: new URL(optimized.src, siteUrl).toString(),
            length: 0,
            type: 'image/jpeg',
          }
        : undefined;
      return {
        title: post.data.title,
        description: post.data.description ?? '',
        pubDate: post.data.publish_date!,
        link,
        author: post.data.author,
        categories: displayableTags(post.data.tags),
        ...(enclosure ? { enclosure } : {}),
      };
    })),
    customData: '<language>en-us</language>',
    stylesheet: false,
  });
};
