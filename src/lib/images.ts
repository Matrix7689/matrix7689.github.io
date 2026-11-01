// Image presets (SPEC Stage 2 task 2). Qualities were tuned against every source in src/assets
// so the worst-case output stays under its cap (thumb ≤ 30 KB, detail ≤ 150 KB, large ≤ 450 KB);
// check-budgets enforces the caps on every build. Encoder options (mozjpeg, effort) are in astro.config.mjs.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

export type Format = 'avif' | 'webp' | 'jpg';
export type Preset = 'thumb' | 'detail';

interface PresetSpec {
  widths: number[];
  /** Picture sources in order, then the <img> fallback (last entry). */
  formats: { format: Format; quality: number }[];
}

export const PRESETS: Record<Preset, PresetSpec> = {
  thumb: {
    widths: [400, 600],
    formats: [
      { format: 'avif', quality: 55 },
      { format: 'webp', quality: 55 },
      { format: 'jpg', quality: 45 },
    ],
  },
  detail: {
    widths: [800, 1280],
    formats: [
      { format: 'avif', quality: 55 },
      { format: 'webp', quality: 50 },
      { format: 'jpg', quality: 65 },
    ],
  },
};

export const LARGE = { width: 1920, format: 'webp' as const, quality: 75 };

/** Preset widths that don't upscale the source; the source width if it is smaller than all of them. */
export function widthsFor(src: ImageMetadata, widths: number[]): number[] {
  const fit = widths.filter((w) => w <= src.width);
  return fit.length ? fit : [src.width];
}

export const heightFor = (src: ImageMetadata, width: number) => Math.round((src.height * width) / src.width);

export async function srcsetFor(src: ImageMetadata, widths: number[], format: Format, quality: number) {
  const images = await Promise.all(widths.map((width) => getImage({ src, width, format, quality })));
  return images.map((img, i) => ({ url: img.src, width: widths[i]! }));
}

/** URL of the 1920 px WebP for "view original" links. Never render it inline. */
export async function largeUrl(src: ImageMetadata): Promise<string> {
  const img = await getImage({ src, width: Math.min(LARGE.width, src.width), format: LARGE.format, quality: LARGE.quality });
  return img.src;
}

/** Single WebP for a <video> poster, through the detail preset. */
export async function posterUrl(src: ImageMetadata): Promise<string> {
  const width = Math.max(...widthsFor(src, PRESETS.detail.widths));
  const webp = PRESETS.detail.formats.find((f) => f.format === 'webp')!;
  const img = await getImage({ src, width, format: 'webp', quality: webp.quality });
  return img.src;
}
