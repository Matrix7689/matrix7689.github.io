# Overplanner: project addition

Date: Nov 11, 2026 · Branch: `revamp` (4 commits plus this report, **not pushed**) · Not a SPEC stage (Stage 9 not started) · **Done; waiting on Jay's review**

## Status
The Overplanner project page is built, verified and committed. It is `featured: false`, so the home page is unchanged. Two things need Jay's decision: the vibe-coded wording, and whether this project joins the home page (see "Open questions").

## Files changed
- `src/content/projects/overplanner.md` (new): summary (proposed, 125 chars), `year: 2026`, the stack from the brief, `context: "Personal project · self-hosted"`, `license: MIT`, `builtWith: Claude (vibe coded)`, `links.github` only (no `live`), `cover` plus a 5-image `gallery`, `featured: false`, `order: 6`. Body: intro, Features, How suggestions work, Your data, Phone capture, Importers, **How it was built**.
- `src/assets/projects/overplanner/` (new): `dashboard.png`, `task-editor.png`, `calendar.png`, `category-page.png`, `phone-capture.png`. These are copies; the originals in the Overplanner repo were not touched.
- `src/content.config.ts`: optional `license` and `builtWith` strings. `gallery` already existed from the Antariksh work and was reused unchanged.
- `src/pages/projects/[slug].astro`: a `License` row after Context and a `Built with` row last in the `SpecTable`. Both are hidden when unset, so the other six projects are unchanged.
- `lighthouserc.json`: added `/projects/overplanner/`.
- `SPEC.md` §4.5: new `overplanner` row, the note that the table has more than 4 rows, and the two new optional fields.

**Hard-coded counts or lists:** none needed changing. `/projects/`, prev/next and the home list render from the collection. There is no sitemap yet (Stage 9), and home and JSON-LD have no project count. `docs/inventory.md` and `docs/content-manifest.json` are Stage 0 snapshots of the old site and were left alone. SPEC §4.1 still says "all 4 by default" for the home list, which has been out of date since Stage 4; left as is.

## Vibe-coded disclosure
- `SpecTable`: **Built with: Claude (vibe coded)**.
- Body, last section, **How it was built**: "Vibe coded with Claude: the app was described in plain language and built through conversation, with Claude writing the code." Plain text at body size, not collapsed and not small print. Marked `(proposed)` in a frontmatter comment (counted by `check:inputs`).
- Checked in `dist/`: it appears on `/projects/overplanner/` only. It is not in that page's meta description, the `/projects/` card, or the home page.

## Verification
### `npm run verify`: exit 0
```
astro check: 84 files, 0 errors, 0 warnings
/                                 16.4 KB initial (<50)   JS 1.0 KB (unchanged)   91.2 KB total (<=120)
/projects/                         8.0 KB initial (<=50)  150.7 KB total (<=200)
/projects/overplanner/             8.6 KB initial (<=80)   99.8 KB total (<=600)
/projects/antariksh-mobile-game/   8.1 KB initial (<=80)  147.2 KB total (<=600)
all budgets pass, 0 third-party references
originals: 256 source files hashed, 1920 dist files checked (1834 images)
0 raw originals in dist/, 0 GIFs, every image <= 450 KB
internal link check: 70 seed pages, 1984 ok, 0 broken
```
Image outputs: thumb max 28.6 KB, detail max 145.8 KB, large max 224.4 KB, all inside their caps.

### `npm run lhci`: exit 0 (14 URLs, 3 runs each; Performance / Accessibility / Best Practices / SEO)
```
/projects/                             100/100/100/100 x3
/projects/overplanner/                 100/100/100/100 x3
every other audited URL                100/100/100/100 x3, except one run of
/projects/level-design/awp-taj-mahal/  99/100/100/100 (median 100; not touched by this work)
```

### Other checks
- **`npm run check:inputs`: 9** (was 7). The two new markers are in `overplanner.md` lines 3 and 4: the vibe-coded wording, and the repo-public confirmation. `NEEDS INPUT` appears in 0 files in `dist/`, so none is visible.
- **360 px:** no horizontal scroll on `/projects/overplanner/` or `/projects/` (scrollWidth = clientWidth = 360).
- **Phone image:** the source is 291 px wide. The widest shipped file is 291 px and it renders at 291 CSS px. Nothing is upscaled. The other four images' large links are at their source width (1844 to 1852 px, under the 1920 cap).
- **Page:** one h1, then h2s (Features, How suggestions work, Your data, Phone capture, Importers, How it was built); 5 images, each with alt text and a "view full size" link; no JS added, no embeds, no third-party host; no "Live demo" link.
- **Copy rules:** all 16 bullets start with a past-tense verb and are at most 24 words; no buzzwords; numbers exactly as given (28 snapshots, 6 hours, 7 fonts, 5 presets).

## Facts and sources
Source files are the Overplanner repo's, read-only. Per the access rules I did not run `git` there or open anything else.

| Fact on the page | Source |
|---|---|
| Self-hosted task and notes app, alternative to Google Keep; runs on the user's computer; plain JSON files; phone capture | `README.md` line 3; `docs/DETAILS.md` (data section) |
| Started Oct 2026, still in development; no version or date shown | Brief (first commit 2026-10-29 from the git log, which I was not allowed to read). The `package.json` version is deliberately not used |
| Stack: TypeScript, React, Vite, Tailwind CSS, Express, Zod, PWA | Brief; `package.json` confirms react 19, vite, tailwindcss 4, express 5, zod 4, zustand, radix-ui, fuse.js, typescript |
| **MIT** | **Brief only.** `README.md`, `package.json` and `docs/DETAILS.md` do not name a license, and I was not allowed to open the `LICENSE` file |
| Tasks, notes, checklists, pins; categories and lists | `README.md` Features; `CHANGELOG.md` (checklists and pinning, item editor) |
| Draggable dashboard, pie chart of open tasks per category | `README.md` Features; `CHANGELOG.md` 0.16.0 (pie chart) |
| Calendar, Results with progress charts, search across everything | `README.md` Features |
| Light and dark modes, 5 presets (Mocha, Orange, Teal, Deep Ocean, Forest), custom colors | `CHANGELOG.md` 0.21.0; `README.md` Features |
| Theme colors checked against WCAG AA | `CHANGELOG.md` (4.5:1 for text, 3:1 for the accent) |
| 7 fonts, 6 bundled so they work offline | `CHANGELOG.md` (Settings > Font); `package.json` lists six `@fontsource-variable` packages |
| Keyword rules first; optional TypeSafe AI, off unless a key is set; text is sent to that service; saving never waits, keyword fallback on failure or timeout | `README.md` "Smarter suggestions"; `docs/DETAILS.md` classification section |
| `data/` local and git-ignored; atomic writes (temp file, then rename); every read and write validated | `docs/DETAILS.md` |
| Backups every 6 hours to any folder incl. Google Drive for desktop; newest 28 kept by default | `docs/DETAILS.md` backup section; `README.md` |
| `/capture/` PWA, offline queue, one-way to the PC's Inbox, Android share menu, private over Tailscale | `docs/DETAILS.md` (capture section); `CHANGELOG.md` Phase 5; `README.md` |
| Importers for Google Keep (Takeout) and WhatsApp; dry run unless `--apply`; re-runnable without duplicates; secret scan | `CHANGELOG.md` 0.14.0; `README.md` |
| Vibe coded with Claude | Brief (Jay's required disclosure) |

Not on the page: no users, downloads, stars, metrics, version or last-updated date.

## Screenshots
I viewed all 11 myself. None shows a real name, email, file path, backup folder, API key, tailnet or PC name, or IP address. The names are demo names (Maya, Nora, Leo, Sam), and the backup bar shows only "Last backed up at Nov 9, 12:15 AM" with no folder.

**Used (5):**

| File | Source | Why |
|---|---|---|
| `dashboard.png` (cover, first in gallery) | `Screenshot_4.png` | Cover, per the brief |
| `task-editor.png` | `Screenshot_9.png` | Editor with checklist, due date and category |
| `calendar.png` | `Screenshot_8.png` | Calendar view (chosen over Results, below) |
| `category-page.png` | `Screenshot_1.png` | Fifth image: tasks, a done list and a pinned note on one page |
| `phone-capture.png` | `Screenshot_11.png` | The phone capture app (291 x 649, used at its real width) |

**Not used (6), all privacy-clean, left out for relevance:**
- `Screenshot_7.png` (Results): shows a "Streak: Definition pending" placeholder that has since been removed from the app, so it no longer matches the product.
- `Screenshot_3.png` (Settings): the one flagged for care. The captured top part shows only appearance, font and theme controls (no paths, keys or machine names), so it is safe, but it predates the theme presets and the new color hints.
- `Screenshot_6.png` (Search), `Screenshot_5.png` and `Screenshot_2.png` (Inbox, near-duplicates), `Screenshot_10.png` (Watch List): clean but add little. The Inbox ones show "Ask JEV", a product name the page does not otherwise explain.

**Gallery pattern:** the existing `ProjectGallery` renders every image at the `detail` preset, each linking to its build-made WebP, with no `thumb` variant. I reused it unchanged. The page is 99.8 KB total against the 600 KB budget, so no image had to be dropped or downsized.

## Repo visibility
`git ls-remote https://github.com/Matrix7689/overplanner.git` returned `HEAD` and `refs/heads/main` (32545c3…) without credentials, so the repo is public and the GitHub link works. Jay should still confirm it stays public (the marker on `overplanner.md` line 4).

## Repo-size delta
`npm run repo:size`, before and after the commits:
```
.git size-pack      55.40 MB -> 55.40 MB   (new objects are still loose)
.git loose objects  43.79 MB -> 45.23 MB   (+1.44 MB: five PNGs, 1.46 MB raw, plus text)
dist/               93.95 MB -> 94.58 MB   (+0.63 MB)
```
The growth is about 1.4 MB against the 5 MB gate. The working-tree line is not comparable between the two runs (it counts regenerated `.lighthouseci` and `.astro` output).

## Home page and featured
Nothing is capped: `src/pages/index.astro` lists every project with `featured: true`, and none of the existing ones sets `featured`, so the default (true) applies. **The home page currently shows all six:** Antariksh Mobile Game, NewsApp: React website, NewsApp: Android app, Halma game-playing agent, Mars rover path search and Advanced text summarization, in that order. Overplanner is `featured: false`, so it appears only on `/projects/` and its own page. I confirmed this by building before and after setting the flag: with the default it appeared as a seventh home card.

## Open questions for Jay
1. **Vibe-coded wording** (`(proposed)`): "Vibe coded with Claude: the app was described in plain language and built through conversation, with Claude writing the code." Approve or reword. The `Built with` row says "Claude (vibe coded)".
2. **Featured:** should Overplanner join the home page? The home already lists six, so it would be a seventh card, or you could drop one.
3. **Order:** I used `order: 6` as instructed, which puts it last. The project lists otherwise run newest to oldest, and Overplanner (2026) would be first on that rule. Say if you want `order: 0` (shifting the others) instead.
4. **Screenshots are older than the product:** the dashboard shot has the old "Due today" card and no pie chart, even though the page mentions the pie chart. If you want the cover to match the current dashboard, send a fresh capture.
5. **MIT:** confirmed only by the brief. Check that the repo's `LICENSE` file says MIT.
6. **Push:** nothing is pushed. `revamp` is ahead of `origin/revamp` by these commits. Say when to push `revamp`; `master` is untouched.
