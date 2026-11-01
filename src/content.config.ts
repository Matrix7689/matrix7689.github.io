// Content collections (SPEC Stage 3 task 1, Appendix A). The schemas validate every entry at build time.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const INCLUDE_FIXTURES = Boolean(process.env.INCLUDE_FIXTURES);
const stem = ({ entry }: { entry: string }) => entry.split('/').pop()!.replace(/\.(md|ya?ml)$/, '');
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const yearMonth = /^\d{4}-(0[1-9]|1[0-2])$/;

// Blog: src/content/blog/<yyyy>-<slug>.md, plus draft fixtures only for `npm run build:fixtures`.
const blog = defineCollection({
  loader: glob({
    base: '.',
    pattern: ['src/content/blog/*.md', ...(INCLUDE_FIXTURES ? ['tests/fixtures/blog/*.md'] : [])],
    generateId: stem,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(90),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      summary: z.string().min(40).max(160),
      tags: z.array(z.string().regex(kebab)).min(1).max(5),
      draft: z.boolean().default(false),
      canonicalUrl: z.url().optional(),
      mediumUrl: z.url().optional(),
      cover: image().optional(),
    }),
});

// Software projects: body is the detail-page prose.
const projects = defineCollection({
  loader: glob({ base: 'src/content/projects', pattern: '*.md', generateId: stem }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(140),
      year: z.number().int().optional(),
      stack: z.array(z.string()).min(1),
      context: z.string().optional(),
      links: z.object({ github: z.url().optional(), live: z.url().optional() }),
      cover: image().optional(),
      video: z.object({ mp4: z.string().startsWith('/media/'), webm: z.string().startsWith('/media/'), poster: image() }).optional(),
      featured: z.boolean().default(true),
      order: z.number().int(),
    }),
});

// Level-design maps: image() makes a missing gallery file fail the build.
const levels = defineCollection({
  loader: glob({ base: 'src/content/levels', pattern: '*.md', generateId: stem }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number().int(),
      game: z.string().optional(),
      year: z.number().int().optional(),
      description: z.string().optional(),
      workshopUrl: z.url().optional(),
      cover: image(),
      gallery: z.array(z.object({ src: image(), alt: z.string().optional() })).min(1),
    }),
});

// Roles: omit `end` for a current role.
const experience = defineCollection({
  loader: glob({ base: 'src/content/experience', pattern: '*.yaml', generateId: stem }),
  schema: z.object({
    company: z.string(),
    title: z.string(),
    team: z.string().optional(),
    start: z.string().regex(yearMonth),
    end: z.string().regex(yearMonth).optional(),
    location: z.string(),
    bullets: z.array(z.string()).min(1),
    showOnHome: z.boolean(),
    homeBulletLimit: z.number().int().positive().optional(),
    order: z.number().int(),
  }),
});

export const collections = { blog, projects, levels, experience };
