// Image helpers built on the presets in image-presets.ts (SPEC Stage 2 task 2).
// Encoder options (mozjpeg, effort) are in astro.config.mjs.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { PRESETS, LARGE, type Format } from './image-presets.ts';

export { PRESETS, LARGE };
export type { Format, Preset } from './image-presets.ts';

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
