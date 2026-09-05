/**
 * Blogpost metadata for the dataviz site.
 *
 * status — lifecycle (listing + CI):
 *   published — homepage, nav, sitemap, /viz; public `/blog/:id`; CI must stay green
 *   hold      — not listed; direct URL still works when a template exists; soft CI
 *   private   — not listed; direct URL still works; skip CI
 *   archived  — not listed; direct URL still works; may break; skip Chart regression
 *
 * Only `published` appears on the homepage, sidebar lists, and sitemap.
 * Any other status is omitted from those surfaces.
 *
 * tier — Chart / regression priority (orthogonal to status):
 *   core     — georgia, earthquake, winamp, matrix, breathe, war
 *   standard — other posts
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
  /** @deprecated Unused for layout — homepage is a single flat grid. */
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

/** Homepage / nav / sitemap /viz listing. */
export function isListed(post: Blogpost): boolean {
  return post.status === 'published'
}

/** Direct `/blog/:id` when a content template exists. */
export function isResolvable(post: Blogpost): boolean {
  return Boolean(post.shortname)
}

export function isCiStrict(post: Blogpost): boolean {
  return post.status === 'published' || post.tier === 'core'
}

export function isCore(post: Blogpost): boolean {
  return post.tier === 'core' || (CORE_SHORTNAMES as readonly string[]).includes(post.shortname)
}

export function byPublishDateDesc(a: Blogpost, b: Blogpost): number {
  return b.publish_date.localeCompare(a.publish_date)
}
