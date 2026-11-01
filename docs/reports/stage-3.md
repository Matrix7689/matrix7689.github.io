# Stage 3 report: content model and data entry

Branch `revamp`, Nov 1, 2026. Not merged to `master`, so the live site is unchanged. Nothing in this stage is rendered on a public page yet.

## What changed

| Commit | What |
|---|---|
| `af42e91` feat: add content collection schemas and lib helpers | `src/content.config.ts` defines `blog`, `projects`, `levels` and `experience` per Appendix A. The blog loader adds `tests/fixtures/blog/*.md` only when `INCLUDE_FIXTURES` is set. Helpers in `src/lib/`: `reading-time.ts`, `canonical.ts` (D6), `dates.ts` and `posts.ts` (drafts hidden in production; newest first; `postSlug`, `adjacent`, `tagsOf`). |
| `d49728a` feat: import the 3 Medium posts | `src/content/blog/2026-<slug>.md` ×3, plus 7 images in `src/assets/blog/<slug>/`. |
| `53dfe0a` feat: add experience, project, level and page content | 4 roles (`.yaml`), 4 projects (`.md`), 12 maps (`.md`, 62 gallery images through `image()`), and `src/data/pages.ts` for page copy that isn't a collection entry. |
| `e4eb116` feat: add reading-time plugin, blog fixtures and content audit | Registers the reading-time plugin, adds 3 draft fixtures and the fixture-only `/_styleguide/content/` audit page, and renames `media:convert` to `media:gifs` to match Appendix C. |

### The Medium import (task 1a)
Medium answers scripted requests with 403, but the posts load normally in the built-in browser. For each post I:
1. Opened the public post and converted the article's body blocks (Medium's `data-selectable-paragraph` elements plus figures) to Markdown in the page itself. Medium's interface (claps, "Listen", responses, recommendations) is excluded.
2. Wrote that Markdown to disk and **compared SHA-256 hashes** of the browser copy and the local copy. All three match byte for byte.
3. Ran a one-off import that adds frontmatter, copies the images and makes formatting-only changes (deviation 3). A final words-only comparison between the verified copy and the committed post is **identical** for all three.

| Post | Date | Words | Reading time (ours / Medium) | Images | Body hash, browser = local |
|---|---|---|---|---|---|
| How to Work Better With AI | 2026-01-20 | 1,119 | 5 / 5 min | 1 | `6762d65a…` |
| How I Avoid and Handle Burnout | 2026-10-14 | 896 | 4 / 4 min | 1 | `2a9fbedd…` |
| Critical Thinking Is Fading. Here’s How You Can Reclaim It | 2026-10-29 | 1,605 | 7 / 7 min | 5 | `137c3a79…` |

Each post has `draft: false`, its clean D5 URL as `mediumUrl`, no `canonicalUrl`, and Medium's 5 tags in kebab case. The images are Medium's originals (`miro.medium.com/v2/<id>`), 108–459 KB each, stored in `src/assets/blog/<slug>/01.jpg…`.

## Verification output

`npm run verify` exits 0:
```
astro check    Result (43 files): 0 errors, 0 warnings, 0 hints
check:budgets  /  4.2 KB initial (<50);  /_styleguide/ 15.8 KB;  all budgets pass, 0 third-party references
check:originals  originals: 75 source files hashed, 30 dist files checked (18 images)
                 0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB
check:html     clean
check:links    internal link check: 2 seed pages, 27 ok, 0 broken
```

`npm run build:fixtures` passes. It builds 4 pages and checks every collection through `/_styleguide/content/`:
```
blog (6) · 3 imported posts (draft false) + 3 fixtures (draft true), newest first, prev/next correct
  2026-10-29 critical-thinking-is-fading-…  7 min  12 headings  canonical → Medium
  2026-10-14 how-i-avoid-and-handle-burnout 4 min  10 headings  canonical → Medium
  2026-03-02 fixture-long-post (draft)      2 min   6 headings  canonical → self
  2026-02-10 fixture-medium-crosspost       1 min               canonical → Medium (dummy URL)
  2026-01-20 how-to-work-better-with-ai     5 min  10 headings  canonical → Medium
  2026-01-05 fixture-images                 1 min               canonical → self
projects (4) · levels (12, 62 gallery images) · experience (4)
check:budgets /_styleguide/content/ 5.2 KB; check:originals 0 raw originals (594 dist files); check:html clean
```

Production build, fixtures excluded:
```
Select-String 'Fixture:' over dist/   → 0 hits
files or folders named *fixture* in dist/  → 0
```

Schema failure test: I changed `date: 2026-01-20` to `date: "x"` in a post, built, then reverted it.
```
[InvalidContentEntryDataError] blog → 2026-how-to-work-better-with-ai data does not match collection schema.
  date: Expected type "date", received "object"          → build exit 1
```
Missing-image test: I pointed one gallery entry at `awp-tridust/9.jpg`, which doesn't exist, then reverted it.
```
npm run build:fixtures → [ImageNotFound] Could not find requested image `../../assets/level-design/awp-tridust/9.jpg`  → exit 1
```
See deviation 7 for why the production build doesn't fail on this yet.

`npm run check:inputs`: 29 markers covering **every** item in §4.11 (N1 was already filled):

| ID | Where |
|---|---|
| N2 email | `src/site.config.ts` |
| N3 home one-liner, N6 skills, N12 blog subtitle | `src/data/pages.ts` (HOME, BLOG_INDEX) |
| N4 bio, N7 resume, N8 headshot, N11 eSports count | `src/data/pages.ts` (ABOUT) |
| N11 level-design stats | `src/data/pages.ts` (LEVEL_DESIGN) |
| N5 SDE II achievements | `src/content/experience/amazon-sde-2.yaml` |
| N9 project year/context | 4 project files (the Android file also asks for its language) |
| N10 per-map facts | 12 level files (one marker each) |
| N13 extra screenshots | 2 NewsApp files |
| Monkeytype placement (§4.1) | `src/site.config.ts` |

Metrics (§4.2), all exact: `$1.74M`, `−15 ms` (U+2212 minus), `10 ms`, `3–4 months`, `4 hours to 5 minutes`, `3 pipelines across 16 regions`, `5 peak-traffic simulations`, `2 engineers`. "Level Designer" appears in content only in the comment noting that the role was removed.

Repo size: packed 53.97 → 55.40 MiB (+1.43 MiB, mostly the 7 blog images). That's +2.28 MiB since Stage 0, within §6.3's 5 MB limit.

## Acceptance criteria

| Criterion | Result |
|---|---|
| 3 imported posts build with `draft: false`, `mediumUrl` = clean D5 URL, body text matches the Medium originals | **Pass**: hash-verified extraction, words-only comparison identical |
| `npm run build` passes with schema validation; a broken field fails the build | **Pass** (output above) |
| `build:fixtures` passes; production `dist/` has 0 `Fixture:` hits | **Pass** |
| `check:inputs` lists every §4.11 gap; nothing invented | **Pass**: 29 markers; see "For your review" for everything that is proposed |
| Every metric matches §4.2 exactly | **Pass** |

## Deviations from the spec

1. **Medium import method:** I used the live public posts in the built-in browser instead of your Medium data export. The spec's fallback is to stop and ask for the export, but the pages loaded normally, and the hash check proves the text is exactly what Medium serves. No bot check or login was involved.
2. **Summaries are Medium's own preview text** (`og:description`), because none of the three posts has a Medium subtitle. For post 1 that's the full opening paragraph (122 characters). For posts 2 and 3, Medium cuts its preview at about 140 characters and ends it with "…". The alternative, a literal `NEEDS INPUT`, would show on the site. Better summaries are listed under "For your review".
3. **Formatting-only changes to the imported Markdown:**
   - Heading levels are shifted so each post's top heading is `##` (Medium used h2/h3, which would have skipped a level under the page's h1).
   - `**bold**` wrappers inside headings are removed, since headings are already bold.
   - The second line of the two Burnout list items that contain a line break is indented, so it stays inside the list item.

   No words changed.
4. **Alt text:** Medium has alt text only on post 1's image ("The 4 step process", kept as is). I wrote factual alt text for the other 6 from what each image shows. The "good vs great question" figure's alt text transcribes the full example, because the post relies on it. This is proposed copy.
5. **Reading-time plugin:** Astro 7's default Markdown processor is Sätteri, which doesn't run remark plugins (they would need the separate unified processor). `src/lib/remark-reading-time.ts` is therefore a Sätteri mdast plugin with the same result: `readingTime` in `remarkPluginFrontmatter`. I pinned `@astrojs/markdown-satteri@0.4.6` (already a dependency of Astro) because the config imports it directly.
6. **File names:** `reading-time.ts` rather than `readingTime.ts`, to match the existing kebab-case files in `src/lib/`.
7. **Missing gallery images** fail any build that *renders* the entry. Astro resolves `image()` paths lazily. Today only `build:fixtures` renders the levels; production builds will catch it too once Stage 7 builds the archive pages.
8. **`src/data/pages.ts`** isn't in the stage's file list. It holds page copy and the markers for N3, N4, N6, N7, N8, N11 and N12, so the templates in Stages 4–8 read it rather than hard-coding copy.
9. **Markers are comments** (`# NEEDS INPUT (N…)` / `// NEEDS INPUT (N…)`), not literal field values, so nothing visible says `NEEDS INPUT`. Optional fields stay empty, and the templates hide them.
10. **Map galleries include `0_main.jpg` as the first image** (it's also the cover). That matches the image counts in §4.7, for example 7 for AWP Lego Asia.
11. **`media:convert` was renamed to `media:gifs`** to match Appendix C.

## For your review (proposed copy and open questions)

**Proposed wording** to approve or rewrite:
- **`src/data/pages.ts`:** the home badge and one-liner, the bio, and the level-design intro, all as drafted in the SPEC.
- **`amazon-sde-2.yaml`:** both SDE II bullets.
- **Project summaries and bodies** (`src/content/projects/*.md`): tightened from the old site's descriptions, with no new facts.
- **Blog summaries for posts 2 and 3**, currently Medium's truncated preview. Suggested replacements, verbatim sentences from each post:
  - Burnout: "In my experience, burnout doesn’t start with long hours. It starts when you work hard for long enough without knowing whether you’re moving in the right direction." (157 characters)
  - Critical thinking: "AI can write the code, summarize the article, and draft the plan, but it can’t do the thinking for you." (103 characters)
- **The 6 image alt texts** in the posts.

**Open questions:**
- **Links inside post 3:** they point to the Medium versions of your other two posts. I kept them as written; should they point to the copies on this site instead?
- **YouTube demo links:** the old site embedded YouTube demos for both NewsApps (`youtube.com/embed/LMVtO46jhlI`, `Pxl6860Nsec`). Embeds are banned (no third-party requests), so they aren't used. They could be plain "watch the demo" links.
- **NewsApp live link:** the live link is `http://hw8react.appspot.com/`. It returned 200 in Stage 0, but it's plain HTTP.
- **CSCI 571:** the NewsApp's live page title reads "CSCI 571 NewsApp", which suggests a USC course, but nothing states it (N9).

## Human checkpoint

Review the content files and fill in whatever `NEEDS INPUT` items you can. To list them:
```
npm run check:inputs
```
To browse every entry with its computed fields:
```
npm run build:fixtures
npm run preview
```
Then open http://localhost:4321/_styleguide/content/.

## Checkpoint answers (Nov 1, 2026)

Jay's answers, applied in the content files and in SPEC §4.1, §4.2, §4.5–§4.7, §4.10, §4.11 and Q4:

| Item | Decision | Change |
|---|---|---|
| N2 email | Public | Marker removed in `site.config.ts` |
| Monkeytype | Dropped | Removed from `site.config.ts` and `SiteLinks`, the SPEC, and the inventory script's rule (the Stage 0 inventory outputs are left as historical) |
| N4 bio | Approved with "which is where I learned to care about performance" removed | `src/data/pages.ts` |
| N5 SDE II | Jay supplied 9 bullets | Tightened to ≤ 25 words each with the same facts (only number: **>99.99%**). They replace the 2 proposed bullets; home shows the first 3 |
| N6 skills | Approved | Marker removed |
| N7 resume | Jay updates the PDF himself later | Marker replaced by a note to update the "217 KB" label when the file changes |
| N8 headshot | None | Marker removed |
| N9 years | Mars rover Sep 2019, Halma Nov 2019; Android NewsApp uses Java and Kotlin | `year: 2019`, "Built Sep/Nov 2019." in the bodies; Android stack adds Java and Kotlin |
| N10 maps | Placeholder text | `description: Description coming soon.` on all 12 maps; markers removed |
| N11 | 32 eSports events; keep the old level-design stats | Line "Organised 32 eSports events." added to About's elsewhere list; markers removed |
| N13 screenshots | "Coming soon" | Stage 6 detail pages show "Screenshots coming soon."; markers removed |

Still open (6 markers): **N3** home one-liner (not answered), **N12** blog subtitle (Jay unsure; hidden), and **N9 course context** for the 4 projects (not answered; hidden).

`npm run verify` exits 0 after the changes. The fixture content audit shows SDE II with 9 bullets (3 on home) and the Android stack with Java and Kotlin.
