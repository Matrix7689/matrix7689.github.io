// Size budgets, JS/CSS/font caps, file-size cap and third-party guard (SPEC §6.1, Stage 1 tasks 10–11),
// plus per-preset image caps and <img> attribute rules (Stage 2 task 5).
// Usage: npm run check:budgets   (after a build)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, posix, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const budgets = JSON.parse(readFileSync(join(ROOT, 'budgets.json'), 'utf8'));
const { default: astroConfig } = await import('../astro.config.mjs');
const SITE_ORIGIN = new URL(astroConfig.site).origin;
const KB = 1024;
const G = budgets.global;

if (!existsSync(DIST)) {
  console.error('dist/ not found: run a build first');
  process.exit(1);
}

const failures = [];
const fail = (msg) => failures.push(msg);
const gz = (buf) => gzipSync(buf, { level: budgets.gzipLevel }).length;
const kb = (n) => `${(n / KB).toFixed(1)} KB`;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const files = walk(DIST);
const rel = (p) => relative(DIST, p).split('\\').join('/');

// ---- attribute helpers (Astro's output is regular enough for this) ----
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => m[0]);
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}(?:=(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?`, 'i'));
const attrValue = (tag, name) => {
  const m = attr(tag, name);
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null;
};

function isExternal(url) {
  if (!url) return false;
  if (url.startsWith('//')) url = `https:${url}`;
  if (!/^https?:/i.test(url)) return false;
  return new URL(url).origin !== SITE_ORIGIN;
}

/** Maps a same-site URL from page `pagePath` to a file in dist, or null. */
function resolveLocal(url, pagePath) {
  if (!url || /^(data:|mailto:|#)/i.test(url) || isExternal(url)) return null;
  let path = /^https?:/i.test(url) ? new URL(url).pathname : url;
  path = path.split(/[?#]/)[0];
  const abs = path.startsWith('/') ? path : posix.join(posix.dirname(`/${pagePath}`), path);
  const file = join(DIST, decodeURIComponent(abs));
  return existsSync(file) && statSync(file).isFile() ? file : null;
}

function routeFor(file) {
  const r = rel(file);
  if (r === '404.html') return '/404';
  if (r === 'index.html') return '/';
  return `/${r.replace(/index\.html$/, '')}`;
}

function budgetFor(route) {
  return budgets.pages.find((b) => {
    const re = new RegExp(`^${b.route.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]+')}$`);
    return re.test(route);
  });
}

// ---- third-party guard (HTML and CSS) ----
const RESOURCE_RELS = /\b(stylesheet|preload|modulepreload|prefetch|preconnect|dns-prefetch|icon|apple-touch-icon|manifest)\b/i;
function thirdParty(html, where) {
  for (const m of html.matchAll(/\s(src|poster|data)=["']([^"']+)["']/gi)) {
    if (isExternal(m[2])) fail(`${where}: third-party ${m[1]}="${m[2]}"`);
  }
  for (const m of html.matchAll(/\ssrcset=["']([^"']+)["']/gi)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (isExternal(u)) fail(`${where}: third-party srcset "${u}"`);
    }
  }
  for (const t of tags(html, 'link')) {
    const relValue = attrValue(t, 'rel') ?? '';
    if (RESOURCE_RELS.test(relValue) && isExternal(attrValue(t, 'href'))) fail(`${where}: third-party <link rel="${relValue}">`);
  }
  cssThirdParty(html, where);
}
function cssThirdParty(css, where) {
  for (const m of css.matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)/gi)) {
    if (isExternal(m[1])) fail(`${where}: third-party @import ${m[1]}`);
  }
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    if (isExternal(m[1])) fail(`${where}: third-party url(${m[1]})`);
  }
}

// ---- global: file sizes and fonts ----
for (const f of files) {
  const size = statSync(f).size;
  if (size > G.maxFileKB * KB && !G.maxFileAllowlist.includes(basename(f))) fail(`${rel(f)}: ${kb(size)} > ${G.maxFileKB} KB file cap`);
  if (f.endsWith('.css')) cssThirdParty(readFileSync(f, 'utf8'), rel(f));
}
const fonts = files.filter((f) => f.endsWith('.woff2'));
const fontBytes = fonts.reduce((s, f) => s + statSync(f).size, 0);
if (fonts.length > G.fontFiles) fail(`fonts: ${fonts.length} files > ${G.fontFiles}`);
if (fontBytes > G.fontsKB * KB) fail(`fonts: ${kb(fontBytes)} > ${G.fontsKB} KB`);
for (const f of fonts) if (statSync(f).size > G.fontFileKB * KB) fail(`${rel(f)}: ${kb(statSync(f).size)} > ${G.fontFileKB} KB`);

// ---- image outputs by preset (Img data-preset, video poster, "view original" links) ----
const srcsetUrls = (srcset) => (srcset ? srcset.split(',').map((p) => p.trim().split(/\s+/)[0]) : []);
const byPreset = new Map(); // file -> preset
function classify(file, preset, route) {
  if (!file) return;
  if (!preset) return;
  if (!(preset in G.imageKB)) return fail(`${route}: unknown data-preset "${preset}"`);
  const prev = byPreset.get(file);
  if (prev && prev !== preset) fail(`${rel(file)}: used as both ${prev} and ${preset}`);
  byPreset.set(file, preset);
}

// ---- per page ----
const rows = [];
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const page = rel(file);
  const route = routeFor(file);
  const html = readFileSync(file, 'utf8');
  thirdParty(html, page);

  const budget = budgetFor(route);
  if (!budget) {
    fail(`${route}: no budget in budgets.json`);
    continue;
  }

  const htmlGz = gz(Buffer.from(html));
  let cssGz = 0;
  let cssExternalGz = 0;
  let jsGz = 0;
  let jsExternalGz = 0;
  let eager = 0;
  let lazy = 0;
  let fontPreloads = 0;
  const pageFonts = new Set();

  for (const t of tags(html, 'link')) {
    const relValue = attrValue(t, 'rel') ?? '';
    const local = resolveLocal(attrValue(t, 'href'), page);
    if (/\bstylesheet\b/i.test(relValue)) {
      if (!local) {
        fail(`${route}: stylesheet not found in dist: ${attrValue(t, 'href')}`);
        continue;
      }
      const css = readFileSync(local);
      const n = gz(css);
      cssGz += n;
      cssExternalGz += n;
      for (const m of css.toString().matchAll(/url\(\s*["']?([^"')]+\.woff2)/g)) {
        const font = resolveLocal(m[1], page);
        if (font) pageFonts.add(font);
      }
    } else if (/\bpreload\b/i.test(relValue) && attrValue(t, 'as') === 'font') {
      fontPreloads += 1;
      if (local) pageFonts.add(local);
    }
  }
  // Inline <style> and <script> are already inside the HTML bytes; they count toward the CSS/JS caps.
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    cssGz += gz(Buffer.from(m[1]));
    for (const f of m[1].matchAll(/url\(\s*["']?([^"')]+\.woff2)/g)) {
      const font = resolveLocal(f[1], page);
      if (font) pageFonts.add(font);
    }
  }
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const type = attrValue(m[0], 'type');
    if (type && !/javascript|module/i.test(type)) continue; // e.g. application/ld+json
    const src = attrValue(m[0], 'src');
    if (src) {
      const local = resolveLocal(src, page);
      if (!local) {
        fail(`${route}: script not found in dist: ${src}`);
        continue;
      }
      const n = gz(readFileSync(local));
      jsGz += n;
      jsExternalGz += n;
    } else if (m[2].trim()) {
      jsGz += gz(Buffer.from(m[2]));
    }
  }
  // Images: each one counts once per page, at its heaviest candidate in the first format a modern
  // browser picks (the first <source>, else the <img>): a high-DPR phone can fetch the largest width.
  const counted = new Set();
  const countImage = (file, isLazy) => {
    if (!file || counted.has(file)) return;
    counted.add(file);
    if (isLazy) lazy += statSync(file).size;
    else eager += statSync(file).size;
  };
  const heaviest = (urls) =>
    urls
      .map((u) => resolveLocal(u, page))
      .filter(Boolean)
      .sort((a, b) => statSync(b).size - statSync(a).size)[0];

  for (const m of html.matchAll(/<picture\b[^>]*>([\s\S]*?)<\/picture>/gi)) {
    const preset = attrValue(m[0], 'data-preset');
    const sources = tags(m[1], 'source');
    const img = tags(m[1], 'img')[0] ?? '';
    for (const t of [...sources, img]) {
      for (const u of [attrValue(t, 'src'), ...srcsetUrls(attrValue(t, 'srcset'))]) classify(resolveLocal(u, page), preset, route);
    }
    const first = sources[0] ?? img;
    countImage(heaviest([attrValue(first, 'src'), ...srcsetUrls(attrValue(first, 'srcset'))]), attrValue(img, 'loading') === 'lazy');
  }
  const outsidePictures = html.replace(/<picture\b[\s\S]*?<\/picture>/gi, '');
  for (const t of tags(outsidePictures, 'img')) {
    // Blog Markdown images are single-format <img srcset> with data-preset (markdown-plugins.ts).
    for (const u of [attrValue(t, 'src'), ...srcsetUrls(attrValue(t, 'srcset'))]) classify(resolveLocal(u, page), attrValue(t, 'data-preset'), route);
    countImage(heaviest([attrValue(t, 'src'), ...srcsetUrls(attrValue(t, 'srcset'))]), attrValue(t, 'loading') === 'lazy');
  }
  for (const t of tags(html, 'img')) {
    const missing = ['width', 'height'].filter((a) => !attrValue(t, a));
    if (attrValue(t, 'decoding') !== 'async') missing.push('decoding="async"');
    if (attrValue(t, 'loading') !== 'lazy' && attrValue(t, 'data-eager') === null) missing.push('loading="lazy" (or data-eager)');
    if (missing.length) fail(`${route}: <img src="${attrValue(t, 'src')}"> lacks ${missing.join(', ')}`);
  }
  // A poster downloads with the page even though the video is preload="none".
  for (const t of tags(html, 'video')) {
    const poster = resolveLocal(attrValue(t, 'poster'), page);
    classify(poster, attrValue(t, 'data-preset'), route);
    countImage(poster, false);
  }
  for (const t of tags(html, 'a')) {
    const preset = attrValue(t, 'data-preset');
    if (preset) classify(resolveLocal(attrValue(t, 'href'), page), preset, route);
  }

  const initial = htmlGz + cssExternalGz + jsExternalGz + eager;
  const total = initial + lazy;
  const fontsOnPage = [...pageFonts].reduce((s, f) => s + statSync(f).size, 0);
  const jsCap = budget.jsKB ?? G.jsKB;

  const initialOk = budget.initialStrict ? initial < budget.initialKB * KB : initial <= budget.initialKB * KB;
  if (!initialOk) fail(`${route}: initial ${kb(initial)} ${budget.initialStrict ? '>=' : '>'} ${budget.initialKB} KB`);
  if (total > budget.totalKB * KB) fail(`${route}: total ${kb(total)} > ${budget.totalKB} KB`);
  if (cssGz > G.cssKB * KB) fail(`${route}: CSS ${kb(cssGz)} > ${G.cssKB} KB`);
  if (jsGz > jsCap * KB) fail(`${route}: JS ${kb(jsGz)} > ${jsCap} KB`);
  if (fontPreloads !== G.fontPreloads) fail(`${route}: ${fontPreloads} font preloads, expected ${G.fontPreloads}`);

  rows.push({ route, html: htmlGz, css: cssGz, js: jsGz, eager, lazy, initial, total, fonts: fontsOnPage, budget });
}

// ---- report ----
const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);
console.log(`budgets (gzip level ${budgets.gzipLevel}; images raw; site origin ${SITE_ORIGIN})`);
console.log(`${pad('route', 32)}${padL('html', 9)}${padL('css', 9)}${padL('js', 9)}${padL('initial', 11)}${padL('budget', 9)}${padL('total', 11)}${padL('budget', 9)}${padL('fonts', 10)}`);
for (const r of rows.sort((a, b) => a.route.localeCompare(b.route))) {
  const cmp = r.budget.initialStrict ? '<' : '≤';
  console.log(
    `${pad(r.route, 32)}${padL(kb(r.html), 9)}${padL(kb(r.css), 9)}${padL(kb(r.js), 9)}${padL(kb(r.initial), 11)}${padL(`${cmp}${r.budget.initialKB}`, 9)}${padL(kb(r.total), 11)}${padL(`≤${r.budget.totalKB}`, 9)}${padL(kb(r.fonts), 10)}`,
  );
}
console.log(`fonts: ${fonts.length} files, ${kb(fontBytes)} (cap ${G.fontsKB} KB, ${G.fontFileKB} KB each); largest file cap ${G.maxFileKB} KB`);
console.log('(css/js columns include inline <style>/<script>; initial counts those bytes once, inside html)');

console.log(`\nimage outputs by preset (raw bytes; caps ${Object.entries(G.imageKB).map(([p, n]) => `${p} ${n} KB`).join(', ')})`);
for (const preset of Object.keys(G.imageKB)) {
  const list = [...byPreset].filter(([, p]) => p === preset).map(([f]) => ({ f, size: statSync(f).size }));
  list.sort((a, b) => b.size - a.size);
  const byFormat = {};
  for (const { f, size } of list) {
    const ext = f.split('.').pop();
    byFormat[ext] = Math.max(byFormat[ext] ?? 0, size);
    if (size > G.imageKB[preset] * KB) fail(`${rel(f)}: ${kb(size)} > ${preset} cap ${G.imageKB[preset]} KB`);
  }
  const maxes = Object.entries(byFormat).map(([ext, n]) => `${ext} max ${kb(n)}`).join(', ');
  console.log(`  ${pad(preset, 8)}${padL(list.length, 4)} files${list.length ? `  ${maxes}` : ''}`);
}

if (failures.length) {
  console.error(`\n${failures.length} budget failure(s):`);
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log('\nall budgets pass, 0 third-party references');
