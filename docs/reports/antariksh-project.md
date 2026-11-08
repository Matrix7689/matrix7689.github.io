# Antariksh Mobile Game: project addition

Date: Nov 9, 2026 · Branch: `revamp` · Not a SPEC stage · **Waiting on Jay: source videos and open questions**

## Status
The project page, schema, links, frame script and docs are done and verified. **The screenshots are not done:** `C:\Jay Data\portfolio revamp\antariksh-source\` does not exist, so no frames were extracted. Nothing was downloaded. Until frames are added, the page has no images and shows "Screenshots coming soon.", like the other projects.

## Files changed
- `src/content/projects/antariksh-mobile-game.md` (new): `year: 2021`, `featured: false`, `order: 6`, five `links.more`.
- `src/content.config.ts`: optional `links.more` (`{ label, url }[]`) and `gallery` (`{ src: image(), alt }[]`).
- `src/pages/projects/index.astro`: `links.more` on the card, after GitHub and live.
- `src/pages/projects/[slug].astro`: `links.more` as text links with `rel="noopener"`, hidden when absent. When `gallery` is set, it replaces the video or cover and the "coming soon" note.
- `src/components/ProjectGallery.astro` (new): static, lazy `detail` images, each linked to its 1920 px WebP. It adds no JS, unlike the map slideshow.
- `src/components/ProjectCard.astro`: outbound links gain `rel="noopener"`. The existing project links did not have it, so the brief's "like the other external links" was applied to all card links.
- `scripts/extract-frames.mjs` (new), `npm run media:frames`: `--times` for PNGs at timestamps, `--sheet [--every 10]` for labelled contact sheets. Tested on `public/media/halma-ai/demo.mp4`.
- `lighthouserc.json`: added `/projects/antariksh-mobile-game/`.
- `SPEC.md` §4.5: new row and a note that the table has more than 4 rows.

**Hard-coded counts or lists:** none needed changing. `/projects/` and prev/next render from the collection. Home and JSON-LD have no project count, and there is no sitemap yet (Stage 9).

## Verification
### `npm run verify`: exit 0
```
/                                 16.4 KB initial (<50)   JS 1.0 KB (unchanged)
/projects/                         7.8 KB initial (≤50)   159.2 KB total (≤200)
/projects/antariksh-mobile-game/   7.1 KB initial (≤80)     7.1 KB total (≤600)
all budgets pass, 0 third-party references
internal link check: 69 seed pages, 1908 ok, 0 broken
```
The page has no external scripts and no iframes.

### `npm run lhci`: exit 0 (13 URLs, 3 runs each)
```
/projects/antariksh-mobile-game/   100/100/100/100 ×3
/projects/                          99/100/100/100, 100/100/100/100 ×2
every other audited URL             100/100/100/100 ×3
```

### Other checks
- `npm run check:inputs`: **10** (was 7): GitHub repo, planet spellings and playlist check, all frontmatter comments. Built page contains 0 occurrences of "NEEDS INPUT".
- 360 px: no horizontal scroll on the new page or `/projects/`.
- Headings: h1, then h2 "Role".
- `npm run check:links:external`: all five new links return 200. **This does not validate the playlist:** YouTube answers 200 for invalid playlist IDs too.
- Gallery path tested with a temporary entry using an existing image, then removed: valid HTML, within budget (53.8 KB total for one image), links to the 1920 px WebP, "coming soon" note gone. Six frames still need measuring against the 600 KB budget.

## Facts and sources
All come from Jay's brief.

| Fact on the page | Source in the brief |
|---|---|
| Title, full name, slug | Project facts |
| May 2021, `year: 2021` | Jay's stated date (the demo video's "Fall 2020" is deliberately not used) |
| CSCI 526 (Advanced Mobile Devices and Game Consoles), USC, team of 7 | Context |
| Unity, C#, Android, touch controls | Stack and platform |
| Four planets; three missions each | Game (final version, per the demo video) |
| Battery, water bottle, rifle, oxygen on Earth | 3D mission |
| Kill targets 70 (Earth), 100 (Arrakis), varies with difficulty | 2D mission |
| 2.5D movement, crystals, health bar, repeat/abort | 2.5D level |
| Themed levels, hazards, moving platforms, end-of-level enemies; volume sliders | Game |
| 13 weekly progress updates with videos | Process fact |
| Five Role bullets | Jay's contribution |
| Links and labels | Links, Task 1 |

Summary is (proposed), 124 characters. No teammate names, and no "Recon / Rescue / Capture".

**Wording choice for Jay to check:** the brief lists SFX and music, level design, and enemies and weapons without saying what he did on each, so those bullets say "Worked on…" rather than claim more. The mission descriptions are short paragraphs, not bullets, because the past-tense bullet rule fits accomplishments.

## Frames
None yet (no source videos). Frame list (video and timestamp) to be added here.

## Open questions
1. **Videos:** put `demo`, `trailer` and `gameplay` (any common extension) in `C:\Jay Data\portfolio revamp\antariksh-source\`.
2. **Date:** confirm May 2021. The demo video says Fall 2020.
3. **Playlist:** open https://youtube.com/playlist?list=PLLc9a_xp6wro. Its ID looks truncated.
4. **Planet spellings:** Earth, Arrakis, Magmar, Aquilon (from auto-captions).
5. **GitHub repo:** is there a public one?
6. **Featured:** the brief says home shows at most 4 featured projects, but there is **no limit in the code**. Home shows all featured projects, currently 5: NewsApp React, NewsApp Android, Halma, Mars rover, Advanced text summarization. With `featured: false` Antariksh is on `/projects/` only. Should it be added, or replace one?
