// Page-level copy that isn't a collection entry (SPEC §4.1, §4.3, §4.6, §4.7).
// "(proposed)" text is Claude's tightening of Jay's own wording, pending his approval.
// null = hidden by the template. `npm run check:inputs` lists every open gap.
// Sources: SPEC §4, the resume PDF, the old site and Jay's LinkedIn profile export (Stage 4 checkpoint).

export const HOME = {
  // (proposed; Seattle is from the old site and LinkedIn)
  badge: 'Software engineer · Seattle',
  // Approved by Jay with the list after the colon removed (N3, Stage 4 checkpoint).
  oneLiner: "I build and scale Amazon's shopping cart service.",
  // Highlights of everything (Jay, Stage 4 checkpoint). Every number comes from §4.2, the resume, the old
  // site or LinkedIn; nothing is rounded or added. Figures are numbered across groups.
  highlights: [
    {
      group: 'Engineering',
      items: [
        { value: '10+ years', caption: 'of programming experience' },
        { value: '>99.99%', caption: 'success on a major service migration (cart session merging, Amazon SDE II)' },
        { value: '0', caption: 'customer impact across large-scale regional cache transitions (Amazon SDE II)' },
        { value: '$1.74M', caption: 'infrastructure cost saved by refactoring cart cache storage (Amazon SDE I)' },
        { value: '−15 ms', caption: 'global TM99 latency from the same refactor (Amazon SDE I)' },
        { value: '−10 ms', caption: 'global TM99 latency from a cross-team service migration (Amazon SDE I)' },
        { value: '3–4 months', caption: 'implementation effort saved by reusing existing components (Amazon SDE I)' },
        { value: '16 regions', caption: '3 pipelines restored across them (Amazon SDE I)' },
        { value: '5', caption: 'peak-traffic simulations run (Amazon SDE I)' },
        { value: '2', caption: 'engineers mentored (Amazon SDE I)' },
        { value: '4 h → 5 min', caption: 'operation time cut by an internal tool (Amazon intern)' },
      ],
    },
    {
      group: 'Gaming & community',
      items: [
        // Old-site total, confirmed by Jay (N11); LinkedIn's summary says "over 30 eSports tournaments in India".
        { value: '32', caption: 'eSports tournaments organised in India, online and LAN' },
        { value: '24+', caption: 'gaming servers built and configured (Drag2Death)' },
        { value: '100,000+', caption: 'users served by those servers (Drag2Death)' },
        { value: '500+', caption: 'students in a 7-week online 3D level design workshop (Drag2Death)' },
        { value: '4', caption: 'subsidiaries led as CTO, including Mammoth Gaming (Bigshine)' },
        { value: '3', caption: 'websites built with a team of 3 (Bigshine)' },
      ],
    },
    {
      // Map counts are the old site's figures as of 2024 (N11, kept by Jay); "9 years" is from LinkedIn.
      group: 'Map making',
      items: [
        { value: '9 years', caption: 'designing 3D levels (maps) for video games' },
        { value: '55', caption: 'custom multiplayer maps published on Steam Workshop' },
        { value: '1,052,075', caption: 'map downloads' },
        { value: '12,340,926', caption: 'map views' },
      ],
    },
    {
      // Old-site fun stats as of 2024; videos from the resume; languages from LinkedIn.
      group: 'Off the clock',
      items: [
        { value: '123 WPM', caption: 'typing speed' },
        { value: '622', caption: 'cups of coffee' },
        { value: '340', caption: 'bowls of ramen' },
        { value: '25', caption: 'pairs of sneakers' },
        { value: '72', caption: 'video games played' },
        { value: '74,156', caption: 'minutes on Spotify' },
        { value: '20,000+', caption: 'Instagram views on 20+ vertical videos I edited' },
        { value: '3', caption: 'languages spoken: Gujarati, Hindi and English' },
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
    "I'm a Software Development Engineer II at Amazon. I graduated from the University of Southern California with an MS in Computer Science in May 2021, and I have 10+ years of programming experience. Problem-solving, decision-making and analysis draw me to projects across very different domains.",
    "I also design 3D levels (maps) for video games. Over 9 years I've created 50+ maps, with 10+ million views and 1 million downloads on Steam Workshop.",
    "I've organized and run technical operations for 30+ eSports tournaments in India, online and LAN, and built and managed community gaming servers hosted on AWS and in local data centers.",
  ],
  // GPA hidden (Q6). High school added back at the Stage 4 checkpoint ("add everything").
  education: [
    {
      level: 'university',
      school: 'University of Southern California',
      degree: 'MS Computer Science',
      start: '2019-08',
      end: '2021-05',
      location: 'Los Angeles',
      coursework: ['Web Technologies', 'Analysis of Algorithms', 'Foundations of AI', '3-D Graphics and Rendering', 'Advanced Mobile Devices and Game Consoles'],
    },
    {
      level: 'university',
      school: 'Dwarkadas J. Sanghvi College of Engineering',
      affiliation: 'University of Mumbai',
      degree: 'BE Information Technology',
      start: '2015-08',
      end: '2019-05',
      location: 'Mumbai',
      coursework: ['Data Structures & Algorithm Analysis', 'Computer Graphics & VR', 'OOP', 'Image Processing', 'Web Programming'],
    },
    {
      level: 'school',
      school: 'Jai Hind College',
      degree: 'High school, Computer Science',
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
  // No headshot (N8, Jay, Stage 3 checkpoint).
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
  // Old-site stats, kept as they are (N11, Jay, Stage 3 checkpoint).
  stats: [
    { value: '55', caption: 'maps' },
    { value: '1,052,075', caption: 'downloads' },
    { value: '12,340,926', caption: 'views' },
  ],
};
