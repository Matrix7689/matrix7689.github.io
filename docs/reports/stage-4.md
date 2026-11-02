# Stage 4 report: home page

Branch `revamp`, Nov 1, 2026. Not merged to `master`: the live home page is still the Stage 1 placeholder.

## What changed

| Commit | What |
|---|---|
| `0570df4` fix: prune unreferenced raw originals after build | `src/integrations/prune-originals.mjs`; see "Problem found" below. |
| `3301774` fix: render section ghost numbers as generated content | `SectionHeader`'s 8 % ghost number is now CSS `content: attr(data-n) / ''` instead of a text node (Lighthouse accessibility fix, below). |
| `3ec7d73` feat: add ExperienceItem, PostListItem and ProjectCard | Three components, plus `src/lib/inline.ts`, which escapes HTML and renders only `**bold**` and `*italic*`, for metric bullets. |
| `8ecd6fc` feat: build the home page | `src/pages/index.astro` and a `head` slot in `Base.astro` for the JSON-LD. |
| `94c8567` chore: add Lighthouse CI | `lighthouserc.json` (mobile preset, 3 runs, the §6.1 assertions), `npm run lhci`, `@lhci/cli@0.15.1`. |

### The page (§4.1), top to bottom
1. **Intro.** The badge `■ SOFTWARE ENGINEER · SEATTLE` and the two-tone h1 ("Jay Parekh" / "Software Development Engineer II @ Amazon") span the full width. Under them, the one-liner and the links row (`github linkedin x medium email resume.pdf`) sit beside the **CommandBlock**: `$ curl -sLO https://matrix7689.github.io/Jay_Parekh_Resume.pdf`, built from `Astro.site`, so it follows `SITE_URL`. It has a copy button, an `ls` output of 5 real links, and a `$ █` cursor.
2. **01 `~/experience`.** SDE II and SDE I, 3 bullets each (`homeBulletLimit`), with `[*]` markers and bold metrics, then "full history →" to /about/.
3. **Highlights.** `Fig 1. $1.74M`, `Fig 2. −15 ms` and `Fig 3. 3–4 months`, from `src/data/pages.ts`.
4. **02 `~/blog`.** The 3 imported posts as `YYYY-MM-DD [tag] [medium]` / title / summary. With 0 posts it shows the `EmptyState` (`$ ls blog/` → "0 posts — first one is on the way. Subscribe: rss.xml"). Then "all posts →".
5. **03 `~/projects`.** 4 `ProjectCard`s, text first, with stack tags and year. The two NewsApps have a tiny grayscale thumbnail (`thumb` preset, lazy) that turns colour on hover or focus. Then "all projects →".
6. **04 `~/skills`.** One static wrapped line with `///` separators, drawn by CSS so screen readers hear a plain list.
7. **JSON-LD `Person`.** Name, url, jobTitle, worksFor Amazon, alumniOf USC and University of Mumbai, and `sameAs` with the 5 non-null profile links (GitHub, LinkedIn, X, Medium, Steam Workshop).

## Problem found: raw originals leaking into `dist/`

The home page is the first production page to call `getCollection()`. That made Astro emit every image any collection imports (level galleries, blog figures, the Mars poster) into `dist/_astro/` as raw JPEG/PNG files. Astro deletes an original only after transforming it; images no page renders yet stay behind. `check-budgets` and `check:originals` both failed the build: 68 files, 29.5 MB, up to 912 KB each.

The fix is a small integration that runs at `astro:build:done`. It deletes any `dist/` file that is byte-identical to a file in `src/assets/` **and** whose name no HTML, CSS, JS, XML or JSON file mentions. A raw copy that something does reference is left in place, so `check:originals` still fails on it. Every build now logs `[prune-originals] removed 68 unreferenced raw original(s), 29.5 MB`. The count will drop as Stages 5–7 render those images.

## Verification output

`npm run verify` exits 0:
```
astro check      Result (48 files): 0 errors, 0 warnings, 0 hints
[prune-originals] removed 68 unreferenced raw original(s), 29.5 MB
check:budgets
route                                html      css       js    initial   budget      total   budget     fonts
/                                  5.1 KB   4.1 KB   0.7 KB     9.2 KB      <50    64.7 KB     ≤120   48.1 KB
/_styleguide/                      4.9 KB   4.0 KB   0.7 KB    15.7 KB      ≤80   104.8 KB     ≤200   48.1 KB
image outputs by preset: thumb 18 files (avif max 27.9 KB, webp 28.6, jpg 28.2), detail 7, large 2
all budgets pass, 0 third-party references
check:originals  0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB
check:html       clean
check:links      internal link check: 2 seed pages, 40 ok, 0 broken, 63 skipped
  pending routes (built in later stages, skipped): /about/, /blog/, /blog/<3 post slugs>/, /projects/,
  /projects/<4 project slugs>/, /projects/level-design/, /rss.xml
```
The total of 64.7 KB counts both lazy thumbnails at their heaviest candidate (600 w AVIF). A phone that picks the 400 w file downloads less.

`npm run lhci` (Lighthouse 12.6.1, mobile preset, simulated throttling, 3 runs) exits 0:
```
run  perf  a11y  best-practices  seo   LCP       CLS     TBT
1    100   100   100             100   1,383 ms  0.0000  0 ms
2    100   100   100             100   1,364 ms  0.0003  0 ms
3    100   100   100             100   1,357 ms  0.0003  0 ms
```
Assertions: every category ≥ 0.95, CLS ≤ 0.02, TBT ≤ 50 ms, LCP ≤ 2,000 ms (medians). On the first run Accessibility was 96: axe flagged the decorative 8 % ghost numbers for contrast. They're `aria-hidden` and incidental, so WCAG exempts them, but they're now generated content, which axe doesn't test, and Accessibility is 100.

### Browser checks (built-in browser, `npm run preview`)
- **Headings:** exactly one `h1`. The order is h1 → h2 (`~/experience`, Highlights, `~/blog`, `~/projects`, `~/skills`, then the footer's Connect and Site) → h3 (roles, posts, projects), with no skipped levels.
- **1440 px:** the name fits on one line; the terminal sits beside the one-liner and links.
- **360 × 740:** `scrollWidth` = 360, and no element extends past the viewport. The long URL in the command block wraps inside the card, and the cards stack with 96 px thumbnails.
- **Copy button:** copies exactly `curl -sLO https://matrix7689.github.io/Jay_Parekh_Resume.pdf`, shows "copied", announces "Copied" through the `aria-live` region, and resets to "copy" after 2 s. The clipboard API was stubbed in the page for this test, so a real paste is part of your manual check.
- **Without JS:** the command is plain text in the HTML, and the copy button ships with `hidden`, so the page is fully readable without JS. The browser pane can't turn JS off; this was checked in the built HTML.
- **Dark theme:** the blog rows, `[medium]` markers and nav read correctly.
- **Fixture build:** the home page lists the newest 5 posts: the 3 imported posts plus 2 fixtures (`fixture-long-post`, `fixture-medium-crosspost`), in date order.

## Acceptance criteria

| Criterion | Result |
|---|---|
| `/` initial < 50 KB gzip excluding fonts; total ≤ 120 KB | **Pass**: 9.2 KB / 64.7 KB |
| Lighthouse mobile ≥ 95 in all 4 categories on `/` | **Pass**: 100 / 100 / 100 / 100 |
| Exactly one `<h1>`; h1 → h2 → h3 without skips | **Pass** |
| Blog section lists the 3 imported posts with `[medium]`; `EmptyState` proven in `/_styleguide/`; fixtures listed in the fixture build | **Pass** |
| Copy button copies the exact command; without JS the command is selectable text | **Pass** (real paste: manual) |
| No horizontal scroll at 360 px | **Pass** |

## Deviations from the spec

1. **`prune-originals` integration**, not in the spec. Without it, production would ship 29.5 MB of raw images and fail the guards (above).
2. **Ghost numbers as generated content** in `SectionHeader`. It looks the same; it just isn't text in the page any more.
3. **Highlights heading:** the section has an `h2` styled as a small label ("Highlights"), so the heading outline stays complete. §4.1 gives it no number, so it sits between 01 and 02 without one.
4. **Post rows show the first tag only** (`maxTags = 1`), because each imported post has 5. The blog index (Stage 5) can show more.
5. **Lighthouse CI serves `dist/` with its own static server** (`staticDistDir`), not `astro preview`. Astro 7 allows only one preview server at a time, so the two conflict. Run `npm run build` first; the spec's `npm run lhci -- --url=/` form isn't needed, because `/` is the only URL so far.
6. **Thumbnails only on the NewsApp cards:** they're the only projects with a cover. Halma and Mars rover have a video and poster, used on their detail pages in Stage 6.

## Notes for Jay

- **Home one-liner (N3):** the page shows the draft "I build and scale Amazon's shopping cart service: throttling, caching, migrations and latency." It's one of the 6 open `NEEDS INPUT` items; approve it or send a rewrite.
- **Unbuilt pages:** links to the blog, projects, about and `rss.xml` 404 until Stages 5–8. The link check skips them and lists them on every run.
- **`npm audit`:** `@lhci/cli` adds 21 advisories in its own dependencies (2 low, 6 moderate, 13 high). They're dev-only tools that run locally or in CI; nothing ships to the site.
- **Live site:** these commits are only on `revamp`. Merging into `master` would replace the live "Rebuild in progress" placeholder with this home page. Its links to unbuilt pages would show GitHub's 404 page until those stages land.

## Human checkpoint

```
npm run build
npm run preview
```
Open http://localhost:4321/ on desktop and phone. Approve the copy (especially the one-liner) and the layout, try the copy button and paste the result, and toggle dark mode.

## Checkpoint changes (Nov 2, 2026)

Jay's review, applied:

| Request | Change |
|---|---|
| Shorten the one-liner | "I build and scale Amazon's shopping cart service." (N3 filled) |
| Remove "x" from the links row | Links row: github, linkedin, medium, email, resume.pdf. The X URL stays in `site.config.ts` for JSON-LD `sameAs` and `twitter:site` (Stage 9). |
| Remove `rss.xml` from the terminal | `ls` output: blog/, projects/, about.md, resume.pdf |
| Remove the API names from project stacks | NewsApp React: React, Node.js. NewsApp Android: Android, Java, Kotlin. |
| Highlights first, covering everything | New `01 ~/highlights` before experience, so the sections are now 01–05. 24 `Figure`s in 4 groups (At Amazon 10, Gaming & community 5, Steam Workshop 3, Off the clock 6), numbered Fig 1–24. Every number comes from §4.2, the resume or the old site. Phones show 2 per row, wide screens up to 5. |

**Is `curl -sLO https://matrix7689.github.io/Jay_Parekh_Resume.pdf` valid?** Yes. `-s` is silent, `-L` follows redirects, and `-O` saves under the remote file name. Run against the live site, it downloaded `Jay_Parekh_Resume.pdf` (222,433 bytes, a `%PDF-1.7` header), byte-identical to `public/Jay_Parekh_Resume.pdf`. It works in macOS and Linux terminals, Windows `cmd` and PowerShell 7. In Windows PowerShell 5.1, `curl` is an alias for `Invoke-WebRequest`, so this exact syntax fails there; `curl.exe -sLO …` works.

**Not added (no source):** Drag2Death eSports achievements. Neither the old site nor the resume mentions Drag2Death, and the resume's "Community Developer" numbers (24+ servers, 100,000+ users, eSports events) don't name an organisation. A new `NEEDS INPUT` in `src/data/pages.ts` holds both questions. The old site's "64,214 lines of code" and "8 GitHub repos" were left out of "Off the clock".

**Nav links 404:** the nav points to `/blog/`, `/projects/` and `/about/`, which Stages 5, 6 and 8 build. They 404 until then, both locally and on the live site if this stage is deployed first.

After the changes: `npm run verify` exits 0. `/` is 9.8 KB initial and 65.3 KB total. Lighthouse (3 runs) gives 100/100/100/100 with LCP 1,356 ms, CLS 0.0005 and TBT 0 ms. At 360 px there's no overflow, and the highlights show 2 per row with no value overflowing its box.

## LinkedIn import (Nov 2, 2026)

Jay shared his LinkedIn profile export and asked for "everything" on the home page for now; a compact home page with "view more" toggles comes later (Appendix D backlog). Text was extracted with `pdfjs-dist`, installed in a scratch folder outside the project.

**Added:**
- **Drag2Death, Community Specialist** (May 2015 – Jun 2017, Mumbai): a new role with 4 bullets. This answers the earlier Drag2Death question: the 24+ servers, 100,000+ users, eSports events, maps and the 500-student workshop all came from this role.
- **Experience on home:** all 5 roles with every bullet. The internship now has LinkedIn's 4 bullets; Bigshine's partner list adds Circle Gaming, USports and Entity Gaming.
- **`01 ~/about`:** 3 paragraphs tightened from the LinkedIn summary, with the "passion" phrasing dropped per the §4 copy rules. Proposed copy.
- **Highlights:** now 29 figures in 4 groups (Engineering 11, Gaming & community 6, Map making 4, Off the clock 8). New figures: 10+ years of programming; 3 websites (Bigshine); 9 years of map design; 20,000+ Instagram views on 20+ videos (resume); 3 spoken languages.
- **`04 ~/education`:** USC; Dwarkadas J. Sanghvi College of Engineering (University of Mumbai); Jai Hind College high school with the old site's coursework. A new `EducationItem` component renders them.
- **`06 ~/projects`:** all 5, including **Advanced text summarization** from the resume (Q5 reversed).
- **`07 ~/skills`:** 5 groups (Languages, Web & mobile, Platforms, Practices, Tools) from the resume and LinkedIn's top skills (CI/CD, SDLC).
- **`08 ~/credentials`:** 2 certifications, 1 honor, 2 publications and 3 spoken languages (titles only; N14).
- **JSON-LD:** `knowsLanguage` added; `alumniOf` now lists the two universities.
- **Font subset:** gains `×` (U+00D7, used in "16×16"). Fonts total 48.3 KB.
- **Level-design intro:** the years "(2017–2019)" are removed, since LinkedIn shows map-making from at least 2015.

**Numbers that differ between sources** (each is kept as its own source states it):

| Fact | Where shown |
|---|---|
| eSports events: old site 32, LinkedIn summary "over 30", Drag2Death role and resume 20+ | Highlights and About: 32 / 30+; Drag2Death bullet: 20+ |
| Maps: old site 55 / 1,052,075 / 12,340,926; LinkedIn and resume 50+ / 10M+ / 1M+ | Highlights: old-site figures; About summary and Drag2Death bullet: LinkedIn's |

**Still open:** N9 (course context for 4 projects), N12 (blog subtitle), N14 (credential details), N15 (summarization project link and publication link). GPA stays hidden (Q6).

**Checks:**
- `npm run verify` exits 0: `/` is 12.5 KB initial and 68.1 KB total.
- Lighthouse, 3 runs: 100/100/100/100, with LCP 1,357–1,382 ms, CLS 0.0005 and TBT 0 ms.
- Structure: one h1, no skipped heading levels, 8 h2 sections, 29 figures, 5 roles (9/6/4/4/4 bullets), 3 schools, 5 projects, 4 credential groups.
- At 360 px: no overflow and no figure value overflowing its box. The page is 13,808 px tall on a phone; the compact version should fix that.
- Skill separators now attach to the end of each item, so wrapped lines never start with `///`.

## About text (Nov 2, 2026)

At Jay's request, `01 ~/about` now shows his own two paragraphs, verbatim: the Shopping Cart paragraph and "Away from work…". It's followed by a secondary button, "more about me →", that links to `/about/` (Stage 8; it 404s until then, and the link check skips it as pending). The LinkedIn-based draft moved to `ABOUT.longSummary` as a starting point for the About page's longer version. `npm run verify` exits 0, and `/` is 12.7 KB initial.

## Highlights revision (Nov 2, 2026)

Jay's 13 edits, applied:
- **No "Fig N." prefix:** `Figure`'s `n` is now optional, and the home page omits it.
- **No source labels:** "(Amazon SDE I)", "(Drag2Death)", "(Bigshine)" and the like are removed from every caption.
- **Removed cards:** 0 customer impact, 4 h → 5 min, 3 websites, Instagram views, and languages spoken.
- **New values from Jay:** 13 years of programming (also in the About-page draft), 6 peak-traffic simulations, 3 engineers mentored, 975 cups of coffee, and "minutes on Spotify (2025)".
- **TM99 captions:** the −15 ms and −10 ms cards now name their own changes, the cart cache storage refactor and a cross-team service migration, instead of "the same refactor".

That leaves **24 cards**: Engineering 9, Gaming & community 5, Map making 4, Off the clock 6. `npm run verify` exits 0; `/` is 12.4 KB initial.

Open question: the SDE I experience bullets still say "Mentored **2 engineers**" and "ran **5 peak-traffic simulations**", as the resume and LinkedIn do for that role. The new highlight totals are 3 and 6.
