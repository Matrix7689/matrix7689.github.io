// Footer "Last updated" date (SPEC §4.9): the date of the latest git commit, so rebuilding
// unchanged content does not move it. Falls back to the build date when git is unavailable.
import { execFileSync } from 'node:child_process';

function commitDate(): Date | null {
  try {
    // %cs = committer date as YYYY-MM-DD in the committer's own time zone.
    const day = execFileSync('git', ['log', '-1', '--format=%cs'], { encoding: 'utf8' }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(day) ? new Date(`${day}T00:00:00Z`) : null;
  } catch {
    return null;
  }
}

const date = commitDate() ?? new Date();

export const LAST_UPDATED = {
  iso: date.toISOString().slice(0, 10),
  // e.g. "Oct 31, 2026"; UTC so the calendar day never shifts with the build machine's zone.
  label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
};
