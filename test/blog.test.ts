/**
 * Legacy Puppeteer + database-backed blog tests depended on `config/db_bootstrap.js`
 * and the old Sequelize setup. The blog is now file-driven (`config/blogposts.ts`).
 *
 * Always skipped. HTTP coverage: `site.integration.test.ts`.
 * Future DB-backed suites should use `SKIP_SITE_INTEGRATION=1` (see CI in
 * spaceforyourmind) so GitHub Actions stays green without MySQL.
 */

import { describe, expect, test } from 'bun:test'

describe.skip('Legacy blog E2E suite (database + Puppeteer)', () => {
  test('placeholder – see site.integration.test.ts for current coverage', () => {
    expect(true).toBe(true)
  })
})
