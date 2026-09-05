import path from 'path'
import fs from 'fs'
import type { RawWebsiteConfig } from 'thalia/types'

import { blogposts } from '../blogposts.js'
import {
  byPublishDateDesc,
  isListed,
  type Blogpost,
} from '../blogpost-types.js'
import { gitHash } from '../utilities.js'

const contentDirSegments = ['src', 'views', 'content'] as const
const blogTemplateExtensions = ['.hbs', '.mustache'] as const

const hasBlogTemplate = (websiteRootPath: string, shortname: string) => {
  const contentDir = path.resolve(websiteRootPath, ...contentDirSegments)

  return blogTemplateExtensions.some((extension) =>
    fs.existsSync(path.resolve(contentDir, `${shortname}${extension}`)),
  )
}

/** Homepage / nav / sitemap /viz — `status === 'published'` only. */
export const publishedBlogposts = (): Blogpost[] =>
  blogposts.filter(isListed).sort(byPublishDateDesc)

/** Any catalogue entry (for direct URL resolution). */
export const findBlogpost = (shortname: string): Blogpost | undefined =>
  blogposts.find((post) => post.shortname === shortname)

const navContext = () => ({
  gitHash,
  blogposts: publishedBlogposts(),
})

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
  viz: (res, req, website, requestInfo) => {
    const html = website.getContentHtml('viz', 'blog')({
      ...navContext(),
      blogposts: publishedBlogposts(),
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

    const blogpost = findBlogpost(shortname)

    if (!blogpost || !hasBlogTemplate(website.rootPath, shortname)) {
      // If <shortname>.ts exists in /src/js, we can serve example.hbs
      if (fs.existsSync(path.resolve(website.rootPath, 'src', 'js', `${shortname}.ts`))) {
        const html = website.getContentHtml('example', 'blog')({
          ...navContext(),
          typescript: `/js/${shortname}.js`,
          blogpost: {
            shortname,
            title: shortname,
            summary: 'Example blog post',
            publish_date: new Date().toISOString().slice(0, 10),
            status: 'hold' as const,
          },
        })
        res.end(html)
        return
      } else {
        const html = website.getContentHtml('404', 'blog')({
          ...navContext(),
        })
        res.statusCode = 404
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end(html)
        return
      }
    }

    const html = website.getContentHtml(shortname, 'blog')({
      ...navContext(),
      blogpost,
      typescript: `/js/${shortname}.js`,
    })
    res.end(html)
  },
}
