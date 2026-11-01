// Markdown plugin (SPEC Stage 3 task 7): adds `readingTime` (minutes) to each Markdown entry's
// frontmatter, readable from `render(entry).remarkPluginFrontmatter.readingTime`.
// Astro 7's default Markdown processor is Sätteri, which takes mdast plugins (not remark ones);
// this one walks the tree once, after parsing. Counts prose and inline code; code blocks are skipped.
// The `.ts` extension is required: scripts/check-budgets.mjs loads astro.config.mjs in plain Node.
import { readingTime } from './reading-time.ts';

interface Node {
  type: string;
  value?: string;
  children?: readonly Node[];
}
interface Context {
  data: { astro?: { frontmatter?: Record<string, unknown> } };
}

function proseText(node: Node): string {
  if (node.type === 'code') return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  return (node.children ?? []).map(proseText).join(' ');
}

export const readingTimePlugin = {
  name: 'reading-time',
  after(root: Node, ctx: Context) {
    const astro = (ctx.data.astro ??= {});
    (astro.frontmatter ??= {}).readingTime = readingTime(proseText(root));
  },
};
