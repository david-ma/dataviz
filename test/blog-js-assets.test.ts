/**
 * Smoke tests to verify that the JS bundle for each published blogpost
 * is accessible (HTTP 200) from the running dev server.
 *
 * A 500 here means the dev server failed to compile or serve the asset —
 * typically because a TS source import can't be resolved in dev mode.
 * The fix is usually to ensure the pre-built file exists in public/js/.
 *
 * Requires a local Thalia dev server on localhost:1337.
 */

import { describe, expect, test } from '@jest/globals'
import http from 'http'
import { publishedBlogposts } from '../config/controllers/blog'

const getStatus = (path: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const req = http.get({ hostname: 'localhost', port: 1337, path }, (res) => {
      res.resume()
      resolve(res.statusCode ?? 0)
    })
    req.on('error', reject)
  })

describe('Published blogpost JS assets', () => {
  test(
    'each published blogpost JS bundle returns HTTP 200',
    async () => {
      const posts = publishedBlogposts().filter((post) => !(post as any).noJs)
      const results = await Promise.all(
        posts.map(async (post) => {
          const status = await getStatus(`/js/${post.shortname}.js`)
          return { shortname: post.shortname, status }
        }),
      )

      const failing = results.filter((r) => r.status !== 200)

      if (failing.length) {
        const message = failing
          .map((r) => `/js/${r.shortname}.js → ${r.status}`)
          .join('\n')
        throw new Error(
          `Expected all published blogpost JS bundles to return HTTP 200:\n${message}`,
        )
      }

      expect(failing.length).toBe(0)
    },
    30000,
  )
})
