# Publishing on the blog

The site deploys from `master`: every push runs `npm run verify` on GitHub and, if it passes, the
site is live about 2 minutes later. Work on `revamp` and merge into `master` when ready.

## (a) Write a post

1. Scaffold a draft. The title comes first; tags and a Medium URL are optional:
   ```
   npm run new:post -- "How we cut cart latency" --tags distributed-systems,java
   ```
   This creates `src/content/blog/<yyyy>-<slug>.md` with today's date and `draft: true`. The URL
   will be `/blog/<slug>/` (the year prefix is dropped).
2. Edit the frontmatter and write the body in Markdown:
   - `title`: up to 90 characters.
   - `summary`: 40–160 characters. It's the TL;DR on the blog index and the meta description.
   - `tags`: 1–5, lowercase-kebab (`distributed-systems`).
   - `updated: 2026-12-01`: add this when you revise a published post.
3. Preview it. `npm run dev` shows drafts at http://localhost:4321/blog/.
4. Publish:
   - Set `draft: false`.
   - Run `npm run verify` (it must pass).
   - Commit, push `revamp`, and merge it into `master` (or push it to `master`).
   - Live in about 2 minutes. The post also appears on the home page, in `/rss.xml` and on its tag pages.

**What the template does for you:**
- Reading time (words ÷ 230, rounded up).
- A table of contents when the post has 3 or more `##`/`###` headings **and** takes 5 minutes or more to read.
- Previous/next links by date.
- Syntax highlighting for fenced code blocks with a language (` ```ts `), shown in a terminal-style box with a copy button.

Use `##` for sections and `###` below them; the post title is the page's only `#`.

## (b) Images

Put files in `src/assets/blog/<slug>/` and reference them relatively from the post:
```
![What the picture shows, for screen readers](../../assets/blog/<slug>/01.png)
```
- **Processing:** the build makes WebP copies at 700, 800, 1280 and 1400 px with a `srcset`, lazy loading and explicit size, so a large original is fine. The original never ships.
- **Alt text:** describe what the image shows. If it contains text the post relies on (a diagram, a screenshot of code), write that text in the alt.
- **Image checks:** `npm run verify` fails if any image output is over its size cap or a raw original reaches `dist/`.

## (c) Import a Medium post

1. **Get the content.** Use one of:
   - Open the post on Medium and copy the body.
   - Download your data from Medium (*Settings → Security and apps → Download your information*); the archive has an HTML file per post.
2. **Scaffold** with the Medium URL. Use the clean URL, without `?source=…` or `?sharedUserId=…`:
   ```
   npm run new:post -- "Post title" --tags a,b --medium https://medium.com/@jay.parekh7689/<slug>-<id>
   ```
3. **Convert the body to Markdown** without rewording it:
   - Headings become `##`/`###`.
   - Code goes in fenced blocks with a language.
   - Bold and italics become `**`/`*`.
   - Links stay links.
4. **Images:** download each one into `src/assets/blog/<slug>/`, numbered `01.jpg`, `02.png`, … in order. Medium's full-size image is at `https://miro.medium.com/v2/<image-id>`. Add alt text.
5. **Metadata:**
   - `date`: the Medium publish date.
   - `tags`: Medium's tags in kebab case.
   - `summary`: the Medium subtitle, or the post's opening sentences.
6. **Canonical:** leave `canonicalUrl` unset, so the page's canonical points to Medium (see (d)). The post shows "Originally published on Medium →" and gets the `[medium]` marker in lists.

The three launch posts were imported this way (Stage 3 report). Their text was checked word for word against Medium.

## (d) Canonical URL: Medium or this site

The rule (SPEC D6): `canonical = canonicalUrl ?? (preferMediumCanonical && mediumUrl) ?? this page`.

- **One post:** set `canonicalUrl: https://matrix7689.github.io/blog/<slug>/` in its frontmatter to make this site the canonical, even though it's also on Medium. The notice then says "Also published on Medium →".
- **Every post:** set `preferMediumCanonical: false` in `src/site.config.ts`. Cross-posts then point their canonical here. Medium also lets you set a canonical link on the Medium copy; set it to this site if you go that way.

## (e) Drafts and tags

- **Drafts:** `draft: true` posts build in `npm run dev` and `npm run build:fixtures` only. They never appear in a production build, the RSS feed or a tag page.
- **Tag pages:** every tag used by at least one published post gets `/blog/tags/<tag>/`. Reuse existing tags where they fit (see the filter row on `/blog/`) rather than near-duplicates (`ai` vs `artificial-intelligence`).
- **Test posts:** template-test posts live in `tests/fixtures/blog/`, start with `Fixture:`, and only build with `npm run build:fixtures`.

## Cover thumbnail

The blog list shows each post's cover as a small thumbnail. Set `cover` in the frontmatter to an image in `src/assets/blog/<slug>/`, e.g. `cover: ../../assets/blog/<slug>/01.jpg`. Without it, the post is listed with no thumbnail. Each thumbnail adds about 10 KB to `/blog/`, whose 60 KB total budget (`budgets.json`) fits about 5 of them, so raise that budget or paginate before going past that; `npm run verify` fails when it is exceeded.
