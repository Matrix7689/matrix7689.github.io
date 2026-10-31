# Stage 1 report: scaffold, design system and quality tooling

Date: 2026-10-31 · Branch: `revamp` · Status: **`npm run verify` exits 0; waiting at the human checkpoint**

## What changed

| Area | Result |
|---|---|
| Old site | Removed from `revamp` with `git rm`: `index.html`, `works-2.html`, `css/`, `js/`, `fonts/`, `webfonts/`, `Matrix_Completed_Games.txt`, `images/blog/`, tech logos, avatars, dots, maps, sneaker/noodle icons, old favicon. `Jay_Parekh_Resume.pdf` → `public/` with `git mv`. `images/works/` is untouched (Stage 2). Everything is still on `legacy-2024`. |
| Inventory | `scripts/inventory.mjs` now reads pages and images straight from `legacy-2024` with `git show`, so `npm run inventory` keeps working after the old files are gone. |
| Astro | `astro@7.4.4`, static output, `site` from `SITE_URL` (default `https://matrix7689.github.io`) in `astro.config.mjs` only, `trailingSlash: 'ignore'`, `build.format: 'directory'`, `inlineStylesheets: 'auto'`, dev toolbar off. TypeScript strict (`astro/tsconfigs/strict`). `.nvmrc` = `24`. |
| `src/site.config.ts` | Name, role, tagline, email, resume path, links (GitHub, LinkedIn, X, Medium, Monkeytype, Steam Workshop), `preferMediumCanonical: true`, `wordmark: 'JP'`, nav items. |
| Tokens | `src/styles/tokens.css`: **light is the default** (`:root, [data-theme='light']`), dark on `[data-theme='dark']`. Radius 0, 10/12/14/16 px UI scale, hero `clamp(3rem … 8rem)`, container 80rem, gutter 16/32 px, prose 72ch, 44 px tap size. |
| Base CSS | `src/styles/base.css`: reset, `@font-face` ×2 (`font-display: swap`), mono body, `::selection` inversion, 4 px scrollbar, 2 px `:focus-visible` ring, `.visually-hidden`, skip link, blinking cursor inside `prefers-reduced-motion: no-preference`, global kill switch under `reduce`. |
| Fonts | `scripts/subset-fonts.mjs` (`npm run fonts:subset`) → `public/fonts/geist-mono-400.woff2` (23.8 KB) and `-700.woff2` (24.4 KB). Source: `geist@1.9.0` npm package, recorded with the OFL text in `public/fonts/LICENSE.txt`. One preload (400). |
| Icons | `public/favicon.svg` (pixel "JP", shapes only) → `favicon-32.png`, `apple-touch-icon.png` via `scripts/favicons.mjs` (`npm run icons`). |
| Layouts | `Base.astro` (head stub, inline theme init, `<noscript>` hides the toggle, skip link, header, `main#main`, footer), `Page.astro` (prose width). |
| Components | `Nav`, `ThemeToggle`, `Footer`, `AsciiWordmark`, `Button`, `Badge`, `Tag`, `SectionHeader`, `TerminalCard`, `SpecTable`, `CommandBlock` (copy button), `Figure`, `EmptyState`. Tokens only, square corners, 1 px borders. |
| Pages | Temporary `/`; hidden `/_styleguide/` (`noindex`) rendering every component in both themes side by side, with a live contrast table computed from `tokens.css`. |
| Tooling | `budgets.json` + `scripts/check-budgets.mjs` (initial/total/CSS/JS/font budgets, 500 KB file cap, third-party guard), `.htmlvalidate.json` + `check:html`, `scripts/check-links.mjs` (`check:links`, `check:links:external`), `scripts/check-inputs.mjs` (`check:inputs [-- --strict]`), `verify`, `build:fixtures`. |

## Verification output

`npm run verify` → **exit 0**
```
astro check     Result (28 files): 0 errors, 0 warnings, 0 hints
astro build     2 page(s) built

check:budgets   (gzip level 6; images raw; site origin https://matrix7689.github.io)
route                                html      css       js    initial   budget      total   budget     fonts
/                                  2.0 KB   2.6 KB   0.4 KB     4.3 KB      <50     4.3 KB     ≤120   48.1 KB
/_styleguide/                      4.2 KB   3.9 KB   0.7 KB     8.0 KB      ≤80     8.0 KB     ≤200   48.1 KB
fonts: 2 files, 48.1 KB (cap 60 KB, 30 KB each); largest file cap 500 KB
all budgets pass, 0 third-party references

check:html      html-validate "dist/**/*.html"  → no problems

check:links     internal link check: 2 seed pages, 10 ok, 0 broken, 47 skipped
                pending routes (built in later stages, skipped): /about/, /blog/, /projects/, /projects/level-design/, /rss.xml
```
(The 47 skipped links are the external ones plus the pending routes.)

`npm run fonts:subset`
```
ok   geist-mono-400.woff2  23.8 KB (from 49.2 KB)
ok   geist-mono-700.woff2  24.4 KB (from 50.6 KB)
total 48.1 KB, 304 code points
```

`npm run check:inputs` → `0 NEEDS INPUT marker(s)` (no content files exist yet; the N2–N13 register items arrive with Stage 3 content).

`npm run repo:size`
```
.git size-pack      53.12 MB (333 objects in pack)
.git loose objects  205.0 KB
working tree        34.23 MB in 119 files (excl. .git, node_modules, dist)
dist/               325.8 KB in 11 files
```
The working tree dropped from 39.29 MB to 34.23 MB (old runtime files removed). Pack growth vs the Stage 0 baseline is 0 so far; the new commits add only loose objects until git packs them.

### Guard self-tests

- **Third-party guard:** a probe page with a Google Fonts stylesheet, a CDN `<img>`, a Font Awesome `<script>` and a CSS `@import` produced 5 `FAIL third-party …` lines and exit 1. A normal `<a href="https://github.com/">` passed. The probe was deleted afterwards.
- **Link check:** a probe page with `/nope/` and `#missing` produced `BROKEN 404 nope/` and `BROKEN probe.html#missing` and exit 1. A pending route (`/blog/`) was skipped. The probe was deleted afterwards.

### Browser checks (preview at `http://localhost:4321`)

| Check | Result |
|---|---|
| Requests to other hosts | **0**. The network log shows only `localhost:4321` (HTML, 2 CSS files, 2 fonts). |
| Theme toggle | Light by default (`stored: null`). Click → `data-theme="dark"`, `aria-pressed="true"`, `localStorage.theme = "dark"`. After a reload, `<html>` is already `dark` and the button already `aria-pressed="true"`: the inline head script sets the theme before the stylesheet and body load, so the wrong theme never paints. |
| Focus ring | Exactly two outline rules in the CSS: `:focus { outline: none }` and `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }`. No component overrides them. 44 focusable elements on the styleguide; the first is "Skip to content". The ring colour follows each theme (`--ring` black in light, white in dark). |
| Reduced motion | CSSOM audit: **0** `transition`/`animation` declarations outside `@media (prefers-reduced-motion: no-preference)`, plus a global `reduce` override that sets `animation: none; transition: none`. |
| 360 px width | `/` and `/_styleguide/`: `scrollWidth` = 360, no element past the right edge. The `<details>` menu replaces the inline links. Header items end at 116, 240 and 344 px. |

**Not verified by me:** the browser pane would not draw (screenshots and real key presses timed out, probably because the Claude window was behind another window). So I could not watch a real Tab walk or a reload for flashing, or emulate `prefers-reduced-motion`. The checks above prove the CSS and script behaviour; please do the hands-on pass at the checkpoint.

## Acceptance criteria

| Criterion | Result |
|---|---|
| `npm run verify` exits 0 | **Pass** |
| Each woff2 ≤ 30 KB; total ≤ 60 KB; exactly 1 font preload | **Pass**: 23.8 + 24.4 = 48.1 KB; 1 preload per page (enforced by `check:budgets`) |
| Global CSS ≤ 12 KB gzip | **Pass**: 2.6 KB on `/`, 3.9 KB on the styleguide |
| JS on `/` ≤ 1 KB gzip (theme only); copy script only where a `CommandBlock` exists | **Pass**: 0.4 KB on `/` (theme init + toggle); 0.7 KB on the styleguide (+ copy script, inlined by Astro as a module) |
| Zero requests to other hosts | **Pass** (guard + network log) |
| Keyboard traversal shows a 2 px ring; theme persists with no flash | **Pass by inspection** (CSS, DOM order, reload state); hands-on Tab walk is for Jay |
| `prefers-reduced-motion: reduce` disables blink and transitions | **Pass by CSSOM audit**; not emulated in a browser |
| Contrast ≥ 4.5:1 for fg/bg and muted/bg in both themes | **Pass**, table below |

### Contrast ratios (WCAG 2.x)

| Pair | Light (default) | Dark |
|---|---|---|
| fg / bg | 21.00:1 | 21.00:1 |
| muted / bg | 6.39:1 | 8.03:1 |
| fg / card | 19.26:1 | 19.80:1 |
| muted / card (terminal bodies) | 5.86:1 | 7.57:1 |
| muted / panel | 5.07:1 | 6.66:1 |

The same table renders live on `/_styleguide/`.

## Deviations from the spec

1. **Styleguide route:** Astro ignores page files that start with `_`, so `src/pages/_styleguide.astro` would never build. The page is `src/pages/[styleguide].astro` with `getStaticPaths` returning `_styleguide`, which still produces `/_styleguide/`. GitHub Pages deploys from Actions artifacts don't run Jekyll, so the underscore folder will be served.
2. **`check:links` is a Node script** (`scripts/check-links.mjs`) using the linkinator API instead of the one-line CLI:
   - linkinator 8 serves on `127.0.0.1`, so the spec's `^(?!http://localhost)` pattern would skip every link.
   - Every page in `dist/` is a crawl seed, so unlinked pages like the styleguide are checked.
   - Anchor fragments are checked.
   - The quoting works in PowerShell as well as bash.
3. **Pending routes:** the nav and footer link to `/blog/`, `/projects/`, `/projects/level-design/`, `/about/` and `/rss.xml`, which later stages build. They are listed in `PENDING_ROUTES` in `check-links.mjs` and printed on every run. Each stage removes its entry, and Stage 11 needs the list empty.
4. **html-validate:** two recommended rules are off:
   - `no-redundant-role`: `role="list"` is deliberate, because Safari VoiceOver drops list semantics when CSS removes the bullets.
   - `no-trailing-whitespace`: the trailing spaces are part of the wordmark glyph rows inside `<pre>`.
5. **Font subset:** besides the D14 ranges it adds U+2018–201F (curly quotes) and U+2026 (…) for the imported Medium posts, and U+2212 (−) for metrics like "−15 ms". Total cost is well under the cap (48.1 KB).
6. **Additions not in the file list:**
   - `scripts/favicons.mjs` (`npm run icons`).
   - `src/lib/contrast.ts` (styleguide contrast table).
   - `@types/node` (needed by `astro check` for `process.env` in `astro.config.mjs`).
   - A `/_styleguide/` budget row in `budgets.json` (internal page, initial ≤ 80 KB).
   - `npm run check` (`astro check`).
7. **Gzip level:** budgets use gzip level 6 (zlib default) as a conservative stand-in for what GitHub Pages serves. Images are counted at their raw size.
8. **X link** uses `https://x.com/jayp_or_jp` (the old site had `twitter.com/jayp_or_jp`, which redirects to the same account).
9. **Nav wordmark** is `> JAY PAREKH` in uppercase mono. The `JP` block letters are the footer wordmark (Q3).
10. **Theme toggle label:** visible text `[ ] dark` / `[x] dark` (a checkbox-style terminal motif), accessible name "Toggle dark mode", `aria-pressed`.

## Notes for Jay

- **Astro version:** `astro@7.4.4` is the current release, but it came out on 2026-10-28, three days ago. All versions are pinned exactly in `package.json`.
- **npm audit:** 3 moderate advisories, all in build-time dev tooling (an old `minimatch` pulled in through `glob`). Nothing ships to the site. They can be revisited once the upstream packages update.
- **Astro telemetry:** the Astro CLI sends anonymous usage data from your machine when it builds. It isn't part of the site and the site makes no third-party requests. To opt out on your machine, run `npx astro telemetry disable` (a global setting, so I left it to you).
- **Preview config:** to run the preview I added `C:\Jay Data\portfolio revamp\.claude\launch.json`. It lives outside the repo.

## Human checkpoint

Open the styleguide with:
```
npm run preview
```
then go to http://localhost:4321/_styleguide/ on desktop and phone, and:
1. Compare both themes (they sit side by side on the page) and approve the look, or ask for token tweaks.
2. Press Tab from the top of the page: the skip link should appear first, and every link and button should show a 2 px ring.
3. Toggle dark, reload, and confirm there's no flash of the light theme.
4. With *reduce motion* turned on in your OS, the cursor in the terminal card should stop blinking.

## Checkpoint review (Oct 31, 2026)

Jay approved the look ("Smooth UI and quick launch") and asked for three changes, all done:
1. Footer `CONNECT` is now GitHub, LinkedIn, Medium, Email. X, RSS, Monkeytype and Steam Workshop were removed. The URLs stay in `site.config.ts`, because X feeds `twitter:site` (Stage 9) and the home links row, and Steam Workshop feeds the archive.
2. SPEC §4.7, §4.9, §4.10, §4.1 and Q4 now say that the Steam Workshop link lives only on the level-design archive (Stage 7). Monkeytype has no placement now and is marked `NEEDS INPUT` in §4.1.
3. Footer bottom bar: `Last updated on Oct 31, 2026`, wrapped in `<time datetime>`. `src/lib/last-updated.ts` takes the latest git commit's date (`git log -1 --format=%cs`), so a rebuild of unchanged content keeps the same date. It falls back to the build date if git isn't available.

`npm run verify` exits 0 after the change: `/` initial 4.2 KB, styleguide 7.9 KB, html-validate clean, internal links 10 ok and 0 broken.
