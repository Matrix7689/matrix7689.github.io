// RSS 2.0 feed (SPEC Stage 5 task 5, D13): published posts only, even in fixture builds; valid
// with 0 items. Each item links to the post on this site.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postSlug } from '../lib/posts';
import { SITE } from '../site.config';

export async function GET(context: APIContext) {
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  return rss({
    title: `${SITE.name} · Blog`,
    description: `Posts by ${SITE.name} on software engineering.`,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.summary,
      link: `/blog/${postSlug(p)}/`,
      pubDate: p.data.date,
      categories: p.data.tags,
    })),
    customData: '<language>en</language>',
  });
}
