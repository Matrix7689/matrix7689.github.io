# Stage 7 report: Level Design archive

Date: Nov 3, 2026 · Branch: `revamp` · Status: **waiting at the human checkpoint**

## What changed

### `/projects/level-design/` (`src/pages/projects/level-design/index.astro`)
- "← all projects", the h1 `~/level-design`, and `LEVEL_DESIGN.intro` ("Before software engineering, I designed custom multiplayer maps. This is the archive.").
- **Stats:** three `Figure`s: 55 maps, 1,052,075 downloads, 12,340,926 views. They have no "Fig N." prefix, matching Jay's removal of it from every home card at the Stage 4 checkpoint (SPEC §4.7 updated).
- **Steam Workshop:** a primary `Button` "Steam Workshop" → `SITE.links.steamWorkshop`, the only place on the site that link appears (§4.7, Q4).
- **"12 maps":** a `ThumbGrid` in the old-site order (`order` 1–12).
  - Each `ThumbCard` is one link with a grayscale `thumb` image and the map name.
  - The year is hidden because no map has one yet. N10 says unknown fields are hidden with no marker, which overrides the "(or NEEDS INPUT)" wording in task 1.
  - Hover and `:focus-visible` restore colour (the `base.css` `a:hover/.img-gray` rule, with the transition off under reduced motion) and darken the border.

### `/projects/level-design/[slug]/`, 12 pages
- "← level design archive", the h1 title, and the description ("Description coming soon.", N10).
- **`SpecTable` "Map":**
  - Game, Year and Workshop appear only when set; none are set yet.
  - Type: "Custom multiplayer map", from the intro's wording.
  - Images: the number of screenshots.
- **`Gallery`:** every screenshot at the `detail` preset. The first is eager (`fetchpriority="high"`, `data-eager`) and the rest are lazy.
  - Each image is wrapped in a link to its build-made 1920 px WebP (`largeUrl`), labelled "view full size →". It opens in the same tab, with no JS and no lightbox.
  - Alt text follows task 3: "AWP Lego Asia — screenshot 1 of 7".
- Prev/next map by `order` ("← previous map" / "next map →"), using the generalised `PrevNext`.

### New components
`ThumbCard.astro`, `ThumbGrid.astro` (2 / 3 / 4 columns at 360 / 768 / 1200 px) and `Gallery.astro`.

### Other changes
- **Footer:** the "level design archive" link is left off on the home page only (`Footer` now takes `current` from `Base`).
  - Stage 7 requires 0 archive links on `/`, and the footer appears on `/`.
  - Every other page still has the footer link, and `/projects/` links to the archive from its teaser.
  - SPEC §4.9 is updated. Jay can reverse this if the footer link on home is fine.
- **Detail preset AVIF quality 55 → 52** (`src/lib/image-presets.ts`).
  - With 55, LCZ CTF Galaxy's eager first screenshot (1280 px AVIF, 113.6 KB) put that page at 120.1 KB initial, over its ≤ 120 KB budget.
  - At 52 it is 100.4 KB, and every map page now has ≥ 13 KB of headroom.
  - A higher AVIF effort was tried first and made files slightly larger (effort 4: 113.6 KB, 6: 114.8 KB, 8: 115.9 KB).
  - This also applies to blog and project images. Jay approved the Stage 2 settings, so please eyeball a map page.
- **`AsciiWordmark`: 11 px → 12 px.**
  - Lighthouse Best Practices was 96 on both archive URLs: "Document doesn't use legible font sizes".
  - The footer wordmark's box-drawing characters were 62–70 % of the text on these text-light pages, at 11 px.
  - At 12 px (Lighthouse's floor) both pages score 100.
- `scripts/check-links.mjs`: `/projects/level-design/` removed from `PENDING_ROUTES`; only `/about/` (Stage 8) is left.
- `lighthouserc.json`: added `/projects/level-design/` and `/projects/level-design/awp-lego-asia/`.

## Verification

### `npm run verify`: exit 0
```
route                                   html     css     js   initial  budget   total   budget
/projects/level-design/                4.6 KB  3.3 KB  0.9 KB   7.0 KB    ≤60  275.9 KB   ≤450
/projects/level-design/aim-devbeach/   3.8 KB  3.2 KB  0.9 KB  43.6 KB   ≤120  149.2 KB  ≤1200
/projects/level-design/aim-lego-ak/    3.7 KB  3.2 KB  0.9 KB  73.0 KB   ≤120  188.4 KB  ≤1200
/projects/level-design/ar-industry/    4.0 KB  3.2 KB  0.9 KB  83.6 KB   ≤120  335.7 KB  ≤1200
/projects/level-design/awp-lego-2015/  4.0 KB  3.2 KB  0.9 KB  94.4 KB   ≤120  424.1 KB  ≤1200
/projects/level-design/awp-lego-2016/  3.9 KB  3.2 KB  0.9 KB  81.0 KB   ≤120  317.5 KB  ≤1200
/projects/level-design/awp-lego-asia/  4.1 KB  3.2 KB  0.9 KB  85.1 KB   ≤120  442.1 KB  ≤1200
/projects/level-design/awp-lego-fort/  3.9 KB  3.2 KB  0.9 KB  76.9 KB   ≤120  358.5 KB  ≤1200
/projects/level-design/awp-lego-x/     3.9 KB  3.2 KB  0.9 KB  79.3 KB   ≤120  321.5 KB  ≤1200
/projects/level-design/awp-lego-z/     3.9 KB  3.2 KB  0.9 KB  73.3 KB   ≤120  335.3 KB  ≤1200
/projects/level-design/awp-taj-heaven/ 3.9 KB  3.2 KB  0.9 KB  45.2 KB   ≤120  194.1 KB  ≤1200
/projects/level-design/awp-tridust/    3.9 KB  3.2 KB  0.9 KB  67.9 KB   ≤120  225.7 KB  ≤1200
/projects/level-design/lcz-ctf-galaxy/ 4.0 KB  3.2 KB  0.9 KB 106.9 KB   ≤120  477.6 KB  ≤1200
image outputs by preset: thumb 102 files (max 29.0 KB) · detail 393 files (max 125.6 KB) · large ≤ 450 KB
all budgets pass, 0 third-party references
0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB
html-validate: no errors
internal link check: 36 seed pages, 643 ok, 0 broken · pending: /about/
```
The budget figures are worst case: each image is counted at its heaviest candidate (the 1280 px AVIF), as a high-DPR phone could fetch.

### Acceptance checks
- **Full-size links:** 62 links across the 12 map pages (7+6+5+5+5+4+3+6+5+6+5+5). All are `.webp`; the largest is 365.8 KB, and none exceed 450 KB. `check:originals` reports 0 raw JPEGs in `dist/`.
- **Home links:** `grep 'href="/projects/level-design/' dist/index.html` returns **0**. `/blog/` still has the footer link (1).
- **Keyboard:** Tab from the Steam Workshop button lands on the first map card. It shows the 2 px focus ring (`:focus-visible`) and the thumbnail turns colour (confirmed in a screenshot).
- **Map page (`awp-lego-asia`):** 7 images, loading `eager,lazy,lazy,lazy,lazy,lazy,lazy`. Rows: "Type: Custom multiplayer map", "Images: 7". The first page has only "next map → LCZ CTF Galaxy", so the missing side is hidden.
- **360 px:** no horizontal scroll on the index and all 12 map pages. Each has one h1, with no skipped heading levels.

### `npm run lhci`: all assertions pass (mobile, 3 runs per URL)
| URL | Perf / A11y / BP / SEO | LCP (ms) | CLS | TBT |
|---|---|---|---|---|
| `/` | 100 / 100 / 100 / 100 | 1354–1362 | 0.001 | 0 |
| `/blog/` | 100 / 100 / 100 / 100 | 1056–1358 | 0.000 | 0 |
| `/blog/critical-thinking-…/` | 100 / 100 / 100 / 100 | 1431–1433 | 0.000 | 0 |
| `/projects/` | 100 / 100 / 100 / 100 | 1511–1516 | 0.001 | 0 |
| `/projects/halma-ai/` | 100 / 100 / 100 / 100 | 1357–1365 | 0.000 | 0 |
| **`/projects/level-design/`** | **100 / 100 / 100 / 100** | 1210–1513 | 0.000 | 0 |
| **`/projects/level-design/awp-lego-asia/`** | **100 / 100 / 100 / 100** | 1367–1884 | 0.000 | 0 |

The first run, before the wordmark change, scored 100 / 100 / **96** / 100 on both archive URLs (font-size audit), which already passed the ≥ 95 gate.

## Repo size (`npm run repo:size`)
```
.git size-pack   55.40 MB (no change: no new binary sources this stage)
dist/            31.53 MB in 611 files (was 3.56 MB; adds 393 detail outputs and 62 large WebPs)
```
`dist/` stays well under the 100 MB line from Stage 2 task 7, so no LFS or external storage is needed.

## NEEDS INPUT: 7 markers (unchanged)
N9 ×4, N12, N14 and N15. Per-map data (N10) is deliberately unmarked: placeholders as Jay chose at Stage 3.

## Deviations from the spec
- **No "Fig N." prefix** on the archive stats (Jay's home-page preference applied here too).
- **No year or `NEEDS INPUT` on cards:** N10 hides unknown fields.
- **Footer archive link hidden on `/` only,** to meet the "0 archive links on home" criterion.
- **Detail AVIF quality 55 → 52** and **wordmark 11 → 12 px** (both explained above).

## Human checkpoint
Please review the archive (`npm run preview` → http://localhost:4321/projects/level-design/) and decide:
1. **Per-map details (N10), optional:** game, year, description and Steam Workshop URL for any maps you know. Anything left blank stays hidden. Descriptions currently read "Description coming soon."
2. **Image quality:** open a map page and a "view full size" link to check that the slightly lower AVIF quality looks fine.
3. **Footer on the home page:** keep the archive link hidden there, or show it everywhere?
4. **Approve the archive.**

## Slideshow on map pages (checkpoint feedback, Nov 3, 2026)

Jay asked for a slideshow with play/pause, next and previous. That needs JavaScript, which the hard rules and Stage 7's "out of scope: carousel, any JS" excluded. Jay chose the small-script option, now recorded as **SPEC D9(d)** and in CLAUDE.md's allowed-JS list.

- **`Gallery.astro`:**
  - The markup is unchanged: a stacked list of screenshots, each linking to its 1920 px WebP. Without JS, visitors get exactly that.
  - A ~1 KB gzip inline script adds `.is-slideshow`, which shows one slide at a time, and reveals the hidden control bar: `←` (previous), `pause`/`play`, `→` (next), and an `N / M` counter. Buttons are 44 px targets with accessible names ("Previous screenshot", "Pause slideshow" / "Play slideshow", "Next screenshot").
  - **Autoplay** advances every 5 s. It is **off when `prefers-reduced-motion: reduce`** (the button then starts as "play"), and it holds while the slideshow is hovered or has focus. A manual move restarts the 5 s timer.
  - **Keyboard:** ← / → keys move between slides when focus is inside the slideshow.
  - **Screen readers:** the counter is `aria-live="polite"` while paused and `off` while playing, so autoplay ticks aren't announced.
  - **Loading:** slides stay `loading="lazy"`. The script switches the next slide to `eager` just before it is needed, so a visitor downloads only what they view, plus one ahead.
- **Tested with real clicks in the built-in browser** (`awp-lego-asia`):
  - The page loaded at 1 / 7 and autoplay reached 2 / 7 on its own.
  - Next → 5 / 7 (autoplay had reached 4).
  - Pause → the label became "play", `aria-label` became "Play slideshow" and the counter became `aria-live="polite"`.
  - Previous ×3 → 2 / 7; ArrowRight → 3 / 7. It stayed at 3 / 7 after 6 s while paused.
  - At 375 px the bar fits (no horizontal scroll) with 44 px buttons.
- **Checks:**
  - `npm run verify` exits 0. Map pages carry 1.7 KB gzip of JS (cap 2 KB); `awp-lego-asia` is 86.1 KB initial and `lcz-ctf-galaxy` 107.9 KB (≤ 120).
  - Lighthouse on `/projects/level-design/awp-lego-asia/`: 100 / 100 / 100 / 100 in two runs and 98 / 100 / 100 / 100 in one (median 100). CLS is 0.000 and TBT 0 on every audited URL; every other URL is still 100 ×4.

### Crossfade and duration slider (follow-up, Jay)

- **Crossfade instead of a hard cut:**
  - In slideshow mode the slides share one grid cell. The new slide fades in on top (`@keyframes ss-in`, opacity 0 → 1, ease-out) while the previous slide stays displayed underneath; the previous one is hidden once the fade is done.
  - Only those two slides are ever displayed, so lazy loading still fetches just what is viewed. The next 2 slides are switched to `eager` ahead of time, so fast speeds don't show blank frames.
  - The fade lasts `min(600 ms, 60 % of the duration)`: 300 ms at 0.5 s.
  - `base.css` turns all animation off under `prefers-reduced-motion: reduce`, so those visitors get an instant swap (and no autoplay).
- **Fixed 16:9 frame:** 5 of the 62 screenshots are square (1024×1024, 1083×1080), so slides use `aspect-ratio: 16 / 9; object-fit: contain` on the card background. The controls don't jump between slides.
- **Duration slider:** `every [——●——] 3.0 s`, a native `<input type="range">` from 0.5 to 5 s in 0.5 s steps, default 3 s (was a fixed 5 s).
  - It has the accessible name "Seconds per screenshot" and an `aria-valuetext` like "3 seconds"; an `<output>` shows the value.
  - Changing it restarts the timer. The arrow keys adjust the slider when it has focus, instead of changing the slide.
- **Size:** script comments moved to the component's frontmatter, so the page's JS stays at **1.9 KB gzip** (cap 2 KB).
- **Tested in the built-in browser:**
  - The pane was hidden, which freezes CSS animation clocks, so the fade was checked by stepping the animation: 0 / 150 / 300 / 450 / 600 ms → opacity 0.00 / 0.38 / 0.68 / 0.91 / 1.00. The leaving slide stayed displayed beneath (z-index 1 for the current slide).
  - Slider: at 0.5 s, 2.1 s of autoplay moved 4 slides (5 → 2 via wrap); the output read "0.5 s", `aria-valuetext` "0.5 seconds" and the fade 300 ms. At 5 s the fade is 600 ms.
  - ArrowLeft ×2 on the focused slider: 5.0 → 4.0 s, with the slide unchanged.
  - At 375 px the bar wraps to two rows with no horizontal scroll.
- **Checks:** `npm run verify` exits 0 (html-validate caught a `<label>` wrapping both the range and the `<output>`; the wrapper is now a `<div>`). Lighthouse is 100 / 100 / 100 / 100 on all 7 audited URLs, with CLS ≤ 0.001 and TBT 0.


---

# Stage 7 revision: 43 maps from the master data (Nov 3, 2026)

Brief: expand the archive from 12 to 43 maps from `gambanana assets\master-spec-table.json`, compute stats from the data, and keep every budget and rule.

## Preflight
- Stages 0–7 reports exist, so this is a revision of Stage 7.
- `C:\Jay Data\portfolio revamp\gambanana assets\images\` holds **437 files** in **43 map folders**, so no download was needed.
- **Master data check:** 43 maps (21 CS:GO, 22 CS:Source; 28 GameBanana-only, 7 Steam-only, 8 on both).
  - Every map's `dl` equals `gb_dl + st_subs`, and every `views` equals `gb_views + st_vis` (0 mismatches).
  - All 12 original slugs are present.
  - All release dates are `YYYY-MM-DD`.
- `master-spec-table.json` was copied to `docs/data/level-design-master.json` and is byte-identical (`cmp`). Its values were not edited.

## What changed
- **`scripts/import-levels.mjs`** (`npm run import:levels`, Node ESM; `--dry-run` measures without writing):
  - Generates all 43 `src/content/levels/<slug>.md` from the master copy. Titles are the raw map names (`awp_lego_asia`, `$2000$_new`, `Awp_LeetGamerz`).
  - Each file gets game, `released`, `downloads`, `views`, `platforms {gamebanana, steam}` and per-platform `stats`. Empty fields are omitted, and no descriptions are written.
  - **The 12 originals** keep their existing image files and gallery order and `order` 1–12.
  - **The other 31** are ordered by game (CS:GO, then CS:Source), newest first (`order` 13–43). Each gets up to 6 screenshots: cover first, then source order, GameBanana `NN.jpg` before Steam `steam-NN.jpg`. They are resized to max 1920 px wide at JPEG q82 (mozjpeg).
  - **Detail-cap guard:** each candidate is encoded at the site's own detail preset (largest width, every format, the same encoder options as `astro.config.mjs`). One that would exceed `budgets.json`'s 150 KB detail cap is skipped for the next source image.
    - This caught `gg-twotowers/06.jpg` (WebP 164.5 KB, JPEG 158.8 KB) and `cs-dustyindia/02.jpg` (JPEG 152.0 KB).
    - Neither map has a 7th source image, so both have 5 screenshots. No cap was loosened.
- **Schema (`src/content.config.ts`):** `game`, `released` (date), `downloads`, `views`, `platforms` (at least one link) and optional `stats.gamebanana {downloads, views}` / `stats.steam {subscribers, visitors, favorites}`. `cover` and `gallery` still use `image()`, so a missing file fails the build. `year` and `workshopUrl` are removed.
- **`src/lib/levels.ts`:** `getMaps()`, `totals()` (computed at build time), `fmt()` and `isoDay()` (UTC).
- **Archive index:**
  - Intro and the Steam Workshop profile link, as before.
  - Three Figures **computed from the data**: **43 maps · 1,009,476 downloads · 1,346,104 views**. A footnote reads "As of 2026-11-03. Downloads are GameBanana downloads plus Steam Workshop current subscribers; views are GameBanana views plus Steam Workshop unique visitors."
  - "12 featured maps": the grayscale `ThumbGrid` of the originals, now with release years.
  - "31 more maps": two static text tables, **CS:GO (9)** and **CS:Source (22)**, newest first. Columns: Map (link), Released, Downloads, Views. No thumbnails. Each table scrolls inside its own box on narrow screens.
- **Map pages (43):**
  - `SpecTable` "Map": Game, Released, Downloads, Views, Platform(s) (GameBanana and/or Steam Workshop links, through a new multi-link `SpecTable` row), Images.
  - The 8 maps on both platforms also get a "By platform" table: GameBanana downloads and views, plus Steam subscribers, unique visitors and favorites.
  - The meta description now names the game and release date.
  - The descriptions are hidden: "Description coming soon." is no longer shown.
- **`/projects/` teaser:** the stat line now uses the computed totals.
- **Slideshow fix:** the first slide no longer fades in on page load. Only slides shown by a change fade (`is-in`).
- **`lighthouserc.json`:** added `/projects/level-design/lcz-ctf-galaxy/` and `/projects/level-design/aim-lego-ak/`; `awp-lego-asia` is kept.

## Verification

### `npm run verify`: exit 0
```
astro check   0 errors
/projects/                  initial   7.5 KB (≤50)   total 158.9 KB (≤200)
/projects/level-design/     initial   8.8 KB (≤60)   total 277.7 KB (≤450)
map pages (43)              initial  27.3 KB (fy_buzzkill_css_redone) … 109.9 KB (gg_twotowers), all ≤120
                            total   141.1 KB … 479.3 KB (lcz_ctf_galaxy), all ≤1200
images by preset            thumb 102 files (max 29.0 KB ≤30) · detail 1431 files (max 145.8 KB ≤150)
all budgets pass, 0 third-party references
0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB
html-validate: no errors
internal link check: 67 seed pages, 1920 ok, 0 broken · pending: /about/
```
All budgets pass at their SPEC §6.1 values; none were changed.

### `npm run lhci`: all assertions pass (mobile, 3 runs per URL), 9 URLs
| URL | Perf / A11y / BP / SEO (3 runs) |
|---|---|
| `/`, `/blog/`, `/blog/critical-thinking-…/`, `/projects/`, `/projects/halma-ai/` | 100 / 100 / 100 / 100 |
| `/projects/level-design/` | 100 / 100 / 100 / 100 |
| `/projects/level-design/lcz-ctf-galaxy/` (both platforms) | 100 / 100 / 100 / 100 |
| `/projects/level-design/aim-lego-ak/` (Steam only) | 100 / 100 / 100 / 100 |
| `/projects/level-design/awp-lego-asia/` | 100 / 100 / 100 / 100 |

CLS ≤ 0.001 and TBT 0 everywhere. LCP on the map pages is 1.5–1.7 s.

### Other done-criteria
- `npm run check:inputs`: **7** markers, unchanged. A comment I wrote briefly contained the marker text (8); it was reworded before committing.
- `grep -o 'href="/projects/level-design/' dist/index.html | wc -l` → **0**.
- **360 px:** `scrollWidth` 360 on the archive, `lcz-ctf-galaxy`, `aim-lego-ak`, `2000-new` and `/projects/`.
  - The first check found the archive at 504 px: grid items don't shrink below their tables by default. Fixed with `min-width: 0`.
  - The tables now scroll inside their boxes (326 of 457 / 486 px visible).
- **Browser checks:**
  - Archive: Figures 43 / 1,009,476 / 1,346,104, the footnote, 12 cards ("awp_lego_asia 2015" …), CS:GO 9 rows (first `am_devbeach 2017-02-13 1,119 1,289`) and CS:Source 22 rows (first `awp_lego_2015_css 2015-04-09 7,916 19,502`).
  - `lcz-ctf-galaxy`: Map table (26,053 downloads, 43,405 views, GameBanana · Steam Workshop links) and By-platform table (1,047 / 6,080 / 25,006 / 37,325 / 311).
  - `aim-lego-ak`: "Platform: Steam Workshop" only, with no breakdown, and the first slide at opacity 1 on load.

## Repo size (`npm run repo:size`, `git count-objects -vH`)
```
before   size-pack 55.40 MB · loose  1.73 MB
after    size-pack 55.40 MB · loose 40.45 MB  (new commits not yet repacked)
growth   about +38.7 MB of new objects (177 JPEG screenshots, 38.87 MB on disk; JPEG does not recompress)
dist/    95.15 MB in 1857 files (was 31.53 MB)
```
The dry run predicted 179 images / 39.57 MB before anything was written, under the 50 MB guard, so the import went ahead; the cap guard then dropped 2. `dist/` is now close to the 100 MB line from Stage 2 task 7 (GitHub Pages allows 1 GB). Adding more maps or images would cross it.

## Deviations from SPEC (SPEC.md updated: §4.7, §4.11 N10/N11, §6.1 audited URLs)
1. **The archive has 43 maps, not 12.** The 12 old-site maps keep their slugs, images and order.
2. **Titles are the raw map names** (`awp_lego_asia`), as the brief asks, instead of "AWP Lego Asia".
3. **Stats are computed from the data** (43 · 1,009,476 · 1,346,104, as of 2026-11-03). The old-site 55 / 1,052,075 / 12,340,926 figures are retired from the archive.
4. **Only the 12 originals get thumbnails;** the other 31 are text tables. This keeps the index inside the budget written for 12 thumbnails.
5. **Map pages show "Platform(s)" and "By platform"** instead of the old "Workshop" row; "Type: Custom multiplayer map" is replaced by the data's Game row.
6. **2 maps have 5 screenshots instead of 6** (the detail-cap guard above).
7. **Descriptions are hidden:** the Stage 3 "Description coming soon." placeholder is gone.

## Not changed, for Jay to decide
- **Home page highlights** still say "55 maps · 1,052,075 downloads · 12,340,926 views" (Map making group, `HOME.highlights`). The Drag2Death role bullet still says "50 maps with 10 million views and 1 million downloads" (LinkedIn wording).
  - The brief retires the old figures for the archive. These two are approved home copy, so they were left as they are.
  - Should they switch to the computed totals, or stay?

## Remaining NEEDS INPUT (7, unchanged)
N9 ×4 (project course context), N12 (blog subtitle), N14 (credential details), N15 (summarization link). Per-map descriptions are hidden with no markers.

## Human checkpoint
Please review the archive (`npm run preview` → http://localhost:4321/projects/level-design/):
1. **Approve** the 43-map archive, the computed stats and their footnote, and the text tables.
2. **Home page highlights and the Drag2Death bullet:** keep the old figures, or switch to the computed totals?
3. **Open questions from earlier in Stage 7:** does the detail AVIF quality look fine, and should the footer archive link stay off the home page?
