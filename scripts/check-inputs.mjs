// List NEEDS INPUT markers in src/ and public/ (SPEC §4.11, Stage 1 task 10).
// Usage: npm run check:inputs [-- --strict]   (--strict exits 1 when any marker remains)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIRS = ['src', 'public'];
const TEXT = new Set(['.astro', '.ts', '.mts', '.js', '.mjs', '.md', '.mdx', '.yaml', '.yml', '.json', '.css', '.html', '.txt', '.xml', '.svg']);
const MARKER = 'NEEDS INPUT';
const strict = process.argv.includes('--strict');

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const hits = [];
for (const file of DIRS.flatMap((d) => walk(join(ROOT, d)))) {
  if (!TEXT.has(extname(file).toLowerCase())) continue;
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (line.includes(MARKER)) hits.push(`${relative(ROOT, file).split('\\').join('/')}:${i + 1}: ${line.trim()}`);
    });
}

for (const h of hits) console.log(h);
console.log(`${hits.length} ${MARKER} marker(s)${strict ? ' (strict)' : ''}`);
if (strict && hits.length) process.exit(1);
