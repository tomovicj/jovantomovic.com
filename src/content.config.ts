import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_IDS, STATUSES } from './lib/timeline';

// YAML reads `2026-10-11` as a date and `2019` as a number, so either way works without quotes.
const partialDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'number' ? String(v) : v),
  z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'use YYYY, YYYY-MM or YYYY-MM-DD'),
);

const profile = defineCollection({
  loader: glob({ base: './src/content', pattern: 'profile.yaml' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    bio: z.string(),
    email: z.email(),
    cv: z.string(),
    now: z.array(z.string()).default([]),
    banner: z
      .object({
        label: z.string().default('new'),
        text: z.string(),
        href: z.string(),
      })
      .optional(),
  }),
});

const links = defineCollection({
  loader: glob({ base: './src/content', pattern: 'links.yaml' }),
  schema: z.object({
    links: z.array(
      z.object({
        label: z.string(),
        url: z.string(),
        href: z.string(),
        contact: z.boolean().default(false),
      }),
    ),
  }),
});

const timeline = defineCollection({
  loader: glob({ base: './src/content/timeline', pattern: '**/*.md' }),
  schema: z.object({
    date: partialDate,
    end: partialDate.optional(),
    label: z.string().optional(),
    category: z.enum(CATEGORY_IDS),
    title: z.string(),
    tags: z.array(z.string()).default([]),
    status: z.enum(STATUSES).optional(),
    link: z.string().optional(),
  }),
});

const blog = defineCollection({
  // Each post is a folder (blog/<slug>/index.md or .mdx) so its images can sit next to it.
  // A single blog/<slug>.md file works too.
  loader: glob({
    base: './src/content/blog',
    pattern: ['*/index.{md,mdx}', '*.{md,mdx}'],
    generateId: ({ entry }) => entry.replace(/(\/index)?\.mdx?$/, ''),
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        updated: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
        cover: image().optional(),
        coverAlt: z.string().optional(),
      })
      .refine((d) => !d.cover || d.coverAlt, { message: 'a cover image needs coverAlt text', path: ['coverAlt'] }),
});

export const collections = { profile, links, timeline, blog };
