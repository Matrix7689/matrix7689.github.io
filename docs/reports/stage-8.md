# Stage 8 report: About, resume and remaining pages

Date: Nov 4, 2026 · Branch: `revamp` · Status: **waiting at the human checkpoint**

## What changed

### `/about/` (`src/pages/about.astro`)
- **Intro:** the h1 `~/about`, then the longer "about me" (`ABOUT.longSummary`, **proposed**, from the LinkedIn summary, for Jay to approve or rewrite) beside the headshot. The headshot is on the right from 48rem and above the text on phones, as on home.
  - Paragraph 2's map figures are now **filled in at build time** from the level-design data: "Over 9 years I've published 40 maps on GameBanana and Steam Workshop, with 1,003,620 downloads and 1,327,140 views." This replaces the retired ballpark "50+ maps, 10+ million views and 1 million downloads".
  - Paragraph 3 now says "32 eSports events" (the confirmed N11 count), replacing "30+ eSports tournaments".
- **Resume:** a primary `Button` with the `download` attribute. Its label, "Download resume (PDF, 217 KB)", reads the real size of `public/Jay_Parekh_Resume.pdf` at build time, so it stays right when Jay replaces the file (N7).
- **01 `~/experience`:** the career timeline (the same profiler as home) and **all 5 roles with every bullet** (SDE II 9, SDE I 6, Intern 4, CTO 4, Drag2Death 4). There is no compact switch, and no level-design role.
- **02 `~/education`:** a `SpecTable` per school (USC, DJSCE, Jai Hind College), with Degree, Dates, Location and Coursework. Three columns from 64rem. The "University of Mumbai" affiliation is left out, matching Jay's removal of that tag on home.
- **03 `~/elsewhere`:** the three `ABOUT.elsewhere` facts (7-week workshop for 500+ students, 24+ servers / 100,000+ users, 32 eSports events) as `[*]` bullets. A fourth bullet (proposed) reads "Designed custom multiplayer maps for Counter-Strike: see the level design archive." The About page can link the archive; only home must not.
- **Shared pieces:**
  - `src/lib/career.ts` (`getRoles()`, `careerTimeline()`) and `src/components/Headshot.astro` replace code that was inline in `index.astro`, so home and About can't drift apart. Home's output is unchanged: it was re-measured with 1 h1, the photo shown and no horizontal scroll at 360 px.
  - The `ABOUT.headshot` field stays unused; the photos live in `Headshot.astro`.

### `404.astro` → `dist/404.html`
- **Content:** the h1 "404 · page not found", then a terminal card: `$ cd ./requested-page` / `bash: cd: ./requested-page: No such file or directory` / `$ ls` with links `~/` `blog/` `projects/` / `$ █`.
- **noindex**, and left-aligned like the other pages.
- **Path:** without JS a static page can't show the path that was requested, so the terminal uses a generic `./requested-page`.

### `public/works-2.html` (D11)
- A meta refresh with `content="0; url=/projects/level-design/"`, a canonical to the archive, `noindex`, and a visible fallback link: "This page has moved to the level design archive".

### Tooling
- **`scripts/check-links.mjs`:** `PENDING_ROUTES` is now **empty** (`/about/` removed), as Stage 11 requires.
  - **Latent bug fixed:** with an empty list, the pending pattern became an empty group that matched every local URL, which would have silently skipped all internal links. It now matches nothing. The internal check covers 68 seed pages: 1,898 ok, 0 broken.
- **`budgets.json`:** a `/works-2.html` route (≤ 5 KB, `fontPreloads: 0`).
- **`scripts/check-budgets.mjs`:** a route may override the expected font-preload count. The stub loads no fonts or CSS, which the "exactly 1 preload" rule would otherwise fail.
- **`lighthouserc.json`:** added `/about/` and `/404.html`, and the assertions became an `assertMatrix` (see deviations).

## Verification

### `npm run verify`: exit 0
```
route            html     css     js   initial  budget   total  budget
/                11.6 KB  7.1 KB  1.0 KB  16.5 KB   <50   105.5 KB  ≤120
/about/           7.8 KB  5.2 KB  0.9 KB  11.5 KB   ≤40    44.9 KB  ≤100   (with headshot)
/404              2.9 KB  3.0 KB  0.9 KB   5.4 KB   ≤30     5.4 KB   ≤30
/works-2.html     0.4 KB  0.0 KB  0.0 KB   0.4 KB    ≤5     0.4 KB    ≤5
all budgets pass, 0 third-party references
0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB
html-validate: no errors
internal link check: 68 seed pages, 1898 ok, 0 broken (no pending routes)
```

### Acceptance criteria
- **`/about/` budget:** 11.5 KB initial (≤ 40) and 44.9 KB total with the headshot (≤ 100). Lighthouse is 100 / 100 / 100 / 100 (3 runs).
- **Resume:** `curl -I http://localhost:4321/Jay_Parekh_Resume.pdf` (preview) returned `HTTP/1.1 200 OK`, `Content-Type: application/pdf`, `Content-Length: 222433`.
- **`/works-2.html`:** opened in the built-in browser, it landed on `/projects/level-design/` (title "Level design archive · Jay Parekh") at once. The raw HTML has `content="0; url=/projects/level-design/"` and the visible link.
- **404 page:** emitted as `dist/404.html` (11,072 bytes) with `<meta name="robots" content="noindex">`. Preview serves it with **HTTP 404** for `/no-such-page/`.
- **Other checks:** 360 px shows no horizontal scroll on `/about/`, the 404 page and `/`, each with one h1. `/about/` headings run h1 → h2 → h3 (roles) → h2.

### `npm run lhci`: all assertions pass (12 URLs, 3 runs each)
| URL | Perf / A11y / BP / SEO |
|---|---|
| `/`, `/blog/`, the blog post, `/projects/`, `/projects/halma-ai/`, archive + 4 map pages | 100 / 100 / 100 / 100 |
| **`/about/`** | **100 / 100 / 100 / 100** |
| **`/404.html`** | **100 / 100 / 100 / 63**. The only failing SEO audit is `is-crawlable` ("Page is blocked from indexing"), the required `noindex`. All 7 other weighted SEO audits pass (document-title, meta-description, http-status-code, link-text, crawlable-anchors, hreflang, canonical). |

## Repo size (`npm run repo:size`)
```
.git   size-pack 55.40 MB · loose 42.31 MB (Stage 7: 42.30 MB; Stage 8 adds only text files)
dist/  93.01 MB in 1836 files
```

## NEEDS INPUT: 7 (unchanged)
N9 ×4 (project course context), N12 (blog subtitle), N14 (credential details), N15 (summarization link). N7 (updated resume PDF) has no marker; the label follows whatever file ships.

## Deviations from the spec
1. **The 404 SEO score is 63, not ≥ 95.** Stage 8 task 2 requires `noindex` on the 404 page, while §6.1 lists `/404.html` among the URLs that need SEO ≥ 95. Lighthouse always fails `is-crawlable` on a `noindex` page, so both can't hold.
   - I kept `noindex`. For `/404.html` only, `lighthouserc.json` asserts the SEO audits one by one, with `is-crawlable` off; every other URL still asserts SEO ≥ 0.95.
   - The alternative is to drop `noindex`. GitHub Pages already serves the page with an HTTP 404 status, which search engines don't index. Jay's call.
2. **The About text is the longer `ABOUT.longSummary`,** not the short §4.6 bio, since the Stage 4 checkpoint moved the long version to this page. The short bio isn't shown, because it repeats the long text's first sentence.
3. **The map figures in the About text are computed**, matching the Stage 7 decision to retire the ballpark figures, and the eSports count is 32.
4. **Education omits "University of Mumbai"** (Jay's preference from the home page).
5. **The 404 terminal shows a generic `./requested-page`,** because the real path needs JS.

## Human checkpoint
Please review `/about/` and the 404 page (`npm run preview` → http://localhost:4321/about/ and any missing URL, e.g. http://localhost:4321/nope/):
1. **The About text:** approve or rewrite the three `longSummary` paragraphs, and the proposed fourth "elsewhere" bullet.
2. **Resume:** supply an updated PDF, or keep the current one (217 KB)?
3. **Headshot:** it reuses the home page's light and dark photos. Keep it?
4. **404 `noindex`:** keep it (SEO 63 on that page only), or drop it?


## Checkpoint follow-up: About is Jay's text and photo (Nov 4, 2026)

Jay's request: the About page shows only his text and his photo, with logos beside the section headings. He also has **15 years** of programming experience, having started learning Java in 8th grade in 2011.

- **`/about/`** is now `ABOUT.story`, Jay's text verbatim, plus `Headshot`.
  - It opens with an untitled intro, then **Games first**, **Engineering**, **How I work** and **Outside work** as h2s.
  - The photo is on the right from 64rem and sticks while the text scrolls; below 64rem it sits above the text.
  - **Removed at Jay's request:** the career timeline and roles, education tables, the elsewhere list and the resume button. The resume is still on the home page ("Preview resume") and in the footer (`resume.pdf`). `ABOUT.longSummary` and `ABOUT.elsewhere` were deleted.
- **Years are computed, not typed:** `CAREER = { programmingSince: 2011, professionalSince: 2021 }` and `yearsSince()` in `src/data/pages.ts`.
  - The About intro reads "programming for **15** years, **five** of them professionally". Small counts are spelled out, as in Jay's text.
  - The home "Engineering" highlight now reads **15 years** of programming experience (it was a hard-coded 13).
  - Both update each year on the next build.
- **Logos (`SectionLogos.astro`):**
  - Monochrome SVGs are inlined from `src/assets/logos/` and coloured with `currentColor` (muted grey in both themes), so the page makes no extra or third-party request. They are decorative (`aria-hidden`).
  - With Jay's OK, two were downloaded from **Simple Icons 13.21.0** (CC0): `amazon.svg` (2.1 KB), shown on **Engineering**, and `counterstrike.svg` (3.1 KB), shown on **Games first**.
  - **Waiting on Jay:** Simple Icons has no Hammer World Editor logo and no separate CS:GO or CS:Source logos. "Games first" already lists `csgo`, `cs-source` and `hammer`, so dropping `csgo.svg`, `cs-source.svg` or `hammer.svg` into `src/assets/logos/` makes them appear. A single-colour SVG suits the theme best.
- **Checks:**
  - `npm run verify` exits 0. `/about/` is **10.1 KB** initial (≤ 40) and **43.5 KB** total with the photo (≤ 100). `/` is 16.1 KB.
  - Lighthouse is 100 / 100 / 100 / 100 on `/about/` and `/`, with all 12 URLs passing their assertions (`/404.html` SEO 63 as before, from the intended noindex).
  - At 360 px there is no horizontal scroll on `/about/` or `/`. `npm run check:inputs` is still 7.
- **Wording follow-up (Jay):** the intro now opens with Jay's own sentence. Proposed wording: "I’m a software engineer on Amazon’s Shopping Cart team. I’ve been programming for 15 years, the last five professionally. I started with Java, C, C++ and Python, and Java is still my strongest language. Before any of that, though, there were games." The last line is trimmed to "Lately that means tech blogs for software engineers." The Hammer logo is dropped from "Games first" (Jay: skip it); `csgo` and `cs-source` still appear if their SVGs are added. `npm run verify` exits 0.

## Checkpoint decisions (Nov 4, 2026)
- **Resume (N7):** Jay will update the PDF later. The current `Jay_Parekh_Resume.pdf` (217 KB) ships until then.
- **404 `noindex`: dropped** (Jay). GitHub Pages serves `404.html` with an HTTP 404 status, so search engines don't index it anyway.
  - `lighthouserc.json` is back to one set of assertions for every URL; the per-URL SEO audit list is removed.
  - `/404.html` now scores **100 / 100 / 100 / 100**, and deviation 1 above no longer applies.
  - `npm run verify` exits 0, and `npm run lhci` passes on all 12 URLs (3 runs each). Two single runs dipped to 98–99 Performance; medians are 100.
