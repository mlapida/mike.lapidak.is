// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mike.lapidak.is',
  output: 'static',
  image: {
    domains: ['assets.lapidak.is'],
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
