/**
 * HTTP integration checks for dataviz.
 *
 * Starts a fresh Thalia server on an ephemeral port (via get-port-please
 * inside `thalia/testing` helpers). Does not require MySQL.
 *
 * Set SKIP_SITE_INTEGRATION=1 to skip (e.g. environments that cannot bind ports).
 */

import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import path from 'node:path'
import {
  fetchFromServer,
  startTestServer,
  stopTestServer,
  waitForServerHttp,
} from 'thalia/testing'
import { blogposts } from '../config/blogposts'
import { publishedBlogposts } from '../config/controllers/blog'

const PROJECT = 'dataviz'
const projectRoot = path.resolve(import.meta.dirname, '..')
const runIntegration = process.env.SKIP_SITE_INTEGRATION !== '1'
const describeIntegration = runIntegration ? describe : describe.skip

const PUBLISHED_POSTS = blogposts.filter((post) => post.published)

describeIntegration('Dataviz site HTTP', () => {
  let port: number

  beforeAll(async () => {
    const serverInfo = await startTestServer(PROJECT, {
      fresh: true,
      rootPath: projectRoot,
    })
    port = serverInfo.port
    await waitForServerHttp(port)
  }, 30_000)

  afterAll(async () => {
    await stopTestServer(PROJECT)
  })

  test('homepage (/) returns HTTP 200', async () => {
    const response = await fetchFromServer('/', port)
    expect(response.status).toBe(200)
  })

  test('/blog with no shortname redirects (301 or 302)', async () => {
    const response = await fetchFromServer('/blog', port, { redirect: 'manual' })
    expect([301, 302]).toContain(response.status)
  })

  test('/blog/nonexistent-route returns a page (200 or 404), not a crash', async () => {
    const response = await fetchFromServer(
      '/blog/nonexistent-route-that-does-not-exist',
      port,
    )
    expect([200, 404]).toContain(response.status)
  })

  test('/viz returns HTTP 200', async () => {
    const response = await fetchFromServer('/viz', port)
    expect(response.status).toBe(200)
  })

  test('each published blogpost returns HTTP 200', async () => {
    const results = await Promise.all(
      PUBLISHED_POSTS.map(async (post) => {
        const response = await fetchFromServer(`/blog/${post.shortname}`, port)
        return { shortname: post.shortname, status: response.status }
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
  }, 30_000)

  test('each published blogpost JS bundle returns HTTP 200', async () => {
    const posts = publishedBlogposts().filter((post) => !(post as { noJs?: boolean }).noJs)
    const results = await Promise.all(
      posts.map(async (post) => {
        const response = await fetchFromServer(`/js/${post.shortname}.js`, port)
        return { shortname: post.shortname, status: response.status }
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
  }, 30_000)
})
