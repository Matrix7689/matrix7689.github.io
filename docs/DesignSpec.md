# DesignSpec.md — "Monochrome Minimal Terminal" Portfolio Theme

Project: personal portfolio + blog for Jay Parekh (SDE II, Amazon), replacing https://matrix7689.github.io/
Theme name: **monochrome minimal terminal**
Audience: tech companies, recruiters, engineers. Positioning: software engineer first.

This file is the single source of truth for the visual design. It merges three references:

1. **Monochrome ASCII Hub** (v0 template) — primary style reference. Full source was read locally. Section 1 below is verified against that source.
2. **OpenCode** (https://opencode.ai/) — developer-tool landing-page structure. Section 2: content and structure verified from page text; **visual tokens are NOT yet captured** (see the TODO checklist).
3. **TypeSafe AI blog** (https://typesafe.ai/blog) — blog-index structure. Section 3: structure verified from page text; **visual tokens are NOT yet captured** (see the TODO checklist).

Local source for reference 1: `C:\Jay Data\portfolio revamp\monochrome-ascii-hub-template`
(Next.js 16 app. Key files: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `components/ascii-hub/*`, `lib/sections-data.ts`.)

Rule for anyone using this spec: it describes a **look**, not a stack. The template is a heavy React app; the new site must be a lightweight static site (see Section 5).

---

## 1. Monochrome ASCII Hub (verified from source)

Tagline in template: "Raw Logic. Refined Form." It is a minimalist, black-and-white, monospace, ASCII-art showcase with eight "technical modules".

### 1.1 Color tokens (from `app/globals.css`, dark theme is the real design)

| Token | Value | Use |
|---|---|---|
| background | `#000000` | page |
| foreground | `#ffffff` | primary text, inverted fills |
| card / popover | `#0a0a0a` | raised surfaces |
| secondary / muted / accent | `#1a1a1a` | panels, terminal bodies (often at 20-50% opacity) |
| muted-foreground | `#a0a0a0` | secondary text, labels |
| border / input | `#262626` | all 1px borders and dividers |
| ring | `#ffffff` | focus ring |
| destructive | `#ff3333` | errors only |
| scrollbar thumb / hover / track | `#333333` / `#555555` / `#000000` | 4px-wide scrollbar |
| selection | bg `#ffffff`, text `#000000` | inverted text selection |
| radius | `0` | square corners everywhere |

Notes:
- There is **no real light theme** in the template. `styles/globals.css` contains unused default shadcn (oklch) tokens, ignore it.
- Light mode for the new site must be derived by inverting the palette (white background, black text, matching gray steps).
- `<html>` is hard-set to class `dark`; theme color meta is `#000000`.
- Opacity is used as a hierarchy tool: ghost numbers at ~8%, footer ASCII logo at ~40%, hero ASCII background at ~10%, body ASCII art at 80%.

### 1.2 Typography

- Primary font: **Geist Mono** (Google Fonts via `next/font`), applied to `body` as `font-mono antialiased`. Everything is monospace.
- Display/pixel font: **Silkscreen** (400/700) as `--font-pixel`, and **Geist Pixel Line** (`geist/font/pixel`) as `--font-pixel-line`. Used for the wordmark (`MONO_HUB`), the huge hero headline, and ghost section numbers.
- Sans (`Geist`) is declared but effectively unused.
- Scale in use:
  - Micro labels: 10px, `uppercase`, `tracking-wider` / `tracking-widest`, muted color
  - UI text: 12px (`text-xs`)
  - Body / intro: 14-16px (`text-sm` / `md:text-base`), `leading-relaxed`, `max-w-prose`
  - Hero h1: `text-5xl` -> `md:text-7xl` -> `lg:text-9xl`, `font-bold`, `leading-none`, `tracking-tight`, `text-balance`
  - Ghost section numbers: `text-7xl md:text-9xl` at `text-foreground/[0.08]`
- Two-tone headline trick: line 1 in `foreground`, line 2 in `muted-foreground`.
- ASCII art `<pre>`: 9px/12px line-height on mobile, 11px/14px on md+.

### 1.3 Layout

- Content container: `max-w-7xl` (80rem), `px-4` mobile, `lg:px-8` desktop, centered.
- Section padding: `py-20 lg:py-32`.
- Sections separated by `border-b border-border` (1px `#262626`).
- Hero: full viewport (`min-h-screen`), content left-aligned (`items-start text-left`), `max-w-4xl`.
- Footer: `border-t`, `py-16 lg:py-24`, 3-column grid at `lg`.
- No border radius, no drop shadows on content (one section uses a layered blue-tinted shadow; do not copy it).

### 1.4 Component patterns (recreate as plain HTML/CSS)

**Navigation** (`navigation.tsx`)
- Sticky top, transparent at top; after scrolling past 50px: `bg-background/80 backdrop-blur-md border-b`. (New site: use a solid background instead of blur.)
- Left: muted `>` prompt glyph + wordmark in pixel font with wide tracking (`MONO_HUB`).
- Links: 12px mono, uppercase, prefixed with a dim number at 50% opacity (e.g. `01 KERNEL & SYSTEMS`).
- Active link: inverted (`bg-foreground text-background`). Hover on inactive: same inversion.
- Mobile: hamburger toggles a stacked list with the same link styling.
- All interactive elements: `focus-visible:ring-2 ring-foreground`, no outline.

**Buttons** (`hero-section.tsx`)
- Primary: `border border-foreground bg-foreground text-background px-6 py-3`, mono 14px, trailing `->` that shifts right 4px on hover; on hover becomes transparent with white text.
- Secondary: `border border-border text-muted-foreground`, hover -> `border-foreground text-foreground`.
- Square corners, 200ms transitions.

**Badge / eyebrow**: `inline-flex border border-border px-3 py-1 text-xs text-muted-foreground` with a 6px solid white square before the label (e.g. "FRONTEND ENGINEERING SHOWCASE").

**Terminal window card** (`mini-terminal.tsx`, `section-kernel.tsx`)
- 1px border container.
- Header row with border-bottom: three small SQUARE dots (`h-2 w-2`): white, `muted/50`, `muted/30`, then a 10px muted title like `<name> ~ terminal`.
- Body: `bg-secondary/20`, lines 12px mono; lines starting with `$` are white, other output is muted; trailing `$ █` with a blinking block cursor.
- Variant: inverted title bar (`bg-foreground`, black text, tiny `bash 5.2.15` label at 50% opacity) for a "full-width terminal takeover" section.

**Spec table** (`spec-table.tsx`)
- Bordered box. Header: 6px white square + 10px uppercase tracked label ("SPECIFICATIONS").
- Rows: `flex justify-between px-4 py-2.5`, label muted left, value white right, `divide-y divide-border`, hover tint `bg-secondary/50`.
- Good fit for: experience facts, tech stack, project metadata.

**ASCII canvas panel** (`ascii-canvas.tsx`)
- Bordered box, `bg-secondary/30 p-4`, header "ASCII Schematic" (6px white square + 10px uppercase label), `<pre>` art at 80% opacity -> 100% on hover.
- `role="img"` + `aria-label` + a visually-hidden label.

**Section header**
- Giant ghost number (pixel font, 8% opacity) on the left, with a 1px horizontal hairline (`h-px flex-1 bg-border`) running to the right edge.

**Tech ticker** (`tech-ticker.tsx`)
- Full-width strip between `border-y`, `py-3`, items in 12px muted mono separated by `///`. It auto-scrolls horizontally (30s linear loop). **Do not copy the animation**; if used at all, make it a static, wrapped line.

**Footer** (`footer.tsx`)
- Col 1: block-letter ASCII logo (box-drawing characters) at `text-foreground/40`, `aria-label` + `role="img"`, plus a one-line muted description.
- Col 2: "CONNECT" label (10-12px uppercase tracked), link list (icon + name + a `->` that fades in on hover).
- Col 3: "TECH STACK" tag row (bordered 10px muted tags) and a "BACK TO TOP" control.
- Bottom bar: `border-t`, 10px muted, `// <name> — <year>` left and a short tagline right.

Footer ASCII logo example (block characters):
```
 ███╗   ███╗██╗  ██╗
 ████╗ ████║██║  ██║
 ██╔████╔██║███████║
 ██║╚██╔╝██║██╔══██║
 ██║ ╚═╝ ██║██║  ██║
 ╚═╝     ╚═╝╚═╝  ╚═╝
```
(For the new site generate a block-letter logo for the owner's name or handle, rendered as real text, under ~2 KB.)

**Hero "boot log" terminal** (decorative copy pattern)
```
> initializing ascii_renderer...
> loading 8 technical modules...
> font: GeistPixel loaded [OK]
> palette: #000 #FFF [MONOCHROME]
> status: OPERATIONAL
> _█
```
A static version of this pattern (a short "status" block) is acceptable on the home page; the typed/animated version is not.

**Pseudo-terminal** (`pseudo-terminal.tsx`): an interactive fake shell with commands `help, sections, inspect, about, stack, clear, ascii`. **Do not build this.** (A static "ls-style" link list styled like terminal output is the acceptable substitute.)

### 1.5 Motion in the template (and what to do with it)

| Template effect | Verdict for the new site |
|---|---|
| Blinking block cursor (`blink`, 1s) | KEEP, CSS only, disabled under `prefers-reduced-motion` |
| `::selection` inversion, thin scrollbar | KEEP |
| Hover inversions on nav/buttons, arrow nudge | KEEP, CSS transitions only |
| Hero random-ASCII background, regenerated every 120ms via `requestAnimationFrame` | DROP (CPU/battery cost, no content value) |
| Scanline overlay (`scanline` 8s) and `glitch` keyframes | DROP |
| Auto-scrolling tech ticker | DROP (static line instead) |
| Framer Motion fade/slide-in on every block | DROP (or tiny CSS-only fade, reduced-motion safe) |
| Typed boot sequences / line-by-line terminal reveals | DROP for content; never gate content behind animation |
| `backdrop-blur` nav, layered blue box-shadow | DROP |

### 1.6 Template structure (for orientation only)

- `app/page.tsx` order: Navigation -> Hero -> TechTicker -> 8 DomainSections (kernel, network, ledger, compiler, graphics, logic, concurrency, hardware) -> PseudoTerminal -> Footer.
- `lib/sections-data.ts` holds section ids, numbers (`01`..`08`), titles, and content; `navLinks` is derived from it.
- Each section file is a themed showcase (e.g. kernel = full-width terminal window with boot log; others use ASCII diagrams, spec tables, mini-terminals).
- Heavy dependencies (do NOT carry over): Next.js 16, React 19, framer-motion, ~30 Radix UI packages, recharts, embla-carousel, react-day-picker, sonner, vaul, cmdk, @vercel/analytics.
- Template license: community v0 template. Recreate the look; do not copy code or content verbatim.

---

## 2. OpenCode — https://opencode.ai/

### 2.1 Verified from page content (structure and copy patterns)

- Header: logo left, text nav (GitHub, Docs, Data, Zen, Go, Enterprise, Download), "Open menu" on mobile.
- Hero: one plain H1 ("The open source AI coding agent"), one-sentence subhead, then an **install-method switcher** (`curl | npm | bun | brew | paru | yay`) above a single copy-able terminal command in a code block:
  `curl -fsSL https://opencode.ai/v2/install | bash`
- Product demo area (video).
- "What is OpenCode?" section: short intro + a bullet list where each item has a `[*]` marker, a bold lead word, and a one-line description (Multi-session, GitHub Copilot, ChatGPT Plus/Pro, Any model, Any editor). Single "Read docs" link.
- Stats block with "Fig N." captions: `Fig 1. 220K GitHub Stars`, `Fig 2. 950 Contributors`, `Fig 3. 16M Monthly Devs`.
- Short "Built for privacy first" paragraph.
- Plain-text FAQ (question/answer list, no heavy accordion chrome required).
- Promo block (Zen) and a waitlist/subscribe input.
- Footer: compact text links (GitHub with star count, Docs, Changelog, Discord, X) and a legal row (© year, status, brand, privacy, terms).

Patterns worth borrowing for the portfolio: a command-in-a-code-block as the primary visual, `[*]` bullet markers, "Fig N." captions for stats/highlights, plain-text FAQ-style sections, minimal link footer.

### 2.2 TODO (to be filled by a browser-based pass; not yet captured)

Inspect opencode.ai with DevTools / computed styles and record:
- [ ] Background and text colors (dark and light modes), border color, any accent color
- [ ] Font family for body, headings, code; sizes and weights; line-height
- [ ] Content max-width, section spacing, header height
- [ ] Code block styling (background, border, radius, padding, copy button)
- [ ] Install-method tab/switcher styling (active vs. inactive states)
- [ ] `[*]` bullet and "Fig N." caption styling
- [ ] Link, button, and hover/focus states
- [ ] Footer layout and typography
- [ ] Dark/light mode behavior
- [ ] Notable animations (if any)

---

## 3. TypeSafe AI blog — https://typesafe.ai/blog

### 3.1 Verified from page content (structure)

- Site is built with Framer (not relevant to implementation).
- Header: `./` wordmark (a path-style logo), nav (Enterprise, Thoughts, Company, Docs, API console, Contact us).
- Page title: "Thoughts" (the blog is named, not called "Blog").
- **Featured latest post** at the top (large entry, same fields as list items).
- **Category filter**: All, Media, Thoughts, Company News.
- **List entries** each show: category label, title, and a short summary line, often a "TL;DR: ..." sentence. Casual, direct tone (an emoji appears in two summaries).
- Posts include a mix of company news, opinion essays ("Thoughts"), and external press/podcast ("Media").
- Footer: © year, Contact, legal links (Terms, Privacy, Acceptable Use, Accessibility), LinkedIn and X.

Patterns worth borrowing: a named blog ("Thoughts"/similar), a featured latest post, category filter row, "category label + title + TL;DR" entries, a plain legal/social footer. Adapt to the terminal aesthetic (text list, mono type, 1px dividers); do NOT copy its imagery, layout chrome, or colors.

### 3.2 TODO (to be filled by a browser-based pass; not yet captured)

- [ ] Colors (background, text, muted, borders, accent), light/dark behavior
- [ ] Fonts, sizes, weights for page title, entry title, category label, TL;DR text
- [ ] Featured-post treatment (size, image or no image, spacing)
- [ ] Filter/category pill styling (active vs. inactive)
- [ ] List spacing, divider style, hover state
- [ ] Individual post page layout (one post, e.g. /blog/bitterest-lesson): content width, heading scale, code/quote styling, metadata (date, author, reading time)
- [ ] Footer typography and spacing

---

## 4. Synthesized design rules for the portfolio

These combine the three references; where they conflict, Section 1 (ASCII Hub) wins on visual style and Sections 2-3 win on content structure.

**Palette**
- Dark default: `#000` background, `#fff` text, `#0a0a0a` card, `#1a1a1a` panel, `#a0a0a0` muted, `#262626` borders. Light mode = inverted. Optional single subtle accent (or none); never neon.
- Square corners, 1px borders, no shadows, no gradients, no glassmorphism.

**Typography**
- Monospace everywhere (Geist Mono self-hosted/subset, or system mono stack). Optional pixel display font only for the wordmark and hero name (single small file) or skip it.
- Hierarchy through size, weight, case, and opacity, not color.
- Reading width ~70-80ch for prose.

**Terminal motifs (sparingly)**
- Prompt-style headings (`~/experience`, `$ cat about.md`), `>` prompt glyph in the nav, `///` and `//` separators, `[*]` bullets, "Fig N." captions for highlights, ghost section numbers, spec-table rows for facts, bordered terminal-window cards with three square dots, one block-letter ASCII wordmark as real text, blinking cursor.
- A single copy-able command block on the home page as the primary visual (OpenCode pattern), e.g. `$ open resume.pdf` or an `ls`-style link list.

**Home page content order**
1. Intro (name, role, one-liner, links)
2. Recent work experience (Amazon SDE II and SDE I) as spec-table or concise bullets with real metrics
3. Latest blog posts (3-5), TypeSafe-style entries
4. Selected software projects (3-4, text-first, tiny thumbnails)
5. Skills/tech as a plain text line or tag row
6. Footer (contact, GitHub, LinkedIn, Medium, RSS)

**Blog index** (TypeSafe pattern, terminal skin)
- Featured latest post, category/tag filter row (plain links or CSS-only), entries as `date  tag  title` + one-line TL;DR, a `medium` marker for cross-posts.

**Blog post page**
- Single column, mono (or justified mono/serif pairing if readability suffers), build-time syntax highlighting in a muted monochrome theme, terminal-styled code blocks with a tiny copy button (progressive enhancement), reading time, optional TOC, prev/next.

**Images**
- Appear on project and level-design detail pages only. Thumbnails ~400-600px wide, under ~30 KB, grayscale by default with color on hover/focus (CSS filter). Lazy-load below the fold, explicit width/height.

**Accessibility**
- ASCII art is `aria-hidden` (or `role="img"` with an `aria-label`) with a real text alternative nearby. WCAG AA contrast in both modes, visible 2px focus rings, skip link, `prefers-reduced-motion` respected, decorative box-drawing characters must not break copy/paste or screen readers.

---

## 5. Hard constraints (override any look-and-feel above)

- **Performance first**: static site, zero JS by default, no CSS framework runtime, no animation libraries. Home page target < ~50 KB transferred (excluding fonts), Lighthouse 95+ on mobile.
- Every ASCII or terminal flourish must be static or CSS-only. If it costs bytes or main-thread time, drop it.
- Never gate content behind a typed command or animation.
- No fake boot sequences, CRT/scanline effects, glitch effects, or neon green-on-black clichés.
- The terminal style is a skin over normal, accessible, fast HTML.

---

## 6. Open items

- [ ] Fill Section 2.2 (OpenCode computed styles) — to be done with a browser/scraping pass
- [ ] Fill Section 3.2 (TypeSafe computed styles and post-page layout) — same
- [ ] Optional: capture the live ASCII Hub demo (https://v0-monochrome-ascii-hub.vercel.app) screenshots to confirm the look vs. the source
- [ ] Decide on accent color (none vs. one subtle) and whether to use a pixel display font
- [ ] Generate the block-letter ASCII wordmark for the owner's name/handle
