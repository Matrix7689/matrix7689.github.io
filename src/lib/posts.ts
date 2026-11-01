// Blog post queries (SPEC Stage 3 task 6). Drafts are hidden in production builds unless
// SHOW_DRAFTS is set (`npm run build:fixtures`); `npm run dev` shows them.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

const SHOW_DRAFTS = import.meta.env.DEV || Boolean(process.env.SHOW_DRAFTS);

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', (p) => SHOW_DRAFTS || !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

/** URL slug: the file name without its `yyyy-` prefix. */
export const postSlug = (post: Post) => post.id.replace(/^\d{4}-/, '');

/** Neighbours in a newest-first list: `prev` is the older post, `next` the newer one. */
export function adjacent(posts: Post[], post: Post): { prev?: Post; next?: Post } {
  const i = posts.findIndex((p) => p.id === post.id);
  return { prev: posts[i + 1], next: i > 0 ? posts[i - 1] : undefined };
}

/** Tags used by the given posts, alphabetical. */
export const tagsOf = (posts: Post[]) => [...new Set(posts.flatMap((p) => p.data.tags))].sort();
