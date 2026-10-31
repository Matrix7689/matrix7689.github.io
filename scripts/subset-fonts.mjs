// Subset Geist Mono 400/700 to woff2 (SPEC D14, Stage 1 task 6).
// Usage: npm run fonts:subset
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'public/fonts');
const MAX_BYTES = 30 * 1024;
// Source: the `geist` npm package (pinned in package.json), SIL OFL 1.1.
const GEIST_DIR = join(ROOT, 'node_modules/geist/dist/fonts/geist-mono');

const ranges = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xbf], // Latin-1 punctuation and symbols (incl. · U+00B7)
  [0x2013, 0x2014], // – —
  [0x2018, 0x201f], // curly quotes (imported Medium posts)
  [0x2022, 0x2022], // •
  [0x2026, 0x2026], // …
  [0x2190, 0x2193], // ← ↑ → ↓
  [0x2212, 0x2212], // − (minus in metrics such as −15 ms)
  [0x2500, 0x257f], // box drawing
  [0x2580, 0x259f], // block elements
];
const text = ranges.flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i))).join('');

const weights = { 400: 'GeistMono-Regular.woff2', 700: 'GeistMono-Bold.woff2' };
mkdirSync(OUT, { recursive: true });
let total = 0;
let failed = false;
for (const [weight, file] of Object.entries(weights)) {
  const source = readFileSync(join(GEIST_DIR, file));
  const subset = await subsetFont(source, text, { targetFormat: 'woff2' });
  const out = join(OUT, `geist-mono-${weight}.woff2`);
  writeFileSync(out, subset);
  total += subset.length;
  const over = subset.length > MAX_BYTES;
  failed ||= over;
  console.log(`${over ? 'FAIL' : 'ok  '} geist-mono-${weight}.woff2  ${(subset.length / 1024).toFixed(1)} KB (from ${(source.length / 1024).toFixed(1)} KB)`);
}
console.log(`total ${(total / 1024).toFixed(1)} KB, ${text.length} code points`);
if (failed) process.exit(1);
