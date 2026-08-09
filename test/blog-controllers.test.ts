/**
 * Unit tests for blog controller logic.
 * These run without a server — they test the pure functions and data
 * exported from config/controllers/blog.ts.
 */

import { describe, expect, test } from 'bun:test'
import path from 'path'
import { publishedBlogposts } from '../config/controllers/blog'
import { blogposts } from '../config/blogposts'

const CONTENT_DIR = path.resolve(
  import.meta.dir,
  '..',
  'src',
  'views',
  'content',
)

describe('publishedBlogposts', () => {
  const PUBLISHED = publishedBlogposts()

  test('only includes posts with published: true', () => {
    expect(PUBLISHED.every((p) => p.published)).toBe(true)
  })

  test('is a subset of all blogposts', () => {
    const allShortnames = new Set(blogposts.map((p) => p.shortname))
    PUBLISHED.forEach((p) => {
      expect(allShortnames.has(p.shortname)).toBe(true)
    })
  })

  test('every published post has a shortname, title, and image', () => {
    PUBLISHED.forEach((p) => {
      expect(p.shortname).toBeTruthy()
      expect(p.title).toBeTruthy()
      expect(p.image).toBeTruthy()
    })
  })
})

describe('template coverage for published posts', () => {
  test('every published post has a matching template in src/views/content', async () => {
    const fs = await import('fs')
    const missing: string[] = []

    for (const post of publishedBlogposts()) {
      const hasTemplate = ['.hbs', '.mustache'].some((ext) =>
        fs.existsSync(path.resolve(CONTENT_DIR, `${post.shortname}${ext}`)),
      )
      if (!hasTemplate) missing.push(post.shortname)
    }

    if (missing.length) {
      throw new Error(
        `Published posts missing a template in src/views/content:\n${missing.join('\n')}`,
      )
    }

    expect(missing.length).toBe(0)
  })
})
