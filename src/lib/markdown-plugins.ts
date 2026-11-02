// Sätteri hast plugins for blog Markdown (SPEC Stage 5 tasks 3–4). They run after Shiki and before
// Astro's image marker.
//   codeBlocksPlugin  wraps each highlighted <pre> in terminal chrome (dots, language title, copy
//                     button) and turns Shiki's inline colours into tok-* classes (styles/code.css).
//   imagesPlugin      sizes Markdown images for the 72ch column: Astro's constrained layout at 700 px with
//                     image.breakpoints (astro.config.mjs) gives a 700/800/1280/1400 srcset, WebP at the detail
//                     preset's quality, lazy + async. Number arrays don't survive Sätteri's property bridge
//                     (they arrive empty), so widths come from the layout, not a widths prop.
import type { HastPluginDefinition } from 'satteri';
import { PRESETS } from './image-presets.ts';

interface Element {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children?: Node[];
}
type Node = Element | { type: 'text'; value: string } | { type: string; [key: string]: unknown };
interface Ctx {
  replaceNode(node: unknown, next: Node | Node[]): void;
}

// Placeholder colours in styles/shiki/mono.json → classes.
const TOKEN_CLASSES: Record<string, string | null> = {
  '#000001': null,
  '#000002': 'tok-comment',
  '#000003': 'tok-keyword',
  '#000004': 'tok-string',
  '#000005': 'tok-constant',
  '#000006': 'tok-entity',
  '#000007': 'tok-punct',
};

const el = (tagName: string, properties: Record<string, unknown>, children: Node[] = []): Element => ({ type: 'element', tagName, properties, children });
const text = (value: string): Node => ({ type: 'text', value });

/** Deep copy of Shiki's output with `style` removed and token colours mapped to classes. */
function strip(node: Node): Node {
  if (node.type !== 'element') return node;
  const { style, ...props } = ((node as Element).properties ?? {}) as Record<string, unknown>;
  const color = typeof style === 'string' ? style.match(/color:\s*(#[0-9a-f]{6})/i)?.[1]?.toLowerCase() : undefined;
  const cls = color ? TOKEN_CLASSES[color] : undefined;
  if (cls) props.className = [...((props.className as string[] | undefined) ?? []), cls];
  return { ...(node as Element), properties: props, children: ((node as Element).children ?? []).map(strip) };
}

let blockId = 0;

// The visitors use a small local node shape; the casts adapt them to Sätteri's plugin type.
export const codeBlocksPlugin = {
  name: 'code-blocks',
  element: {
    filter: ['pre'],
    visit(node: Element, ctx: Ctx) {
      const lang = String(node.properties?.dataLanguage ?? node.properties?.['data-language'] ?? 'text');
      const id = `code-${++blockId}`;
      const pre = strip(node) as Element;
      // Shiki already sets tabindex=0, so the scrollable block is keyboard reachable.
      pre.properties = { ...pre.properties, id };
      ctx.replaceNode(
        node,
        el('figure', { className: ['codeblock'] }, [
          el('figcaption', { className: ['codeblock__bar'] }, [
            el('span', { className: ['codeblock__dots'], ariaHidden: 'true' }, [el('span', {}), el('span', {}), el('span', {})]),
            el('span', { className: ['codeblock__lang'] }, [text(lang)]),
            el('button', { type: 'button', className: ['codeblock__copy'], dataCopyTarget: id, ariaLabel: `Copy ${lang} code`, hidden: true }, [text('copy')]),
            el('span', { className: ['visually-hidden'], ariaLive: 'polite' }),
          ]),
          pre,
        ]),
      );
    },
  },
} as unknown as HastPluginDefinition;

const detailWebp = PRESETS.detail.formats.find((f) => f.format === 'webp')!;
export const PROSE_IMAGE_WIDTH = 700;

export const imagesPlugin = {
  name: 'blog-images',
  element: {
    filter: ['img'],
    visit(node: Element, ctx: Ctx) {
      ctx.replaceNode(node, {
        ...node,
        properties: {
          ...node.properties,
          layout: 'constrained',
          width: PROSE_IMAGE_WIDTH,
          sizes: '(min-width: 64rem) 46rem, 100vw',
          format: 'webp',
          quality: detailWebp.quality,
          loading: 'lazy',
          decoding: 'async',
          'data-preset': 'detail',
        },
      });
    },
  },
} as unknown as HastPluginDefinition;
