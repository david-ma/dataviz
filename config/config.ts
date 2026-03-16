import type { RawWebsiteConfig } from 'thalia'
import { recursiveObjectMerge } from '../node_modules/thalia/server/website.js'
import { config as blogpostConfig } from './blogposts.js'
import { blogControllers } from './controllers/blog.js'
import { fridgeImagesController } from './controllers/fridge_images.js'

let config: RawWebsiteConfig = {
  controllers: {
    ...blogControllers,
    fridge_images: fridgeImagesController,
  },
}

config = recursiveObjectMerge(config, blogpostConfig)

export { config }
