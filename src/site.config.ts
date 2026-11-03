// Single source for site-wide facts (SPEC Stage 1 task 3).
// Unknown values use the SPEC §4.11 marker string or null; components hide null links.

export interface SiteLinks {
  github: string | null;
  linkedin: string | null;
  x: string | null;
  medium: string | null;
  steamWorkshop: string | null;
  /** GameBanana submissions page; the archive button is hidden while null. */
  gamebanana: string | null;
}

export const SITE = {
  name: 'Jay Parekh',
  role: 'Software Development Engineer II @ Amazon',
  // SPEC §4.9 (proposed footer line).
  // Public (N2 confirmed by Jay, Stage 3 checkpoint).
  email: 'jay.parekh7689@gmail.com',
  resume: '/Jay_Parekh_Resume.pdf',
  links: {
    github: 'https://github.com/Matrix7689',
    linkedin: 'https://www.linkedin.com/in/jaymparekh',
    x: 'https://x.com/jayp_or_jp',
    medium: 'https://medium.com/@jay.parekh7689',
    steamWorkshop: 'https://steamcommunity.com/id/MatrixIN/myworkshopfiles/',
    // "GameBanana Submissions" button on the archive (Jay, Stage 7 revision).
    gamebanana: 'https://gamebanana.com/members/submissions/mods/1281978',
  } satisfies SiteLinks,
  // SPEC D6: canonical of a cross-post points to Medium unless the post overrides it.
  preferMediumCanonical: true,
  // SPEC Q3: footer block-letter wordmark.
  wordmark: 'JP',
} as const;

// 00 home first (Jay, Stage 5 follow-up); the nav numbers items from 00.
export const NAV = [
  { id: 'home', label: 'home', href: '/' },
  { id: 'blog', label: 'blog', href: '/blog/' },
  { id: 'projects', label: 'projects', href: '/projects/' },
  { id: 'about', label: 'about', href: '/about/' },
] as const;

export type NavId = (typeof NAV)[number]['id'];
