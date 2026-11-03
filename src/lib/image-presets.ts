// Image preset numbers (SPEC Stage 2 task 2), with no Astro imports so astro.config.mjs and its
// Markdown plugins can load them in plain Node. Qualities were tuned against every source in
// src/assets so the worst-case output stays under its cap (thumb ≤ 30 KB, detail ≤ 150 KB,
// large ≤ 450 KB); check-budgets enforces the caps on every build.

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
      // 52 (was 55, Stage 7): keeps a map page's eager first screenshot (1280 px AVIF) inside the
      // 120 KB initial budget with headroom; LCZ CTF Galaxy measured 113.6 KB → 100.4 KB.
      { format: 'avif', quality: 52 },
      { format: 'webp', quality: 50 },
      { format: 'jpg', quality: 65 },
    ],
  },
};

export const LARGE = { width: 1920, format: 'webp' as const, quality: 75 };
