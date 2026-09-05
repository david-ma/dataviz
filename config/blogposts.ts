import type { Blogpost } from './blogpost-types.js'

/**
 * Canonical catalogue of dataviz posts.
 * `status: 'published'` → homepage / nav / sitemap /viz.
 * Any other status → omitted from those surfaces; `/blog/:shortname` still works.
 */
export const blogposts: Blogpost[] = [
  {
    shortname: 'georgia',
    title: 'Which Georgia are you closest to?',
    category: 'interactive',
    summary:
      'A simple interactive map to show which Georgia you are closest to',
    image: 'images/georgia.png',
    publish_date: '2024-04-17',
    status: 'published',
    tier: 'core',
  },
  {
    shortname: 'war',
    title: 'American Wartime',
    category: '#MakeoverMonday',
    summary:
      'Nearly a quarter of Americans have never experienced the U.S. in a time of peace according to the Washington Post.',
    image: 'images/war.jpg',
    publish_date: '2020-02-01',
    status: 'published',
    tier: 'core',
  },
  {
    shortname: 'wealth',
    title: 'World Wealth',
    category: '#MakeoverMonday',
    summary: "All of the world's wealth, according to the Credit Suisse report",
    image: 'images/wealth.png',
    publish_date: '2020-02-17',
    status: 'published',
  },
  {
    shortname: 'breathe',
    title: 'Breathing Polygons',
    category: 'animation',
    summary: 'D3.js & maths practice by drawing breathing polygons',
    image: 'images/breathe.png',
    publish_date: '2020-11-07',
    status: 'published',
    tier: 'core',
  },
  {
    shortname: 'AusIncome',
    title: 'Australian Income',
    category: 'archive',
    summary: 'Graphs from ATO income stats 2018',
    image: 'images/ausIncome.png',
    publish_date: '2021-08-30',
    status: 'archived',
  },
  {
    shortname: 'matrix',
    title: 'Matrix Raining Code',
    category: 'animation',
    summary: 'The raining code from the movie The Matrix (1999)',
    image: 'images/matrix.jpg',
    publish_date: '2021-09-12',
    status: 'published',
    tier: 'core',
  },
  {
    shortname: 'winamp',
    title: 'Winamp Animation',
    category: 'animation',
    summary: 'A simple animation, reminiscent of the old winamp visualisations',
    image: 'images/winamp.jpg',
    publish_date: '2021-09-15',
    status: 'published',
    tier: 'core',
  },
  {
    shortname: 'earthquake',
    title: 'Melbourne Earthquake',
    category: 'animation',
    summary:
      'A visualisation of the twitter activity when Melbourne had an earthquake',
    image: 'images/earthquake.jpg',
    publish_date: '2021-09-23',
    status: 'published',
    tier: 'core',
  },
  {
    shortname: 'sixseven',
    title: "Six Seven: Benford's Law on Twitter counts",
    category: 'archive',
    summary:
      "Testing Benford's law on anonymised Twitter follower, friend and status counts: do first digits follow the classic pattern?",
    image: 'images/sixseven.png',
    publish_date: '2025-02-21',
    status: 'archived',
  },
  {
    shortname: 'statues',
    title: 'Statues of Women and Goats in the UK',
    category: 'interactive',
    summary:
      'Mapping the geographic distribution of public statues featuring women and goats across the UK, highlighting the underrepresentation of women in public monuments',
    image: 'images/statues.png',
    publish_date: '2025-12-03',
    status: 'hold',
  },
  {
    shortname: 'genuary-25-01',
    title: 'Vertical or horizontal lines only',
    category: 'Genuary 2025',
    summary:
      'An exploration of strict geometry using only vertical and horizontal lines for the first Genuary 2025 prompt.',
    image: 'images/genuary-25-01.png',
    publish_date: '2025-01-01',
    status: 'published',
    tier: 'standard',
  },
  {
    shortname: 'genuary-25-02',
    title: 'Layers upon layers upon layers',
    category: 'Genuary 2025',
    summary:
      'Stacked generative layers build up depth and texture in response to the second Genuary 2025 prompt.',
    image: 'images/genuary-25-02.png',
    publish_date: '2025-01-02',
    status: 'published',
    tier: 'standard',
  },
  {
    shortname: 'genuary-25-03',
    title: 'Exactly 42 lines of code',
    category: 'Genuary 2025',
    summary:
      'A constrained generative sketch written in exactly forty‑two lines of code for the third Genuary 2025 prompt.',
    image: 'images/genuary-25-03.png',
    publish_date: '2025-01-03',
    status: 'published',
    tier: 'standard',
  },
  {
    shortname: 'genuary-25-04',
    title: 'Black on black',
    category: 'Genuary 2025',
    summary:
      'Low‑contrast textures and light play explore the “black on black” Genuary 2025 prompt.',
    image: 'images/genuary-25-04.png',
    publish_date: '2025-01-04',
    status: 'published',
    tier: 'standard',
  },
  {
    shortname: 'genuary-25-05',
    title: 'Isometric art (no vanishing points)',
    category: 'Genuary 2025',
    summary:
      'An isometric generative scene built without vanishing points for the fifth Genuary 2025 prompt.',
    image: 'images/genuary-25-05.png',
    publish_date: '2025-01-05',
    status: 'published',
    tier: 'standard',
  },
  {
    shortname: 'genuary-25-06',
    title: 'Landscapes from primitive shapes',
    category: 'Genuary 2025',
    summary:
      'Minimalist landscapes assembled solely from primitive shapes for the sixth Genuary 2025 prompt.',
    image: 'images/genuary-25-06.png',
    publish_date: '2025-01-06',
    status: 'published',
    tier: 'standard',
  },
  {
    shortname: 'genuary-25-07',
    title: 'Use software not intended for art',
    category: 'Genuary 2025',
    summary:
      'A physics‑driven sketch inspired by the “use software that is not intended to create art or images” prompt.',
    image: 'images/genuary-25-07.png',
    publish_date: '2025-01-07',
    status: 'published',
    tier: 'standard',
  },
  {
    shortname: 'genuary-25-17',
    title: 'What happens if π = 4?',
    category: 'Genuary 2025',
    summary:
      'An exploration of circles, squares and approximations of π through the lens of the “pi equals four” prompt.',
    image: 'images/genuary-25-17.png',
    publish_date: '2025-01-17',
    status: 'published',
    tier: 'standard',
  },
  {
    shortname: 'theseus-wiki',
    title: 'Theseus Wiki',
    category: 'interactive',
    summary:
      'An interactive visualisation of the Ship of Theseus thought experiment, exploring identity and change through Wikipedia edit histories.',
    image: 'images/theseus.png',
    publish_date: '2024-12-03',
    status: 'published',
  },
  {
    shortname: 'wordle',
    title: 'Wordle solver',
    category: 'interactive',
    summary: 'A tool for helping you beat Wordle by tracking guesses and letter feedback.',
    image: 'images/wordle.png',
    publish_date: '2022-02-01',
    status: 'published',
  },
  {
    shortname: 'genuary',
    title: 'Genuary 2025',
    category: 'Genuary 2025',
    summary: 'Eight generative art pieces made for Genuary 2025 — one prompt per day.',
    image: 'images/genuary-25-01.png',
    publish_date: '2025-01-01',
    status: 'hold',
    noJs: true,
  },
]

const config: any = {}
export { config }
