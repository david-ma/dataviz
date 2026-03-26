import type { RawWebsiteConfig } from 'thalia'
import { recursiveObjectMerge } from '../node_modules/thalia/server/website.js'
import { config as blogpostConfig } from './blogposts.js'
import { blogControllers } from './controllers/blog.js'
import { fridgeImagesController } from './controllers/fridge_images.js'
import fs from 'fs'

let config: RawWebsiteConfig = {
  controllers: {
    ...blogControllers,
    fridge_images: fridgeImagesController,
    speedtests: function (res, req, website, requestInfo) {
      // List files in:
      // /usr/local/dev/Thalia/websites/dataviz/data/cloudflare-speedtest-runs
      fs.readdir('/usr/local/dev/Thalia/websites/dataviz/data/cloudflare-speedtest-runs', (err, files) => {
        if (err) {
          res.end('Error reading directory');
          return;
        }
        res.end(JSON.stringify(files));
      });
    },
  },
}

config = recursiveObjectMerge(config, blogpostConfig)

export { config }
