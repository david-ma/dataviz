/**
 * Capture a PNG preview of a blog post for the homepage grid.
 *
 * Prerequisites (operator installs — agents must not run installs):
 *   bun add -d playwright
 *   bunx playwright install chromium
 *
 * Usage:
 *   bun run preview:png georgia
 *   bun run preview:png --missing
 *   bun run preview:png --all
 *
 * Requires the site to be running (default http://127.0.0.1:1337).
 * Override with PREVIEW_BASE_URL.
 *
 * Writes public/images/<shortname>.png and prints the blogposts.ts image path.
 */

import fs from 'node:fs'
import path from 'node:path'
import { blogposts } from '../config/blogposts.ts'
import { isListed } from '../config/blogpost-types.ts'

const ROOT = path.resolve(import.meta.dir, '..')
const OUT_DIR = path.resolve(ROOT, 'public', 'images')
const BASE = process.env.PREVIEW_BASE_URL ?? 'http://127.0.0.1:1337'
const SETTLE_MS = Number(process.env.PREVIEW_SETTLE_MS ?? 2500)

const args = process.argv.slice(2).filter((a) => a !== '--')

function usage(): never {
  console.error(`Usage:
  bun run preview:png <shortname> [...]
  bun run preview:png --missing
  bun run preview:png --all

Env:
  PREVIEW_BASE_URL   (default ${BASE})
  PREVIEW_SETTLE_MS  wait after load before screenshot (default ${SETTLE_MS})
`)
  process.exit(1)
}

function localImagePath(post: { image: string }): string {
  // image is like "images/foo.png" → public/images/foo.png
  return path.resolve(ROOT, 'public', post.image)
}

function targets(): typeof blogposts {
  if (args.includes('--all')) return blogposts.filter(isListed)
  if (args.includes('--missing')) {
    return blogposts.filter(isListed).filter((p) => !fs.existsSync(localImagePath(p)))
  }
  const names = args.filter((a) => !a.startsWith('--'))
  if (!names.length) usage()
  return names.map((shortname) => {
    const post = blogposts.find((p) => p.shortname === shortname)
    if (!post) {
      console.error(`Unknown shortname: ${shortname}`)
      process.exit(1)
    }
    return post
  })
}

async function main() {
  let chromium: typeof import('playwright').chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch {
    console.error(`Playwright is not installed.

Operator steps:
  cd ${ROOT}
  bun add -d playwright
  bunx playwright install chromium
`)
    process.exit(1)
  }

  const posts = targets()
  if (!posts.length) {
    console.log('Nothing to capture.')
    return
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  })

  for (const post of posts) {
    const url = `${BASE.replace(/\/$/, '')}/blog/${post.shortname}`
    console.log(`Capturing ${post.shortname} ← ${url}`)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
    await page.waitForTimeout(SETTLE_MS)

    const clipTarget =
      (await page.$('#content_reactive_wrapper')) ??
      (await page.$('section.blogpost')) ??
      (await page.$('main')) ??
      (await page.$('body'))

    const out = localImagePath(post)
    fs.mkdirSync(path.dirname(out), { recursive: true })

    if (clipTarget) {
      await clipTarget.screenshot({ path: out, type: 'png' })
    } else {
      await page.screenshot({ path: out, type: 'png', fullPage: false })
    }

    console.log(`  → ${path.relative(ROOT, out)}`)
    console.log(`  blogposts.ts image: '${post.image}'`)
  }

  await browser.close()
  console.log(`Done (${posts.length} file(s)).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
