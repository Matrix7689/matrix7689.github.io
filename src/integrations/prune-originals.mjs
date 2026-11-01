// Astro integration: delete raw originals that no built file references (SPEC §6.1 "0 raw originals").
// Astro emits every image a collection imports, but deletes an original only after transforming it;
// an image no page renders (a gallery not built yet, a draft post's figure) would ship raw.
// A raw copy that something does reference is left alone, so `npm run check:originals` still fails on it.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');

export default function pruneOriginals() {
  return {
    name: 'prune-originals',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const assets = fileURLToPath(new URL('../assets/', import.meta.url));
        const originals = new Set(walk(assets).map(sha));
        const files = walk(dist);
        const text = files
          .filter((f) => /\.(html|css|js|xml|json)$/.test(f))
          .map((f) => readFileSync(f, 'utf8'))
          .join('\n');
        let count = 0;
        let bytes = 0;
        for (const f of files) {
          if (/\.(html|css|js|xml|json|txt|woff2)$/.test(f)) continue;
          if (!originals.has(sha(f)) || text.includes(basename(f))) continue;
          bytes += statSync(f).size;
          rmSync(f);
          count += 1;
        }
        if (count) logger.info(`removed ${count} unreferenced raw original(s), ${(bytes / 1024 / 1024).toFixed(1)} MB`);
      },
    },
  };
}
