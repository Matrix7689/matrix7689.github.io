// @ts-check
import { defineConfig } from 'astro/config';

// The one place the site URL is set (SPEC D1). A custom domain only needs SITE_URL.
const SITE_URL = process.env.SITE_URL ?? 'https://matrix7689.github.io';

/** Fixture-only pages from tests/fixtures/pages, added only for `npm run build:fixtures`. */
function fixtureRoutes() {
  return {
    name: 'fixture-routes',
    hooks: {
      /** @param {{ injectRoute: (route: { pattern: string; entrypoint: string }) => void }} options */
      'astro:config:setup': ({ injectRoute }) => {
        if (!process.env.INCLUDE_FIXTURES) return;
        injectRoute({ pattern: '/_styleguide/images', entrypoint: './tests/fixtures/pages/image-audit.astro' });
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
  // Encoder options for every getImage/<Img> output; per-preset qualities are in src/lib/images.ts.
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { jpeg: { mozjpeg: true }, webp: { effort: 6 }, avif: { effort: 4 } },
    },
  },
  integrations: [fixtureRoutes()],
  devToolbar: { enabled: false },
});
