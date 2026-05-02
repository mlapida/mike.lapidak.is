import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { displayableTags } from '../../lib/posts';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts');
  const published = posts.filter(
    p => p.data.status === 'published' && p.data.publish_date
  );
  return published.map(post => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const post = (props as any).post;
  const { title, description, publish_date, modified_date, word_count, tags } = post.data;
  // Strip the leading "# Title" and "> description" if present in the body —
  // we render our own clean header above. The imported posts have these
  // pre-baked from the Ghost import.
  let body: string = post.body;
  body = body.replace(/^\s*#\s+[^\n]+\n+/, '');
  body = body.replace(/^\s*>\s+[^\n]+\n+/, '');

  const dateISO = publish_date.toISOString().split('T')[0];
  const readMin = word_count ? Math.max(1, Math.round(word_count / 220)) : null;

  const cleanTags = displayableTags(tags).map(t => t.replace(/-/g, ' '));

  const metaParts = [`Published ${dateISO}`];
  if (readMin) metaParts.push(`${readMin} min read`);
  if (cleanTags.length) metaParts.push(cleanTags.join(', '));
  if (modified_date && modified_date.toISOString().split('T')[0] !== dateISO) {
    metaParts.push(`updated ${modified_date.toISOString().split('T')[0]}`);
  }

  const lines: string[] = [`# ${title}`, ''];
  if (description) lines.push(`> ${description}`, '');
  lines.push(`*${metaParts.join(' · ')}*`, '');
  lines.push(`Source: https://mike.lapidak.is/posts/${post.data.slug}/`, '');
  lines.push('---', '', body);

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
