import path from 'path'
import fs from 'fs'
import type { RawWebsiteConfig } from 'thalia'

import { blogposts } from '../blogposts.js'
import { gitHash } from '../utilities.js'

const contentDirSegments = ['src', 'views', 'content'] as const
const blogTemplateExtensions = ['.hbs', '.mustache'] as const

const hasBlogTemplate = (websiteRootPath: string, shortname: string) => {
  const contentDir = path.resolve(websiteRootPath, ...contentDirSegments)

  return blogTemplateExtensions.some((extension) =>
    fs.existsSync(path.resolve(contentDir, `${shortname}${extension}`)),
  )
}

export const publishedBlogposts = blogposts.filter((post) => post.published)

export const blogControllers: RawWebsiteConfig['controllers'] = {
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
      res.statusCode = 404
      res.writeHead(404, { 'Content-Type': 'text/html' })
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
}

