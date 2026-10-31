// Single source for site-wide facts (SPEC Stage 1 task 3).
// Unknown values use the SPEC §4.11 marker string or null; components hide null links.

export interface SiteLinks {
  github: string | null;
  linkedin: string | null;
  x: string | null;
  medium: string | null;
  monkeytype: string | null;
  steamWorkshop: string | null;
}

export const SITE = {
  name: 'Jay Parekh',
  role: 'Software Development Engineer II @ Amazon',
  // SPEC §4.9 (proposed footer line).
  tagline: 'Software engineer. Writes about building things.',
  email: 'jay.parekh7689@gmail.com',
  resume: '/Jay_Parekh_Resume.pdf',
  links: {
    github: 'https://github.com/Matrix7689',
    linkedin: 'https://www.linkedin.com/in/jaymparekh',
    x: 'https://x.com/jayp_or_jp',
    medium: 'https://medium.com/@jay.parekh7689',
    monkeytype: 'https://monkeytype.com/profile/matrix7689',
    steamWorkshop: 'https://steamcommunity.com/id/MatrixIN/myworkshopfiles/',
  } satisfies SiteLinks,
  // SPEC D6: canonical of a cross-post points to Medium unless the post overrides it.
  preferMediumCanonical: true,
  // SPEC Q3: footer block-letter wordmark.
  wordmark: 'JP',
} as const;

export const NAV = [
  { id: 'blog', label: 'blog', href: '/blog/' },
  { id: 'projects', label: 'projects', href: '/projects/' },
  { id: 'about', label: 'about', href: '/about/' },
] as const;

export type NavId = 'home' | (typeof NAV)[number]['id'];
