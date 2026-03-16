import { describe, expect, test } from '@jest/globals'

/**
 * Legacy Puppeteer + database-backed blog tests depended on `config/db_bootstrap.js`
 * and the old Sequelize setup. The blog has since been moved to a file-driven
 * configuration in `config/blogposts.ts`, so those tests no longer reflect the
 * current architecture.
 *
 * Keep a placeholder suite here so that `bun test` remains green while we
 * design a new, lighter-weight blog test strategy around the file-based config
 * and simple HTTP checks.
 */

describe.skip('Legacy blog E2E suite (database + Puppeteer)', () => {
  test('placeholder – see blog-published-routes.test.ts for current coverage', () => {
    expect(true).toBe(true)
  })
})
