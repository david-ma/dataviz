import { describe, expect, test } from 'bun:test'
import path from 'path'
import { publishedBlogposts } from '../config/controllers/blog'
import { blogposts } from '../config/blogposts'
import { CORE_SHORTNAMES, isCore, isListed } from '../config/blogpost-types'

const CONTENT_DIR = path.resolve(
  import.meta.dir,
  '..',
  'src',
  'views',
  'content',
)

describe('publishedBlogposts', () => {
  const PUBLISHED = publishedBlogposts()

  test('only includes posts with status published', () => {
    expect(PUBLISHED.every((p) => p.status === 'published')).toBe(true)
    expect(PUBLISHED.every(isListed)).toBe(true)
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

  test('core six are published with tier core', () => {
    for (const shortname of CORE_SHORTNAMES) {
      const post = blogposts.find((p) => p.shortname === shortname)
      expect(post).toBeTruthy()
      expect(post!.status).toBe('published')
      expect(isCore(post!)).toBe(true)
    }
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
