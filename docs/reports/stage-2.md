# Stage 2 report: image and media pipeline

Branch `revamp`, Nov 1, 2026. Not merged to `master`, so the live site is unchanged.

## What changed

| Commit | What |
|---|---|
| `abfcfc8` docs: record early launch in spec and CLAUDE.md | Before starting the stage: SPEC D2, the stage conventions, Stage 10 and Stage 11, and the CLAUDE.md git rules now say that `master` is live and every push to it deploys. |
| `2c7260c` chore: move level-design and project images into src/assets | `git mv` of all 12 gallery folders to `src/assets/level-design/<slug>/` and the 4 project images to `src/assets/projects/<slug>/{cover.png,demo.gif}`. The `images/` folder is removed. 66 renames, 0 bytes added. |
| `d040aad` feat: convert GIF demos to MP4 and WebM | `scripts/convert-gifs.mjs` (`npm run media:convert`): `public/media/<slug>/demo.{mp4,webm}` plus a first-frame `poster.png` beside each GIF. |
| `5622351` feat: add image presets, Img and Video components | `src/lib/images.ts` (presets, `largeUrl()`, `posterUrl()`), `Img.astro`, `Video.astro`, the grayscale CSS in `base.css`, sharp encoder options in `astro.config.mjs`, the styleguide image and video section, and the fixture-only `/_styleguide/images/` audit page. |
| `b5c2a0b` feat: add originals guard and per-preset image budgets | `scripts/check-originals.mjs` (added to `verify`) and the `check-budgets` extension (per-preset caps and `<img>` attribute rules). `budgets.json` gains `imageKB`, and `ffmpeg-static@5.3.0` is pinned. |

### Presets (`src/lib/images.ts`)
I tuned each quality setting with sharp against every source: all 62 map JPEGs and the 2 project PNGs. Thumbnails were tuned on the 14 covers only, because those are the only images that become thumbnails. The encoders are mozjpeg, WebP at effort 6 and AVIF at effort 4.

| Preset | Widths | AVIF | WebP | JPEG fallback | Cap | Worst output across all sources |
|---|---|---|---|---|---|---|
| `thumb` | 400, 600 | q55 | q55 | q45 | 30 KB | AVIF 28.5, WebP 29.0, JPEG 28.2 KB |
| `detail` | 800, 1280 | q55 | q50 | q65 | 150 KB | AVIF 117.9, WebP 110.8, JPEG 125.6 KB |
| `large` | 1920 (WebP only, link target) | – | q75 | – | 450 KB | 365.8 KB |

### Videos (`public/media/`)
The script starts at a high-quality CRF and raises it until each file is at most 400 KB. Both demos fit at the starting value.

| Demo | GIF | MP4 (H.264, CRF 23) | WebM (VP9, CRF 32) | Duration |
|---|---|---|---|---|
| `halma-ai` | 2,837 KB, 480×480, 498 frames | **118.9 KB** | 114.6 KB | 33.2 s (GIF 33.19 s) |
| `mars-rover-search` | 781 KB, 567×320, 225 frames | **117.9 KB** | 198.2 KB | 9.04 s (GIF 9.04 s) |

The output is 4.0–6.6× smaller than the GIFs. The posters are WebP made through the detail preset; the Halma poster is 7.0 KB.

## Verification output

`npm run verify` (production build) exits 0:
```
astro check   Result (35 files): 0 errors, 0 warnings, 0 hints
check:budgets
route                                html      css       js    initial   budget      total   budget     fonts
/                                  1.9 KB   2.6 KB   0.4 KB     4.2 KB      <50     4.2 KB     ≤120   48.1 KB
/_styleguide/                      4.9 KB   4.0 KB   0.7 KB    15.8 KB      ≤80   104.8 KB     ≤200   48.1 KB
image outputs by preset (raw bytes; caps thumb 30 KB, detail 150 KB, large 450 KB)
  thumb      6 files  webp max 28.6 KB, avif max 27.1 KB, jpg max 23.7 KB
  detail     7 files  jpg max 80.2 KB, avif max 61.9 KB, webp max 47.2 KB
  large      2 files  webp max 224.4 KB
all budgets pass, 0 third-party references
check:originals
originals: 68 source files hashed, 30 dist files checked (18 images)
0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB
check:html    (clean)
check:links   internal link check: 2 seed pages, 27 ok, 0 broken, 39 skipped
```

Fixture build (`npm run build:fixtures && npm run check:budgets && npm run check:originals`): this build adds `/_styleguide/images/`, which runs **every** source through its presets.
```
/_styleguide/images/               8.5 KB   2.5 KB   0.4 KB    10.8 KB      ≤80  4647.9 KB   ≤12000   48.1 KB
image outputs by preset (raw bytes; caps thumb 30 KB, detail 150 KB, large 450 KB)
  thumb     84 files  webp max 29.0 KB, avif max 28.5 KB, jpg max 28.2 KB
  detail   369 files  jpg max 125.6 KB, avif max 117.9 KB, webp max 110.8 KB
  large     66 files  webp max 365.8 KB
all budgets pass, 0 third-party references
originals: 68 source files hashed, 535 dist files checked (522 images)
0 raw originals in dist/, 0 GIFs, every image ≤ 450 KB
```
The first fixture build took 2 m 8 s, because it encodes 519 images. Later builds use Astro's image cache and take about 2 s. Production CI builds only encode the styleguide's 15 outputs.

### All 14 covers (fixture build)
The project covers are 800 px wide, so their detail output stops at 800 w: the pipeline never upscales.

| Source | thumb AVIF 600w | detail 1280w AVIF / WebP / JPEG | large WebP 1920w |
|---|---|---|---|
| level-design/aim-devbeach/0_main.jpg | 13.8 KB | 41.8 / 37.0 / 61.8 KB | 95.5 KB |
| level-design/aim-lego-ak/0_main.jpg | 24.5 KB | 75.3 / 65.3 / 97.9 KB | 162.6 KB |
| level-design/ar-industry/0_main.jpg | 21.3 KB | 88.6 / 79.9 / 97.0 KB | 190.0 KB |
| level-design/awp-lego-2015/0_main.jpg | 24.4 KB | 100.6 / 110.8 / 123.1 KB | 153.6 KB |
| level-design/awp-lego-2016/0_main.jpg | 26.2 KB | 85.2 / 82.1 / 106.5 KB | 218.5 KB |
| level-design/awp-lego-asia/0_main.jpg | 27.1 KB | 89.2 / 84.6 / 114.9 KB | 224.4 KB |
| level-design/awp-lego-fort/0_main.jpg | 23.9 KB | 80.6 / 80.6 / 105.4 KB | 221.9 KB |
| level-design/awp-lego-x/0_main.jpg | 26.1 KB | 82.8 / 80.5 / 110.5 KB | 210.8 KB |
| level-design/awp-lego-z/0_main.jpg | 21.1 KB | 75.9 / 81.1 / 105.3 KB | 225.2 KB |
| level-design/awp-taj-heaven/0_main.jpg | 14.0 KB | 43.7 / 35.2 / 59.6 KB | 90.0 KB |
| level-design/awp-tridust/0_main.jpg | 18.0 KB | 71.0 / 58.2 / 80.1 KB | 175.4 KB |
| level-design/lcz-ctf-galaxy/0_main.jpg | 28.5 KB | 113.6 / 99.9 / 114.1 KB | 248.4 KB |
| projects/newsapp-android/cover.png | 27.7 KB | 40.1 / 39.4 / 58.4 KB (800 w) | 49.5 KB (800 w) |
| projects/newsapp-react/cover.png | 27.9 KB | 50.8 / 44.6 / 60.9 KB (800 w) | 55.1 KB (800 w) |

### Guard self-tests (planted in `dist/`, then rebuilt clean)
I planted three things: a raw map JPEG copy, a raw `demo.gif` copy, and in `index.html` an `<img>` with no attributes plus a large WebP tagged as a thumb.
```
check:originals  4 failure(s):
  FAIL dist/planted.gif is a raw copy of src/assets/projects/halma-ai/demo.gif
  FAIL dist/planted.gif: GIFs must not ship (SPEC D10)
  FAIL dist/planted.gif: 2837.1 KB > 450 KB image cap
  FAIL dist/planted.jpg is a raw copy of src/assets/level-design/aim-devbeach/1.jpg
check:budgets    5 failure(s):
  FAIL planted.gif: 2837.1 KB > 500 KB file cap
  FAIL /: <img src="/planted.jpg"> lacks width, height, decoding="async", loading="lazy" (or data-eager)
  FAIL /: initial 324.6 KB >= 50 KB
  FAIL /: total 690.4 KB > 120 KB
  FAIL _astro/3.B1gJfPIz_Z7g8uk.webp: used as both thumb and large
```
The guard also caught a real problem. My first version of the audit page sat in `src/pages`, and its `import.meta.glob` made a production build emit 22 raw originals into `dist/` (510–912 KB each), even though the page itself wasn't built. `check-budgets` failed the build. The page now lives in `tests/fixtures/pages/` and is injected only by `build:fixtures`; see deviation 4.

### Browser checks (`npm run preview`, `/_styleguide/`)
- **Thumbnail:** the browser loads `0_main…avif` at 400 w for `sizes=300px`. The computed filter is `grayscale(1)`, and it clears on hover or focus of the link.
- **Detail:** loads the AVIF at 1280 w.
- **Video:** `preload=none`, no autoplay, controls on, WebP poster. Calling `play()` runs `halma-ai/demo.mp4` at 480×480, 33.2 s long.
- **Banding check:** for 3 covers (`awp-lego-asia`, `lcz-ctf-galaxy`, `awp-tridust`) I put a lossless 600 px resize next to the shipped AVIF, both cropped and upscaled 2× with nearest-neighbour scaling. There's no banding in the sky gradients. Fine texture such as brick and the star field is slightly softer. PSNR is 25.5, 27.2 and 26.8 dB; it's low because of the high-frequency texture.

## Acceptance criteria

| Criterion | Result |
|---|---|
| `npm run verify` (now including `check:originals`) exits 0 | **Pass** |
| All 12 map covers: thumb AVIF ≤ 30 KB at 600 w; detail ≤ 150 KB at 1280 w; large WebP ≤ 450 KB at 1920 w | **Pass**: max 28.5 / 123.1 (largest format) / 248.4 KB (table above) |
| `halma` and `mars-rover-search` MP4 ≤ 400 KB each; no `.gif` in `dist/` | **Pass**: 118.9 KB and 117.9 KB; 0 GIFs |
| 0 raw originals in `dist/` (hash check) | **Pass**: in both the production and fixture builds |
| Packed repo growth ≤ 2 MB (videos only) | **Pass**: see below |

## Repo size

| | Before (Stage 2 start) | After (`git gc`) |
|---|---|---|
| `git count-objects -vH` size-pack | 53.12 MiB (333 objects) + 400 KiB loose | 53.97 MiB (520 objects), 0 loose |
| Working tree (excl. .git, node_modules, dist) | 34.25 MB, 122 files | 34.92 MB, 134 files |
| `dist/` (production) | 324.5 KB, 11 files | 1.60 MB, 30 files |

Growth is +0.85 MiB packed, or +0.45 MiB counting the loose objects that existed before. Most of it is the four video files (~550 KB) and the two posters (107 KB). The moves added 0 bytes. LFS isn't needed: the repo grew far less than 50 MB, and `dist/` is far under 100 MB.

10 largest `dist/` files:
```
    224.4 KB  _astro/0_main.CoTkIs7-_1ypxjq.webp   (large, styleguide)
    217.2 KB  Jay_Parekh_Resume.pdf
    198.2 KB  media/mars-rover-search/demo.webm
    127.7 KB  _astro/1.DlgyEg1K_ZhC95P.webp        (large, styleguide)
    118.9 KB  media/halma-ai/demo.mp4
    117.9 KB  media/mars-rover-search/demo.mp4
    114.6 KB  media/halma-ai/demo.webm
     80.2 KB  _astro/1.DlgyEg1K_25yQ6C.jpg          (detail JPEG fallback)
     61.9 KB  _astro/1.DlgyEg1K_ZegE8R.avif         (detail)
     47.2 KB  _astro/1.DlgyEg1K_2c8AIw.webp         (detail)
```

`NEEDS INPUT` markers in `src/` and `public/`: 0. The SPEC's own register is unchanged.

## Deviations from the spec

1. **`Img` builds `<picture>` itself** with one `getImage()` call per format and width. I didn't use Astro's `<Picture>`, because `<Picture>` applies a single quality to every format, and the caps need a different quality per format. The output is the same: AVIF and WebP `<source>`s, a JPEG `<img>` with `srcset`, explicit width/height, lazy loading and async decoding.
2. **Posters come from a committed `poster.png` (the first frame)**, not from the GIF directly. Astro's sharp service opens GIFs as animated (`pages: -1`), and when encoding fails it ships the raw GIF. `convert-gifs.mjs` extracts frame 1 with sharp, and `Video` runs that through the detail preset (WebP).
3. **MP4 is listed before WebM** in `<video>`. Every current browser plays H.264, and the Mars WebM is larger than its MP4 (198 vs 118 KB). WebM stays as the fallback.
4. **The audit page `/_styleguide/images/` is in `tests/fixtures/pages/`**, not in `src/pages`. An integration in `astro.config.mjs` injects it only when `INCLUDE_FIXTURES` is set. A file in `src/pages` makes production builds emit every raw original; this was caught and fixed, see the self-tests. It has its own budget row: initial ≤ 80 KB, total ≤ 12,000 KB.
5. **`data-preset` attributes** on `<picture>`, the `<video>` and "view original" links tell `check-budgets` which cap applies to each output file.
6. **Image bytes in page totals** use each image's heaviest candidate in the first `<source>` format: the worst case for a high-DPR phone. Before this stage, the budget counted only the `<img src>`. Posters count as eager.
7. **Styleguide file name:** this stage edited `src/pages/[styleguide].astro`. The SPEC calls the file `_styleguide.astro`; see Stage 1 deviation 1.
8. **Mars video is 566×320.** H.264 with `yuv420p` needs even dimensions, so the 567 px GIF loses one column.
9. **`ffmpeg-static` install script:** npm prints "install scripts not yet covered by allowScripts". The binary installed locally, and CI never runs ffmpeg, so it doesn't matter there.

## Notes for Jay

- **Live site:** these commits are on `revamp` only. https://matrix7689.github.io/ won't change until `revamp` is merged into `master`. There's nothing visitor-facing in this stage; the only visible change is the hidden styleguide.
- **Thumbnail quality:** at q55, thumbnails keep gradients clean but soften fine game textures a little. If you want them crisper, the 30 KB cap is the limit: `lcz-ctf-galaxy` and `awp-lego-2015` are within about 1.5 KB of it. Larger thumbnails would need a higher cap.
- **Re-running the conversion:** to regenerate the videos (for example with different quality), run `npm run media:convert` and commit the outputs.

## Human checkpoint

```
npm run build:fixtures
npm run preview
```
1. Open http://localhost:4321/_styleguide/ and scroll to **Images and video** (in both themes). Hover or Tab onto the thumbnail to check the grayscale → colour change, open "view original (1920 px WebP)", and play the Halma video.
2. Open http://localhost:4321/_styleguide/images/ (fixture build only). It lists all 64 sources with their thumbnail (covers only), detail image and a `large` link. Look at a few at 2× browser zoom.
3. Approve the compression levels, or tell me which preset to push harder or softer.
4. Afterwards, run `npm run build` again so your local `dist/` is the production build. It doesn't matter for deploys, which build in CI.

## Checkpoint review (Nov 1, 2026)

Jay approved the image and video compression levels as they are. No changes.
