// WCAG 2.x contrast helpers, used by the styleguide to print token contrast ratios.

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((x) => x + x).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Reads `--name: #hex;` pairs from the first CSS block whose selector contains `selector`. */
export function readTokens(css: string, selector: string): Record<string, string> {
  const block = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find((m) => m[1]!.includes(selector));
  const tokens: Record<string, string> = {};
  for (const m of block?.[2]?.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g) ?? []) tokens[m[1]!] = m[2]!;
  return tokens;
}
