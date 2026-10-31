// Old-site inventory (SPEC Stage 0, task 7).
// Reads the 2020 site straight from git (`legacy-2024`), so it keeps working after the old
// files are removed or moved on `revamp`, and writes:
//   docs/content-manifest.json  machine-readable
//   docs/inventory.md           human-readable, with keep / transform / drop and link status
// Usage: npm run inventory [-- --offline]   (--offline skips the external link check)
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LEGACY_REF = 'legacy-2024';
const PAGES = ['index.html', 'works-2.html'];
const LINK_TIMEOUT_MS = 10_000;
const OFFLINE = process.argv.includes('--offline');

// SPEC §4.7: old folder → slug, title, order.
const MAPS = {
  awplegoasia: { slug: 'awp-lego-asia', title: 'AWP Lego Asia', order: 1, expectedImages: 7 },
  lczctfgalaxy: { slug: 'lcz-ctf-galaxy', title: 'LCZ CTF Galaxy', order: 2, expectedImages: 6 },
  awplegox: { slug: 'awp-lego-x', title: 'AWP Lego X', order: 3, expectedImages: 5 },
  awptajheaven: { slug: 'awp-taj-heaven', title: 'AWP Taj Heaven', order: 4, expectedImages: 5 },
  awplegofort: { slug: 'awp-lego-fort', title: 'AWP Lego Fort', order: 5, expectedImages: 5 },
  aimdevbeach: { slug: 'aim-devbeach', title: 'AIM Devbeach', order: 6, expectedImages: 4 },
  aimlegoak: { slug: 'aim-lego-ak', title: 'AIM Lego AK', order: 7, expectedImages: 3 },
  arindustry: { slug: 'ar-industry', title: 'AR Industry', order: 8, expectedImages: 6 },
  awplego2016: { slug: 'awp-lego-2016', title: 'AWP Lego 2016', order: 9, expectedImages: 5 },
  awplego2015: { slug: 'awp-lego-2015', title: 'AWP Lego 2015', order: 10, expectedImages: 6 },
  awplegoz: { slug: 'awp-lego-z', title: 'AWP Lego Z', order: 11, expectedImages: 5 },
  awptridust: { slug: 'awp-tridust', title: 'AWP Tridust', order: 12, expectedImages: 5 },
};

// SPEC §4.5 and Stage 2 task 1: old thumbnail → slug, title, new source path.
const PROJECTS = {
  'images/works/react_news.png': { slug: 'newsapp-react', title: 'NewsApp: React website', newPath: 'src/assets/projects/newsapp-react/cover.png' },
  'images/works/android_news.png': { slug: 'newsapp-android', title: 'NewsApp: Android app', newPath: 'src/assets/projects/newsapp-android/cover.png' },
  'images/works/halma.gif': { slug: 'halma-ai', title: 'Halma game-playing agent', newPath: 'src/assets/projects/halma-ai/demo.gif' },
  'images/works/bfs.gif': { slug: 'mars-rover-search', title: 'Mars rover path search (BFS / UCS / A*)', newPath: 'src/assets/projects/mars-rover-search/demo.gif' },
};

// SPEC §4.10, D11, Q4 and Stage 1 task 1: disposition of every old file.
function fileDisposition(path) {
  if (path === 'Jay_Parekh_Resume.pdf') return ['keep', 'same URL; `git mv` to public/ in Stage 1 (D11)'];
  if (path === 'index.html') return ['transform', 'content reused in new pages (§4); file removed in Stage 1'];
  if (path === 'works-2.html') return ['transform', 'becomes redirect stub → /projects/level-design/ (D11, Stage 8)'];
  if (path === 'Matrix_Completed_Games.txt') return ['drop', '§1.2 non-goal, §4.10'];
  const m = path.match(/^images\/works\/([^/]+)\/[^/]+\.jpe?g$/i);
  if (m && MAPS[m[1]]) return ['transform', `→ src/assets/level-design/${MAPS[m[1]].slug}/ (Stage 2, processed)`];
  if (PROJECTS[path]) {
    const p = PROJECTS[path];
    return ['transform', path.endsWith('.gif') ? `→ ${p.newPath}, converted to MP4/WebM (D10)` : `→ ${p.newPath} (Stage 2)`];
  }
  if (/^(css|js|fonts|webfonts)\//.test(path)) return ['drop', 'old runtime (Bootstrap/jQuery/icon fonts); removed in Stage 1'];
  if (path.startsWith('images/blog/')) return ['drop', 'unused; removed in Stage 1'];
  if (path.startsWith('images/')) return ['drop', 'logo / decoration / avatar; removed in Stage 1'];
  return ['review', 'not covered by SPEC §4.10'];
}

// SPEC §4.10 and Q4: disposition of external links.
function linkDisposition(url) {
  const rules = [
    [/github\.com\/Matrix7689\/?$/i, 'keep', 'GitHub profile (Q4)'],
    [/github\.com\/Matrix7689\/.+/i, 'keep', 'project repo (§4.5)'],
    [/linkedin\.com/i, 'keep', 'Q4'],
    [/twitter\.com|x\.com/i, 'keep', 'X (Q4)'],
    [/mailto:/i, 'keep', 'email (N2)'],
    [/steamcommunity\.com/i, 'transform', 'replaced by the Steam Workshop link (Q4)'],
    [/monkeytype\.com/i, 'keep', 'footer CONNECT (Q4)'],
    [/instagram\.com|spotify\.com/i, 'drop', 'Q4'],
    [/hw8react\.appspot\.com/i, 'review', 'keep only if 2xx/3xx (§4.5)'],
    [/matrix7689\.github\.io\/Jay_Parekh_Resume\.pdf/i, 'keep', 'becomes relative /Jay_Parekh_Resume.pdf'],
    [/youtube\.com\/embed/i, 'drop', 'no third-party embeds (CLAUDE.md)'],
    [/kit\.fontawesome\.com/i, 'drop', 'no icon kits / third-party requests'],
    [/w3\.org\/2000\/svg/i, 'n/a', 'XML namespace, not a link'],
  ];
  for (const [re, d, why] of rules) if (re.test(url)) return [d, why];
  return ['review', ''];
}

// Old-site sections → disposition (SPEC §4.10).
const SECTION_DISPOSITION = {
  header: ['drop', 'rotating "Jay, JP, Matrix7689" text and vertical menu dropped; new Nav (§5)'],
  home: ['transform', 'name/links reused in Intro (§4.1); rotating text, avatar, parallax, scroll mouse dropped'],
  about: ['transform', 'bio rewritten (§4.6, N4); map stats → archive (§4.7); fun stats dropped'],
  experience: ['transform', 'reused in §4.2 / §4.6; high school dropped'],
  works: ['transform', 'replaced by /projects/ + level-design archive'],
  testimonials: ['transform', 'tech-stack logos → text skills line (§4.1)'],
  contact: ['transform', 'email link in intro and footer'],
  'works-2': ['transform', 'maps 6–12 → level-design archive'],
};

// About-section fact counters (SPEC §4.7, §4.10, N11).
function factDisposition(label) {
  if (/Level Designs|Map Downloads|Map Views/i.test(label)) return ['move', 'level-design archive stats (§4.7)'];
  if (/eSports/i.test(label)) return ['review', 'N11: old site 32 vs resume 20+'];
  return ['drop', 'fun stat (§1.2, §4.10)'];
}

// ---------- helpers ----------
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (all, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return ENTITIES[e] ?? all;
  });
}
function text(html) {
  return decode(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}
function all(re, s) {
  return [...s.matchAll(re)];
}
function first(re, s) {
  const m = s.match(re);
  return m ? text(m[1]) : null;
}
function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}
function md(s) {
  return String(s ?? '').replace(/\|/g, '\\|');
}

function gitShow(path, encoding) {
  return execFileSync('git', ['show', `${LEGACY_REF}:${path}`], { cwd: ROOT, encoding, maxBuffer: 64 * 1024 ** 2 });
}

// ---------- old file tree (from legacy-2024) ----------
const lsTree = execFileSync('git', ['ls-tree', '-r', '-l', LEGACY_REF], { cwd: ROOT, encoding: 'utf8' });
const legacyCommit = execFileSync('git', ['log', '-1', '--format=%h %s', LEGACY_REF], { cwd: ROOT, encoding: 'utf8' }).trim();
const files = lsTree
  .trim()
  .split(/\r?\n/)
  .map((line) => {
    const [meta, path] = line.split('\t');
    const size = Number(meta.trim().split(/\s+/)[3]);
    const [disposition, note] = fileDisposition(path);
    return { path, bytes: size, disposition, note };
  });
const fileBytes = new Map(files.map((f) => [f.path, f.bytes]));

const folderTotals = new Map();
for (const f of files) {
  const parts = f.path.split('/');
  const keys = ['(root)'];
  for (let i = 1; i < parts.length; i++) keys.push(parts.slice(0, i).join('/') + '/');
  // Root files count only toward (root); folder files count toward every ancestor folder.
  const targets = parts.length === 1 ? keys : keys.slice(1);
  for (const k of targets) {
    const t = folderTotals.get(k) ?? { files: 0, bytes: 0 };
    t.files += 1;
    t.bytes += f.bytes;
    folderTotals.set(k, t);
  }
}

// ---------- image metadata ----------
const imageCache = new Map();
async function image(path) {
  if (imageCache.has(path)) return imageCache.get(path);
  const meta = await sharp(gitShow(path, 'buffer'), { animated: true }).metadata();
  const info = {
    file: path,
    bytes: fileBytes.get(path) ?? null,
    width: meta.width,
    height: meta.pageHeight ?? meta.height,
    format: meta.format,
    ...(meta.pages > 1 ? { frames: meta.pages } : {}),
  };
  imageCache.set(path, info);
  return info;
}

// ---------- pages, sections, items ----------
const pages = [];
const maps = [];
const projects = [];
const linkRefs = new Map(); // url → Set(page#section)
const education = [];
const experience = [];
const facts = [];
const techStack = [];
const socialLinks = [];

function addLink(url, where) {
  if (!/^(https?:|mailto:)/i.test(url)) return;
  if (!linkRefs.has(url)) linkRefs.set(url, new Set());
  linkRefs.get(url).add(where);
}

function parseTimeline(block) {
  return all(/<div class="timeline-container[\s\S]*?<\/ul>/g, block).map(([b]) => {
    const desc = all(/<li>([\s\S]*?)<\/li>/g, b).map((m) => text(m[1]));
    const location = desc.find((d) => d.startsWith('Location:'));
    return {
      dates: first(/<span class="time">([\s\S]*?)<\/span>/, b),
      org: first(/<h3 class="title"[^>]*>([\s\S]*?)<\/h3>/, b)?.replace(/^\|\s*/, ''),
      role: first(/<p class="myRole">([\s\S]*?)<\/p>/, b),
      location: location?.replace(/^Location:\s*/, '') ?? null,
      bullets: desc.filter((d) => d !== location),
    };
  });
}

async function parseGridItems(html, pageName) {
  const starts = all(/<div class="col-md-4 col-sm-6 grid-item ([^"]+)">/g, html);
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const loadMore = html.indexOf('load-more', start);
    const end = i + 1 < starts.length ? starts[i + 1].index : loadMore > -1 ? loadMore : html.length;
    const block = html.slice(start, end);
    const oldTitle = first(/<h4 class="title">([\s\S]*?)<\/h4>/, block);
    const term = first(/<span class="term">([\s\S]*?)<\/span>/, block);
    const thumb = block.match(/<div class="thumb">\s*<img[^>]*src="([^"]+)"/)?.[1];
    const gallery = block.match(/class="gallery mfp-hide">([\s\S]*?)<\/div>/);
    const hrefs = all(/(?:href|src)="([^"]+)"/g, block).map((m) => m[1]);
    for (const h of hrefs) addLink(h, `${pageName}#works`);

    if (gallery) {
      const galleryFiles = all(/href="([^"]+)"/g, gallery[1]).map((m) => m[1]);
      const folder = posix.dirname(galleryFiles[0]).split('/').pop();
      const spec = MAPS[folder];
      maps.push({
        order: spec?.order ?? null,
        page: pageName,
        oldTitle,
        title: spec?.title ?? null,
        oldFolder: `images/works/${folder}`,
        proposedSlug: spec?.slug ?? null,
        newFolder: spec ? `src/assets/level-design/${spec.slug}` : null,
        expectedImages: spec?.expectedImages ?? null,
        cover: thumb,
        gallery: await Promise.all(galleryFiles.map(image)),
      });
    } else {
      const spec = PROJECTS[thumb];
      const imgs = [...new Set(all(/<img[^>]*src="([^"]+)"/g, block).map((m) => m[1]))];
      projects.push({
        page: pageName,
        oldTitle,
        oldCategory: term,
        title: spec?.title ?? null,
        oldFolder: posix.dirname(thumb),
        proposedSlug: spec?.slug ?? null,
        newPath: spec?.newPath ?? null,
        description: all(/<p>([\s\S]*?)<\/p>/g, block).map((m) => text(m[1])),
        links: hrefs.filter((h) => /^https?:/.test(h)),
        gallery: await Promise.all(imgs.map(image)),
      });
    }
  }
}

for (const name of PAGES) {
  const html = gitShow(name, 'utf8');
  const page = {
    file: name,
    bytes: fileBytes.get(name),
    title: first(/<title>([\s\S]*?)<\/title>/, html),
    description: html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? null,
    sections: [],
  };

  // Every head / header / script reference counts as an external link too.
  for (const m of all(/(?:href|src)="([^"]+)"/g, html)) addLink(m[1], name);

  if (name === 'index.html') {
    const header = all(/<header[\s\S]*?<\/header>/g, html).map((m) => m[0]).join('\n');
    page.sections.push({ id: 'header', heading: null, text: text(header) });
    for (const m of all(/<section id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g, html)) {
      const [, id, body] = m;
      page.sections.push({ id, heading: first(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/, body), text: text(body) });
      for (const h of all(/(?:href|src)="([^"]+)"/g, body)) addLink(h[1], `${name}#${id}`);
      if (id === 'home') {
        for (const s of all(/<a href="([^"]+)"[^>]*><i class="([^"]+)"><\/i><\/a>/g, body)) {
          const [d, why] = linkDisposition(s[1]);
          socialLinks.push({ url: s[1], icon: s[2], disposition: d, note: why });
        }
      }
      if (id === 'about') {
        for (const f of all(/<em class="count">([^<]+)<\/em><\/h3>\s*<p class="mb-0">([^<]+)<\/p>/g, body)) {
          const [d, why] = factDisposition(f[2]);
          facts.push({ value: f[1], label: f[2], disposition: d, note: why });
        }
      }
      if (id === 'experience') {
        const edu = body.match(/<div class="timeline edu[\s\S]*?<span class="line"><\/span>/)?.[0] ?? '';
        const exp = body.match(/<div class="timeline exp[\s\S]*?<span class="line"><\/span>/)?.[0] ?? '';
        education.push(...parseTimeline(edu));
        experience.push(...parseTimeline(exp));
      }
      if (id === 'testimonials') techStack.push(...all(/<img[^>]*alt="([^"]+)"/g, body).map((t) => t[1]));
    }
  } else {
    page.sections.push({ id: 'works-2', heading: 'Works (page 2, loaded by infinite scroll)', text: text(html) });
  }
  for (const s of page.sections) [s.disposition, s.note] = SECTION_DISPOSITION[s.id] ?? ['review', ''];
  await parseGridItems(html, name);
  pages.push(page);
}
maps.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

// ---------- external link check ----------
async function check(url) {
  if (!/^https?:/i.test(url)) return { status: null, ok: null, note: 'not HTTP; not checked' };
  if (/w3\.org\/2000\/svg/.test(url)) return { status: null, ok: null, note: 'XML namespace; not checked' };
  if (OFFLINE) return { status: null, ok: null, note: 'skipped (--offline)' };
  const attempt = async (method) => {
    const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(LINK_TIMEOUT_MS) });
    await res.body?.cancel();
    return res;
  };
  try {
    let res = await attempt('HEAD');
    let method = 'HEAD';
    // Some hosts reject HEAD; one GET retry gives the real status.
    if ([403, 404, 405, 501].includes(res.status)) {
      try {
        const g = await attempt('GET');
        if (g.status !== res.status) {
          res = g;
          method = 'GET (HEAD returned a different status)';
        }
      } catch {
        /* keep the HEAD result */
      }
    }
    // LinkedIn answers automated requests with 999; that is a bot block, not a dead link.
    if (res.status === 999) return { status: 999, ok: null, note: 'bot block (LinkedIn); verify manually' };
    return {
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      finalUrl: res.url !== url ? res.url : undefined,
      note: method === 'HEAD' ? '' : method,
    };
  } catch (err) {
    const cause = err.cause?.code ?? err.cause?.message ?? err.name;
    return { status: null, ok: false, note: `request failed: ${cause}` };
  }
}

const links = await Promise.all(
  [...linkRefs.entries()].map(async ([url, where]) => {
    const [disposition, note] = linkDisposition(url);
    return { url, foundIn: [...where].sort(), disposition, dispositionNote: note, ...(await check(url)) };
  }),
);
links.sort((a, b) => a.url.localeCompare(b.url));

// ---------- summary ----------
const mapImages = maps.flatMap((m) => m.gallery);
const projectImages = [...new Map(projects.flatMap((p) => p.gallery).map((g) => [g.file, g])).values()];
const allImages = [...mapImages, ...projectImages];
const summary = {
  legacyCommit,
  generatedAt: new Date().toISOString(),
  maps: maps.length,
  mapJpegs: mapImages.filter((i) => i.format === 'jpeg').length,
  softwareProjects: projects.length,
  projectGifs: projectImages.filter((i) => i.format === 'gif').length,
  projectPngs: projectImages.filter((i) => i.format === 'png').length,
  imagesMissingMetadata: allImages.filter((i) => !(i.bytes && i.width && i.height)).map((i) => i.file),
  mapImageCountMismatches: maps
    .filter((m) => m.expectedImages !== m.gallery.length)
    .map((m) => ({ slug: m.proposedSlug, expected: m.expectedImages, actual: m.gallery.length })),
  externalLinks: links.length,
  externalLinksFailing: links.filter((l) => l.ok === false).map((l) => l.url),
  oldSiteFiles: files.length,
  oldSiteBytes: files.reduce((s, f) => s + f.bytes, 0),
};

const manifest = {
  summary,
  pages,
  content: { socialLinks, facts, education, experience, techStack },
  projects,
  maps,
  links,
  rootFiles: files.filter((f) => !f.path.includes('/')),
  files,
  folderTotals: Object.fromEntries([...folderTotals].sort(([a], [b]) => a.localeCompare(b))),
};

mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs/content-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

// ---------- inventory.md ----------
const L = [];
L.push('# Old-site inventory', '');
L.push(`Generated by \`npm run inventory\` (\`scripts/inventory.mjs\`) from \`${LEGACY_REF}\` @ \`${legacyCommit}\`.`);
L.push(`Machine-readable version: [\`content-manifest.json\`](content-manifest.json). Link check: HEAD, ${LINK_TIMEOUT_MS / 1000} s timeout, one GET retry on 403/404/405/501.`, '');

L.push('## Summary', '');
L.push('| Item | Count |', '|---|---|');
L.push(`| Level-design maps | ${summary.maps} |`);
L.push(`| Map JPEGs | ${summary.mapJpegs} |`);
L.push(`| Software projects | ${summary.softwareProjects} |`);
L.push(`| Project GIFs / PNGs | ${summary.projectGifs} / ${summary.projectPngs} |`);
L.push(`| Images missing bytes/width/height | ${summary.imagesMissingMetadata.length} |`);
L.push(`| External links (failing) | ${summary.externalLinks} (${summary.externalLinksFailing.length}) |`);
L.push(`| Old-site files / bytes | ${summary.oldSiteFiles} / ${fmt(summary.oldSiteBytes)} |`, '');
if (summary.mapImageCountMismatches.length) {
  L.push('**Map image counts differ from SPEC §4.7:**', '');
  for (const m of summary.mapImageCountMismatches) L.push(`- \`${m.slug}\`: expected ${m.expected}, found ${m.actual}`);
  L.push('');
}

L.push('## Pages and sections', '');
for (const p of pages) {
  L.push(`### \`${p.file}\` (${fmt(p.bytes)})`, '');
  if (p.title) L.push(`- Title: ${p.title}`);
  if (p.description) L.push(`- Meta description: ${p.description}`);
  L.push('');
  L.push('| Section | Heading | Disposition | Note |', '|---|---|---|---|');
  for (const s of p.sections) L.push(`| \`${s.id}\` | ${md(s.heading ?? '—')} | **${s.disposition}** | ${md(s.note)} |`);
  L.push('');
  for (const s of p.sections) {
    L.push(`<details><summary><code>${s.id}</code> text (${s.text.length} chars)</summary>`, '', s.text, '', '</details>', '');
  }
}

L.push('## Social links (home)', '');
L.push('| URL | Disposition | Note |', '|---|---|---|');
for (const s of socialLinks) L.push(`| ${s.url} | **${s.disposition}** | ${md(s.note)} |`);
L.push('');

L.push('## About-section stats', '');
L.push('| Value | Label | Disposition | Note |', '|---|---|---|---|');
for (const f of facts) L.push(`| ${f.value} | ${f.label} | **${f.disposition}** | ${md(f.note)} |`);
L.push('');

L.push('## Education and experience (as on the old site)', '');
L.push('| Dates | Organisation | Role | Location | Bullets | Disposition |', '|---|---|---|---|---|---|');
for (const e of education) {
  const d = /High School/i.test(e.org) ? '**drop** (§4.6)' : '**keep** (§4.6)';
  L.push(`| ${e.dates} | ${md(e.org)} | ${md(e.role)} | ${md(e.location)} | ${e.bullets.length} | ${d} |`);
}
for (const e of experience) L.push(`| ${e.dates} | ${md(e.org)} | ${md(e.role)} | ${md(e.location)} | ${e.bullets.length} | **transform** (§4.2, tightened) |`);
L.push('', `Tech-stack logos (→ text skills line, §4.1): ${techStack.join(', ')}.`, '');

L.push('## Software projects', '');
L.push('| Old title | Old category | Proposed slug | New source | Images | Links |', '|---|---|---|---|---|---|');
for (const p of projects) {
  L.push(`| ${md(p.oldTitle)} | ${md(p.oldCategory)} | \`${p.proposedSlug}\` | \`${p.newPath}\` | ${p.gallery.length} | ${p.links.join('<br>')} |`);
}
L.push('');
L.push('| Image | Format | Width × height | Bytes | Frames |', '|---|---|---|---|---|');
for (const i of projectImages) L.push(`| \`${i.file}\` | ${i.format} | ${i.width} × ${i.height} | ${i.bytes} (${fmt(i.bytes)}) | ${i.frames ?? 1} |`);
L.push('');

L.push('## Level-design maps', '');
L.push('| # | Old title | Title | Old folder | Proposed slug | Images | Bytes | Page |', '|---|---|---|---|---|---|---|---|');
for (const m of maps) {
  const bytes = m.gallery.reduce((s, g) => s + g.bytes, 0);
  L.push(`| ${m.order} | ${md(m.oldTitle)} | ${md(m.title)} | \`${m.oldFolder}\` | \`${m.proposedSlug}\` | ${m.gallery.length} | ${fmt(bytes)} | ${m.page} |`);
}
L.push('');
for (const m of maps) {
  L.push(`<details><summary><code>${m.proposedSlug}</code>: ${m.gallery.length} images</summary>`, '');
  L.push('| File | Format | Width × height | Bytes |', '|---|---|---|---|');
  for (const g of m.gallery) L.push(`| \`${g.file}\` | ${g.format} | ${g.width} × ${g.height} | ${g.bytes} (${fmt(g.bytes)}) |`);
  L.push('', '</details>', '');
}

L.push('## External links', '');
L.push('| URL | Found in | Status | Result | Disposition |', '|---|---|---|---|---|');
for (const l of links) {
  const result = l.ok === null ? '—' : l.ok ? 'OK' : '**FAIL**';
  const status = [l.status ?? '—', l.finalUrl ? `→ ${l.finalUrl}` : '', l.note].filter(Boolean).join(' ');
  L.push(`| ${md(l.url)} | ${l.foundIn.join(', ')} | ${md(status)} | ${result} | **${l.disposition}** ${md(l.dispositionNote)} |`);
}
L.push('');

L.push('## Root-level files', '');
L.push('| File | Bytes | Disposition | Note |', '|---|---|---|---|');
for (const f of manifest.rootFiles) L.push(`| \`${f.path}\` | ${f.bytes} (${fmt(f.bytes)}) | **${f.disposition}** | ${md(f.note)} |`);
L.push('');

L.push('## Totals per folder', '');
L.push('| Folder | Files | Bytes |', '|---|---|---|');
for (const [k, t] of Object.entries(manifest.folderTotals)) L.push(`| \`${k}\` | ${t.files} | ${fmt(t.bytes)} |`);
L.push('');

L.push('## Every file: keep / transform / drop', '');
const counts = files.reduce((acc, f) => ((acc[f.disposition] = (acc[f.disposition] ?? 0) + 1), acc), {});
L.push(Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' · '), '');
L.push('| File | Bytes | Disposition | Note |', '|---|---|---|---|');
for (const f of files) L.push(`| \`${f.path}\` | ${fmt(f.bytes)} | **${f.disposition}** | ${md(f.note)} |`);
L.push('');

writeFileSync(join(ROOT, 'docs/inventory.md'), L.join('\n'));

// ---------- console ----------
console.log(`inventory of ${LEGACY_REF} @ ${legacyCommit}`);
console.log(`  maps ${summary.maps}, map JPEGs ${summary.mapJpegs}, software projects ${summary.softwareProjects}`);
console.log(`  project GIFs ${summary.projectGifs}, project PNGs ${summary.projectPngs}`);
console.log(`  images missing bytes/width/height: ${summary.imagesMissingMetadata.length}`);
console.log(`  map image-count mismatches vs SPEC §4.7: ${summary.mapImageCountMismatches.length}`);
console.log(`  external links ${summary.externalLinks}, failing ${summary.externalLinksFailing.length}`);
for (const u of summary.externalLinksFailing) console.log(`    FAIL ${u}`);
const hw8 = links.find((l) => /hw8react/.test(l.url));
if (hw8) console.log(`  hw8react: status ${hw8.status ?? '—'} ${hw8.note ?? ''}`.trimEnd());
console.log('  wrote docs/content-manifest.json and docs/inventory.md');
