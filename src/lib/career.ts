// The career timeline shared by the home and About pages: bars from every role and the university
// entries, one lane per organisation in HOME.timeline's order (Stage 5 follow-up; About since Stage 8).
import { getCollection } from 'astro:content';
import { HOME, ABOUT } from '../data/pages';
import { buildTimeline, type Segment } from './timeline';

/** Every role in display order (SDE II first). */
export async function getRoles() {
  return (await getCollection('experience')).sort((a, b) => a.data.order - b.data.order);
}

export async function careerTimeline() {
  const roles = await getRoles();
  const segments: Segment[] = [
    ...roles.map(({ data: r }) => ({ title: r.title, org: r.company, start: r.start, end: r.end, kind: /intern/i.test(r.title) ? ('internship' as const) : ('work' as const) })),
    ...ABOUT.education.filter((e) => e.level === 'university').map((e) => ({ title: e.degree, org: e.school, start: e.start, end: e.end, kind: 'study' as const })),
  ];
  return buildTimeline(
    HOME.timeline.from,
    HOME.timeline.lanes.map((l) => ({ label: l.label, segments: segments.filter((s) => s.org === l.org) })),
  );
}
