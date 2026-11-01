// Date formats (SPEC §4 copy rules): blog `YYYY-MM-DD`, roles `Mon YYYY – Mon YYYY` / `– present`.
// Blog dates are calendar days, so they are formatted in UTC to avoid shifting with the build machine.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** '2021-07' → 'Jul 2021' */
export function monthYear(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m! - 1]} ${y}`;
}

/** ('2021-07', '2023-12') → 'Jul 2021 – Dec 2023'; no end → 'Jul 2021 – present' */
export const roleRange = (start: string, end?: string) => `${monthYear(start)} – ${end ? monthYear(end) : 'present'}`;
