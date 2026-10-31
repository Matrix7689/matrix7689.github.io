// Repo and dist size report (SPEC Stage 0, task 8).
// Usage: npm run repo:size [-- --json]
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const EXCLUDE = new Set(['.git', 'node_modules', 'dist']);

function dirSize(dir, exclude = new Set()) {
  let bytes = 0;
  let files = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (exclude.has(entry.name)) continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = dirSize(p);
      bytes += sub.bytes;
      files += sub.files;
    } else if (entry.isFile()) {
      bytes += statSync(p).size;
      files += 1;
    }
  }
  return { bytes, files };
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

const countObjects = execFileSync('git', ['count-objects', '-v'], { cwd: ROOT, encoding: 'utf8' });
const stats = Object.fromEntries(
  countObjects.trim().split(/\r?\n/).map((line) => {
    const [k, v] = line.split(':').map((s) => s.trim());
    return [k, Number(v)];
  }),
);
// git reports size-pack and size in KiB.
const packBytes = (stats['size-pack'] ?? 0) * 1024;
const looseBytes = (stats.size ?? 0) * 1024;

const tree = dirSize(ROOT, EXCLUDE);
const distDir = join(ROOT, 'dist');
const dist = existsSync(distDir) ? dirSize(distDir) : null;

const report = {
  sizePackBytes: packBytes,
  inPack: stats['in-pack'] ?? 0,
  looseBytes,
  workingTreeBytes: tree.bytes,
  workingTreeFiles: tree.files,
  distBytes: dist?.bytes ?? null,
  distFiles: dist?.files ?? null,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('repo size');
  console.log(`  .git size-pack      ${fmt(packBytes)} (${report.inPack} objects in pack)`);
  console.log(`  .git loose objects  ${fmt(looseBytes)}`);
  console.log(`  working tree        ${fmt(tree.bytes)} in ${tree.files} files (excl. .git, node_modules, dist)`);
  console.log(`  dist/               ${dist ? `${fmt(dist.bytes)} in ${dist.files} files` : 'not built'}`);
}
