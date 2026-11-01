// Raw-original guard (SPEC Stage 2 task 4). Run after a build: npm run check:originals
// Fails if any dist/ file is byte-identical (SHA-256) to a file under src/assets/,
// if any dist/ image is over the 450 KB cap, or if any GIF ships.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const ASSETS = join(ROOT, 'src', 'assets');
const IMAGE_CAP = 450 * 1024;
const IMAGE_EXT = new Set(['.avif', '.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg']);

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
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
const rel = (p) => relative(ROOT, p).split('\\').join('/');

const originals = new Map(walk(ASSETS).map((f) => [sha(f), f]));
const distFiles = walk(DIST);
const failures = [];
let images = 0;

for (const f of distFiles) {
  const original = originals.get(sha(f));
  if (original) failures.push(`${rel(f)} is a raw copy of ${rel(original)}`);
  const ext = extname(f).toLowerCase();
  if (ext === '.gif') failures.push(`${rel(f)}: GIFs must not ship (SPEC D10)`);
  if (IMAGE_EXT.has(ext)) {
    images += 1;
    const size = statSync(f).size;
    if (size > IMAGE_CAP) failures.push(`${rel(f)}: ${(size / 1024).toFixed(1)} KB > 450 KB image cap`);
  }
}

console.log(`originals: ${originals.size} source files hashed, ${distFiles.length} dist files checked (${images} images)`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log('0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB');
