// Level-design import (Stage 7 revision): generates src/content/levels/<slug>.md for every map in
// docs/data/level-design-master.json (the source of truth; values are copied, never edited) and copies
// up to 6 screenshots per new map into src/assets/level-design/<slug>/ (max 1920 px wide, JPEG q82).
// A screenshot whose detail-preset outputs would exceed the detail cap (budgets.json, encoded with the
// site's own preset qualities and encoder options) is skipped for the next source image, so no budget
// has to be loosened. Files in a new map's folder that are no longer selected are removed.
//
//   npm run import:levels                      write content + images
//   npm run import:levels -- --dry-run         measure the images that would be added; write nothing
//   npm run import:levels -- --images <dir>    source images (default: ../gambanana assets/images)
//
// Featured maps come first: the 12 old-site maps (SPEC §4.7), which keep their existing image files and
// gallery order, then the extra maps in docs/data/level-design-extra.json (maps not in the master table,
// e.g. Jay's unreleased awp_taj_mahal). The rest follow by game (CS:GO first, then CS:Source), newest
// release first. Maps in EXCLUDE are skipped and their generated files removed. Titles are the raw map
// names. Descriptions are not in the data, so none are written (the page hides the field).
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PRESETS } from '../src/lib/image-presets.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const at = args.indexOf('--images');
const SRC = at >= 0 ? args[at + 1] : join(ROOT, '..', 'gambanana assets', 'images');
const CONTENT = join(ROOT, 'src/content/levels');
const ASSETS = join(ROOT, 'src/assets/level-design');
const MAX_IMAGES = 6;
const DETAIL_CAP = JSON.parse(readFileSync(join(ROOT, 'budgets.json'), 'utf8')).global.imageKB.detail * 1024;
// Encoder options from astro.config.mjs (image.service.config).
const ENCODE = { jpg: (q) => ({ quality: q, mozjpeg: true }), webp: (q) => ({ quality: q, effort: 6 }), avif: (q) => ({ quality: q, effort: 4 }) };
const GAME_ORDER = ['Counter-Strike: Global Offensive', 'Counter-Strike: Source'];

// SPEC §4.7 order of the 12 maps from the old site.
const ORIGINAL = [
  'awp-lego-asia', 'lcz-ctf-galaxy', 'awp-lego-x', 'awp-taj-heaven', 'awp-lego-fort', 'aim-devbeach',
  'aim-lego-ak', 'ar-industry', 'awp-lego-2016', 'awp-lego-2015', 'awp-lego-z', 'awp-tridust',
];

// Republished maps Jay didn't design (Jay, Stage 7 checkpoint). They stay in the master copy, unedited.
const EXCLUDE = ['awp-abyss', 'aim-lavadeathmatch', 'awp-leetgamerz'];

const master = JSON.parse(readFileSync(join(ROOT, 'docs/data/level-design-master.json'), 'utf8'));
const extra = JSON.parse(readFileSync(join(ROOT, 'docs/data/level-design-extra.json'), 'utf8'));
const num = (v) => (v === '' || v == null ? undefined : Number(v));
const slugOf = (m) => m.slug.replace(/^images\//, '').replace(/\/$/, '');
const maps = [...master, ...extra].filter((m) => !EXCLUDE.includes(slugOf(m)));
const FEATURED = [...ORIGINAL, ...extra.map(slugOf)];
const natural = (a, b) => a.localeCompare(b, 'en', { numeric: true });
const rejected = [];

// Would every detail output of this image (largest width, every format) fit the detail cap?
async function fitsDetail(file) {
  const { width } = await sharp(file).metadata();
  const w = Math.min(Math.max(...PRESETS.detail.widths), width);
  for (const { format, quality } of PRESETS.detail.formats) {
    const buf = await sharp(file).resize({ width: w })[format === 'jpg' ? 'jpeg' : format](ENCODE[format](quality)).toBuffer();
    if (buf.length > DETAIL_CAP) return false;
  }
  return true;
}

const rest = maps
  .filter((m) => !FEATURED.includes(slugOf(m)))
  .sort((a, b) => GAME_ORDER.indexOf(a.game) - GAME_ORDER.indexOf(b.game) || b.released.localeCompare(a.released));
const orderOf = new Map([...FEATURED.map((s, i) => [s, i + 1]), ...rest.map((m, i) => [slugOf(m), FEATURED.length + i + 1])]);

if (!DRY) mkdirSync(CONTENT, { recursive: true });
const tmp = DRY ? join(tmpdir(), `import-levels-${process.pid}`) : null;
let added = 0;
let addedBytes = 0;

for (const m of maps) {
  const slug = slugOf(m);
  const dir = join(ASSETS, slug);
  let files;
  if (ORIGINAL.includes(slug)) {
    // Existing files stay where they are: 0_main.jpg (cover), 1.jpg, 2.jpg, …
    files = readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort(natural);
  } else {
    // Cover first, then source order: GameBanana (NN.jpg) before Steam (steam-NN.jpg).
    const src = readdirSync(join(SRC, slug)).filter((f) => f.endsWith('.jpg'));
    const gb = src.filter((f) => !f.startsWith('steam-')).sort(natural);
    const st = src.filter((f) => f.startsWith('steam-')).sort(natural);
    const out = DRY ? join(tmp, slug) : dir;
    mkdirSync(out, { recursive: true });
    files = [];
    for (const f of [...gb, ...st]) {
      if (files.length === MAX_IMAGES) break;
      const target = join(out, f);
      if (DRY || !existsSync(target)) {
        await sharp(join(SRC, slug, f)).resize({ width: 1920, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(target);
      }
      if (!(await fitsDetail(target))) {
        rejected.push(`${slug}/${f}`);
        rmSync(target);
        continue;
      }
      files.push(f);
      added++;
      addedBytes += statSync(target).size;
    }
    if (!DRY) for (const f of readdirSync(dir)) if (!files.includes(f)) rmSync(join(dir, f));
  }

  const gbStats = m.gb_link ? { downloads: num(m.gb_dl), views: num(m.gb_views) } : undefined;
  const stStats = m.steam_link ? { subscribers: num(m.st_subs), visitors: num(m.st_vis), favorites: num(m.st_favs) } : undefined;
  const data = {
    title: m.name,
    order: orderOf.get(slug),
    featured: FEATURED.includes(slug) || undefined,
    unreleased: m.unreleased || undefined,
    game: m.game,
    released: m.released,
    downloads: num(m.dl),
    views: num(m.views),
    platforms: m.unreleased ? undefined : { gamebanana: m.gb_link || undefined, steam: m.steam_link || undefined },
    stats: { gamebanana: gbStats, steam: stStats },
  };
  const yaml = (o, pad = '') =>
    Object.entries(o)
      .filter(([, v]) => v !== undefined && !(typeof v === 'object' && Object.values(v).every((x) => x === undefined)))
      .map(([k, v]) => (typeof v === 'object' ? `${pad}${k}:\n${yaml(v, `${pad}  `)}` : `${pad}${k}: ${JSON.stringify(v)}`))
      .join('\n');
  const rel = (f) => `../../assets/level-design/${slug}/${f}`;
  const md = [
    '---',
    '# Generated by `npm run import:levels` from docs/data/level-design-{master,extra}.json. Edit the JSON source, not this file.',
    yaml(data),
    `cover: ${rel(files[0])}`,
    'gallery:',
    ...files.map((f) => `  - src: ${rel(f)}`),
    '---',
    '',
  ].join('\n');
  if (!DRY) writeFileSync(join(CONTENT, `${slug}.md`), md);
}

if (!DRY) {
  for (const slug of EXCLUDE) {
    rmSync(join(CONTENT, `${slug}.md`), { force: true });
    rmSync(join(ASSETS, slug), { recursive: true, force: true });
  }
}

const mb = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;
console.log(
  `${DRY ? 'dry run: would add' : 'added'} ${added} image(s), ${mb(addedBytes)}; ${maps.length} maps (${ORIGINAL.length} originals kept as-is, ${extra.length} extra, ${EXCLUDE.length} excluded)`,
);
if (rejected.length) console.log(`  skipped (a detail output would exceed ${DETAIL_CAP / 1024} KB): ${rejected.join(', ')}`);
if (DRY) console.log(`  measured copies in ${tmp}`);
