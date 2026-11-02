# Stage 5 report: blog

Branch `revamp`, Nov 2, 2026. Not merged to `master`, so on the live site `/blog/` still 404s.

## What changed

| Area | Files |
|---|---|
| Post page | `src/pages/blog/[slug].astro`, `src/layouts/Post.astro`, `src/styles/prose.css`; components `Toc`, `PrevNext`; `Base` now emits `<link rel="canonical">` (self by default, the D6 result on posts). |
| Blog index and tags | `src/pages/blog/index.astro`, `src/pages/blog/tags/[tag].astro`; components `FeaturedPost`, `TagFilter`, `PostList`; `PostListItem` gains a `level` prop, so titles are h2 under the page h1. |
| Code blocks | `src/lib/markdown-plugins.ts` (`codeBlocksPlugin`), `src/styles/shiki/mono.json`, `src/styles/code.css`. |
| Post images | `src/lib/markdown-plugins.ts` (`imagesPlugin`), `image.breakpoints` in `astro.config.mjs`. |
| Feed | `src/pages/rss.xml.ts` (`@astrojs/rss@4.0.19`). |
| Authoring | `scripts/new-post.mjs` (`npm run new:post`), `docs/PUBLISHING.md`. |
| Shared code | `src/scripts/copy.ts` is the copy button for both `CommandBlock` and code blocks. `src/lib/image-presets.ts` holds the preset numbers with no Astro imports, so the config can load them in plain Node; `images.ts` re-exports them. |
| Checks | `check-budgets` now caps `<img data-preset>` images outside `<picture>`; `check-links` no longer skips `/blog/` and `/rss.xml`; `.htmlvalidate.json` sets `valid-id` to relaxed (heading ids such as `1-be-solution-oriented` are valid HTML5); `lighthouserc.json` audits `/`, `/blog/` and one imported post. |
| Fixtures | The long fixture is now 6 min, so it exercises the table of contents (≥ 5 min rule). |

### How the pieces work
- **Post page:**
  - The header has "← all posts", the h1, the date (plus `updated`), reading time, tag links and the Medium notice.
  - The notice reads "**Originally** published on Medium →" when the canonical is Medium, otherwise "**Also** published on Medium →".
  - The lead (summary) is hidden when the body already opens with it, as all three imported posts do.
  - The table of contents shows when there are ≥ 3 h2/h3 **and** ≥ 5 min of reading. Phones get a closed `<details>`; screens ≥ 1024 px get the same list always open in a sticky right column. Only one is displayed at a time, so screen readers never meet both.
  - The body sits at ≤ 72ch, followed by prev/next by date and "← all posts". Titles over 70 characters drop the " · Jay Parekh" suffix from `<title>`.
- **Code blocks:**
  - Shiki highlights with a single theme whose colours are placeholders (`#000001`…`#000007`). `codeBlocksPlugin` replaces each `<pre>` with `figure.codeblock`: three square dots, the language as the title, a copy button (`hidden` until JS confirms the Clipboard API) and an `aria-live` status.
  - In the same pass it strips Shiki's inline `style` and maps each placeholder colour to a `tok-*` class. `code.css` colours those with theme tokens: comments muted italic, keywords bold, strings and punctuation muted, the rest the foreground colour. The theme toggle therefore recolours code with no JS, and **no inline styles ship** (0 in every post).
- **Post images:**
  - Markdown images use Astro's `constrained` layout at 700 px, the column width, with `image.breakpoints: [800, 1280]`. That gives `srcset` 700/800/1280/1400 w in WebP at the detail preset's quality (q50), plus `sizes`, lazy loading, async decoding, explicit width/height and `data-preset="detail"`.
  - The widest output is 110.8 KB, under the 150 KB detail cap.
- **Feed:** `/rss.xml` lists published posts only, even in fixture builds. Each item has title, summary, the link on this site, pubDate and categories.

## Verification output

`npm run verify` (production) exits 0:
```
astro check      Result (63 files): 0 errors, 0 warnings, 0 hints
[prune-originals] removed 61 unreferenced raw original(s), 28.0 MB   (blog images are now rendered, so 7 fewer)
check:budgets (initial / total, budget)
  /                                                               12.3 KB  <50  |  67.8 KB ≤120
  /blog/                                                           5.6 KB  ≤40  |   5.6 KB ≤60
  /blog/critical-thinking-is-fading-heres-how-you-can-reclaim-it/  11.6 KB  ≤60  | 143.8 KB ≤400
  /blog/how-i-avoid-and-handle-burnout/                             9.1 KB  ≤60  |  77.7 KB ≤400
  /blog/how-to-work-better-with-ai/                                 9.8 KB  ≤60  |  39.4 KB ≤400
  /blog/tags/* (11 pages)                                       5.0–5.3 KB  ≤40  |  5.0–5.3 KB ≤60
  JS 0.4 KB gzip on every page (theme toggle + copy script)
  all budgets pass, 0 third-party references
check:originals  0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB
check:html       clean
check:links      internal link check: 17 seed pages, 101 ok, 0 broken
                 pending: /about/, /projects/ and the 6 project pages (Stages 6–8)
```

Acceptance checks on the production build:
```
/blog/: featured=true entries=3 (featured + 2), filter row: all + 11 tags, "all" active
critical-thinking-…: canonical = mediumUrl ✓ | toc=true  | prev=how-i-avoid-… next=– | Originally published on Medium
how-i-avoid-…:       canonical = mediumUrl ✓ | toc=false | prev=how-to-work-… next=critical-thinking-…
how-to-work-…:       canonical = mediumUrl ✓ | toc=true  | prev=– next=how-i-avoid-…
tag pages (11): ai, architecture, artificial-intelligence, career-advice, career-development, critical-thinking,
  productivity, software-development, software-engineering, work-life-balance, workflow
  (none for the draft-only tags fixture, java, distributed-systems, career, level-design)
rss: rss-parser parsed OK: "Jay Parekh · Blog" | 3 items, each with isoDate, link and 5 categories
```

Fixture build (`npm run build:fixtures`):
```
/blog/: featured + 5 entries (3 imported + 3 fixtures, newest first), filter row: all + 16 tags
fixture-long-post:        canonical self ✓ | toc=true  | 3 code blocks (ts, python, bash) | prev/next by date ✓
fixture-medium-crosspost: canonical = mediumUrl ✓ | toc=false | Originally published on Medium
fixture-images:           canonical self ✓ | toc=false
rss: still 3 items (drafts excluded); check:budgets and check:html pass
```
- **Canonical flip:** with `preferMediumCanonical: false` (temporary edit, reverted), `fixture-medium-crosspost` and `how-to-work-better-with-ai` both have self canonicals, and their notices read "Also published on Medium".
- **`new:post`:** `npm run new:post -- "Test" --tags meta` created `src/content/blog/2026-test.md` (`draft: true`, today's date, tags `[meta]`). It built in the fixture build, was absent from the production build, and was deleted afterwards.

Lighthouse (mobile, 3 runs each), all assertions pass:
```
url                                                        perf a11y bp  seo  LCP        CLS     TBT
/                                                          100  100  100 100  1,360 ms   0.0005  0 ms
/blog/                                                     100  100  100 100  1,055 ms   0.0000  0 ms
/blog/critical-thinking-is-fading-heres-how-you-can-reclaim-it/  100 100 100 100  1,436 ms 0.0000  0 ms
/blog/fixture-long-post/ (fixture build)                   100  100  100 100  1,365 ms   0.0001  0 ms
```

**Code contrast (WCAG 2.x):**
- Default code text: 19.26:1 light (`#000` on `#f5f5f5`), 19.80:1 dark (`#fff` on `#0a0a0a`).
- Muted tokens (comments, strings, punctuation): 5.86:1 light, 7.57:1 dark.
- All are above the 4.5:1 minimum.

### Browser checks (built-in browser)
- **360 × 740 on `fixture-long-post`:** the document is 360 px wide and no element outside `<pre>` extends past the viewport. The three code blocks scroll inside their boxes (`scrollWidth` 702/378/961 vs `clientWidth` 326).
- **Controls at 360 px:** the copy buttons are visible with JS; the table of contents is a closed `<details>` and the wide version is hidden; one h1 and no skipped heading levels.
- **Bug found and fixed:** the first 360 px check reported a 621 px viewport. The long bash line was stretching the post's grid column (`min-width: auto`), so the phone browser widened the whole page. The column is now `minmax(0, 1fr)` with `min-width: 0` on the body.
- **1440 px, critical-thinking post:** the table of contents is sticky on the right, images render at 691 px, and BLOG is inverted in the nav.

## Acceptance criteria

| Criterion | Result |
|---|---|
| `/blog/` shows the featured post plus the other 2; `/rss.xml` validates with 3 items; imported canonicals = `mediumUrl`; no draft-only tag pages | **Pass** |
| Fixture build: featured post, filter row, entries, TOC on the long fixture only (among fixtures), prev/next correct, Medium fixture canonical = `mediumUrl`, `preferMediumCanonical: false` flips it | **Pass**. The index has 6 entries, not 3, because the 3 imported posts are also there. |
| Post page initial ≤ 60 KB; JS ≤ 2 KB gzip | **Pass**: 6.3–11.6 KB; 0.4 KB JS |
| Code readable in both themes (≥ 4.5:1) and scrolls inside its box at 360 px | **Pass** |
| `npm run new:post -- "Test" --tags meta` creates a valid draft that builds | **Pass** (deleted afterwards) |

## Deviations from the spec

1. **One token-class Shiki theme** instead of two colour themes: `mono.json` plus class mapping. It gives the same result (the toggle recolours code, no JS) without inline styles, which html-validate's `no-inline-style` rule rejects and which add bytes. D15 in the SPEC now says so.
2. **No `CodeBlock.astro`:** code blocks only come from Markdown, so the chrome is built by `codeBlocksPlugin` and styled by `code.css`. A component can reuse that markup if an `.astro` page ever needs a code block.
3. **Markdown images are WebP-only `<img srcset>`**, not `<picture>` with AVIF and JPEG. Markdown images can't use the `Img` component, and number arrays don't survive Sätteri's plugin bridge (`widths: [800, 1280]` arrives as `[]`), so sizes come from Astro's constrained layout. Every current browser supports WebP.
4. **Line highlighting (`// [!code highlight]`)** is skipped: it needs `@shikijs/transformers`, which the spec makes optional.
5. **TOC on wide screens is a separate always-open `<nav>`**, not one `<details>` that opens on wide screens. HTML can't change `open` by screen width without JS.
6. **Lead hidden for imported posts:** each one opens with its own summary, so the lead would repeat it.
7. **The "TOC on the long fixture only" criterion** holds among fixtures. Two imported posts (5 and 7 min, 10–12 headings) also get a table of contents, as the rule intends.
8. **`valid-id` relaxed in html-validate:** Sätteri's heading ids for numbered headings start with a digit, which HTML5 allows.

## Notes for Jay

- **Blog name and nav label:** both are still `blog` (`~/blog` as the page title). Tell me if you want another name, for example "Thoughts" as TypeSafe uses (DesignSpec §3).
- **Blog subtitle (N12):** still hidden.
- **Overlapping tags:** your Medium tags include both `ai` and `artificial-intelligence`, and three `career-*` / `software-*` variants. Each gets its own tag page; I left them as Medium has them.
- **Live site:** merging this into `master` makes `/blog/`, the 3 posts, the tag pages and `/rss.xml` live. That fixes the home page's blog links and the nav's BLOG link.

## Human checkpoint

```
npm run build:fixtures
npm run preview
```
1. Open http://localhost:4321/blog/ on desktop and phone, open a few posts, try the tag filter and toggle dark mode.
2. Check the code blocks on `/blog/fixture-long-post/`: highlighting, horizontal scroll, and the copy button.
3. Read `docs/PUBLISHING.md`.
4. Confirm the blog name and nav label.
5. Run `npm run build` afterwards to get the production `dist/` back.

## Home and shared tweaks (Nov 2, 2026, during the Stage 5 checkpoint)

Jay's requests, applied:

| Request | Change |
|---|---|
| Ghost numbers (01, 02, …) more visible | `--opacity-ghost` raised from 0.08 to 0.22: darker on light, brighter on dark. The numbers are CSS-generated, so contrast audits don't apply. |
| "resume.pdf" appeared three times | The links row is removed. The terminal's `ls` output is now `blog/ projects/ github linkedin medium email`, without `about.md` or `resume.pdf`. A primary **Download resume** button sits under the terminal. |
| Badge and role line were redundant | The eyebrow badge and the "Software Development Engineer II @ Amazon" line are removed. The h1 is just "Jay Parekh", with three badges below it: Software Engineer, Amazon, Seattle (`HOME.badges`). |
| Bigger highlight group titles | Engineering, Gaming & community, Map making and Off the clock are now 1 rem, bold, in the foreground colour (they were 10 px muted labels). |
| Education like experience | Rendered with `ExperienceItem`: the degree as the bold title (now spelled out, e.g. "Master of Science in Computer Science"), the school and affiliation below, dates and location, and one sentence: "Coursework included A, B, and C." `EducationItem.astro` is deleted. |
| Skills: bigger, more spacing, no slashes | A `SpecTable` with a new `size="lg"`: 16 px rows, more padding, a 12 rem label column with values beside it. On phones the value stacks under its label. The `///` separators are gone. |
| Back to top didn't work | `id="top"` was on the sticky header, which is always on screen, so jumping to it never scrolled. It moved to `<body>`. Tested: clicking "back to top" from the bottom (scrollY 8,234) now lands at 0. |

**Checks:**
- `npm run verify` exits 0; `/` is 12.6 KB initial.
- Lighthouse is 100/100/100/100 on `/`, `/blog/` and the imported post.
- At 360 px there's no overflow.
- Checked in the browser: one h1, three badges, terminal links as listed, the resume button, three education entries with degree titles, five skill rows with values left-aligned (192 px label column, 16 px text), and ghost opacity 0.22 in both themes.
- **Terminal placement (follow-up):** the intro is one column at every width: name and badges, the one-liner, then the terminal across the full container width (1,216 px at a 1,440 px window), then the Download resume button. `npm run verify` exits 0; `/` is 12.3 KB initial.
- **Intro tags (follow-up):** "Software Engineer", "Amazon" and "Seattle" now use the `Tag` component (bordered, mixed case, no square) instead of `Badge` (`HOME.tags`). `npm run verify` exits 0; `/` is 11.8 KB initial.

## Compact mode and timeline space (Nov 2, 2026)

Jay asked for a compact on/off toggle on experience and education (on by default), and an empty area at the start of experience for a planned horizontal timeline, 2015 – present.

- **`CompactToggle`** (new component): a native `<input type="checkbox" role="switch" checked>` inside a `[x] compact` / `[ ] compact` label. Its accessible names are "Compact experience" and "Compact education", and it keeps the 2 px focus ring and a 44 px target.
- **CSS only, no JS:** a rule in `base.css` hides `.is-extra` content while its switch is checked (mechanism revised below; no `:has()`). Everything stays in the HTML.
- **Experience:** each role's new `compactBullets` field (1-based) lists the bullets compact mode keeps. These are my picks, for Jay to adjust in the YAML:

  | Role | Kept in compact |
  |---|---|
  | SDE II | 1 (cache consistency, zero customer impact), 2 (>99.99% migration), 4 (secure authentication migration) |
  | SDE I | 1–3 ($1.74M and −15 ms, −10 ms migration, 3–4 months saved) |
  | Intern | 1–2 (full-stack tool, 4 h → 5 min) |
  | Bigshine | 1 (4 subsidiaries), 3 (U Cypher on MTV India) |
  | Drag2Death | 1–2 (24+ servers and 100,000+ users, 20+ eSports events) |

  Tested: compact on shows 3/3/2/2/2 bullets, off shows 9/6/4/4/4, and toggling back works.
- **Education:** compact mode hides the coursework sentence, leaving degree, school, dates and location. Tested in both states.
- **Timeline slot:** an empty `div.timeline-slot` (`aria-hidden`, 8 rem tall) between the experience header and the first role, marked with an HTML comment.
- **Checks:** `npm run verify` exits 0; `/` is 12.7 KB initial. Lighthouse is 100/100/100/100 on `/`, `/blog/` and the imported post.
- **Note:** browsers may restore a visitor's own toggle state on reload. `autocomplete="off"` would prevent that, but it's invalid HTML on checkboxes, so it isn't used.

### Compact toggle fix (Jay: "the compact toggle isn't working")

- **Cause:** the hide rule depended on CSS `:has()`, which older browsers (Firefox before 121, older Safari) don't support and some apply unreliably when a checkbox changes. Real clicks worked in Chromium here, so this was the weak point rather than a reproduced failure.
- **Fix:** `CompactToggle` now renders the checkbox as a visually hidden sibling *before* the section's content, plus a `<label for>` that draws `[x]`/`[ ]`. The rule is now `.compact-input:checked ~ * .is-extra { display: none }`, a plain sibling selector supported everywhere. A bullet list with nothing left in compact mode carries `is-extra` itself, so no `:has()` is needed there either. `.compact-scope` is gone.
- **Tested with real clicks and keyboard:** experience 12 ↔ 27 bullets; education 0 ↔ 3 coursework lines; Tab shows the focus ring on the switch, and Space toggles it.
- **Checks:** `npm run verify` exits 0. Lighthouse on `/` is 100/100/100/100 (3 runs), and all lhci assertions pass.

### Role header, timeline placeholder, education switch (Jay, Stage 5 checkpoint)

- **Left column of each role/education entry:** sizes go largest to smallest from top to bottom: title (`--fs-title`, bold), then the company or school as a `Badge` (■ AMAZON), then the dates, location and any extra item as `Tag`s. The team ("Shopping Cart") is no longer shown; the `team` field stays in the YAML as data. A college's university ("University of Mumbai") is an extra tag.
- **Timeline placeholder:** the reserved area now has a dashed border and the text "// timeline: 2015 → present / coming soon".
- **Education:** the compact switch is removed; the coursework always shows. Experience keeps its switch.
- **Checks:** `npm run verify` exits 0 (astro check 0 errors). No horizontal scroll at 375 px. Lighthouse is 100/100/100/100 on `/`, `/blog/` and the imported post (3 runs each).

### Compact switch regression, inverted tags (Jay, Stage 5 checkpoint)

- **Regression:** after the role header change, the bullet rule became `.role__bullets > li`. Astro scoping adds an attribute to each compound, so it outranked the global hide rule and every bullet stayed visible. The hide rule is now `display: none !important`, so no scoped style can override it.
- **Tested with real clicks:** experience 12 ↔ 27 bullets, both ways.
- **Inverted tags:** `Tag` has a new `inverted` prop (foreground fill, background text, the same look as an active filter tag). The dates, location and extra tags in each role's left column use it: black on white in light mode, white on black in dark mode.
- **Checks:** `npm run verify` exits 0. Lighthouse is 100/100/100/100 on `/`, `/blog/` and the imported post.
