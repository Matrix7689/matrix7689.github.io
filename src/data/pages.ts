// Page-level copy that isn't a collection entry (SPEC §4.1, §4.3, §4.6, §4.7).
// "(proposed)" text is Claude's tightening of Jay's own wording, pending his approval.
// null = hidden by the template. `npm run check:inputs` lists every open gap.

export const HOME = {
  // (proposed; Seattle is from the old site)
  badge: 'Software engineer · Seattle',
  // Approved by Jay with the list after the colon removed (N3, Stage 4 checkpoint).
  oneLiner: "I build and scale Amazon's shopping cart service.",
  // Highlights of everything (Jay, Stage 4 checkpoint). Every number comes from §4.2, the resume
  // or the old site; nothing is rounded or added. Figures are numbered across groups.
  highlights: [
    {
      group: 'At Amazon',
      items: [
        { value: '>99.99%', caption: 'success on a major service migration (cart session merging, SDE II)' },
        { value: '0', caption: 'customer impact across large-scale regional cache transitions (SDE II)' },
        { value: '$1.74M', caption: 'infrastructure cost saved by refactoring cart cache storage (SDE I)' },
        { value: '−15 ms', caption: 'global TM99 latency from the same refactor (SDE I)' },
        { value: '−10 ms', caption: 'global TM99 latency from a cross-team service migration (SDE I)' },
        { value: '3–4 months', caption: 'implementation effort saved by reusing existing components (SDE I)' },
        { value: '16 regions', caption: '3 pipelines restored across them (SDE I)' },
        { value: '5', caption: 'peak-traffic simulations run (SDE I)' },
        { value: '2', caption: 'engineers mentored (SDE I)' },
        { value: '4 h → 5 min', caption: 'operation time cut by an internal tool (intern)' },
      ],
    },
    {
      // Resume "Community Developer" and old site; which organisation these belong to is still an open question (below).
      group: 'Gaming & community',
      items: [
        { value: '4', caption: 'subsidiaries led as CTO of Bigshine, including Mammoth Gaming' },
        { value: '24+', caption: 'gaming servers built and configured as head of technical operations' },
        { value: '100,000+', caption: 'users served by those servers' },
        { value: '32', caption: 'eSports events organised' },
        { value: '500+', caption: 'students in a 7-week online 3D-modelling workshop I led' },
      ],
    },
    {
      // Old-site figures as of 2024 (N11, kept by Jay).
      group: 'Steam Workshop',
      items: [
        { value: '55', caption: 'custom multiplayer maps published' },
        { value: '1,052,075', caption: 'map downloads' },
        { value: '12,340,926', caption: 'map views' },
      ],
    },
    {
      // Old-site fun stats as of 2024 (Jay, Stage 4 checkpoint).
      group: 'Off the clock',
      items: [
        { value: '123 WPM', caption: 'typing speed' },
        { value: '622', caption: 'cups of coffee' },
        { value: '340', caption: 'bowls of ramen' },
        { value: '25', caption: 'pairs of sneakers' },
        { value: '72', caption: 'video games played' },
        { value: '74,156', caption: 'minutes on Spotify' },
      ],
    },
  ],
  // NEEDS INPUT (Stage 4): Drag2Death eSports achievements (not on the old site or resume), and whether the
  // "Gaming & community" numbers (24+ servers, 100,000+ users, 32 events) were Mammoth Gaming or Drag2Death.
  // From the resume; confirmed by Jay (N6, Stage 3 checkpoint).
  skills: ['Java', 'Kotlin', 'C++', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Linux', 'Git', 'SQL'],
};

export const BLOG_INDEX = {
  // NEEDS INPUT (N12): one line on what you write about. Hidden while null.
  subtitle: null as string | null,
};

export const ABOUT = {
  // Approved by Jay with the last clause removed (N4, Stage 3 checkpoint).
  bio: "I'm a software engineer on Amazon's Shopping Cart team in Seattle. Before Amazon I studied CS at USC, and before that I spent years designing 3D game levels and running gaming servers.",
  // GPA hidden (Q6); high school dropped.
  education: [
    {
      school: 'University of Southern California',
      degree: 'MS Computer Science',
      start: '2019-08',
      end: '2021-05',
      location: 'Los Angeles',
      coursework: ['Web Technologies', 'Analysis of Algorithms', 'Foundations of AI', '3-D Graphics and Rendering', 'Advanced Mobile Devices and Game Consoles'],
    },
    {
      school: 'University of Mumbai',
      degree: 'BE Information Technology',
      start: '2015-08',
      end: '2019-05',
      location: 'Mumbai',
      coursework: ['Data Structures & Algorithm Analysis', 'Computer Graphics & VR', 'OOP', 'Image Processing', 'Web Programming'],
    },
  ],
  // Secondary history. The level-design archive link is added by the template.
  // eSports count: 32 (old-site figure, confirmed by Jay; N11, Stage 3 checkpoint).
  elsewhere: [
    'Led a 7-week online 3D-modelling workshop for 500+ students.',
    'Head of technical operations for 24+ gaming servers serving 100,000+ users.',
    'Organised 32 eSports events.',
  ],
  // N7: Jay replaces public/Jay_Parekh_Resume.pdf himself; update the size in this label when he does.
  resumeLabel: 'Download resume (PDF, 217 KB)',
  // No headshot (N8, Jay, Stage 3 checkpoint).
  headshot: null as string | null,
};

export const LEVEL_DESIGN = {
  // (proposed)
  intro: 'Before software engineering, I designed custom multiplayer maps (2017–2019). This is the archive.',
  // Old-site stats, kept as they are (N11, Jay, Stage 3 checkpoint).
  stats: [
    { value: '55', caption: 'maps' },
    { value: '1,052,075', caption: 'downloads' },
    { value: '12,340,926', caption: 'views' },
  ],
};
