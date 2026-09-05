import { readFileSync, writeFileSync } from 'node:fs'

const path = 'config/blogposts.ts'
let s = readFileSync(path, 'utf8')

const core = new Set(['georgia', 'earthquake', 'winamp', 'matrix', 'breathe', 'war'])

if (!s.includes("from './blogpost-types")) {
  s = s.replace(
    /^export const blogposts = \[/m,
    `import type { Blogpost } from './blogpost-types.js'\n\nexport const blogposts: Blogpost[] = [`,
  )
}

// Parse objects roughly by shortname blocks
const posts: { shortname: string; published: boolean; start: number; end: number }[] = []
const re = /\{\s*\n\s*shortname: '([^']+)'/g
let m: RegExpExecArray | null
while ((m = re.exec(s))) {
  const shortname = m[1]
  const start = m.index
  const next = s.indexOf('\n  },', start)
  const end = next === -1 ? s.length : next + 5
  const block = s.slice(start, end)
  const pub = /published:\s*true/.test(block)
  posts.push({ shortname, published: pub, start, end })
}

// Rebuild from original with replacements from the end so indices stay valid
for (const p of posts.reverse()) {
  let block = s.slice(p.start, p.end)
  if (block.includes('status:')) continue

  let status: string
  if (p.shortname === 'winamp') status = 'published'
  else if (p.published) status = 'published'
  else status = 'archived'

  block = block.replace(/\n\s*published:\s*(true|false),/, '')

  const tier =
    core.has(p.shortname)
      ? `\n    tier: 'core',`
      : p.shortname.startsWith('genuary-25')
        ? `\n    tier: 'standard',`
        : p.shortname === 'genuary'
          ? `\n    tier: 'standard',`
          : ''

  // Insert status before closing of object — after publish_date line if present
  if (block.includes('publish_date:')) {
    block = block.replace(
      /(publish_date: '[^']*',)/,
      `$1\n    status: '${status}',${tier}`,
    )
  } else {
    block = block.replace(/\{/, `{\n    status: '${status}',${tier}`)
  }

  s = s.slice(0, p.start) + block + s.slice(p.end)
}

writeFileSync(path, s)
console.log('status count', (s.match(/status:/g) || []).length)
console.log('winamp', /shortname: 'winamp'[\s\S]*?status: '([^']+)'/.exec(s)?.[1])
