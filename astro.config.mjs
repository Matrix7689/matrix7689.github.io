// @ts-check
import { defineConfig } from 'astro/config';

// The one place the site URL is set (SPEC D1). A custom domain only needs SITE_URL.
const SITE_URL = process.env.SITE_URL ?? 'https://matrix7689.github.io';

export default defineConfig({
  site: SITE_URL,
  base: '/',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
});
