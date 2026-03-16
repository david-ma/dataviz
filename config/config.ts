import path from 'path'
import fs from 'fs'
import type { RawWebsiteConfig } from 'thalia'
import { recursiveObjectMerge } from '../node_modules/thalia/server/website.js'
import { gitHash } from './utilities.js'
import { blogposts, config as blogpostConfig } from './blogposts.js'

const contentDirSegments = ['src', 'views', 'content'] as const
const blogTemplateExtensions = ['.hbs', '.mustache'] as const

const publishedBlogposts = blogposts.filter((post) => post.published)

const hasBlogTemplate = (websiteRootPath: string, shortname: string) => {
  const contentDir = path.resolve(websiteRootPath, ...contentDirSegments)

  return blogTemplateExtensions.some((extension) =>
    fs.existsSync(path.resolve(contentDir, `${shortname}${extension}`)),
  )
}

let config: RawWebsiteConfig = {
  controllers: {
    '': (res, req, website, requestInfo) => {
      const html = website.getContentHtml('homepage')({
        gitHash,
        blogposts: publishedBlogposts,
      })
      res.end(html)
    },
    blog: (res, req, website, requestInfo) => {
      const shortname = requestInfo.action
      if (!shortname) {
        res.statusCode = 301
        res.setHeader('Location', '/')
        res.end()
        return
      }

      const blogpost = publishedBlogposts.find((post) => post.shortname === shortname)

      if (!blogpost || !hasBlogTemplate(website.rootPath, shortname)) {
        const html = website.getContentHtml('404', 'blog')({
          gitHash,
          blogposts: publishedBlogposts,
        })
        res.end(html)
        return
      }

      const html = website.getContentHtml(shortname, 'blog')({
        gitHash,
        typescript: `/js/${shortname}.js`,
        blogposts: publishedBlogposts,
      })
      res.end(html)
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
        res.end(fs.readFileSync(path.resolve(website.rootPath, 'src', 'js', `${shortname}.ts`)))
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
      const filter = ['.DS_Store', '.gitignore', 'david.png', 'grace.png', 'index.html', 'printed']
      Promise.all([
        fs.promises.readdir(path.resolve(basePath, 'az_images')),
        fs.promises.readdir(path.resolve(basePath, 'ruby_images')),
        fs.promises.readdir(path.resolve(basePath, 'renee_images')),
      ]).then(function ([az, ruby, renee]) {
        var images = az
          .filter((d) => filter.indexOf(d) === -1)
          .map((d) => 'az_images/' + d)
          .concat(ruby.filter((d) => filter.indexOf(d) === -1).map((d) => 'ruby_images/' + d))
          .concat(renee.filter((d) => filter.indexOf(d) === -1).map((d) => 'renee_images/' + d))
        res.end(JSON.stringify(images))
      })
    },
  },
}

config = recursiveObjectMerge(config, blogpostConfig)

export { config }
