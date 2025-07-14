const blogposts = [
  {
    shortname: 'georgia',
    title: 'Which Georgia are you closest to?',
    category: 'interactive',
    summary:
      'A simple interactive map to show which Georgia you are closest to',
    image: 'images/georgia.png',
    publish_date: '2024-04-17',
    published: true,
  },
  {
    shortname: 'war',
    title: 'American Wartime',
    category: '#MakeoverMonday',
    summary:
      'Nearly a quarter of Americans have never experienced the U.S. in a time of peace according to the Washington Post.',
    image: 'images/war.jpg',
    publish_date: '2020-02-01',
    published: true,
  },
  {
    shortname: 'wealth',
    title: 'World Wealth',
    category: '#MakeoverMonday',
    summary: "All of the world's wealth, according to the Credit Suisse report",
    image: 'images/wealth.png',
    publish_date: '2020-02-17',
    published: true,
  },
  {
    shortname: 'influenza',
    title: 'Influenza Surveillance Report',
    category: '#MakeoverMonday',
    summary: 'Influenza in the USA in 2018',
    image: 'images/influenza.jpg',
    publish_date: '2018-06-18',
    published: false,
  },
  {
    shortname: 'breathe',
    title: 'Breathing Polygons',
    category: 'animation',
    summary: 'D3.js & maths practice by drawing breathing polygons',
    image: 'images/breathe.png',
    publish_date: '2020-11-07',
    published: true,
  },
  {
    shortname: 'AusIncome',
    title: 'Australian Income',
    category: 'charts',
    summary: 'Graphs from ATO income stats 2018',
    image: 'images/ausIncome.png',
    publish_date: '2021-08-30',
    published: true,
  },
  {
    shortname: 'matrix',
    title: 'Matrix Raining Code',
    category: 'animation',
    summary: 'The raining code from the movie The Matrix (1999)',
    image: 'images/matrix.jpg',
    publish_date: '2021-09-12',
    published: true,
  },
  {
    shortname: 'winamp',
    title: 'Winamp Animation',
    category: 'animation',
    summary: 'A simple animation, reminiscent of the old winamp visualisations',
    image: 'images/winamp.jpg',
    publish_date: '2021-09-15',
    published: true,
  },
  {
    shortname: 'earthquake',
    title: 'Melbourne Earthquake',
    category: 'animation',
    summary:
      'A visualisation of the twitter activity when Melbourne had an earthquake',
    image: 'images/earthquake.jpg',
    publish_date: '2021-09-23',
    published: true,
  },
]

import { blogpostTable } from '../../models/drizzle-schema.js'
import { drizzle } from 'drizzle-orm/mysql2'
import path from 'path'

// @ts-ignore
const drizzleConfig = await import(
  path.join(import.meta.dirname, '..', '..', 'drizzle.config.ts')
)

const db = drizzle(drizzleConfig.default.dbCredentials.url)

db.select()
  .from(blogpostTable)
  .then((results) => {
    if (results.length === 0) {
      console.log('No blogposts found, inserting...')
      // db.insert(blogpostTable).values(blogposts)

      Promise.all(
        blogposts.map((blogpost) => db.insert(blogpostTable).values(blogpost)),
      )
        .then(() => {
          console.log('Blogposts inserted')
          process.exit(0)
        })
        .catch((error) => {
          console.error('Error inserting blogposts:', error)
          process.exit(1)
        })
    } else {
      console.log('Blogposts found, skipping...')
      process.exit(0)
    }
  })
