import type { RawWebsiteConfig } from 'thalia'
import { recursiveObjectMerge } from '../node_modules/thalia/server/website.js'
import { gitHash } from './utilities.js'
import { config as blogpostConfig } from './blogposts.js'
import { blogControllers } from './controllers/blog.js'
import { fridgeImagesController } from './controllers/fridge_images.js'

let config: RawWebsiteConfig = {
  controllers: {
    ...blogControllers,
    source: (res, req, website, requestInfo) => {
      // Show the source code for a typescript file
      // Created for Genuary 2025
      const filepath = requestInfo.pathname
      const regex = /js\/(.*).js/
      if (regex.test(filepath)) {
        // @ts-ignore
        const shortname = regex.exec(filepath)[1]
        res.setHeader('Content-Type', 'text/javascript')
        res.end(fs.readFileSync(path.resolve(website.rootPath, 'src', 'js', `${shortname}.ts`)))
      } else {
        res.end('404')
      }
    },
    fridge_images: fridgeImagesController,
  },
}

config = recursiveObjectMerge(config, blogpostConfig)

export { config }
