// Geometry for CareerTimeline (Jay, Stage 5 follow-up). Bars are placed by month along a year scale that
// starts at `from` and ends with the build month ("present"). html-validate forbids inline styles, so each
// bar's left/width goes into `css` (one class per bar), which the page puts in <head>.
export type Segment = { title: string; org: string; start: string; end?: string | undefined; kind: 'work' | 'internship' | 'study' };

const ym = (s: string) => {
  const [y, m] = s.split('-').map(Number);
  return y! * 12 + (m! - 1);
};

// Length of a span in whole months, both ends inclusive (Jul 2017 – Feb 2019 = 20), e.g. "1 year 8 months".
const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
export function duration(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y > 0 && plural(y, 'year'), (m > 0 || y === 0) && plural(m, 'month')].filter(Boolean).join(' ');
}

export function buildTimeline(from: string, lanes: { label: string; segments: Segment[] }[], now = new Date()) {
  const origin = ym(from);
  const nowMonth = now.getFullYear() * 12 + now.getMonth();
  const total = nowMonth + 1 - origin;
  const pct = (months: number) => `${((Math.max(0, months) / total) * 100).toFixed(3)}%`;

  const firstYear = Number(from.slice(0, 4));
  const years = Array.from({ length: now.getFullYear() - firstYear + 1 }, (_, i) => ({ year: i + firstYear, x: pct(i * 12), odd: i % 2 === 1 }));

  const rules: string[] = [];
  let n = 0;
  const rows = lanes.map((lane) => ({
    label: lane.label,
    studyOnly: lane.segments.every((s) => s.kind === 'study'),
    bars: [...lane.segments]
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((s) => {
        const last = s.end ? ym(s.end) : nowMonth;
        const start = Math.max(0, ym(s.start) - origin);
        const end = last + 1 - origin;
        const cls = `tl-b${n++}`;
        rules.push(`.${cls}{left:${pct(start)};width:${pct(end - start)}}`);
        // Bars starting in the right half open their card leftwards so it stays on screen.
        return { ...s, cls, time: duration(last - ym(s.start) + 1), flip: start / total > 0.5 };
      }),
  }));

  return { firstYear, years, rows, css: rules.join('') };
}

export type Timeline = ReturnType<typeof buildTimeline>;
