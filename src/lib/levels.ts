// Level-design maps and archive totals (Stage 7 revision), computed at build time from the levels
// collection, which `npm run import:levels` generates from docs/data/level-design-master.json.
import { getCollection, type CollectionEntry } from 'astro:content';

export type MapEntry = CollectionEntry<'levels'>;

/** Every map in archive order (the 12 old-site maps first, then by game, newest first). */
export async function getMaps(): Promise<MapEntry[]> {
  return (await getCollection('levels')).sort((a, b) => a.data.order - b.data.order);
}

/** Totals for the archive Figures: downloads and views already combine both platforms per map. */
export function totals(maps: MapEntry[]) {
  return {
    maps: maps.length,
    downloads: maps.reduce((sum, m) => sum + m.data.downloads, 0),
    views: maps.reduce((sum, m) => sum + m.data.views, 0),
  };
}

const NUMBER = new Intl.NumberFormat('en-US');
export const fmt = (n: number) => NUMBER.format(n);

/** "2016-08-06" (UTC, so the date never shifts with the build machine's time zone). */
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);
