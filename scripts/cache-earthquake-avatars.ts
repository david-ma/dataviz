/**
 * Cache earthquake tweet profile images locally and rewrite the served JSON.
 *
 * Reads:  data/earthquakeTweets.json.gz
 * Writes: public/earthquakeTweets.json
 *         public/images/earthquake-avatars/<userId>.<ext>
 *         public/images/earthquake-avatars/_missing.svg (placeholder)
 *
 * Also ensures public/aust.json exists (copy from public/dataviz or data).
 *
 * Usage:
 *   bun scripts/cache-earthquake-avatars.ts
 *   bun scripts/cache-earthquake-avatars.ts --dry-run
 *   bun scripts/cache-earthquake-avatars.ts --limit=20
 */
import { gunzipSync } from 'node:zlib'
import { mkdir, writeFile, copyFile, access, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const gzPath = path.join(root, 'data', 'earthquakeTweets.json.gz')
const outJson = path.join(root, 'public', 'earthquakeTweets.json')
const avatarDir = path.join(root, 'public', 'images', 'earthquake-avatars')
const missingName = '_missing.svg'
const missingPublic = `/images/earthquake-avatars/${missingName}`

const dryRun = Bun.argv.includes('--dry-run')
const limitArg = Bun.argv.find((a) => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity
const concurrency = 8

type User = {
  id?: number
  id_str?: string
  screen_name?: string
  profile_image_url_https?: string
  profile_image_url?: string
  [key: string]: unknown
}

type TweetData = {
  users: Record<string, User>
  tweets: unknown[]
  geocodes?: unknown
  [key: string]: unknown
}

const MISSING_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="24" fill="#9ca3af"/>
  <circle cx="24" cy="18" r="8" fill="#e5e7eb"/>
  <ellipse cx="24" cy="40" rx="14" ry="10" fill="#e5e7eb"/>
</svg>
`

async function exists(p: string) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function readGzipJson(file: string): Promise<TweetData> {
  const compressed = await readFile(file)
  const json = gunzipSync(compressed).toString('utf8')
  return JSON.parse(json) as TweetData
}

function extFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const ext = path.extname(pathname).toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return ext
  } catch {
    /* ignore */
  }
  return '.jpg'
}

function contentTypeExt(ct: string | null): string | null {
  if (!ct) return null
  if (ct.includes('png')) return '.png'
  if (ct.includes('gif')) return '.gif'
  if (ct.includes('webp')) return '.webp'
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg'
  return null
}

async function ensureAustJson() {
  const dest = path.join(root, 'public', 'aust.json')
  if (await exists(dest)) return
  const candidates = [
    path.join(root, 'public', 'dataviz', 'aust.json'),
    path.join(root, 'data', 'aust.json'),
  ]
  for (const src of candidates) {
    if (await exists(src)) {
      if (!dryRun) await copyFile(src, dest)
      console.log(`aust.json ← ${path.relative(root, src)}`)
      return
    }
  }
  console.warn('warning: could not find aust.json to copy into public/')
}

async function mapPool<T, R>(
  items: T[],
  n: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, () => worker()),
  )
  return results
}

async function downloadAvatar(
  userId: string,
  url: string,
): Promise<{ localPath: string; ok: boolean; skipped: boolean }> {
  const preferredExt = extFromUrl(url)
  const preferredFile = path.join(avatarDir, `${userId}${preferredExt}`)

  if (await exists(preferredFile)) {
    return {
      localPath: `/images/earthquake-avatars/${userId}${preferredExt}`,
      ok: true,
      skipped: true,
    }
  }
  for (const ext of ['.jpg', '.jpeg', '.png', '.gif', '.webp']) {
    const alt = path.join(avatarDir, `${userId}${ext}`)
    if (await exists(alt)) {
      return {
        localPath: `/images/earthquake-avatars/${userId}${ext}`,
        ok: true,
        skipped: true,
      }
    }
  }

  if (dryRun) {
    return {
      localPath: `/images/earthquake-avatars/${userId}${preferredExt}`,
      ok: true,
      skipped: false,
    }
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'dataviz-earthquake-avatar-cache/1.0',
        Accept: 'image/*',
      },
      redirect: 'follow',
    })
    if (!res.ok) {
      return { localPath: missingPublic, ok: false, skipped: false }
    }
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 32) {
      return { localPath: missingPublic, ok: false, skipped: false }
    }
    const ext = contentTypeExt(res.headers.get('content-type')) || preferredExt
    const file = path.join(avatarDir, `${userId}${ext}`)
    await writeFile(file, buf)
    return {
      localPath: `/images/earthquake-avatars/${userId}${ext}`,
      ok: true,
      skipped: false,
    }
  } catch {
    return { localPath: missingPublic, ok: false, skipped: false }
  }
}

async function main() {
  if (!(await exists(gzPath))) {
    console.error(`Missing ${gzPath}`)
    process.exit(1)
  }

  console.log(`Reading ${path.relative(root, gzPath)}…`)
  const data = await readGzipJson(gzPath)
  const users = data.users || {}
  const entries = Object.entries(users).filter(([, u]) => {
    const url = u.profile_image_url_https || u.profile_image_url
    return Boolean(url)
  })

  const work = entries.slice(0, Number.isFinite(limit) ? limit : entries.length)
  console.log(
    `Users with avatars: ${entries.length}; processing: ${work.length}` +
      (dryRun ? ' (dry-run)' : ''),
  )

  if (!dryRun) {
    await mkdir(avatarDir, { recursive: true })
    await writeFile(path.join(avatarDir, missingName), MISSING_SVG)
  }

  let ok = 0
  let failed = 0
  let skipped = 0

  await mapPool(work, concurrency, async ([key, user]) => {
    const userId = String(user.id_str || user.id || key)
    const url = (user.profile_image_url_https || user.profile_image_url)!
    const result = await downloadAvatar(userId, url)
    if (result.skipped) skipped++
    else if (result.ok) ok++
    else failed++

    user.profile_image_url_https = result.localPath
    if (user.profile_image_url) user.profile_image_url = result.localPath
    return result
  })

  if (Number.isFinite(limit)) {
    for (const [key, user] of entries.slice(work.length)) {
      const userId = String(user.id_str || user.id || key)
      for (const ext of ['.jpg', '.jpeg', '.png', '.gif', '.webp']) {
        const file = path.join(avatarDir, `${userId}${ext}`)
        if (await exists(file)) {
          const local = `/images/earthquake-avatars/${userId}${ext}`
          user.profile_image_url_https = local
          if (user.profile_image_url) user.profile_image_url = local
          break
        }
      }
    }
  }

  await ensureAustJson()

  if (!dryRun) {
    await writeFile(outJson, JSON.stringify(data))
    console.log(`Wrote ${path.relative(root, outJson)}`)
  }

  console.log(
    `Done. downloaded=${ok} reused=${skipped} missing=${failed} → ${path.relative(root, avatarDir)}`,
  )
  if (failed > 0) {
    console.log(
      `Failed CDN fetches use ${missingPublic}. Re-run later to retry (existing files are skipped).`,
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
