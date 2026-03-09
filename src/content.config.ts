import { defineCollection, z } from 'astro:content';

const photos = defineCollection({
  type: 'content',
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

export const collections = { photos };
