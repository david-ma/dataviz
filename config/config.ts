import { RawWebsiteConfig } from 'thalia'
import { gitHash } from './utilities.js'

import path from 'path'
import http from 'http'
import fs from 'fs'

const fsPromise = fs.promises

let cache = null
import { blogpostTable } from '../models/drizzle-schema.js'
import { eq, desc } from 'drizzle-orm'

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
          .then((blogposts) => {
            const html = website.getContentHtml('homepage')({
              gitHash,
              blogposts,
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
          .then((blogposts) => {
            const html = website.getContentHtml(
              shortname,
              'blog',
            )({
              gitHash,
              typescript: `/js/${shortname}.js`,
              blogposts,
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
