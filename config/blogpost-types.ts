/**
 * Blogpost metadata for the dataviz site.
 *
 * status — lifecycle (listing + CI):
 *   published — public routes + /viz; CI must stay green
 *   hold      — WIP / quarantine; not listed; soft CI
 *   private   — personal analysis dump; not listed; skip CI
 *   archived  — frozen; may break; not listed; skip Chart regression
 *
 * tier — Chart / regression priority (orthogonal to status):
 *   core     — georgia, earthquake, winamp, matrix, breathe, war (+ genuary when tagged)
 *   standard — other published posts
 */

export type PostStatus = 'published' | 'hold' | 'private' | 'archived'
export type PostTier = 'core' | 'standard'

export type Blogpost = {
  shortname: string
  title: string
  category: string
  summary: string
  image: string
  image_url?: string
  publish_date: string
  status: PostStatus
  tier?: PostTier
  featured?: boolean
  noJs?: boolean
}

export const CORE_SHORTNAMES = [
  'georgia',
  'earthquake',
  'winamp',
  'matrix',
  'breathe',
  'war',
] as const

export function isListed(post: Blogpost): boolean {
  return post.status === 'published'
}

export function isCiStrict(post: Blogpost): boolean {
  return post.status === 'published' || post.tier === 'core'
}

export function isCore(post: Blogpost): boolean {
  return post.tier === 'core' || (CORE_SHORTNAMES as readonly string[]).includes(post.shortname)
}
