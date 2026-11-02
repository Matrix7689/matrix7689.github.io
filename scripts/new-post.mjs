// Scaffold a draft post (SPEC Stage 5 task 6).
//   npm run new:post -- "Title" [--tags a,b] [--medium <url>]
// Writes src/content/blog/<yyyy>-<slug>.md with draft: true and today's date. Refuses to overwrite.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const title = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));

if (!title) {
  console.error('usage: npm run new:post -- "Title" [--tags a,b] [--medium <url>]');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const tags = (flag('tags') ?? 'notes')
  .split(',')
  .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  .filter(Boolean);
const medium = flag('medium');
const today = new Date();
const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const dir = join(ROOT, 'src', 'content', 'blog');
const file = join(dir, `${today.getFullYear()}-${slug}.md`);
if (existsSync(file)) {
  console.error(`exists: ${file}`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

const frontmatter = [
  '---',
  `title: ${JSON.stringify(title)}`,
  `date: ${date}`,
  '# 40–160 characters; shown as the TL;DR and used as the meta description.',
  'summary: "TODO: one-sentence summary of this post, at least forty characters long."',
  `tags: [${tags.join(', ')}]`,
  'draft: true',
  ...(medium ? [`mediumUrl: ${medium}`] : []),
  '---',
  '',
  'Write the post here. Put images in `src/assets/blog/' + slug + '/` and reference them relatively.',
  '',
].join('\n');

writeFileSync(file, frontmatter);
console.log(`created ${file.slice(ROOT.length).replace(/\\/g, '/')}`);
console.log(`url when published: /blog/${slug}/`);
