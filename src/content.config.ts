import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const photos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photos' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    location: z.string(),
    gps: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    camera: z.string().optional(),
    lens: z.string().optional(),
    aperture: z.string().optional(),
    shutter: z.string().optional(),
    iso: z.number().optional(),
    image: z.string(),
    imgWidth: z.number().optional(),
    imgHeight: z.number().optional(),
    featured: z.boolean().default(false),
    orientation: z.enum(['landscape', 'portrait', 'square']).default('landscape'),
    collection: z.string().optional(),
    immichId: z.string().optional(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    type: z.literal('post'),
    status: z.enum(['idea', 'draft', 'published']),
    title: z.string(),
    description: z.string().optional(),
    publish_date: z.coerce.date().optional(),
    modified_date: z.coerce.date().optional(),
    slug: z.string(),
    source_url: z.string().url().optional(),
    author: z.string().default('Mike Lapidakis'),
    word_count: z.number().int().nonnegative().optional(),
    feature_image: z.string().url().optional(),
    ghost_id: z.string().optional(),
    updated_at: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { photos, posts };
