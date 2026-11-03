# Stage 6 report: Projects and project detail pages

Date: Nov 3, 2026 · Branch: `revamp` · Status: **waiting at the human checkpoint**

## What changed

### `/projects/` (`src/pages/projects/index.astro`)
- H1 `~/projects` with one intro line (proposed): "Software projects first, then an archive of the multiplayer maps I designed." It is stored as `PROJECTS_PAGE.intro` in `src/data/pages.ts`.
- **01 `~/software`:** all 5 projects in `order` (5, not 4, since Q5 was reversed at the Stage 4 checkpoint) as `ProjectCard`s: title, summary, stack tags, year, and outbound links (GitHub, Live demo). Two columns from 64rem.
  - Each card's thumbnail is its `cover`, or its video poster when it has no cover (Halma, Mars rover). They are grayscale until the card is hovered or focused.
  - Advanced text summarization has no media and no links (N15).
- **02 `~/level-design`:** a teaser with `LEVEL_DESIGN.intro`, the stat line "55 maps · 1,052,075 downloads · 12,340,926 views", 3 grayscale map thumbs (the first 3 maps by order), and a secondary button "level design archive" → `/projects/level-design/` (built in Stage 7).

### `/projects/[slug]/` (`src/pages/projects/[slug].astro`), 5 pages
- "← all projects", the h1 title, and the summary as the lead.
- **`SpecTable` "Project":**
  - Type: "Software project" for all. The schema has no per-project type, so nothing more specific is stated.
  - Year, Stack.
  - Context: only when `context` is set; hidden for every project for now (N9).
  - Repository (`Matrix7689/<repo>`, linked) and Live demo (host, linked), when present.
  - From 64rem it sits in a sticky right column; on narrow screens it comes above the body.
- **Body:** the content file's Markdown, verbatim, with `[*]` bullets.
- **Media:**
  - `Video` for Halma and Mars rover (`controls`, `preload="none"`, poster, `aria-label="<title> demo"`, and a caption under it).
  - The cover at the `detail` preset for the two NewsApps (lazy).
  - Then "Screenshots coming soon." on every page (N13).
- **Links:** a primary "View on GitHub" button, plus a secondary "Live demo" button (NewsApp React only).
- **Prev/next by `order`:** "← previous project" / "next project →" (`PrevNext` gained `label`, `prevLabel` and `nextLabel` props; the blog defaults are unchanged).

### Supporting changes
- `src/content.config.ts`: `video.caption` (required). It is filled for both demos with what the recordings show:
  - Halma: "Demo recording (33 s, no audio) of a game on the 16×16 board: each side starts with its 19 pieces in opposite corners."
  - Mars rover: "Demo recording (9 s, no audio) of the rover on a terrain grid, with the start point, end point and solution path marked."
  - The lengths come from ffmpeg; the content from the posters.
- `Video.astro`: a new required `name` prop for the player's `aria-label`.
- `ProjectCard.astro`: an optional `links` prop. The links sit above the card's full-card link overlay so they stay clickable. The `→` glyph is used because `↗` is not in the font subset.
- `scripts/check-links.mjs`:
  - `/projects/` removed from `PENDING_ROUTES`; `/projects/level-design/` (Stage 7) and `/about/` (Stage 8) remain.
  - **Bug fix:** `check:links:external` skipped every local page, including the seeds, so it never reached an outbound link and always reported "0 ok". It now crawls the local pages and reports only third-party links. The site's own absolute URLs (canonicals, the curl line) are excluded because they point at the deployed copy.
- `lighthouserc.json`: added `/projects/` and `/projects/halma-ai/`.

## Verification

### `npm run verify`: exit 0
```
astro check  Result (69 files): 0 errors, 0 warnings, 0 hints
budgets      route                              html     css     js   initial  budget   total  budget
             /projects/                        5.1 KB  3.6 KB  0.9 KB   7.5 KB    ≤50  158.9 KB  ≤200
             /projects/advanced-text-summarization/ 3.8  3.6     0.9    6.3 KB    ≤80    6.3 KB  ≤600
             /projects/halma-ai/               4.2 KB  3.6 KB  0.9 KB  13.7 KB    ≤80   13.7 KB  ≤600
             /projects/mars-rover-search/      4.2 KB  3.6 KB  0.9 KB  15.4 KB    ≤80   15.4 KB  ≤600
             /projects/newsapp-android/        4.1 KB  3.6 KB  0.9 KB   6.6 KB    ≤80   46.7 KB  ≤600
             /projects/newsapp-react/          4.1 KB  3.6 KB  0.9 KB   6.6 KB    ≤80   57.4 KB  ≤600
             all budgets pass, 0 third-party references
originals    0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB
html         html-validate: no errors
links        internal link check: 23 seed pages, 152 ok, 0 broken
             pending routes (built in later stages, skipped): /about/, /projects/level-design/
```
The video files are `preload="none"` and are not counted, per §6.1. The Halma and Mars rover "initial" figures include the video poster.

### `npm run lhci`: all assertions pass (mobile, 3 runs per URL)
| URL | Perf / A11y / BP / SEO | LCP (ms) | CLS | TBT |
|---|---|---|---|---|
| `/` | 100 / 100 / 100 / 100 | 1361–1363 | 0.001 | 0 |
| `/blog/` | 100 / 100 / 100 / 100 | 1053–1355 | 0.000 | 0 |
| `/blog/critical-thinking-…/` | 100 / 100 / 100 / 100 | 1432–1433 | 0.000 | 0 |
| **`/projects/`** | **100 / 100 / 100 / 100** | 1058–1522 | ≤ 0.001 | 0 |
| **`/projects/halma-ai/`** | **100 / 100 / 100 / 100** | 1355–1358 | 0.000 | 0 |

### `npm run check:links:external` (report, after the fix)
```
ok     200 http://hw8react.appspot.com/
ok     200 https://github.com/Matrix7689
ok     200 https://github.com/Matrix7689/BFS-UCS-AStar
ok     200 https://github.com/Matrix7689/Halma-AI
ok     200 https://github.com/Matrix7689/NewsApp-Android
ok     200 https://github.com/Matrix7689/NewsApp-React
ok     200 https://steamcommunity.com/id/MatrixIN/myworkshopfiles/
ok     200 fortune.com, youtube.com ×2, x.com (blog post links)
BROKEN 404 https://kiro.dev/docs/specs/concepts/  (from blog/how-to-work-better-with-ai/)
external link check: 23 seed pages, 11 ok, 1 broken, 5 skipped
```
All four project repos and the NewsApp React live demo return 200. The one broken link is inside the imported Medium post "How to work better with AI". Its body is verbatim (D5), so it is reported to Jay rather than edited.

### Manual checks (built-in browser, `npm run preview`)
- **Video:** `preload="none"`, a poster, `aria-label="Halma game-playing agent demo"`, and the caption directly under it. Prev/next on Halma: "← previous project: NewsApp: Android app" and "next project →: Mars rover path search (BFS / UCS / A*)".
- **360 px:** `scrollWidth` 360 on `/projects/` and all 5 detail pages. Each page has exactly one h1, with no skipped heading levels (detail pages h1 → h2, index h1 → h2 → h3).
- **Map thumbs:** grayscale, and they load lazily (AVIF, 192 px rendered).
- **JS disabled:** these pages have no JS of their own (only the site-wide theme and loadTime scripts), so they read fully without it.

## Repo size (`npm run repo:size`)
```
.git size-pack      55.40 MB (609 objects)   Stage 0 baseline: 53 MB → +2.4 MB (videos in Stage 2, headshot sources)
working tree        280.79 MB (excl. .git, node_modules, dist)
dist/               3.56 MB in 133 files
```

## NEEDS INPUT: 7 markers (`npm run check:inputs`)
- N9 ×4: course or role context for Halma, Mars rover, NewsApp React and NewsApp Android. The Context row stays hidden until confirmed.
- N15: GitHub link for Advanced text summarization, and whether it is the work behind the "User-Based Text Summarization" publication.
- N12: blog subtitle.
- N14: credential details.

## Deviations from the spec
- **5 software projects, not 4:** Advanced text summarization was added at the Stage 4 checkpoint.
- **"Type" is "Software project" on every page:** the data has no per-project type, and a more specific label would be invented.
- **Video captions are new content fields:** they describe only what each recording shows.
- **`check:links:external` was broken since Stage 1** (it reported 0 ok) and is fixed here.

## Human checkpoint
Please review `/projects/` and the 5 detail pages (`npm run preview` → http://localhost:4321/projects/) and decide:
1. **Project copy:** the summaries, bodies, the `/projects/` intro line and the two video captions.
2. **NewsApp React live link:** `http://hw8react.appspot.com/` returns 200 today. It is plain `http://` (no HTTPS), and the app's page title is "CSCI 571 NewsApp". Keep it or drop it?
3. **Optional:** course context for N9, and N15 (summarization GitHub link and publication).
4. **Optional:** the broken kiro.dev link in "How to work better with AI": fix it to a current URL, or leave it as published on Medium.

## Checkpoint decisions (Nov 3, 2026)
- **NewsApp React live link: keep** (Jay). `http://hw8react.appspot.com/` stays on the card and on the detail page (Live demo row and button).
