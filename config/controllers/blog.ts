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

export const publishedBlogposts = () => blogposts.filter((post) => post.published)

const navContext = () => {
  const published = publishedBlogposts()
  return {
    gitHash,
    blogposts: published.filter((post) => post.category !== 'Genuary 2025'),
    genuaryBlogposts: published.filter((post) => post.category === 'Genuary 2025'),
  }
}

export const blogControllers: RawWebsiteConfig['controllers'] = {
  '': (res, req, website, requestInfo) => {
    const html = website.getContentHtml('homepage')({
      ...navContext(),
      blogposts: publishedBlogposts(),
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
  blog: (res, req, website, requestInfo) => {
    const shortname = requestInfo.action
    if (!shortname) {
      res.statusCode = 301
      res.setHeader('Location', '/')
      res.end()
      return
    }

    const blogpost = publishedBlogposts().find((post) => post.shortname === shortname)

    if (!blogpost || !hasBlogTemplate(website.rootPath, shortname)) {
      const html = website.getContentHtml('404', 'blog')({
        ...navContext(),
      })
      res.statusCode = 404
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end(html)
      return
    }

    const html = website.getContentHtml(shortname, 'blog')({
      ...navContext(),
      blogpost,
      typescript: `/js/${shortname}.js`,
    })
    res.end(html)
  },
}

