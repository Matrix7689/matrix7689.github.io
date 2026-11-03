// Page-level copy that isn't a collection entry (SPEC §4.1, §4.3, §4.6, §4.7).
// "(proposed)" text is Claude's tightening of Jay's own wording, pending his approval.
// null = hidden by the template. `npm run check:inputs` lists every open gap.
// Sources: SPEC §4, the resume PDF, the old site and Jay's LinkedIn profile export (Stage 4 checkpoint).

export const HOME = {
  // Tags under the name (Jay, Stage 5 checkpoint); they replace the eyebrow badge and the role line.
  tags: ['Software Engineer', 'Amazon', 'Seattle'],
  // Experience timeline (Jay, Stage 5 follow-up; the template's "Thread Profiler"). One lane per organisation,
  // top to bottom; `org` matches an experience `company` or an education `school`. Bars come from their dates.
  timeline: {
    from: '2015-01',
    lanes: [
      { label: 'amazon', org: 'Amazon' },
      { label: 'bigshine', org: 'Bigshine Media & Entertainment' },
      { label: 'drag2death', org: 'Drag2Death' },
      { label: 'usc', org: 'University of Southern California' },
      { label: 'djsce', org: 'Dwarkadas J. Sanghvi College of Engineering' },
    ],
  },
  // Approved by Jay with the list after the colon removed (N3, Stage 4 checkpoint).
  oneLiner: "I build and scale Amazon's shopping cart service.",
  // Highlights (Jay, Stage 4 checkpoint). Numbers come from §4.2, the resume, the old site, LinkedIn or
  // Jay directly (13 years, 6 simulations, 3 mentees, 3 hackathons, 975 coffees, Spotify 2025). No source labels on the cards.
  highlights: [
    {
      group: 'Engineering',
      items: [
        { value: '13 years', caption: 'of programming experience' },
        { value: '>99.99%', caption: 'success on a major service migration' },
        { value: '$1.74M', caption: 'infrastructure cost saved by refactoring cart cache storage' },
        { value: '−15 ms', caption: 'global TM99 latency from the cart cache storage refactor' },
        { value: '−10 ms', caption: 'global TM99 latency from a cross-team service migration' },
        { value: '6', caption: 'peak-traffic simulations run' },
        { value: '3', caption: 'engineers mentored' },
        { value: '3', caption: 'hackathons won at Amazon' },
      ],
    },
    {
      group: 'Gaming & community',
      items: [
        // Old-site total, confirmed by Jay (N11); LinkedIn's summary says "over 30 eSports tournaments in India".
        { value: '32', caption: 'eSports tournaments organised in India, online and LAN' },
        { value: '24+', caption: 'gaming servers built and configured' },
        { value: '100,000+', caption: 'users served by those servers' },
        { value: '500+', caption: 'students in a 7-week online 3D level design workshop' },
        { value: '4', caption: 'subsidiaries led as CTO, including Mammoth Gaming' },
      ],
    },
    {
      // Map counts are the old site's figures as of 2024 (N11, kept by Jay); "9 years" is from LinkedIn.
      group: 'Map making',
      items: [
        { value: '9 years', caption: 'designing 3D levels (maps) for video games' },
        // Computed from the level-design master data at build time (lib/levels.ts; Jay, Stage 7 revision:
        // the old 55 / 1,052,075 / 12,340,926 were ballpark figures).
        { stat: 'maps' as const, caption: 'custom multiplayer maps published on GameBanana and Steam Workshop' },
        { stat: 'downloads' as const, caption: 'map downloads' },
        { stat: 'views' as const, caption: 'map views' },
      ],
    },
    {
      // Old-site fun stats as of 2024, updated by Jay where noted above.
      group: 'Off the clock',
      items: [
        { value: '123 WPM', caption: 'typing speed' },
        { value: '975', caption: 'cups of coffee' },
        { value: '340', caption: 'bowls of ramen' },
        { value: '25', caption: 'pairs of sneakers' },
        { value: '72', caption: 'video games played' },
        { value: '74,156', caption: 'minutes on Spotify (2025)' },
      ],
    },
  ],
  // Resume "Software skills" plus LinkedIn's top skills. The Stage 3 list (N6) is a subset.
  skillGroups: [
    { label: 'Languages', items: ['Java', 'Kotlin', 'C++', 'Python', 'C'] },
    { label: 'Web & mobile', items: ['React', 'Node.js', 'JavaScript', 'HTML5', 'CSS3', 'PHP', 'MySQL', 'jQuery', 'Android Studio'] },
    { label: 'Platforms', items: ['AWS', 'GCP', 'Docker', 'Linux', 'Windows', 'Git'] },
    { label: 'Practices', items: ['CI/CD', 'SDLC'] },
    { label: 'Tools', items: ['Unity', 'Hammer World Editor', 'Adobe Premiere Pro', 'Adobe Photoshop', 'Anaconda'] },
  ],
};

export const BLOG_INDEX = {
  // NEEDS INPUT (N12): one line on what you write about. Hidden while null.
  subtitle: null as string | null,
};

export const ABOUT = {
  // Approved by Jay with the last clause removed (N4, Stage 3 checkpoint).
  bio: "I'm a software engineer on Amazon's Shopping Cart team in Seattle. Before Amazon I studied CS at USC, and before that I spent years designing 3D game levels and running gaming servers.",
  // Home "~/about" text, Jay's own words verbatim (Stage 4 checkpoint). Followed by a "more about me" button.
  summary: [
    'I’m a software engineer on Amazon’s Shopping Cart team, building the backend behind every cart for billions of customers in the US, Japan, Europe, and India. Anyone can build a cart. The hard part is keeping it fast, always available, and accurate, even through migrations, traffic spikes, and bot attacks.',
    'Away from work, you’ll find me writing tech blogs, playing badminton, or lost in a video game.',
  ],
  // (proposed) Longer version for the About page (Stage 8), tightened from the LinkedIn summary;
  // "passion" phrasing dropped per the §4 copy rules. Jay will write the final long version there.
  longSummary: [
    "I'm a Software Development Engineer II at Amazon. I graduated from the University of Southern California with an MS in Computer Science in May 2021, and I have 13 years of programming experience. Problem-solving, decision-making and analysis draw me to projects across very different domains.",
    "I also design 3D levels (maps) for video games. Over 9 years I've created 50+ maps, with 10+ million views and 1 million downloads on Steam Workshop.",
    "I've organized and run technical operations for 30+ eSports tournaments in India, online and LAN, and built and managed community gaming servers hosted on AWS and in local data centers.",
  ],
  // GPA hidden (Q6). High school added back at the Stage 4 checkpoint ("add everything").
  education: [
    {
      level: 'university',
      school: 'University of Southern California',
      degree: 'Master of Science in Computer Science',
      start: '2019-08',
      end: '2021-05',
      location: 'Los Angeles',
      coursework: ['Web Technologies', 'Analysis of Algorithms', 'Foundations of AI', '3-D Graphics and Rendering', 'Advanced Mobile Devices and Game Consoles'],
    },
    {
      level: 'university',
      school: 'Dwarkadas J. Sanghvi College of Engineering',
      affiliation: 'University of Mumbai',
      degree: 'Bachelor of Engineering in Information Technology',
      start: '2015-08',
      end: '2019-05',
      location: 'Mumbai',
      coursework: ['Data Structures & Algorithm Analysis', 'Computer Graphics & VR', 'OOP', 'Image Processing', 'Web Programming'],
    },
    {
      level: 'school',
      school: 'Jai Hind College',
      degree: 'High School, Computer Science specialization',
      start: '2013-08',
      end: '2015-05',
      location: 'Mumbai',
      coursework: ['C++', 'Operating Systems', 'Data Structures', 'HTML', 'CSS', '8085 Microprocessors', 'Networking Technology', 'Microcontrollers', 'Assembly Language'],
    },
  ] as { level: 'university' | 'school'; school: string; affiliation?: string; degree: string; start: string; end: string; location: string; coursework: string[] }[],
  // Secondary history. The level-design archive link is added by the template.
  // eSports count: 32 (old-site figure, confirmed by Jay; N11, Stage 3 checkpoint).
  elsewhere: [
    'Led a 7-week online 3D-modelling workshop for 500+ students.',
    'Head of technical operations for 24+ gaming servers serving 100,000+ users.',
    'Organised 32 eSports events.',
  ],
  // N7: Jay replaces public/Jay_Parekh_Resume.pdf himself; update the size in this label when he does.
  resumeLabel: 'Download resume (PDF, 217 KB)',
  // N8 was "no headshot" (Stage 3). Jay later supplied two (Stage 5 follow-up): src/assets/about/headshot-{light,dark}.jpg,
  // shown in the home about section. This field is for the /about/ page (Stage 8), still unset.
  headshot: null as string | null,
};

// From the LinkedIn profile export (Stage 4 checkpoint).
// NEEDS INPUT (N14): issuer and year for each certification, year for the scholarship, and venue, year and link for each publication.
export const CREDENTIALS = {
  certifications: ['Learning Git and GitHub', 'Introduction to Python: Absolute Beginner'],
  honors: ['Scholarship for Higher Education (SHE)'],
  publications: ['User-Based Text Summarization', 'Data Visualization and Improving Accuracy of Attrition Using Stacked Classifier'],
  languages: [
    { name: 'Gujarati', level: 'native or bilingual' },
    { name: 'Hindi', level: 'native or bilingual' },
    { name: 'English', level: 'professional working' },
  ],
};

export const LEVEL_DESIGN = {
  // (proposed) Years removed at the Stage 4 checkpoint: LinkedIn shows map-making from at least 2015 over 9 years.
  intro: 'Before software engineering, I designed custom multiplayer maps. This is the archive.',
  // Totals are computed from the levels collection (lib/levels.ts, Stage 7 revision): downloads = GameBanana
  // downloads + Steam current subscribers, views = GameBanana views + Steam unique visitors (data as of 2026-11-03).
  // Jay removed the on-page footnote saying so.
};

export const PROJECTS_PAGE = {
  // (proposed) Stage 6: plain description of what the page lists; no course context (N9).
  intro: 'Software projects first, then an archive of the multiplayer maps I designed.',
  // Detail pages: one note for screenshots not yet supplied (N13, Jay, Stage 3 checkpoint).
  screenshotsNote: 'Screenshots coming soon.',
};
