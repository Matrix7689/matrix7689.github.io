// Link check on the built site (SPEC Stage 1 task 10).
//   npm run check:links            internal links only, blocking
//   npm run check:links:external   external links, report only (always exits 0)
// Every HTML page in dist/ is a crawl seed, so unlinked pages (e.g. /_styleguide/) are checked too.
import { readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LinkChecker } from 'linkinator';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const EXTERNAL = process.argv.includes('--external');

// Routes linked from the shell before their stage builds them. Remove each entry when its stage
// lands; Stage 11 requires this list to be empty.
const PENDING_ROUTES = [
  '/projects/level-design/', // Stage 7
  '/about/', // Stage 8
];

if (!existsSync(DIST)) {
  console.error('dist/ not found: run a build first');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const pages = walk(DIST)
  .filter((f) => f.endsWith('.html'))
  .map((f) => relative(DIST, f).split('\\').join('/'));

// linkinator serves dist/ on a loopback address (127.0.0.1 in v8, not "localhost").
const LOCAL = String.raw`^http://(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?`;
const isLocal = (url) => new RegExp(`${LOCAL}/`).test(url);
const pendingRe = new RegExp(`${LOCAL}(?:${PENDING_ROUTES.map((r) => r.replace(/[.]/g, '\\.')).join('|')})`);

const pendingSeen = new Set();
const checker = new LinkChecker();
const result = await checker.check({
  path: pages, // relative to serverRoot
  serverRoot: DIST,
  recurse: true,
  checkCss: true,
  checkFragments: !EXTERNAL,
  timeout: 15_000,
  concurrency: EXTERNAL ? 10 : 100,
  linksToSkip: async (url) => {
    if (/^mailto:/i.test(url)) return true;
    // External mode still crawls the local pages (they are the seeds); only outbound results are reported.
    if (EXTERNAL) return pendingRe.test(url);
    if (pendingRe.test(url)) {
      pendingSeen.add(new URL(url).pathname);
      return true;
    }
    return !isLocal(url);
  },
});

// Outbound = absolute http(s) to another host. The site's own absolute URLs (canonicals, the terminal's
// curl line) point at the deployed copy, so they are not third-party links.
const SITE_ORIGIN = new URL(process.env.SITE_URL ?? 'https://matrix7689.github.io').origin;
const isOutbound = (url) => /^https?:\/\//i.test(url) && !isLocal(url) && new URL(url).origin !== SITE_ORIGIN;
const links = EXTERNAL ? result.links.filter((l) => isOutbound(l.url)) : result.links;
const broken = links.filter((l) => l.state === 'BROKEN');
const checked = links.filter((l) => l.state === 'OK');
const skipped = links.filter((l) => l.state === 'SKIPPED');

console.log(`${EXTERNAL ? 'external' : 'internal'} link check: ${pages.length} seed pages, ${checked.length} ok, ${broken.length} broken, ${skipped.length} skipped`);
if (pendingSeen.size) console.log(`  pending routes (built in later stages, skipped): ${[...pendingSeen].sort().join(', ')}`);
for (const l of broken) console.log(`  BROKEN ${l.status ?? '—'} ${l.url}  (from ${l.parent ?? 'seed'})`);
if (EXTERNAL) for (const l of checked) console.log(`  ok     ${l.status} ${l.url}`);

if (broken.length && !EXTERNAL) process.exit(1);
