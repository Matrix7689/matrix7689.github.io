// Page-level copy that isn't a collection entry (SPEC §4.1, §4.3, §4.6, §4.7).
// "(proposed)" text is Claude's tightening of Jay's own wording, pending his approval.
// null = hidden by the template. `npm run check:inputs` lists every open gap.

export const HOME = {
  // (proposed; Seattle is from the old site)
  badge: 'Software engineer · Seattle',
  // NEEDS INPUT (N3): approve or rewrite the home one-liner.
  oneLiner: "I build and scale Amazon's shopping cart service: throttling, caching, migrations and latency.",
  // From §4.2 (SDE I, cart cache storage refactor).
  highlights: [
    { value: '$1.74M', caption: 'infrastructure cost saved (cart cache storage refactor)' },
    { value: '−15 ms', caption: 'global TM99 latency, same change' },
    { value: '3–4 months', caption: 'implementation effort saved by design choice' },
  ],
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
