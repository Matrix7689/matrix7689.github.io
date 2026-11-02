// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { readFileSync } from 'node:fs';
import { readingTimePlugin } from './src/lib/remark-reading-time.ts';
import { codeBlocksPlugin, imagesPlugin } from './src/lib/markdown-plugins.ts';
import pruneOriginals from './src/integrations/prune-originals.mjs';

// The one place the site URL is set (SPEC D1). A custom domain only needs SITE_URL.
const SITE_URL = process.env.SITE_URL ?? 'https://matrix7689.github.io';

// SPEC D15: one token-class Shiki theme; colours come from CSS variables (see markdown-plugins.ts).
const monoTheme = JSON.parse(readFileSync(new URL('./src/styles/shiki/mono.json', import.meta.url), 'utf8'));

/** Fixture-only pages from tests/fixtures/pages, added only for `npm run build:fixtures`. */
function fixtureRoutes() {
  return {
    name: 'fixture-routes',
    hooks: {
      /** @param {{ injectRoute: (route: { pattern: string; entrypoint: string }) => void }} options */
      'astro:config:setup': ({ injectRoute }) => {
        if (!process.env.INCLUDE_FIXTURES) return;
        injectRoute({ pattern: '/_styleguide/images', entrypoint: './tests/fixtures/pages/image-audit.astro' });
        injectRoute({ pattern: '/_styleguide/content', entrypoint: './tests/fixtures/pages/content-audit.astro' });
      },
    },
  };
}

export default defineConfig({
  site: SITE_URL,
  base: '/',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  // Encoder options for every getImage/<Img> output; per-preset qualities are in src/lib/image-presets.ts.
  image: {
    // Only for layout-based images (blog Markdown, markdown-plugins.ts); <Img> passes explicit widths.
    breakpoints: [800, 1280],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { jpeg: { mozjpeg: true }, webp: { effort: 6 }, avif: { effort: 4 } },
    },
  },
  markdown: {
    processor: satteri({ mdastPlugins: [readingTimePlugin], hastPlugins: [codeBlocksPlugin, imagesPlugin] }),
    shikiConfig: { theme: monoTheme },
  },
  integrations: [fixtureRoutes(), pruneOriginals()],
  devToolbar: { enabled: false },
});
