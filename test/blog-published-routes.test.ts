/**
 * Basic smoke test to ensure all published blogposts configured in
 * `config/blogposts.ts` return HTTP 200 from the running dev server.
 *
 * This relies on a local Thalia server listening on localhost:1337.
 */

import { describe, expect, test } from '@jest/globals'
import http from 'http'
import { blogposts } from '../config/blogposts'

const PUBLISHED_POSTS = blogposts.filter((post) => post.published)

const getStatus = (path: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const req = http.get(
      {
        hostname: 'localhost',
        port: 1337,
        path,
      },
      (res) => {
        // drain response to avoid socket hangup in CI
        res.resume()
        resolve(res.statusCode ?? 0)
      },
    )

    req.on('error', (err) => reject(err))
  })

describe('Published blogpost routes', () => {
  test(
    'each published blogpost returns HTTP 200',
    async () => {
      const results = await Promise.all(
        PUBLISHED_POSTS.map(async (post) => {
          const status = await getStatus(`/blog/${post.shortname}`)
          return { shortname: post.shortname, status }
        }),
      )

      const failing = results.filter((r) => r.status !== 200)

      if (failing.length) {
        const message = failing
          .map((r) => `/blog/${r.shortname} → ${r.status}`)
          .join('\n')
        throw new Error(
          `Expected all published blogposts to return HTTP 200:\n${message}`,
        )
      }

      expect(failing.length).toBe(0)
    },
    // allow a little extra time for a cold dev server
    15000,
  )
}

