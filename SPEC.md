# SPEC.md — Portfolio + Blog Rebuild (matrix7689.github.io)

Owner: Jay Parekh · Implementer: Claude Code, one stage per session · Visual source of truth: `docs/DesignSpec.md`

> **How to use this file.** Each stage in Section 3 is a self-contained session. Before you start a stage, read this whole file and `docs/DesignSpec.md`. Do exactly one stage. Stop at its **Human checkpoint** and report back. Do not start the next stage until Jay says so.
>
> **Precedence.** On visuals, `docs/DesignSpec.md` wins over this file. On performance, this file wins over everything. Where DesignSpec says "TODO" (Sections 2.2 and 3.2), do not invent values.

---

## 0. Assumptions (made while drafting; correct any that are wrong)

1. **Claude Code runs on Jay's Windows machine** in `C:\Jay Data\portfolio revamp\matrix7689.github.io`. That path contains a space, so always quote it. Every project script is a Node ESM script run through `npm run …`, with no bash-only scripts, so the same commands work in PowerShell, Git Bash and GitHub Actions (Ubuntu).
2. **The blog launches with Jay's 3 existing Medium posts** as cross-posts (D5, decided at the Stage 0 checkpoint). The empty state stays as a component for a 0-post build. Templates are also developed against `draft: true` test fixtures that never ship.
3. **The "view original" link on level-design maps points to a large copy made at build time** (1920 px WebP, ≤ 450 KB), not the raw JPEG. Raw originals stay in the repo under `src/assets/` and never appear in `dist/`.
4. **Local working tree noise:** the clone has 19 "modified" files on `master`. Running `git diff --ignore-all-space --ignore-cr-at-eol` on them returns nothing, so they are CRLF line-ending churn only. Stage 0 discards them and adds `.gitattributes`.
5. **Repo size baseline:** `.git` is 53 MB packed (333 objects). `images/works/` is 34 MB: 63 JPEGs (300–930 KB, mostly 1920×1080), `halma.gif` at 2.9 MB, `bfs.gif` at 0.8 MB, and 2 PNG screenshots. These blobs are already in history, so `git mv` into `src/assets/` adds ~0 bytes. **No Git LFS is needed**, and migrating existing history to LFS would require a history rewrite (not recommended).
6. Resume facts (education dates, coursework, intern and CTO bullets, skills) come from `Jay_Parekh_Resume.pdf` and the old `index.html`, which are Jay's own published material. Anything not in those two sources or the brief is marked `NEEDS INPUT`.
7. No analytics, comments, newsletter, contact form or search in v1.

---

## 1. Overview

### 1.1 Goal
Replace the 2020 Bootstrap/jQuery portfolio at https://matrix7689.github.io/ with a minimal, very fast, static portfolio and blog in the "monochrome minimal terminal" style. It positions Jay as a software engineer (SDE II, Amazon) for tech companies and recruiters, and supports publishing blog posts over time, including Medium cross-posts.

### 1.2 Non-goals
- No interactive pseudo-terminal, typed or animated boot sequences, ASCII background animation, scanlines, glitch effects or auto-scrolling ticker (DesignSpec §1.5, §5).
- No CMS, server, database, contact form, comments, analytics or search.
- Level design is not the site's identity: it gets no home-page section.
- No fun stats (coffee, sneakers, ramen, Spotify, WPM, lines of code, games completed). `Matrix_Completed_Games.txt` is dropped.
- No pixel-perfect copy of OpenCode or TypeSafe. Their computed styles are not captured (DesignSpec §2.2, §3.2).

### 1.3 Success metrics (hard gates; see Section 6)
| Metric | Target |
|---|---|
| Home page transferred (gzip, HTML+CSS+JS+eager images, **excluding fonts**) | **< 50 KB** |
| Lighthouse **mobile**: Performance, Accessibility, Best Practices, SEO | **≥ 95 each**, on every audited URL (median of 3 runs) |
| Client JS per page (gzip) | ≤ 2 KB, and only theme toggle and copy button |
| Third-party requests | **0** (no Google Fonts, CDNs, kits or trackers) |
| Thumbnails | 400–600 px wide, **≤ 30 KB** each |
| Largest file in `dist/` | ≤ 500 KB (allowlist: `Jay_Parekh_Resume.pdf`) |
| Raw originals in `dist/` | **0** (byte-hash check) |
| CLS / TBT / LCP (Lighthouse mobile, home) | ≤ 0.02 / ≤ 50 ms / ≤ 2.0 s |

### 1.4 Stack decision: **Astro** (static output), npm, Node 24 LTS (≥ 24.11)
(Changed from Node 22 at the Stage 0 checkpoint: Jay's machine runs Node 24, which is the current LTS line.)
Astro ships zero client JS unless a component opts in. It also bundles in one tool what this site needs: typed content collections with schema validation, a sharp-based image pipeline (`astro:assets`: AVIF/WebP, `srcset`, intrinsic width/height) and build-time Shiki highlighting, so fewer hand-wired plugins than Eleventy.

Supporting packages, all build-time only: `@astrojs/rss`, `@astrojs/sitemap`, `sharp`, `subset-font` (font subsetting), `ffmpeg-static` (one-off GIF→video), `cross-env` (env vars in npm scripts on Windows), `html-validate`, `linkinator`, `@lhci/cli`. Pin exact versions in `package.json`. Use the content-collection API of the installed Astro major version; the snippets in this spec are illustrative.

### 1.5 Repo layout (target, on branch `revamp`)
```
matrix7689.github.io/
├─ CLAUDE.md                     # rules for Claude Code
├─ SPEC.md                       # this file
├─ docs/
│  ├─ DesignSpec.md              # visual source of truth (copied in Stage 0)
│  ├─ inventory.md               # Stage 0 output (human-readable)
│  ├─ content-manifest.json      # Stage 0 output (machine-readable)
│  ├─ PUBLISHING.md              # how to add a post / import from Medium (Stage 5)
│  ├─ DEPLOY.md                  # Pages setting, cutover, rollback (Stage 10)
│  └─ reports/                   # budget, lighthouse, link, repo-size reports per stage
├─ .github/workflows/
│  ├─ deploy.yml                 # build + deploy on push to master
│  ├─ ci.yml                     # build + checks on PRs / revamp branch (no deploy)
│  └─ rollback-legacy.yml        # manual: redeploy legacy-2024 as-is
├─ public/
│  ├─ Jay_Parekh_Resume.pdf      # same URL as the old site
│  ├─ works-2.html               # redirect stub → /projects/level-design/
│  ├─ robots.txt  favicon.svg  favicon-32.png  apple-touch-icon.png
│  ├─ og/default.png             # 1200×630 default Open Graph image
│  ├─ fonts/                     # subset woff2 only
│  └─ media/<project>/demo.{mp4,webm}
├─ src/
│  ├─ site.config.ts             # name, role, links, email, flags (single source)
│  ├─ content.config.ts          # collection schemas
│  ├─ content/
│  │  ├─ blog/                   # <yyyy>-<slug>.md (empty at launch)
│  │  ├─ projects/               # software projects (.md)
│  │  ├─ levels/                 # level-design maps (.md)
│  │  └─ experience/             # roles (.yaml)
│  ├─ assets/                    # ORIGINAL images: processed, never copied raw
│  │  ├─ projects/<slug>/…
│  │  └─ level-design/<slug>/0_main.jpg, 1.jpg, …
│  ├─ components/                # .astro components (Section 5)
│  ├─ layouts/                   # Base.astro, Post.astro, Page.astro
│  ├─ pages/                     # index, blog/, projects/, about, 404, rss.xml
│  ├─ styles/                    # tokens.css, base.css, shiki/{mono-dark,mono-light}.json
│  └─ lib/                       # reading-time, canonical, dates, budgets helpers
├─ scripts/                      # Node ESM: inventory, subset-fonts, convert-gifs,
│                                #   check-budgets, check-originals, check-inputs, new-post, og-default, repo-size
├─ tests/fixtures/blog/          # draft-only sample posts for template testing
├─ budgets.json  lighthouserc.json  .htmlvalidate.json  .gitattributes  .nvmrc
└─ astro.config.mjs  package.json  tsconfig.json
```

---

## 2. Decisions and open questions

### 2.1 Decisions already made
| # | Decision |
|---|---|
| D1 | **Stack:** Astro static output (§1.4). `site` = `https://matrix7689.github.io`, `base` = `/`, set in **one place** (`astro.config.mjs` reading `SITE_URL` env with that default) so a custom domain is a one-line change. |
| D2 | **Branches:** preserve old site on `legacy-2024` (from current `origin/master`). Build on `revamp`. `master` is replaced only after Jay's review (Stage 11). **Superseded Nov 1, 2026:** Jay asked to go live after Stage 1. `master` was fast-forwarded to `revamp` (`2b5af9d`), Pages Source was switched to GitHub Actions, and `deploy.yml` was added early. Stages now land on `revamp` and reach `master` when Jay approves. |
| D3 | **Deploy:** GitHub Actions → GitHub Pages. One-time setting: *Settings → Pages → Build and deployment → Source: **GitHub Actions***. |
| D4 | **Map originals:** link to a build-made 1920 px WebP (≤ 450 KB). Raw JPEGs stay in `src/assets/level-design/` and never ship. |
| D5 | **Blog at launch:** Jay's 3 Medium posts, imported in Stage 3 as full cross-posts with `mediumUrl` set (canonical → Medium per D6). URLs are stored without the `?sharedUserId=…` query:<br>1. `https://medium.com/@jay.parekh7689/how-to-work-better-with-ai-95b32713664f`<br>2. `https://medium.com/@jay.parekh7689/how-i-avoid-and-handle-burnout-c8caedd9fdf1`<br>3. `https://medium.com/@jay.parekh7689/critical-thinking-is-fading-heres-how-you-can-reclaim-it-d30881b52ccb`<br>Body text is Jay's own and is imported verbatim (no rewriting). An empty state still renders for a 0-post build. Future Medium imports are **documented** (`docs/PUBLISHING.md`) plus a `new:post` scaffold script. No automated importer in v1. |
| D6 | **Canonical rule:** `canonical = post.canonicalUrl ?? (SITE.preferMediumCanonical && post.mediumUrl) ?? selfUrl`. `preferMediumCanonical` defaults to `true` in `site.config.ts`. Flip it site-wide there, or per post with `canonicalUrl`. |
| D7 | **Blog filtering without JS:** the filter row links to static tag pages `/blog/tags/<tag>/`. |
| D8 | **Mobile nav without JS:** `<details><summary>` disclosure. |
| D9 | **Allowed JS (2 islands, inline, ≤ 2 KB gzip total):** (a) theme init in `<head>` plus the toggle handler, with `localStorage` wrapped in try/catch; (b) copy-to-clipboard button for code and command blocks, as progressive enhancement. Nothing else. |
| D10 | **GIF demos** (`halma.gif` 2.9 MB, `bfs.gif` 0.8 MB): convert once to MP4 (H.264) + WebM with `ffmpeg-static`, ≤ 400 KB each, committed to `public/media/`. Rendered as `<video controls preload="none" playsinline poster=…>` with no autoplay. The poster is the first frame through the image pipeline. GIFs never ship. |
| D11 | **Old URLs:** `/Jay_Parekh_Resume.pdf` is kept at the same path. `/works-2.html` becomes a static redirect stub (meta refresh + canonical + link) to `/projects/level-design/`. Old `/images/...` URLs and `/Matrix_Completed_Games.txt` are allowed to 404. |
| D12 | **OG image:** one static default `public/og/default.png` (1200×630, ≤ 60 KB) for all pages in v1. Per-post generated OG images go to the backlog. |
| D13 | **Feeds:** RSS 2.0 at `/rss.xml` (satisfies "RSS/Atom"). Sitemap via `@astrojs/sitemap`. `robots.txt` points to it. |
| D14 | **Fonts:** Geist Mono (OFL) self-hosted as subset woff2, weights 400 and 700, `font-display: swap`, only 400 preloaded. Subset = Basic Latin + Latin-1 punctuation + `→ ← ↑ ↓ — – • ·` + box-drawing (U+2500–257F) + block elements (U+2580–259F). |
| D15 | **Syntax highlighting:** Shiki at build time with custom monochrome dark and light themes (`src/styles/shiki/`), dual-theme output via CSS variables so the theme toggle switches code colors with no JS. **Implemented (Stage 5)** as one token-class theme (`src/styles/shiki/mono.json`): a hast plugin maps its placeholder colours to `tok-*` classes coloured by theme tokens, so no inline styles ship. |
| D16 | **Level-design maps:** all **12** maps from both old pages are included (§4.7). |
| D17 | **CSS:** hand-written, tokens in `tokens.css`, no framework or preprocessor. Global CSS ≤ 12 KB gzip. Astro `build.inlineStylesheets: 'auto'`. |
| D18 | **DesignSpec §2.2 and §3.2 (OpenCode and TypeSafe computed styles) are still unfilled.** Stage 1 builds from DesignSpec **§1 and §4 only**. If Jay fills them later, a follow-up session adjusts `tokens.css` only. |

### 2.2 Open questions (each has a default; Claude Code proceeds with the default if unanswered)
| # | Question | Default if no answer |
|---|---|---|
| Q1 | Theme default: always dark, or follow the OS `prefers-color-scheme`? | **Answered (Stage 0): Light** unless the visitor has toggled. The OS setting is not followed. |
| Q2 | Pixel display font (Silkscreen) for wordmark and hero name, and a single accent color? (DesignSpec §6) | **No** pixel font and **no** accent. Hierarchy comes from size, weight, case and opacity. |
| Q3 | Footer ASCII block-letter wordmark text? | **`JP`** (fits a 360 px viewport; `JAY PAREKH` does not). |
| Q4 | Which social links to keep? | **Answered (Stage 0):** GitHub, LinkedIn, X, Medium (`https://medium.com/@jay.parekh7689`), Email, RSS, **Monkeytype** (`https://monkeytype.com/profile/matrix7689`) and **Steam Workshop** (`https://steamcommunity.com/id/MatrixIN/myworkshopfiles/`, replacing the old Steam profile link). Drop Instagram and Spotify. **Stage 3 checkpoint:** Monkeytype dropped entirely. **Stage 1 checkpoint:** the footer `CONNECT` column is GitHub, LinkedIn, Medium, Email only; Steam Workshop goes on the level-design archive (§4.7). |
| Q5 | Add "Advanced Text Summarization" (on the resume, not on the old site) as a 5th software project? | ~~No.~~ **Yes (Stage 4 checkpoint, "add everything").** |
| Q6 | Show GPAs (3.67/4, 8.85/10, from the resume) on About? | **No.** |

All copy and data gaps are listed as `NEEDS INPUT` in Section 4. `npm run check:inputs` lists every remaining marker.

---

## 3. Stages

Conventions for every stage:
- Work on branch `revamp`. One commit per logical task, using conventional-commit style (`feat:`, `chore:`, `docs:`).
- **`master` is live** (early launch, Nov 1, 2026, at Jay's request): every push to `master` deploys to https://matrix7689.github.io/ through `deploy.yml`. Merge `revamp` into `master` only when Jay approves it. **Never** force-push `master` or `legacy-2024`.
- At the end of each stage, write `docs/reports/stage-<n>.md` containing: what changed, the command outputs (budgets, build, checks), the repo-size delta (`npm run repo:size`), the remaining `NEEDS INPUT` count, and any deviations from this spec.
- "Verify" lists the commands Claude Code must run and paste summarised output from. A stage is not done until every acceptance criterion passes.

---

### Stage 0 — Repo prep and inventory

**Goal:** Preserve the old site, set up the working branch, and produce a complete, measured inventory of the old site's content and assets.

**Depends on:** nothing.

**Inputs:** the existing clone; `../SPEC.md`, `../CLAUDE.md`, `../DesignSpec.md` (in `C:\Jay Data\portfolio revamp\`).

**Tasks:**
1. Confirm the working-tree changes are line-endings only: `git diff --ignore-all-space --ignore-cr-at-eol --stat` must print nothing. If it prints anything, **stop and ask**. Otherwise run `git stash push -m "stage0-crlf-noise"` (keep the stash; do not drop it).
2. `git fetch origin`, then confirm local `master` == `origin/master`.
3. Create and push `legacy-2024` from `origin/master`: `git branch legacy-2024 origin/master` and `git push -u origin legacy-2024`.
4. Create `revamp` from `master` and switch to it.
5. Copy `../SPEC.md` → `SPEC.md`, `../CLAUDE.md` → `CLAUDE.md`, and `../DesignSpec.md` → `docs/DesignSpec.md`.
6. Add `.gitattributes`: `* text=auto eol=lf`, plus `binary` for `*.jpg *.jpeg *.png *.gif *.webp *.avif *.pdf *.woff2 *.mp4 *.webm`.
7. Write `scripts/inventory.mjs` (Node, uses `sharp` for dimensions). It produces:
   - `docs/content-manifest.json`: every page (`index.html`, `works-2.html`), every section and its text, every project and map (old title, old folder, proposed slug, gallery file list with **bytes, width, height, format**), every external link, and every root-level file with size.
   - `docs/inventory.md`: the same as tables, plus totals per folder, a "keep / transform / drop" column (per Section 4.10) and the HTTP status of every external link (HEAD request, 10 s timeout; record failures, don't fail the script).
8. Write `scripts/repo-size.mjs`: prints `git count-objects -vH` size-pack, the working-tree size excluding `.git`, `node_modules` and `dist`, and (if present) the `dist/` size. Add `npm run repo:size`. A minimal `package.json` is created in this stage just for scripts.
9. Record the baseline in `docs/reports/stage-0.md`.

**Files to create or change:** `SPEC.md`, `CLAUDE.md`, `docs/DesignSpec.md`, `.gitattributes`, `package.json` (scripts only, plus `sharp`), `scripts/inventory.mjs`, `scripts/repo-size.mjs`, `docs/content-manifest.json`, `docs/inventory.md`, `docs/reports/stage-0.md`.

**Acceptance criteria:**
- `git ls-remote origin legacy-2024` returns the same SHA as `origin/master` (expected head commit: `5881795 Updated Work experience section and Resume`).
- The manifest lists **12 maps** with **63 JPEGs** in total, **4 software projects**, and 2 GIFs + 2 PNG project images. Each image has bytes, width and height.
- `docs/inventory.md` flags `http://hw8react.appspot.com/` (NewsApp React live demo) with its actual status.
- No file from the old site has been deleted or moved yet.

**Verification:** `git branch -a`; `git ls-remote origin legacy-2024`; `npm run inventory`; `npm run repo:size`; open `docs/inventory.md` and confirm the counts above.

**Out of scope:** Astro scaffold, deleting old files, any design work.

**Human checkpoint:** Jay confirms `legacy-2024` exists on GitHub, reviews `docs/inventory.md` (especially dead links and the keep/drop column) and answers any of Q1–Q6 he wants to override.

---

### Stage 1 — Scaffold, design system and quality tooling

**Goal:** A running Astro site with the full design system (tokens, fonts, base CSS, layout shell, nav, footer, theme toggle, core primitives) and the budget, validation and link tooling every later stage uses.

**Depends on:** Stage 0.

**Inputs:** `docs/DesignSpec.md` §1.1–1.5 and §4–5 (**not** §2.2/§3.2); `.nvmrc` = `24`; Geist Mono font files (from the `geist` npm package or the official release; record the source and OFL licence in `public/fonts/LICENSE.txt`).

**Tasks:**
1. Remove old-site runtime files from `revamp`: `index.html`, `works-2.html`, `css/`, `js/`, `fonts/`, `webfonts/`, `Matrix_Completed_Games.txt`, and the unused images (`ajax-loader.gif`, `dots-bg*.svg`, `map.svg`, `map-light.png`, `nike_jordan.png`, `noodles.png`, `blog/*.svg`, tech logos, `avatar_circle*.png`, old `favicon.png`). **Do not touch `images/works/`** (Stage 2) or `Jay_Parekh_Resume.pdf` (moved to `public/` now with `git mv`). They remain on `legacy-2024`.
2. Scaffold Astro (minimal template, TypeScript strict) in the repo root. `output: 'static'`, `site` from `SITE_URL` env (default `https://matrix7689.github.io`), `trailingSlash: 'ignore'`, `build.format: 'directory'`. Canonicals always use a trailing slash.
3. `src/site.config.ts`: name, role, tagline, email, links (github, linkedin, x, medium, steamWorkshop; values per Q4; Monkeytype dropped at the Stage 3 checkpoint), `preferMediumCanonical: true`, `wordmark: 'JP'`. Any unknown value is the literal string `'NEEDS INPUT'` or `null`, and components hide `null` links.
4. `src/styles/tokens.css`: **light is the default** (Q1): inverted light tokens on `:root, [data-theme="light"]` (bg `#fff`, fg `#000`, card `#f5f5f5`, panel `#e5e5e5`, muted `#5f5f5f`, border `#d9d9d9`, ring `#000`), and DesignSpec §1.1 dark tokens on `[data-theme="dark"]`. The inline theme script applies `dark` only when the visitor has chosen it; with no stored choice, or with JS off, the page is light. Radius 0. Spacing and type scale per §1.2–1.3 (10/12/14/16 px UI scale; hero `clamp()` from ~48 px to ~128 px). Container max 80rem, gutter 16 px mobile / 32 px desktop, prose max 72ch.
5. `src/styles/base.css`: reset, mono body, `::selection` inversion, 4 px scrollbar, `:focus-visible` 2 px ring, `.visually-hidden`, skip link, blinking-cursor keyframes inside `@media (prefers-reduced-motion: no-preference)` only.
6. `scripts/subset-fonts.mjs` (`subset-font`): produce `public/fonts/geist-mono-400.woff2` and `-700.woff2` with the D14 range. `@font-face` with `font-display: swap`, `<link rel="preload" as="font" type="font/woff2" crossorigin>` for 400 only. Metric-compatible fallback stack: `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`.
7. Layouts: `Base.astro` (head meta stub, theme init script, skip link, `<header>`, `<main id="main">`, `<footer>`), `Page.astro` (prose width).
8. Components (Section 5): `Nav`, `ThemeToggle`, `Footer`, `AsciiWordmark`, `Button`, `Badge`, `Tag`, `SectionHeader`, `TerminalCard`, `SpecTable`, `CommandBlock` (with copy button), `Figure` (Fig N.), `EmptyState`.
9. Temporary `/` page and a hidden `/_styleguide/` page rendering every component in both themes (excluded from sitemap; `noindex`).
10. Quality tooling:
    - `budgets.json` (values from §6.1) and `scripts/check-budgets.mjs`. For each HTML file in `dist/`, it parses the referenced CSS, JS, preloaded and eager (non-`loading="lazy"`) images, gzips each and sums them. It reports initial (excluding fonts), fonts, and total including lazy images, and exits non-zero on any breach. It also fails on any `dist` file > 500 KB that isn't allowlisted and on JS > 2 KB gzip per page.
    - `.htmlvalidate.json` (recommended preset) and `npm run check:html`.
    - `npm run check:links` → `linkinator dist --recurse --skip "^(?!http://localhost)"` (internal only). `npm run check:links:external` is a separate, non-blocking report.
    - `scripts/check-inputs.mjs`: greps `src/` and `public/` for `NEEDS INPUT`, prints file:line and count. It exits non-zero only with `--strict`.
    - `npm run verify` = `astro check && astro build && check:budgets && check:html && check:links`.
    - `npm run build:fixtures` = `cross-env INCLUDE_FIXTURES=1 SHOW_DRAFTS=1 astro build` (Stage 3 makes it meaningful).
11. Third-party guard in `check-budgets`: fail if any `dist` HTML references `http(s)://` in `src=`, `href=` for a stylesheet or script, or `@import`, except same-site.

**Files to create or change:** `astro.config.mjs`, `package.json`, `tsconfig.json`, `.nvmrc`, `src/site.config.ts`, `src/styles/{tokens,base}.css`, `src/layouts/*`, `src/components/*` (list above), `src/pages/index.astro` (temp), `src/pages/_styleguide.astro`, `public/fonts/*`, `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png`, `budgets.json`, `.htmlvalidate.json`, `scripts/{subset-fonts,check-budgets,check-inputs}.mjs`.

**Acceptance criteria:**
- `npm run verify` exits 0.
- Each woff2 is ≤ 30 KB; total fonts ≤ 60 KB; exactly 1 font preload.
- Global CSS ≤ 12 KB gzip. JS on `/` ≤ 1 KB gzip (theme only; the copy script loads only when a `CommandBlock` or code block is present).
- Zero requests to any host other than the site (checked by the third-party guard).
- Styleguide passes keyboard-only traversal: every interactive element shows a 2 px focus ring. Theme toggle persists across reloads with no flash of the wrong theme (theme set before first paint by the inline head script).
- `prefers-reduced-motion: reduce` disables the cursor blink and every transition.
- Text contrast ≥ 4.5:1 in both themes for fg/bg and muted/bg (document the computed ratios in the stage report).

**Verification:** `npm run verify`; `npm run preview` then load `/_styleguide/`; toggle theme, reload, and Tab through the page; DevTools Network: filter by "other domains" = 0; `npm run repo:size`.

**Out of scope:** real page content, images, blog, SEO meta beyond title and description.

**Human checkpoint:** Jay reviews `/_styleguide/` in both themes on desktop and phone and approves the look (or requests token tweaks) before content stages begin.

---

### Stage 2 — Image and media pipeline

**Goal:** Every image is optimised at build time into budgeted thumbnail, detail and large outputs, GIF demos become lightweight videos, and a guard proves no raw original ships.

**Depends on:** Stage 1.

**Inputs:** `images/works/**` (34 MB), `docs/content-manifest.json`.

**Tasks:**
1. `git mv` every gallery folder into `src/assets/level-design/<slug>/` (old folder → slug mapping in §4.7, file names kept) and the project images into `src/assets/projects/<slug>/` (`android_news.png` → `newsapp-android/cover.png`, `react_news.png` → `newsapp-react/cover.png`, `halma.gif` → `halma-ai/demo.gif`, `bfs.gif` → `mars-rover-search/demo.gif`). Delete the now-empty `images/` folder.
2. `src/components/Img.astro`, a wrapper around `<Picture>` with three presets:
   - `thumb`: widths 400 and 600, formats AVIF then WebP with JPEG fallback, quality tuned so every output is ≤ 30 KB, `loading="lazy"`, `decoding="async"`, explicit width and height, `sizes` passed by the caller.
   - `detail`: widths 800 and 1280, AVIF/WebP/JPEG, each output ≤ 150 KB, lazy unless `eager` is passed (only the first image above the fold).
   - `large`: a single 1920 px WebP made with `getImage()` (≤ 450 KB). Its URL is returned for the "view original" link and is **never** rendered inline.
   - A `grayscale` boolean prop adds the CSS class used by `ThumbGrid` (filter in CSS, not baked into pixels).
3. `scripts/convert-gifs.mjs` (`ffmpeg-static`): converts each `demo.gif` to `public/media/<slug>/demo.mp4` (H.264, `-preset veryfast`, `-pix_fmt yuv420p`, `-movflags +faststart`, CRF tuned to ≤ 400 KB) and `demo.webm` (VP9, ≤ 400 KB). Poster = first frame through `Img` `detail`. Run once and commit the outputs. GIFs stay in `src/assets` as sources only.
4. `scripts/check-originals.mjs`: SHA-256 every file under `src/assets/` and every file under `dist/`. It fails if any hash matches, and fails if any `dist` image is > 450 KB. Add it to `npm run verify`.
5. Extend `check-budgets` to report every image output by preset (thumb ≤ 30 KB, detail ≤ 150 KB, large ≤ 450 KB) and to fail any `<img>` in `dist` lacking `width`, `height` or `decoding="async"`, or lacking `loading="lazy"` unless marked `data-eager`.
6. Add the `/_styleguide/` image section: one thumb, one detail, one large link, and one video, in both themes.
7. Write the repo-size report: before and after `git count-objects -vH`, the `dist/` total, and the 10 largest `dist` files. Recommend LFS or external storage **only if** the packed repo grew by > 50 MB or `dist/` exceeds 100 MB. Expected outcome: neither happens.

**Files to create or change:** `src/assets/**` (moved), `src/components/Img.astro`, `src/components/Video.astro`, `scripts/{convert-gifs,check-originals}.mjs`, `scripts/check-budgets.mjs`, `public/media/**`, `src/pages/_styleguide.astro`, `package.json`.

**Acceptance criteria:**
- `npm run verify` (now including `check:originals`) exits 0.
- For all 12 map covers: thumb AVIF ≤ 30 KB at 600 w; detail ≤ 150 KB at 1280 w; large WebP ≤ 450 KB at 1920 w.
- `halma` and `mars-rover-search` MP4 ≤ 400 KB each; no `.gif` anywhere in `dist/`.
- 0 raw originals in `dist/` (hash check).
- Packed repo growth ≤ 2 MB (videos only).

**Verification:** `npm run build && npm run check:originals && npm run check:budgets`; `npm run repo:size`; spot-check 3 thumbnails visually in `/_styleguide/` at 2× zoom for banding.

**Out of scope:** project and map pages (Stages 6–7).

**Human checkpoint:** Jay eyeballs image quality (thumb, detail, large) and the converted Halma video, and approves compression levels.

---

### Stage 3 — Content model and data entry

**Goal:** Typed content collections and data files for blog, projects, levels and experience, filled with the real facts from Section 4 and with gaps marked `NEEDS INPUT`.

**Depends on:** Stage 2.

**Inputs:** Section 4 (content spec), Appendix A (schemas), `docs/content-manifest.json`.

**Tasks:**
1. `src/content.config.ts` with the four collections (Appendix A). The blog loader also includes `tests/fixtures/blog/**` **only when** `INCLUDE_FIXTURES=1`.
1a. **Import Jay's 3 Medium posts** (D5) into `src/content/blog/<yyyy>-<slug>.md`, following the import procedure that Stage 5 documents in `docs/PUBLISHING.md` (c): body converted to Markdown verbatim; `title`, `date` and tags taken from the post; `summary` = the Medium subtitle (or `NEEDS INPUT` if the post has none); `mediumUrl` = the clean URL from D5; `canonicalUrl` unset; images downloaded to `src/assets/blog/<slug>/`; `draft: false`. If Medium blocks automated fetching, stop and ask Jay for the HTML from Medium *Settings → Security and apps → Download your information*.
2. `tests/fixtures/blog/`: 3 draft fixtures (`draft: true`) exercising every feature: long post with h2/h3 (TOC), code blocks in 3 languages, a Medium cross-post (`mediumUrl` set), tags, images. Fixture text must be obviously placeholder (`Fixture: …`), never published, and excluded from feeds and sitemap.
3. `src/content/experience/*.yaml`: Amazon SDE II, Amazon SDE I, Amazon SDE Intern, Bigshine CTO. Copy per §4.2 and §4.6. **No "Level Designer" role** anywhere (Stage 0 checkpoint); level designs appear only as projects.
4. `src/content/projects/*.md`: 4 software projects per §4.5.
5. `src/content/levels/*.md`: 12 maps per §4.7, with gallery images referenced via the `image()` schema helper so missing files fail the build.
6. `src/lib/`: `readingTime.ts` (words / 230, ceil, min 1), `canonical.ts` (D6), `dates.ts` (ISO `YYYY-MM-DD` for blog, `Mon YYYY` for roles), `posts.ts` (published = `!draft` in production; sorted by date desc; prev/next helpers).
7. `remark` plugin to inject reading time into post frontmatter.

**Files to create or change:** `src/content.config.ts`, `src/content/**`, `tests/fixtures/blog/*.md`, `src/lib/*.ts`, `astro.config.mjs` (remark plugin).

**Acceptance criteria:**
- The 3 imported Medium posts build with `draft: false`, each with `mediumUrl` equal to its clean D5 URL, and their body text matches the Medium originals (no rewording).
- `npm run build` passes with schema validation. Deliberately breaking one field (e.g. `date: "x"`) fails the build; revert after testing.
- `npm run build:fixtures` passes, and production `npm run build` emits **no** fixture slugs (grep `dist/` for `Fixture:` = 0 hits).
- `npm run check:inputs` lists every gap from §4.11, and nothing invented (spot-check against Section 4).
- Every metric in content files matches §4.2 exactly ($1.74M, TM99 −15 ms, TM99 −10 ms, 3–4 months, 4 h → 5 min, 3 pipelines / 16 regions, 5 peak simulations, 2 engineers mentored).

**Verification:** `npm run build`; `npm run build:fixtures`; `npm run check:inputs`; Select-String/grep for `Fixture:` in `dist`.

**Out of scope:** page templates.

**Human checkpoint:** Jay reviews the tightened experience and project copy in the content files, fills whatever `NEEDS INPUT` he can, and approves the wording.

---

### Stage 4 — Home page

**Goal:** The production home page per §4.1, under 50 KB.

**Depends on:** Stage 3.

**Inputs:** §4.1; DesignSpec §1.4 and §4 "Home page content order".

**Tasks:**
1. `src/pages/index.astro` sections, in order: **Intro** → **Experience** (SDE II, SDE I) → **Highlights** (Fig 1–3) → **Latest posts** (3–5, or `EmptyState`) → **Selected projects** (featured, max 4) → **Skills** (static wrapped line, `///` separators) → Footer. **Stage 4 checkpoint:** Highlights moved first and expanded to 24 figures; sections are now 01 `~/highlights`, 02 `~/experience`, 03 `~/blog`, 04 `~/projects`, 05 `~/skills` (§4.1).
2. The intro contains the one `CommandBlock` as the primary visual (§4.1), built from `SITE_URL` so it stays correct after a custom-domain switch.
3. Section headers use `SectionHeader` with ghost numbers `01`–`04` and prompt-style titles (`~/experience`, `~/blog`, `~/projects`, `~/skills`).
4. Project cards show text first; the tiny thumbnail (`thumb` preset, grayscale) is optional per card and lazy.
5. JSON-LD `Person` (name, jobTitle, worksFor Amazon, alumniOf USC and University of Mumbai, sameAs from non-null links).

**Files to create or change:** `src/pages/index.astro`, `src/components/{ExperienceItem,PostListItem,ProjectCard}.astro`, minor CSS.

**Acceptance criteria:**
- `/` initial transfer **< 50 KB** gzip excluding fonts (check-budgets output), with total including lazy thumbs ≤ 120 KB.
- Lighthouse mobile ≥ 95 in all 4 categories on `/` (`npm run lhci -- --url=/`).
- Exactly one `<h1>`; heading order h1 → h2 → h3 with no skips.
- The blog section lists the 3 imported posts, each with the `[medium]` marker. The `EmptyState` path is proven in `/_styleguide/`. With `npm run build:fixtures`, it also lists the fixtures (template proof).
- Copy button copies the exact command (manual test). Without JS the command is still selectable text.
- Renders at 360 px width with no horizontal scroll.

**Verification:** `npm run verify`; `npm run lhci`; DevTools device mode at 360 × 740; disable JS and reload.

**Out of scope:** other pages (links may 404 until their stage; `check:links` may allowlist them for this stage only, noted in the report).

**Human checkpoint:** Jay approves the home page copy and layout on phone and desktop.

---

### Stage 5 — Blog

**Goal:** Blog index, tag pages, post template and publishing docs, ready for the first post.

**Depends on:** Stage 4.

**Inputs:** §4.3–4.4; DesignSpec §3.1 and §4 "Blog index" / "Blog post page"; fixtures.

**Tasks:**
1. `/blog/`: page title, **featured latest post** (larger entry, same fields), **tag filter row** (`all` + every tag used, linking to `/blog/tags/<tag>/`, active state inverted), list entries `YYYY-MM-DD  [tag]  Title` + one-line TL;DR + `[medium]` marker when `mediumUrl` is set. Shows the empty state at 0 posts.
2. `/blog/tags/[tag]/`: same list filtered; `getStaticPaths` from published posts only.
3. `/blog/[slug]/` (layout `Post.astro`): title, date, updated, reading time, tags, Medium notice ("Also published on Medium →" when `mediumUrl`), TOC (render when ≥ 3 h2/h3 **and** reading time ≥ 5 min; `<details open>` on wide screens, closed on mobile; no JS), prose at ≤ 72ch, terminal-styled code blocks (`TerminalCard` chrome with the language as title, copy button), prev/next by date, canonical per D6.
4. Shiki dual monochrome themes (D15). Line highlighting via `// [!code highlight]` if supported by the installed Shiki transformers; otherwise skip.
5. `/rss.xml` (published posts only; full summary, link, pubDate, categories). It stays valid with 0 items.
6. `scripts/new-post.mjs`: `npm run new:post -- "Title" [--tags a,b] [--medium <url>]` creates `src/content/blog/<yyyy>-<slug>.md` with frontmatter, `draft: true` and today's date.
7. `docs/PUBLISHING.md`: (a) write a post: `npm run new:post`, edit, set `draft: false`, `npm run verify`, commit, push to `master`, and it is live in ~2 min; (b) images: put files in `src/assets/blog/<slug>/` and reference them relatively; (c) **import a Medium post**: open the post → copy the body (or use Medium *Settings → Security and apps → Download your information*, which gives HTML per post), convert headings/code/images to Markdown, download images into `src/assets/blog/<slug>/`, set `mediumUrl`, and leave `canonicalUrl` unset so the canonical points to Medium (D6); (d) **flip canonical**: per post set `canonicalUrl` to the site URL, or site-wide set `preferMediumCanonical: false`; (e) drafts and tags conventions.

**Files to create or change:** `src/pages/blog/index.astro`, `src/pages/blog/tags/[tag].astro`, `src/pages/blog/[slug].astro`, `src/pages/rss.xml.ts`, `src/layouts/Post.astro`, `src/components/{FeaturedPost,TagFilter,Toc,PrevNext,CodeBlock}.astro`, `src/styles/shiki/*.json`, `scripts/new-post.mjs`, `docs/PUBLISHING.md`.

**Acceptance criteria:**
- Production build: `/blog/` shows the featured post plus the other 2 imported posts; `/rss.xml` validates (W3C feed validator or `npx rss-parser` parse) with 3 items; each imported post's `<link rel="canonical">` equals its `mediumUrl`; no `/blog/tags/*` pages are emitted for draft-only tags.
- Fixture build (`npm run build:fixtures`): featured post, filter row, 3 entries, TOC on the long fixture only, prev/next correct, the Medium fixture's `<link rel="canonical">` equals its `mediumUrl`, and setting `preferMediumCanonical:false` flips it to the self URL.
- Post page initial transfer ≤ 60 KB (excluding fonts, lazy images); JS ≤ 2 KB gzip.
- Code blocks are readable in both themes (contrast ≥ 4.5:1 for default token color) and scroll horizontally inside their box with no page overflow at 360 px.
- `npm run new:post -- "Test" --tags meta` creates a valid draft that builds (delete it afterwards).

**Verification:** `npm run verify`; `npm run build:fixtures && npm run check:budgets`; `npm run lhci` on a fixture post (fixture build).

**Out of scope:** per-post OG images, search, comments, an automated Medium importer.

**Human checkpoint:** Jay reviews the blog templates (fixture build) and `docs/PUBLISHING.md`, and confirms the blog name and nav label (default `blog`).

---

### Stage 6 — Projects and project detail pages

**Goal:** `/projects/` listing software first, plus a detail page per software project.

**Depends on:** Stage 5.

**Inputs:** §4.5; `src/content/projects/`.

**Tasks:**
1. `/projects/`: intro line; **Software** list (4 `ProjectCard`s: title, one-line summary, stack tags, year, links); then a **Level design** teaser (one line plus the aggregate stat line + link to `/projects/level-design/`). No map thumbnails here beyond at most 3 grayscale thumbs.
2. `/projects/[slug]/`: title, summary, `SpecTable` (type, year, stack, role/course, repo, live), body (what it does, how it works, notable decisions; facts only from §4.5), media (cover image `detail` preset or `Video` for halma and mars-rover), links (GitHub; live demo only if the Stage 0 link check returned 2xx/3xx), prev/next project.

**Files to create or change:** `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`, `src/components/ProjectCard.astro` (extend), `src/components/Video.astro`.

**Acceptance criteria:**
- `/projects/` initial ≤ 50 KB; total ≤ 200 KB. Detail pages initial ≤ 80 KB; total ≤ 600 KB.
- Video has `preload="none"`, a poster, an `aria-label`, and an adjacent text description.
- Lighthouse mobile ≥ 95 ×4 on `/projects/` and `/projects/halma-ai/`.
- No dead outbound links (the external report shows the GitHub repos as 200).

**Verification:** `npm run verify`; `npm run lhci`; `npm run check:links:external`.

**Out of scope:** level-design pages.

**Human checkpoint:** Jay approves project copy and whether NewsApp React's live link stays.

---

### Stage 7 — Level Design archive

**Goal:** `/projects/level-design/` grid and 12 per-map detail pages: secondary, fast and accessible.

**Depends on:** Stage 6.

**Inputs:** §4.7; `src/content/levels/`; `src/assets/level-design/**`.

**Tasks:**
1. Index: short intro (secondary-history framing), aggregate stats as `Figure`s (§4.7), Steam Workshop link, `ThumbGrid` of 12 maps in the old-site order. Thumbnails are grayscale by default and show color on `:hover` and `:focus-visible` of the card link (CSS `filter`; transition disabled under reduced motion). Each card shows map name + year (or `NEEDS INPUT`).
2. Map page `/projects/level-design/[slug]/`: title, `SpecTable` (game, year, type, images count, workshop link if any), description, gallery of `detail` images (first eager, rest lazy). Each image is wrapped in a link "view full size" → `large` WebP (opens in the same tab, no lightbox JS). Prev/next map; back to archive.
3. Alt text pattern: `"<Map name> — screenshot <i> of <n>"` unless Jay provides captions.
4. Link the archive from `/projects/` and the footer. **Not** from the home page.

**Files to create or change:** `src/pages/projects/level-design/index.astro`, `src/pages/projects/level-design/[slug].astro`, `src/components/{ThumbGrid,ThumbCard,Gallery}.astro`.

**Acceptance criteria:**
- Index initial ≤ 60 KB, total ≤ 450 KB with all 12 thumbs. Map page initial ≤ 120 KB, total ≤ 1.2 MB.
- No raw JPEG in `dist/` (`check:originals`); every "view full size" link resolves to a ≤ 450 KB WebP.
- Keyboard focus on a card shows both the focus ring and the color state.
- Lighthouse mobile ≥ 95 ×4 on the index and on `/projects/level-design/awp-lego-asia/`.
- Home page has 0 links to `/projects/level-design/` (grep).

**Verification:** `npm run verify`; `npm run lhci`; keyboard walkthrough.

**Out of scope:** lightbox, carousel, any JS.

**Human checkpoint:** Jay fills per-map game, year and description where known, and approves the archive.

---

### Stage 8 — About, resume and remaining pages

**Goal:** `/about/`, resume download, `404`, and the `works-2.html` redirect.

**Depends on:** Stage 7.

**Inputs:** §4.6, §4.8, §4.9; `public/Jay_Parekh_Resume.pdf` (or an updated PDF from Jay).

**Tasks:**
1. `/about/`: bio, `~/education` (USC, Mumbai) as `SpecTable`s, `~/experience` (full timeline incl. intern + CTO; no level-design role), `~/elsewhere` (community and extra-curricular facts from §4.6), resume download button (`Button` primary, `download` attr, size and "PDF" label), optional headshot (only if provided).
2. `404.astro`: terminal-style `$ cd <path>: No such file or directory` with links to home, blog and projects. `noindex`.
3. `public/works-2.html` redirect stub (D11).
4. Confirm `/Jay_Parekh_Resume.pdf` is served at the old URL.

**Files to create or change:** `src/pages/about.astro`, `src/pages/404.astro`, `public/works-2.html`, `src/components/Timeline.astro` (or reuse `ExperienceItem`).

**Acceptance criteria:**
- `/about/` initial ≤ 40 KB (≤ 100 KB with headshot). Lighthouse ≥ 95 ×4.
- `curl -I` (or `Invoke-WebRequest -Method Head`) on preview `/Jay_Parekh_Resume.pdf` → 200, `application/pdf`.
- `/works-2.html` lands on `/projects/level-design/` within 0 s, with a visible fallback link.
- The 404 page is emitted as `dist/404.html`.

**Verification:** `npm run verify`; `npm run lhci`; manual redirect test in preview.

**Out of scope:** new resume authoring.

**Human checkpoint:** Jay approves the bio and decides whether to supply an updated resume and a headshot.

---

### Stage 9 — SEO, feeds, metadata and accessibility pass

**Goal:** Complete metadata, crawlability and a site-wide accessibility sweep.

**Depends on:** Stage 8.

**Tasks:**
1. `Seo.astro` in `Base.astro`: `<title>` pattern `"<Page> · Jay Parekh"` (home: `"Jay Parekh · Software Engineer"`), meta description (≤ 155 chars per page), canonical, `og:*` (type, title, description, url, image = `/og/default.png`, site_name), `twitter:card=summary_large_image`, `twitter:site/creator` from `links.x`, `<link rel="alternate" type="application/rss+xml">`, `theme-color` for both schemes.
2. JSON-LD: `Person` (home, about) and `BlogPosting` (posts: headline, datePublished, dateModified, author, url, mainEntityOfPage = canonical).
3. `@astrojs/sitemap` (exclude `/_styleguide/`, `/404`, drafts, `/works-2.html`). `public/robots.txt` (`Allow: /`, `Disallow: /_styleguide/`, `Sitemap: <site>/sitemap-index.xml`).
4. `scripts/og-default.mjs`: render `src/assets/og/default.svg` (black, white mono wordmark `JP`, name, role; shapes and outlined text only, no system-font dependency) to `public/og/default.png` with sharp. Commit the PNG.
5. Accessibility sweep against §6.2: landmarks, skip link, one h1, heading order, link text, alt text, `aria-hidden` on decorative ASCII with a visible or visually-hidden text alternative, toggle `aria-pressed` + label, copy button `aria-live="polite"` feedback, `lang="en"`, tap targets ≥ 44 × 44 px for nav and toggle, contrast in both themes.
6. `npm run check:inputs -- --strict` is **reported**, not yet enforced.

**Files to create or change:** `src/components/Seo.astro`, `src/layouts/Base.astro`, `astro.config.mjs`, `public/robots.txt`, `public/og/default.png`, `src/assets/og/default.svg`, `scripts/og-default.mjs`, fixes across components.

**Acceptance criteria:**
- Every page in `dist` has a unique title, meta description, canonical (absolute, trailing slash), `og:image` (absolute URL) and exactly one h1 (script check added to `check:html` or `check-budgets`).
- `sitemap-index.xml` lists all public pages and none of the excluded ones.
- Lighthouse SEO = 100 and Accessibility ≥ 95 on all audited URLs.
- `og/default.png` is 1200×630 and ≤ 60 KB.

**Verification:** `npm run verify`; `npm run lhci`; open `dist/sitemap-0.xml`; validate a post's JSON-LD with the Schema.org validator (fixture build).

**Out of scope:** per-post generated OG images (backlog).

**Human checkpoint:** Jay approves the OG image and the page titles and descriptions.

---

### Stage 10 — Deployment pipeline (no cutover yet)

> **Early launch (Nov 1, 2026):** task 2 (`deploy.yml`) and the Pages Source switch are already done and live. Stage 10 now covers only `ci.yml`, `rollback-legacy.yml` and `docs/DEPLOY.md`. Rewrite the runbook as "how deploys work now" plus rollback. Criteria that say the live site is unchanged no longer apply.

**Goal:** CI and deploy workflows, a rollback path and a cutover runbook, all tested without touching the live site.

**Depends on:** Stage 9.

**Tasks:**
1. `.github/workflows/ci.yml`: on `pull_request` and push to `revamp`. Steps: checkout, setup-node from `.nvmrc` with npm cache, `npm ci`, `npm run verify`, `npm run lhci` (temporary public storage off; upload `.lighthouseci/` as an artifact), and upload `dist/` as an artifact so Jay can download and preview.
2. `.github/workflows/deploy.yml`: on push to `master` + `workflow_dispatch`. Permissions `contents: read, pages: write, id-token: write`. Concurrency group `pages` with `cancel-in-progress: false`. Jobs: build (`npm ci`, `npm run verify`, `actions/upload-pages-artifact` with `path: dist`) → deploy (`actions/deploy-pages`, environment `github-pages`). Use current major versions of the official actions.
3. `.github/workflows/rollback-legacy.yml`: `workflow_dispatch` only. Checks out `legacy-2024` and uploads the repo root (excluding `.git`) as the Pages artifact, then deploys. This gives a one-click restore of the old site.
4. `docs/DEPLOY.md`:
   - **One-time setting:** *Settings → Pages → Source: GitHub Actions*.
   - **Cutover runbook (executed in Stage 11):** (1) open PR `revamp → master`; CI green. (2) Switch Pages Source to GitHub Actions. (3) Immediately merge the PR (merge commit, not squash, to keep history). (4) Watch `deploy.yml`; site live in ~2 min. (5) Run post-deploy checks (§6.3).
   - **Rollback:** fast path = run `rollback-legacy.yml`. Full path = `git revert -m 1 <merge-sha>` on `master` and push, or re-point Pages Source to "Deploy from a branch: `legacy-2024` / root".
   - **Custom domain later:** add the domain in *Settings → Pages → Custom domain* (Actions deployments don't need a `CNAME` file, but adding `public/CNAME` is harmless), set the `SITE_URL` repo variable and pass it in the build step, then add DNS records per GitHub docs, enable *Enforce HTTPS*, and rebuild.
5. Push `revamp`, then confirm `ci.yml` passes on GitHub and the `dist` artifact downloads.

**Files to create or change:** `.github/workflows/{ci,deploy,rollback-legacy}.yml`, `docs/DEPLOY.md`, `lighthouserc.json` (CI-friendly settings).

**Acceptance criteria:**
- `ci.yml` is green on the `revamp` branch on GitHub, with Lighthouse assertions passing in CI.
- `deploy.yml` and `rollback-legacy.yml` pass `actionlint` (`npx actionlint` or the GitHub UI shows no YAML errors). Neither has run against production yet.
- The live site is unchanged (still the 2020 site).

**Verification:** `gh run list --branch revamp`; `gh run view <id> --log-failed` if red; open https://matrix7689.github.io/ and confirm it is still the old site.

**Out of scope:** merging to `master`, switching the Pages source.

**Human checkpoint:** Jay downloads the CI `dist` artifact or runs `npm run preview` for a full review of the whole site.

---

### Stage 11 — Performance and QA audit, final fixes and launch

**Goal:** Prove every gate in Section 6, fix regressions and, after Jay's explicit go, execute the cutover.

**Depends on:** Stage 10 and Jay's approval of the full review.

**Tasks:**
1. Run the full Definition of Done (§6.3) on a clean clone: `git clone`, then `npm ci`, then `npm run verify`, then `npm run lhci`.
2. Lighthouse on all 9 audited URLs (§6.1). Write `docs/reports/lighthouse.md` with scores, LCP, CLS and TBT per URL.
3. Cross-browser smoke (manual or Playwright screenshot script, optional): latest Chrome, Firefox and Safari (if available) at 360 px and 1440 px, both themes.
4. Fix everything below threshold. Re-run.
5. `npm run check:inputs -- --strict`: the remaining `NEEDS INPUT` markers must be either filled or **explicitly accepted by Jay** to ship hidden (components hide null values). Anything visible that still says `NEEDS INPUT` blocks launch.
6. **Stop.** Present the report. After Jay says "launch", run the cutover runbook in `docs/DEPLOY.md`, then the post-deploy checks. (Since the early launch, there is no cutover. "Launch" means merging the final `revamp` into `master` and running the post-deploy checks.)
7. After launch: tag `v1.0.0`, then delete the Stage 0 stash only if Jay agrees.

**Files to create or change:** fixes anywhere; `docs/reports/lighthouse.md`, `docs/reports/stage-11.md`.

**Acceptance criteria:** every item in §6.3 passes; Jay's explicit launch approval is recorded in the report; post-deploy checks pass on the live URL.

**Verification:** §6.3 commands; on production, `npx lhci collect --url=https://matrix7689.github.io/` (3 runs) and `npx linkinator https://matrix7689.github.io/ --recurse`.

**Out of scope:** new features (log them in `docs/backlog.md`).

**Human checkpoint:** (a) launch go/no-go; (b) after launch, Jay confirms the live site and the old resume URL work.

---

## 4. Content spec

**Copy rules (all pages):**
- Plain and specific. First person on About; neutral elsewhere (never "Jay is…"). No buzzwords ("passionate", "rockstar", "synergy"). Numbers exactly as in §4.2; never round, inflate or add new ones.
- Prompt-style section titles (`~/experience`, `$ cat about.md`) used sparingly, at most one motif per section header.
- Dates: blog `YYYY-MM-DD`; roles `Mon YYYY – Mon YYYY` / `– present`.
- Bullets use `[*]` markers (DesignSpec §2.1). One idea per bullet, ≤ 25 words, starting with a past-tense verb and ending with the result.
- Everything marked **(proposed)** is Claude's tightening of Jay's own wording; Jay approves it at the stage checkpoint.

### 4.1 Home `/`
| Section | Content |
|---|---|
| Badge | Removed (Jay, Stage 5 checkpoint). Three `Badge`s sit under the name instead: `Software Engineer`, `Amazon`, `Seattle`. |
| H1 | `Jay Parekh` only; the muted role line was removed as redundant with the badges (Jay, Stage 5 checkpoint). |
| One-liner | "I build and scale Amazon's shopping cart service." (approved by Jay at the Stage 4 checkpoint, list after the colon removed) |
| Links row | Removed (Jay, Stage 5 checkpoint): github, linkedin, medium and email moved into the terminal's `ls` output. |
| CommandBlock (primary visual) | Title `jay@portfolio ~ terminal`. Line: `$ curl -sLO https://matrix7689.github.io/Jay_Parekh_Resume.pdf` (URL from `SITE_URL`). Copy button. Below it, static output styled as `ls`: `blog/  projects/  github  linkedin  medium  email`, each a real link (Stage 5 checkpoint: `about.md` and `resume.pdf` removed, profiles moved in). Below the terminal: a primary `Button` "Download resume" → `/Jay_Parekh_Resume.pdf` (download). Trailing `$ █` cursor (CSS blink, reduced-motion safe). |
| 02 `~/highlights` | Placed before experience (Jay, Stage 4 checkpoint). 23 `Figure`s **without** the "Fig N." prefix and without source labels, in four groups (Engineering 8, Gaming & community 5, Map making 4, Off the clock 6). Jay's updates: 13 years programming, 6 peak simulations, 3 engineers mentored (SDE I bullets updated to match), 3 hackathons won at Amazon, 975 cups of coffee, Spotify minutes labelled 2025; removed: 0 customer impact, 4 h → 5 min, 3–4 months, 16 regions, 3 websites, Instagram views, languages spoken. Data in `src/data/pages.ts`. |
| 02 `~/experience` | Two `ExperienceItem`s (SDE II, SDE I) per §4.2: role, team ("Shopping Cart"), dates, location, 2–4 bullets. Link: "full history → /about/". |
| 03 `~/blog` | Latest 3–5 posts (`PostListItem`); at launch the 3 imported Medium posts. With 0 posts: `EmptyState`: `$ ls blog/` → `0 posts — first one is on the way. Subscribe: rss.xml` |
| 04 `~/projects` | Featured software projects (all 4 by default): title, one-liner, stack tags, link. "all projects → /projects/". |
| 05 `~/skills` | One static wrapped line: `Java /// Kotlin /// C++ /// Python /// React /// Node.js /// AWS /// Docker /// Linux /// Git /// SQL` (from the resume; confirmed by Jay, N6) |
| Footer | §4.9 |

### 4.2 Experience data (home + about)
**Amazon: Software Development Engineer II**, Shopping Cart · Dec 2023 – present · Seattle, WA
(Jay supplied 9 bullets at the Stage 3 checkpoint; these are (proposed) tightenings with the same facts. Home shows the first 3.)
- [*] Delivered cross-region cache consistency with a dual-write architecture and migration support, enabling large-scale regional transitions with zero customer impact.
- [*] Designed fault-tolerant merging of unauthenticated and authenticated cart sessions, preventing cart-state loss and supporting a major service migration with **>99.99%** success.
- [*] Launched reliability, monitoring and load-testing improvements for multiple customer-facing APIs, improving peak-event readiness, deployment safety and incident response.
- [*] Migrated critical service integrations to secure authentication and encrypted traffic, coordinating a staged multi-team rollout with automated validation to full production coverage.
- [*] Modernized internal dashboards and debugging tools and improved log traceability, reducing investigation time during incidents and production analysis.
- [*] Led technical mentoring, including intern project delivery, cross-team onboarding and knowledge-sharing sessions that scaled best practices across partner teams.
- [*] Resolved dependency risks, streamlined configuration pipelines and reduced manual operational overhead, improving security, stability and service readiness across environments.
- [*] Enhanced the shopping cart's throttling mechanism against bot attacks, keeping the service available without interruption.
- [*] Kept the service documentation and dashboards up to date.

**Amazon: Software Development Engineer I**, Shopping Cart · Jul 2021 – Dec 2023 · Seattle, WA
- [*] Refactored the cart's caching storage layer: **$1.74M** infrastructure cost savings and **−15 ms** global TM99 latency.
- [*] Led a cross-team service migration that cut global TM99 latency by **10 ms** and reduced infrastructure cost.
- [*] Designed translation and invocation strategies for a new service; reusing existing components saved **3–4 months** of implementation effort.
- [*] Kept a client team's migration to the new cart version backward compatible, with tracking metrics.
- [*] Restored **3 pipelines across 16 regions**, ran **6 peak-traffic simulations**, and built a mock-request testing framework.
- [*] Mentored **3 engineers**; ran knowledge-transfer sessions on internal debugging and log-query tools.

(Home shows the first 3 SDE I bullets; About shows all.)

**Amazon: Software Development Engineer Intern** · May 2020 – Aug 2020 · Los Angeles, CA (4 bullets from LinkedIn since the Stage 4 checkpoint; see `src/content/experience/amazon-sde-intern.yaml`)
- [*] Built a full-stack, end-to-end internal tool used by the Ordering Shopping Cart team.
- [*] Cut an operation from **4 hours to 5 minutes** by automating a manual, error-prone process.
- [*] Designed a React UI with filtering, sorting, pagination, selection and form validation.
- [*] Designed and implemented new Java APIs as the middleware between the front end and other back-end components.

**Bigshine Media & Entertainment: Chief Technical Officer** · Jul 2017 – Feb 2019 · Mumbai (About only, "earlier roles")
- [*] Led operations across 4 subsidiaries (Mammoth Media, Mammoth Gears, Ironhead Productions, Mammoth Gaming).
- [*] Led a team of 3 building 3 websites, front and back end.
- [*] Ran technical operations for the video-game segments of *U Cypher Season 1* on MTV India.
- [*] Managed partnerships with companies including Cooler Master, Zowie by BenQ, Circle Gaming, USports and Entity Gaming (LinkedIn).

**Drag2Death: Community Specialist** · May 2015 – Jun 2017 · Mumbai (from LinkedIn, Stage 4 checkpoint)
- [*] Developed and configured **24+** gaming servers serving **100,000+** users.
- [*] Organized and ran **20+** eSports events, online and LAN.
- [*] Created **50** maps with **10 million** views and **1 million** downloads on Steam Workshop.
- [*] Ran a **7-week** online workshop on 3D level design for **500+** students.

(No "3D Level Designer" role: removed at the Stage 0 checkpoint. Level designs are shown only as projects, §4.7.)

**Stage 4 checkpoint (LinkedIn import):** for now the home page shows everything: 01 `~/about` (Jay's own two paragraphs, verbatim, then a secondary `Button` "more about me" → `/about/`; the longer About-page version is drafted in `ABOUT.longSummary` for Stage 8), 02 `~/highlights` (29 figures), 03 `~/experience` (all 5 roles, every bullet), 04 `~/education` (incl. high school; rendered with `ExperienceItem` like experience: the degree as the title and one "Coursework included …" sentence, Stage 5 checkpoint), 05 `~/blog`, 06 `~/projects` (all 5), 07 `~/skills` (grouped, resume + LinkedIn top skills; a large `SpecTable` since the Stage 5 checkpoint). The `08 ~/credentials` section was removed at Jay's request; the data stays in `CREDENTIALS` (`src/data/pages.ts`) and only feeds JSON-LD `knowsLanguage`. A compact home page with "view more" toggles comes later (Appendix D). Data lives in `src/data/pages.ts` and `src/content/`.

### 4.3 Blog index `/blog/`
- H1 `~/blog` with subtitle `NEEDS INPUT: one line on what you write about` (default: hidden).
- Featured latest post: date, tag(s), title (larger), TL;DR (`summary`), reading time, `[medium]` marker.
- Filter row: `all` + tags (alphabetical), linking to tag pages.
- List: `YYYY-MM-DD  [tag]  Title` / TL;DR line / `[medium]` when `mediumUrl`.
- Empty state when there are 0 posts (same copy as home) + RSS link.

### 4.4 Blog post `/blog/<slug>/`
Fields: title, date, updated?, reading time, tags, summary (meta description and lead), Medium notice, TOC (conditional), body, prev/next, "← all posts". No author box (single author). Medium cross-post: notice text "Originally published on Medium" + link when canonical points to Medium.

### 4.5 Software projects (`/projects/`, `/projects/<slug>/`)
| slug | Title | Facts (from old site / resume only) | Links | Media |
|---|---|---|---|---|
| `newsapp-react` | NewsApp: React website | Responsive site in React + Node.js showing latest news by category from the New York Times and Guardian APIs; share via Facebook, X/Twitter, email; bookmarks in localStorage; async keyword search with autosuggest. Mar–May 2020. | GitHub `github.com/Matrix7689/NewsApp-React`; live `hw8react.appspot.com` (keep only if Stage 0 check is 2xx/3xx) | `cover.png` 800×600 |
| `newsapp-android` | NewsApp: Android app | Android app (Java and Kotlin) with Guardian API news and OpenWeatherMap weather for the user's location; bookmarks (SharedPreferences); Google Trends + MPAndroidChart keyword-trend graphs; Bing Autosuggest search. Mar–May 2020. | GitHub `github.com/Matrix7689/NewsApp-Android` | `cover.png` 800×800 |
| `halma-ai` | Halma game-playing agent | C++11 AI agent for Halma (16×16 board, 19 pieces per side); alpha-beta pruned minimax to 3-ply picks the best move. | GitHub `github.com/Matrix7689/Halma-AI` | video from `halma.gif` (480×480) |
| `mars-rover-search` | Mars rover path search (BFS / UCS / A*) | C++11 program that reads a terrain map, landing site, targets and rover limits, and finds the optimal safe path to each target over 8-neighbour moves using BFS, UCS and A*. | GitHub `github.com/Matrix7689/BFS-UCS-AStar` | video from `bfs.gif` (567×320) |

Years (Jay, Stage 3 checkpoint): Mars rover Sep 2019, Halma Nov 2019. Per project `NEEDS INPUT`: `role/course` context (likely USC courses; don't state it until confirmed). Screenshots beyond the existing covers: detail pages show "Screenshots coming soon." (N13).

### 4.6 About `/about/`
- **Long "about me"** (Stage 4 checkpoint): the About page carries the longer version; draft in `ABOUT.longSummary` (from LinkedIn), final text from Jay in Stage 8. The home page links here with "more about me".
- **Bio** (proposed, from old About text, re-centred on engineering): "I'm a software engineer on Amazon's Shopping Cart team in Seattle. Before Amazon I studied CS at USC, and before that I spent years designing 3D game levels and running gaming servers." (approved by Jay at the Stage 3 checkpoint with the last clause removed)
- **Education:** USC, MS Computer Science, Aug 2019 – May 2021, Los Angeles; coursework: Web Technologies, Analysis of Algorithms, Foundations of AI, 3-D Graphics and Rendering, Advanced Mobile Devices and Game Consoles. Dwarkadas J. Sanghvi College of Engineering (University of Mumbai), BE Information Technology, Aug 2015 – May 2019; coursework: Data Structures & Algorithm Analysis, Computer Graphics & VR, OOP, Image Processing, Web Programming. Jai Hind College, Mumbai, high school (Computer Science), Aug 2013 – May 2015 (added back at the Stage 4 checkpoint). (GPA hidden per Q6.)
- **Experience:** full timeline from §4.2.
- **Elsewhere (secondary):** level design → archive link; led a 7-week online 3D-modelling workshop for 500+ students; head of technical operations for 24+ gaming servers serving 100,000+ users; organised 32 eSports events (Jay, Stage 3 checkpoint).
- **Resume:** primary button "Download resume (PDF, 217 KB)" → `/Jay_Parekh_Resume.pdf`. Jay replaces the PDF himself later (N7); until then the existing file ships.
- **Headshot:** `NEEDS INPUT` (default: none; the old 177 px avatar is not reused).

### 4.7 Level Design archive (`/projects/level-design/`)
Intro (proposed): "Before software engineering, I designed custom multiplayer maps. This is the archive." (years removed at the Stage 4 checkpoint: LinkedIn shows map-making over 9 years, from at least 2015)
Stats (from the old site, `NEEDS INPUT: confirm or refresh; numbers are as of 2024`): `Fig 1. 55 maps` · `Fig 2. 1,052,075 downloads` · `Fig 3. 12,340,926 views` (old site figures; the resume rounds them to 50+ / 1M+ / 10M+).
Steam Workshop link: `https://steamcommunity.com/id/MatrixIN/myworkshopfiles/` (Q4). This page is the only place the Steam Workshop link appears (Jay, Stage 1 checkpoint): a visible link near the intro/stats, e.g. `Button` "Steam Workshop →". Stage 7 builds it.

| Order | slug | Title | Old folder | Images |
|---|---|---|---|---|
| 1 | `awp-lego-asia` | AWP Lego Asia | `awplegoasia` | 7 |
| 2 | `lcz-ctf-galaxy` | LCZ CTF Galaxy | `lczctfgalaxy` | 6 |
| 3 | `awp-lego-x` | AWP Lego X | `awplegox` | 5 |
| 4 | `awp-taj-heaven` | AWP Taj Heaven | `awptajheaven` | 5 |
| 5 | `awp-lego-fort` | AWP Lego Fort | `awplegofort` | 5 |
| 6 | `aim-devbeach` | AIM Devbeach | `aimdevbeach` | 4 |
| 7 | `aim-lego-ak` | AIM Lego AK | `aimlegoak` | 3 |
| 8 | `ar-industry` | AR Industry | `arindustry` | 6 |
| 9 | `awp-lego-2016` | AWP Lego 2016 | `awplego2016` | 5 |
| 10 | `awp-lego-2015` | AWP Lego 2015 | `awplego2015` | 6 |
| 11 | `awp-lego-z` | AWP Lego Z | `awplegoz` | 5 |
| 12 | `awp-tridust` | AWP Tridust | `awptridust` | 5 |

Per map (N10): game/engine, year, description, Steam Workshop URL and per-map stats are still to come. Jay chose placeholder text at the Stage 3 checkpoint: `description: Description coming soon.`; the other fields stay hidden.

### 4.8 404
`$ cd <requested-path>` / `bash: cd: <path>: No such file or directory` / links: `~/` `blog/` `projects/`.

### 4.9 Footer (all pages)
- Col 1: `AsciiWordmark` (`JP`, `aria-hidden`, plus visually hidden "Jay Parekh") + one muted line: "Software engineer. Writes about building things." (proposed).
- Col 2 `CONNECT`: GitHub, LinkedIn, Medium, Email (Jay, Stage 1 checkpoint: X, RSS, Monkeytype and Steam Workshop removed from the footer; Steam Workshop lives on the level-design archive, §4.7).
- Col 3 `SITE`: blog, projects, level design archive, about, resume.pdf; "back to top" (anchor link, no JS).
- Bottom bar: `Last updated on <Mon D, YYYY>` left (date of the latest git commit, build date as fallback, in a `<time datetime>`; Jay, Stage 1 checkpoint); `built with astro · 0 trackers` right (proposed).

### 4.10 Old-site content disposition
| Old item | Disposition |
|---|---|
| Rotating text "Jay, JP, Matrix7689", preloader, scroll mouse | Drop |
| "Matrix7689" handle | Keep only in the GitHub URL; not used as a display name |
| About stats: maps / downloads / views / eSports | Move to the level-design archive (§4.7) |
| Stats: lines of code, WPM, GitHub repos, coffee, sneakers, Spotify, ramen, video games | WPM, coffee, ramen, sneakers, video games and Spotify minutes return as home highlights (Jay, Stage 4 checkpoint); lines of code and GitHub repos stay dropped |
| Education & experience timeline | Reuse (§4.2, §4.6); drop high school |
| Works filter (All / Level Designs / Web Dev / AI / ML) | Replaced by Projects + archive |
| Tech-stack logos | Replaced by a text skills line |
| Social: Steam, Instagram, Spotify, Monkeytype | Steam → Steam Workshop link, on the level-design archive only; Monkeytype dropped (Stage 3 checkpoint); Instagram and Spotify dropped (Q4) |
| "Get in touch" mailto button | Email link in intro and footer |
| `Matrix_Completed_Games.txt` | Drop |
| `Jay_Parekh_Resume.pdf` | Keep at the same URL |

### 4.11 `NEEDS INPUT` register (canonical list)
| ID | Item | Default if not provided |
|---|---|---|
| N1 | ~~Medium profile URL / handle~~ **Filled (Stage 0):** `https://medium.com/@jay.parekh7689` | — |
| N2 | ~~Public email~~ **Filled (Stage 3):** jay.parekh7689@gmail.com, public | — |
| N3 | ~~Home one-liner approval~~ **Filled (Stage 4):** "I build and scale Amazon's shopping cart service." | — |
| N4 | ~~Bio approval~~ **Filled (Stage 3):** approved with the last clause removed | — |
| N5 | ~~Recent SDE II achievements~~ **Filled (Stage 3):** 9 bullets from Jay (§4.2) | — |
| N6 | ~~Current skills list~~ **Filled (Stage 3):** resume list approved | — |
| N7 | Updated resume PDF | Jay replaces it himself; existing PDF until then (no marker) |
| N8 | ~~Headshot~~ **Decided (Stage 3):** none | — |
| N9 | Project course context (years filled at Stage 3: Mars rover Sep 2019, Halma Nov 2019; Android is Java and Kotlin) | Hidden |
| N10 | Per-map game, year, description, workshop URL | **Stage 3:** placeholder "Description coming soon."; other fields hidden (no marker) |
| N11 | ~~Level-design stats; eSports count~~ **Filled (Stage 3):** keep old-site stats; 32 events | — |
| N12 | Blog subtitle | Hidden |
| N13 | Project screenshots beyond the existing covers | **Stage 3:** "Screenshots coming soon." on detail pages (no marker) |
| N14 | Credential details: issuer and year per certification, scholarship year, venue/year/link per publication | Titles only |
| N15 | Advanced text summarization: GitHub link; link to the "User-Based Text Summarization" publication? | No links |

---

## 5. Component spec

All components are `.astro`, render static HTML, use tokens only (no hard-coded colors) and have square corners and 1 px borders. "DS" = `docs/DesignSpec.md`.

| Component | Props / fields | States | DS reference |
|---|---|---|---|
| `Nav` | `current: 'home'\|'blog'\|'projects'\|'about'` | default, hover (inverted), active (inverted, `aria-current="page"`), focus-visible ring; mobile `<details>` open/closed; solid bg (no blur) | §1.4 Navigation |
| `ThemeToggle` | none | dark / light; `aria-pressed`, `aria-label="Toggle dark mode"`; works with JS only (hidden via `<noscript>` style when JS is off) | §1.1, §4 Palette |
| `Button` | `href`, `variant: 'primary'\|'secondary'`, `download?`, `arrow?=true` | hover (primary → transparent; arrow +4 px), focus ring, reduced-motion = no transition | §1.4 Buttons |
| `Badge` | `label` | static; 6 px square glyph | §1.4 Badge / eyebrow |
| `Tag` | `label`, `href?`, `active?` | default bordered 10–12 px muted; hover/active inverted | §1.4 Footer "tech stack" tags, §3.1 filter |
| `SectionHeader` | `number: '01'…`, `title` (prompt-style), `id` | ghost number at 8 % opacity (`aria-hidden`), hairline rule | §1.4 Section header |
| `SpecTable` | `label`, `rows: {label, value, href?}[]` | row hover tint; values may be links | §1.4 Spec table |
| `TerminalCard` | `title`, `variant: 'default'\|'inverted'`, slot | static; three square dots `aria-hidden` | §1.4 Terminal window card |
| `CommandBlock` | `command`, `title?`, `outputLinks?: {label, href}[]`, `cursor?=true` | copy button: idle → "copied" (aria-live) → idle after 2 s; no-JS = plain selectable text, button hidden | §2.1 command block, §4 Terminal motifs |
| `CodeBlock` (Shiki wrapper) | `lang`, code | same chrome as `TerminalCard` (lang as title); horizontal scroll inside; copy button | §4 Blog post page |
| `Figure` (stat) | `n`, `value`, `caption` | static, `Fig N.` prefix | §2.1 "Fig N." |
| `PostListItem` | `date`, `tags[]`, `title`, `summary`, `href`, `medium?: boolean`, `featured?` | hover: title underline + row tint; featured = larger title, extra spacing | §3.1 list entries, §4 Blog index |
| `FeaturedPost` | same as `PostListItem` + `readingTime` | — | §3.1 featured |
| `TagFilter` | `tags[]`, `active` | active inverted; `aria-current` | §3.1 category filter |
| `Toc` | `headings[]` | `<details>` open on ≥ 1024 px | §4 Blog post page |
| `PrevNext` | `prev?`, `next?` | missing side hidden | — |
| `ExperienceItem` | `company`, `title`, `team?`, `start`, `end?`, `location`, `bullets[]`, `limit?` | — | §1.4 Spec table, §4 Home order |
| `ProjectCard` | `title`, `summary`, `stack[]`, `year?`, `href`, `thumb?` | hover/focus: border → fg; thumb grayscale → color | §4 Home order, §4 Images |
| `ThumbGrid` / `ThumbCard` | `items: {title, year?, href, image}[]` | grayscale default; color on `:hover`/`:focus-visible`; 2/3/4 columns at 360/768/1200 px | §4 Images |
| `Gallery` | `images[]`, `title` | first eager; each links to `large` | §4 Images |
| `Img` | `src`, `alt`, `preset: 'thumb'\|'detail'`, `sizes`, `eager?`, `grayscale?` | — | §4 Images |
| `Video` | `mp4`, `webm`, `poster`, `label` | `controls`, `preload="none"`, no autoplay | §5 Hard constraints |
| `AsciiWordmark` | `text` | `aria-hidden`, real text in `<pre>`, ≤ 2 KB, 40 % opacity | §1.4 Footer, §6 |
| `Footer` | from `site.config.ts` | link arrow fades in on hover (CSS) | §1.4 Footer |
| `EmptyState` | `command`, `message`, `link?` | — | §4 Terminal motifs |
| `Seo` | `title`, `description`, `canonical`, `image?`, `type`, `jsonLd?` | — | — |

---

## 6. Quality gates

### 6.1 Performance budgets (`budgets.json`, enforced by `npm run check:budgets`)
"Initial" = gzip HTML + CSS + JS + eager images, **excluding fonts**. "Total" = initial + all lazy images on the page (excluding video, which is `preload="none"`).

| Page | Initial | Total |
|---|---|---|
| `/` | **< 50 KB** | ≤ 120 KB |
| `/blog/`, `/blog/tags/*` | ≤ 40 KB | ≤ 60 KB |
| `/blog/<post>/` | ≤ 60 KB | ≤ 400 KB |
| `/projects/` | ≤ 50 KB | ≤ 200 KB |
| `/projects/<slug>/` | ≤ 80 KB | ≤ 600 KB |
| `/projects/level-design/` | ≤ 60 KB | ≤ 450 KB |
| `/projects/level-design/<slug>/` | ≤ 120 KB | ≤ 1.2 MB |
| `/about/` | ≤ 40 KB | ≤ 100 KB |
| `/404` | ≤ 30 KB | ≤ 30 KB |

Global: CSS ≤ 12 KB gzip · JS ≤ 2 KB gzip per page · fonts ≤ 60 KB total, ≤ 2 files, 1 preload · thumb ≤ 30 KB · detail ≤ 150 KB · large ≤ 450 KB · any `dist` file ≤ 500 KB (allowlist: resume PDF) · 0 third-party requests · 0 raw originals.

Lighthouse (`lighthouserc.json`, mobile preset, 3 runs, median): Performance, Accessibility, Best Practices and SEO ≥ 0.95 on `/`, `/blog/`, `/projects/`, `/projects/halma-ai/`, `/projects/level-design/`, `/projects/level-design/awp-lego-asia/`, `/about/`, `/404.html`, one imported Medium post, plus one fixture post in the fixture build. Assertions: CLS ≤ 0.02, TBT ≤ 50 ms, LCP ≤ 2.0 s on `/`.

### 6.2 Accessibility checklist (WCAG 2.2 AA)
- [ ] `lang="en"`, skip link to `#main` as the first focusable element, landmarks (`header`, `nav`, `main`, `footer`).
- [ ] One `h1` per page; no skipped heading levels.
- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI borders that convey state) in **both** themes.
- [ ] Visible 2 px focus ring on every interactive element; no focus traps; logical tab order.
- [ ] All functionality works by keyboard (nav disclosure, toggle, copy, tag filter, gallery links).
- [ ] `prefers-reduced-motion`: no blinking, no transitions.
- [ ] Decorative ASCII and dots are `aria-hidden="true"`; any ASCII that conveys meaning has a text alternative.
- [ ] Every content image has meaningful `alt`; decorative images have `alt=""`.
- [ ] Links are distinguishable by more than color (underline on hover and focus at minimum; underline in prose always).
- [ ] Copy button announces "Copied" via `aria-live="polite"`.
- [ ] Theme toggle has an accessible name and `aria-pressed`.
- [ ] Target size ≥ 24 × 24 px for all controls (nav and toggle ≥ 44 × 44 px).
- [ ] Page usable at 200 % zoom and 320 px width with no horizontal scroll (except inside code blocks).
- [ ] Video has controls, no autoplay, and an adjacent text description.

### 6.3 Definition of done (Claude Code runs this itself)
```bash
npm ci
npm run verify                    # astro check, build, budgets, originals, html-validate, internal links
npm run lhci                      # all audited URLs ≥ 95 ×4 (mobile)
npm run build:fixtures && npm run check:budgets   # templates proven with content (fixtures + drafts)
npm run check:links:external      # report; GitHub/LinkedIn may rate-limit, review manually
npm run check:inputs -- --strict  # 0 visible NEEDS INPUT, or each accepted by Jay
npm run repo:size                 # packed repo growth vs Stage 0 baseline ≤ 5 MB
```
Plus the manual checks: keyboard walkthrough of every page type; both themes; 360 px and 1440 px; JS disabled (site fully readable, only toggle and copy missing).

**Post-deploy checks (Stage 11):** home loads over HTTPS; `/Jay_Parekh_Resume.pdf` is 200; `/works-2.html` redirects; `/rss.xml` and `/sitemap-index.xml` are 200; Lighthouse on the live home ≥ 95 ×4; `linkinator https://matrix7689.github.io/ --recurse` shows 0 internal broken links.

---

## Appendix A — Frontmatter and data schemas (illustrative)

```ts
// blog: src/content/blog/<yyyy>-<slug>.md
{
  title: string,                 // ≤ 90 chars
  date: Date,                    // publish date (YYYY-MM-DD)
  updated?: Date,
  summary: string,               // TL;DR, 40–160 chars; used as meta description
  tags: string[],                // 1–5, lowercase-kebab, e.g. ["distributed-systems"]
  draft: boolean = false,
  canonicalUrl?: URL,            // explicit override (D6)
  mediumUrl?: URL,               // set for cross-posts → shows [medium] marker
  cover?: image(),               // optional; never required
}

// projects: src/content/projects/<slug>.md  (body = detail page prose)
{
  title: string, summary: string /* ≤ 140 */, year?: number,
  stack: string[], context?: string /* course, team, role */,
  links: { github?: URL, live?: URL },
  cover?: image(), video?: { mp4: string, webm: string, poster: image() },
  featured: boolean = true, order: number,
}

// levels: src/content/levels/<slug>.md
{
  title: string, order: number, game?: string, year?: number,
  description?: string, workshopUrl?: URL,
  cover: image(),                // 0_main.jpg
  gallery: { src: image(), alt?: string }[],
}

// experience: src/content/experience/<id>.yaml
{
  company: string, title: string, team?: string,
  start: 'YYYY-MM', end?: 'YYYY-MM',   // omit = present
  location: string, bullets: string[],
  showOnHome: boolean, homeBulletLimit?: number, order: number,
}
```

## Appendix B — Directory tree
See §1.5. Generated or ignored: `dist/`, `.astro/`, `node_modules/`, `.lighthouseci/`.

## Appendix C — Command cheat sheet
| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server (drafts visible) |
| `npm run build` / `npm run preview` | Production build / serve `dist/` locally |
| `npm run verify` | Type check + build + all blocking checks |
| `npm run check:budgets` | Size budgets, image presets, JS/CSS caps, third-party guard |
| `npm run check:originals` | No raw `src/assets` file in `dist/` |
| `npm run check:html` / `check:links` / `check:links:external` | Validation and link checks |
| `npm run check:inputs [-- --strict]` | List or enforce `NEEDS INPUT` markers |
| `npm run lhci` | Lighthouse CI (mobile, 3 runs) on audited URLs |
| `npm run new:post -- "Title" --tags a,b [--medium URL]` | Scaffold a draft post |
| `npm run fonts:subset` | Regenerate subset woff2 |
| `npm run media:gifs` | Re-convert demo GIFs to MP4/WebM |
| `npm run og:default` | Regenerate the default OG image |
| `npm run inventory` / `npm run repo:size` | Old-site manifest / repo and dist size report |
| `npm run build:fixtures` | Build including draft fixtures (`cross-env INCLUDE_FIXTURES=1 SHOW_DRAFTS=1 astro build`); works in PowerShell and bash |

## Appendix D — Backlog (not in v1)
**Compact home page with "view more" toggles** (Jay, Stage 4 checkpoint: like a spoiler; native `<details>` keeps it JS-free) · Per-post generated OG images (satori, build-time) · automated Medium importer · search (Pagefind, lazy-loaded) · custom domain · `docs/DesignSpec.md` §2.2/§3.2 token refinements · pixel display font.
