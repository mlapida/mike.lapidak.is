// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import rehypePostImages from './src/lib/rehype-post-images.mjs';

export default defineConfig({
  site: 'https://mike.lapidak.is',
  output: 'static',
  image: {
    domains: ['pub-1925a6f6efeb4b71bc918d8041c946c6.r2.dev'],
  },
  markdown: {
    rehypePlugins: [rehypePostImages],
  },
  integrations: [
    sitemap({
      // Exclude .md companion routes and llms.txt — they duplicate or supplement
      // content already covered by canonical HTML routes.
      filter: page =>
        !page.endsWith('.md') &&
        !page.endsWith('/llms.txt') &&
        !page.endsWith('/rss.xml'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['.ts.net'],
    },
  },
});
