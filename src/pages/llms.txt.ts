import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { spotlight } from '../data/work';

const SITE = 'https://mike.lapidak.is';

export const GET: APIRoute = async () => {
  const allPosts = await getCollection('posts');
  const published = allPosts
    .filter(p => p.data.status === 'published' && p.data.publish_date)
    .sort((a, b) => b.data.publish_date!.valueOf() - a.data.publish_date!.valueOf());

  const writingLines = published.map(p => {
    const date = p.data.publish_date!.toISOString().split('T')[0];
    const desc = p.data.description ? `: ${p.data.description}` : '';
    return `- [${p.data.title}](${SITE}/posts/${p.data.slug}/) (${date})${desc}`;
  });

  const publicationLines = spotlight
    .filter(s => s.links?.[0]?.href)
    .map(s => `- [${s.title}](${s.links[0].href}): ${s.desc} ${s.meta}.`);

  const out = `# Mike Lapidakis

> Personal site for Mike Lapidakis, a Senior Manager at AWS leading Security & Networking Specialist Solutions Architects across North America. Based in Denver, CO. The site covers professional background (work, publications, talks), long-form writing on homelab and self-hosted services, and a photography portfolio shot on a Leica Q3.

Mike has spent ten years at AWS, the last six building and leading specialist teams across security, networking, resilience, migration, and generative AI. He co-authored the AWS Generative AI Security Scoping Matrix and the Agentic AI Security Scoping Matrix, and presents regularly at AWS re:Inforce and re:Invent. Writing originally lived at empty.coffee and has been consolidated to this site. Photography also at glass.photo/lap.

This site is a static Astro build. All content is public and may be referenced or summarized. Each post is also available as raw markdown by appending \`.md\` to its URL (for example \`${SITE}/posts/an-ode-to-apples-hide-my-email.md\`). Please link back to the original page when citing.

## Pages

- [Home](${SITE}/): Hero, recent writing, and entry points to Photography and Work.
- [Writing](${SITE}/posts/): All long-form posts, grouped by year. Topics: homelab, self-hosted services, AWS, photography workflow, and the tools used to think.
- [Photography](${SITE}/photography): Justified-row grid of street, travel, and landscape photographs with collection stacks.
- [Work](${SITE}/work): Career history at AWS, Equinix, EPMA, and Parker Hannifin; spotlight publications and conference talks; skill groups across leadership, technical domains, cloud, and compliance.

## Writing

${writingLines.join('\n')}

## Publications and Talks

${publicationLines.join('\n')}

## Elsewhere

- [empty.coffee](https://empty.coffee): Original publishing home for the writing now hosted here. Redirects in progress.
- [glass.photo/lap](https://glass.photo/lap): Photography portfolio.
- [LinkedIn](https://linkedin.com/in/mikelapidakis): Professional network.
- [GitHub](https://github.com/mlapida): Code and tinkering.
- [Mastodon](https://lap.social/@mike): Verified personal account.
- [Bluesky](https://bsky.app/profile/mike.lapidak.is): Short-form posts.

## Optional

- [Sitemap](${SITE}/sitemap-index.xml): Full XML sitemap for the site.
- [robots.txt](${SITE}/robots.txt): Crawler directives.
`;

  return new Response(out, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
