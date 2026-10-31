# CLAUDE.md — matrix7689.github.io

## Purpose
Personal portfolio and blog for Jay Parekh (SDE II, Amazon), replacing the 2020 Bootstrap site.
Audience: tech companies and recruiters. Style: "monochrome minimal terminal". Top priority: speed.

## Before you do anything
1. Read `SPEC.md` and `docs/DesignSpec.md` in full before starting any stage.
2. Implement **exactly one stage per session**, the one Jay names.
3. Stop at that stage's **Human checkpoint**. Write `docs/reports/stage-<n>.md` and wait. Do not start the next stage.
4. Visuals: `docs/DesignSpec.md` wins. Performance: `SPEC.md` wins. Never invent values for DesignSpec §2.2/§3.2.
5. Never invent copy, metrics, links or posts. Unknown content stays as `NEEDS INPUT` (see SPEC §4.11).

## Stack
- Astro (static output), TypeScript strict, hand-written CSS with tokens, npm, Node 22 LTS (`.nvmrc`).
- Content collections: `src/content/{blog,projects,levels,experience}`, schemas in `src/content.config.ts`.
- Images: `astro:assets` `<Picture>` via `src/components/Img.astro`; originals live in `src/assets/` and never ship.
- Deploy: GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`, on push to `master`).

## Key commands
```
npm run dev                 # dev server
npm run build               # production build → dist/
npm run preview             # serve dist/
npm run verify              # astro check + build + budgets + originals + html + internal links (must pass)
npm run build:fixtures      # build with draft test fixtures (template testing)
npm run lhci                # Lighthouse CI, mobile, all audited URLs
npm run check:inputs        # list remaining NEEDS INPUT markers
npm run new:post -- "Title" --tags a,b [--medium URL]
npm run repo:size           # repo and dist size report
```
This runs on Windows: use npm scripts (Node ESM), not bash-only commands. Quote paths (the folder has a space).

## Hard performance rules (non-negotiable)
- Zero client JS by default. Only allowed: inline theme init + toggle, and the copy button. ≤ 2 KB gzip per page.
- No jQuery, Bootstrap, Tailwind, CSS frameworks, animation libraries, UI frameworks or hydration islands.
- No third-party requests: no Google Fonts, CDNs, icon kits, analytics or embeds.
- Home page < 50 KB transferred (gzip, excluding fonts). Lighthouse mobile ≥ 95 on Performance, Accessibility, Best Practices and SEO.
- Fonts: self-hosted subset woff2 (Geist Mono 400/700), `font-display: swap`, one preload, ≤ 60 KB total.
- Images: AVIF/WebP with JPEG fallback, `srcset`, explicit width/height, `loading="lazy"`, `decoding="async"`.
  Thumbs 400–600 px and ≤ 30 KB; full-size only on detail pages; map "originals" are build-made 1920 px WebP links, never inline.
- No raw file from `src/assets/` may appear in `dist/` (`npm run check:originals`). No GIFs ship; demos are MP4/WebM, `preload="none"`.
- No typed or animated boot sequences, scanlines, glitch, auto-scrolling tickers or blur. CSS-only motion, off under `prefers-reduced-motion`.
- Never gate content behind JS or animation. Site must be fully readable with JS disabled.

## Git rules
- Work on `revamp`. Never push to `master` until Stage 11 launch approval. Never modify or force-push `legacy-2024`.
- Small conventional commits. Don't commit `dist/`, `.astro/`, `node_modules/` or `.lighthouseci/`.
- End commit messages with the attribution lines the session gives you, if any.

## Done means
Every acceptance criterion of the current stage passes, verification output is pasted into the stage report, and `npm run verify` exits 0.
