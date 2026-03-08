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
    featured: z.boolean().default(false),
  }),
});

export const collections = { photos };
