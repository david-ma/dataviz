/**
 * Smoke tests for key server routes.
 * Requires a local Thalia dev server on localhost:1337.
 *
 * Covers routes that are not blog posts (homepage, blog redirect, 404 handling).
 */

import { describe, expect, test } from '@jest/globals'
import http from 'http'

const getStatus = (path: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const req = http.get({ hostname: 'localhost', port: 1337, path }, (res) => {
      res.resume()
      resolve(res.statusCode ?? 0)
    })
    req.on('error', reject)
  })

describe('Key route smoke tests', () => {
  test('homepage (/) returns HTTP 200', async () => {
    expect(await getStatus('/')).toBe(200)
  }, 10000)

  test('/blog with no shortname redirects (301 or 302)', async () => {
    const status = await getStatus('/blog')
    expect([301, 302]).toContain(status)
  }, 10000)

  test('/blog/nonexistent-route returns a page (200 or 404), not a crash', async () => {
    const status = await getStatus('/blog/nonexistent-route-that-does-not-exist')
    expect([200, 404]).toContain(status)
  }, 10000)
})
