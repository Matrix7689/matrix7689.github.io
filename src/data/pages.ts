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
  // Jay directly (programming since 2011, 6 simulations, 3 mentees, 3 hackathons, 975 coffees, Spotify 2025). No source labels on the cards.
  highlights: [
    {
      group: 'Engineering',
      items: [
        // Computed from CAREER (Jay: 15 years in 2026, from 8th-grade Java in 2011; professional since 2021).
        { stat: 'professional' as const, caption: 'of professional software engineering' },
        { stat: 'learning' as const, caption: 'of programming through school and college' },
        { value: '$1.74M', caption: 'infrastructure cost saved by refactoring cart cache storage' },
        { value: '15 ms', caption: 'global TM99 latency reduction from the cart cache storage refactor' },
        { value: '3', caption: 'hackathons won at Amazon' },
        { value: '6', caption: 'peak-traffic simulations run' },
        { value: '3', caption: 'engineers mentored' },
        { value: '10 ms', caption: 'global TM99 latency reduction from a cross-team service migration' },
      ],
    },
    {
      group: 'Gaming & community',
      items: [
        // Old-site total, confirmed by Jay (N11); LinkedIn's summary says "over 30 eSports tournaments in India".
        { value: '32', caption: 'eSports tournaments organised in India, online and LAN' },
        { value: '24+', caption: 'custom gaming servers built, configured, and maintained' },
        { value: '100,000+', caption: 'users served by those servers' },
        { value: '500+', caption: 'students in a 7-week online 3D level design workshop' },
      ],
    },
    {
      // Views, downloads and maps are computed from the level-design data at build time (lib/levels.ts; the old
      // 55 / 1,052,075 / 12,340,926 were ballpark figures). Maps counts the whole archive, including the unreleased
      // awp_taj_mahal (Jay). "9 years" is from LinkedIn.
      group: 'Map making',
      items: [
        { stat: 'views' as const, caption: 'map views' },
        { stat: 'downloads' as const, caption: 'map downloads' },
        { value: '9 years', caption: 'designing 3D levels (maps) for video games' },
        { stat: 'maps' as const, caption: 'custom multiplayer maps' },
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
        { value: '74,156 mins', caption: 'on Spotify (2025)' },
        // Hours played, from Jay.
        { value: '3,167 hours', caption: 'played in CS:GO and CS2' },
        { value: '1,659 hours', caption: 'played in CS:S' },
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

// Years of programming (Jay: started 8th-grade Java in 2011) and of professional work (Amazon SDE I, 2021).
export const CAREER = { programmingSince: 2011, professionalSince: 2021 };
/** Whole years since a year, as of the build. */
export const yearsSince = (year: number) => new Date().getFullYear() - year;

export const ABOUT = {
  // Approved by Jay with the last clause removed (N4, Stage 3 checkpoint).
  bio: "I'm a software engineer on Amazon's Shopping Cart team in Seattle. Before Amazon I studied CS at USC, and before that I spent years designing 3D game levels and running gaming servers.",
  // Home "~/about" text, Jay's own words verbatim (Stage 4 checkpoint). Followed by a "more about me" button.
  summary: [
    'I’m a software engineer on Amazon’s Shopping Cart team, building the backend behind every cart for billions of customers in the US, Japan, Europe, and India. Anyone can build a cart. The hard part is keeping it fast, always available, and accurate, even through migrations, traffic spikes, and bot attacks.',
    // (proposed) Jay's two gaming startups, taken to be Drag2Death and Mammoth Gaming; facts from their role entries.
    'Before Amazon, I ran two gaming startups in Mumbai, Drag2Death and Mammoth Gaming, where we served 100,000+ users on our game servers and organized 32 eSports events.',
    'Away from work, you’ll find me writing tech blogs, playing badminton, or lost in a video game.',
  ],
  // The About page: Jay's own text (Stage 8 checkpoint), shown with his photo and nothing else. **bold** marks
  // key facts (rendered by inlineMarkdown).
  // {years} and {proYears} are filled in at build time from CAREER (Jay: programming since 2011, 8th
  // grade Java), so they stay right each year. `logos` name SVGs in src/assets/logos/ (missing ones are
  // skipped, so a file Jay adds later just appears).
  story: [
    {
      heading: null,
      logos: [],
      paragraphs: [
        // (proposed) Reworded at Jay's request, opening with his own first sentence.
        'I’m a software engineer on Amazon’s Shopping Cart team. I’ve been programming for **{years} years**, the last {proYears} professionally. I started with Java, C, C++ and Python, and **Java is still my strongest language**. Before any of that, though, there were games.',
      ],
    },
    {
      heading: 'Games first',
      logos: ['counterstrike', 'csgo', 'cs-source'],
      paragraphs: [
        '**From 2011 to 2019**, I designed 3D levels and ran game servers for Counter-Strike: Global Offensive and Counter-Strike: Source. It began as a side project next to school and college, and I learned to balance both. I picked up level design from YouTube series, blogs, and veteran map designers. My early maps were rough, but they got better with practice. Over time, **40 of them** went up on GameBanana and Steam Workshop and collected **over 1 million downloads** and **1.3 million views**. I built **the Taj Mahal** from scratch, which took a month. My Lego-themed and sci-fi maps went viral and were **featured on the Steam front page**. I later hosted a YouTube series of map-making workshops, with **500 to 1,000 viewers per live stream**.',
        'The technical side taught me just as much. I configured and maintained game servers on **AWS** and in local data centers, handled **DDoS attacks**, and worked with data centers to keep latency low for players. The same skills carried over to the **two gaming startups** I ran in Mumbai, Drag2Death and Mammoth Gaming, and to running technical operations for **32 eSports events** in India, both online and LAN. Keeping a live service up while real people depend on it was my first lesson in operations, long before my first engineering job.',
      ],
    },
    {
      heading: 'Engineering',
      logos: ['amazon'],
      paragraphs: [
        'Gaming is a hobby now. What stayed with me was the pull of complex problems. That led to an **MS in Computer Science** at the **University of Southern California**, and then to Amazon.',
        'Working on a large service changed what I thought the job was. At first, coding felt like the whole thing. It isn’t. Software engineering is design documents, unit tests, launch dashboards, documentation, deployments, and then the code. The hard part was never typing the code. It was **knowing what to type**. That’s why I write down the problem and sketch a simple solution before I open an AI tool. AI makes code easy to produce, but it doesn’t make a system simple. I’d rather ship something I can still understand six months later.',
        'What matters most comes after the code: deploying, testing, and making sure customers in prod see the correct results. Watching a change move from source through the pipeline, **from beta to prod**, is my favorite part of the work.',
      ],
    },
    {
      heading: 'How I work',
      logos: [],
      paragraphs: [
        'Good mentors, peers, and managers shaped how I approach it. They taught me to stay calm when things get difficult, to keep a level head on-call, and to **mitigate first** and find the root cause afterward. They pushed me to look past the problem as stated and ask whether the solution holds up long-term. They also taught me to ask better questions: do the research first, then bring what I tried and what I think. When I’m stuck, I talk to someone early instead of grinding alone. A fresh perspective often saves days. In short, they taught me to be **solution-oriented**.',
      ],
    },
    {
      heading: 'Outside work',
      logos: [],
      paragraphs: [
        'I listen to a lot of music. According to Spotify, I listen to **15 different genres**. I love exploring new cuisines and traveling. I also play **badminton**, which is a great stress buster, and I can get competitive. Okay, I’m always competitive. After a long day of thinking, a game or a quiet evening does more for me than pushing through. I save the deep thinking for the big decisions and keep the small ones, like where to eat, easy.',
        'Whenever there’s a chance to write, I do. Lately that means **tech blogs for software engineers**.',
      ],
    },
  ] as { heading: string | null; logos: string[]; paragraphs: string[] }[],
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
