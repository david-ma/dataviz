import { RawWebsiteConfig } from 'thalia'
import { gitHash } from './utilities.js'

import path from 'path'
import http from 'http'
import fs from 'fs'

const fsPromise = fs.promises

let cache = null
import { blogpostTable } from '../models/drizzle-schema.js'
import { eq, desc } from 'drizzle-orm'

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

let config: RawWebsiteConfig = {
  controllers: {
    '': (res, req, website, requestInfo) => {
      if (!website.db) {
        res.end('Database not connected')
      } else {
        website.db.drizzle
          .select()
          .from(blogpostTable)
          .where(eq(blogpostTable.published, true))
          .orderBy(desc(blogpostTable.publish_date))
          .then((results) => {
            const html = website.getContentHtml('homepage')({
              gitHash,
              blogposts,
              // blogposts: results,
            })

            res.end(html)
          })
      }
    },
    blog: (res, req, website, requestInfo) => {
      const shortname = requestInfo.action
      if (!shortname) {
        res.statusCode = 301
        res.setHeader('Location', '/')
        res.end()
        return
      }

      if (!website.db) {
        res.end('Database not connected')
      } else {
        website.db.drizzle
          .select()
          .from(blogpostTable)
          .where(eq(blogpostTable.published, true))
          .then((results) => {
            const html = website.getContentHtml(
              shortname,
              'blog',
            )({
              gitHash,
              typescript: `/js/${shortname}.js`,
              blogposts,
              // blogpost: results,
            })
            res.end(html)
          })
          .catch((error) => {
            console.error(error)
            res.end('Error')
          })
      }
    },
    source: (res, req, website, requestInfo) => {
      // Show the source code for a typescript file
      // Created for Genuary 2025
      const filepath = requestInfo.pathname
      const regex = /js\/(.*).js/

      if (regex.test(filepath)) {
        // @ts-ignore
        const shortname = regex.exec(filepath)[1]
        res.setHeader('Content-Type', 'text/javascript')
        res.end(
          fs.readFileSync(
            path.resolve(website.rootPath, 'src', 'js', `${shortname}.ts`),
          ),
        )
      } else {
        res.end('404')
      }
    },
    fridge_images: function (res, req, db) {
      const basePath = path.resolve(__dirname, '..', 'data', 'fridge')

      // check if az_images, ruby_images and renee_images exist
      if (
        !fs.existsSync(path.resolve(basePath, 'az_images')) ||
        !fs.existsSync(path.resolve(basePath, 'ruby_images')) ||
        !fs.existsSync(path.resolve(basePath, 'renee_images'))
      ) {
        res.end('No images')
        return
      }

      const filter = [
        '.DS_Store',
        '.gitignore',
        'david.png',
        'grace.png',
        'index.html',
        'printed',
      ]

      Promise.all([
        fsPromise.readdir(path.resolve(basePath, 'az_images')),
        fsPromise.readdir(path.resolve(basePath, 'ruby_images')),
        fsPromise.readdir(path.resolve(basePath, 'renee_images')),
      ]).then(function ([az, ruby, renee]) {
        var images = az
          .filter((d) => filter.indexOf(d) === -1)
          .map((d) => 'az_images/' + d)
          .concat(
            ruby
              .filter((d) => filter.indexOf(d) === -1)
              .map((d) => 'ruby_images/' + d),
          )
          .concat(
            renee
              .filter((d) => filter.indexOf(d) === -1)
              .map((d) => 'renee_images/' + d),
          )

        res.end(JSON.stringify(images))
      })
    },
  },
  database: {
    schemas: {
      blogpost: blogpostTable,
    },
  },
}

// if (fs.existsSync(path.resolve(__dirname, 'config.json'))) {
//   config = _.merge(config, smugmugConfig)
// } else {
//   console.warn('config.json not provided, skipping smugmug stuff')
// }

// import { config as awesomeConfig } from './awesome'
// config = _.merge(config, awesomeConfig)

// import { config as cameraConfig } from './camera'
// config = _.merge(config, cameraConfig)

// import { config as atlassianConfig } from './atlassianBackend'
// config = _.merge(config, atlassianConfig)

export { config }
