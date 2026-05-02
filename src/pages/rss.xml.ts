import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../config/site';
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
    items: published.map(post => {
      const link = `/posts/${post.data.slug}/`;
      const enclosure = post.data.feature_image
        ? {
            url: new URL(post.data.feature_image, siteUrl).toString(),
            length: 0,
            type: post.data.feature_image.endsWith('.png') ? 'image/png' : 'image/jpeg',
          }
        : undefined;
      return {
        title: post.data.title,
        description: post.data.description ?? '',
        pubDate: post.data.publish_date!,
        link,
        author: post.data.author,
        categories: post.data.tags.filter(
          t => !['empty-coffee', 'published', 'draft', 'idea'].includes(t),
        ),
        ...(enclosure ? { enclosure } : {}),
      };
    }),
    customData: '<language>en-us</language>',
    stylesheet: false,
  });
};
