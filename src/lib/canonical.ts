// Canonical URL of a post (SPEC D6):
// canonical = post.canonicalUrl ?? (SITE.preferMediumCanonical && post.mediumUrl) ?? selfUrl
import { SITE } from '../site.config';

interface CanonicalFields {
  canonicalUrl?: string | undefined;
  mediumUrl?: string | undefined;
}

export function canonicalFor(post: CanonicalFields, selfUrl: string): string {
  return post.canonicalUrl ?? (SITE.preferMediumCanonical ? post.mediumUrl : undefined) ?? selfUrl;
}

/** True when the canonical points to Medium, which is when the post shows "Originally published on Medium" (§4.4). */
export const isMediumCanonical = (post: CanonicalFields, selfUrl: string) =>
  post.mediumUrl !== undefined && canonicalFor(post, selfUrl) === post.mediumUrl;
