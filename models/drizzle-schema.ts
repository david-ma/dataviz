/**
 * Usage:
 * - Add your model schemas here
 * - pnpm drizzle-kit generate
 * - pnpm drizzle-kit push
 */

import { mysqlTable, MySqlTableWithColumns, json, unique, boolean, date } from 'drizzle-orm/mysql-core'
import { baseTableConfig, vc } from '../node_modules/thalia/dist/models/util.js'

// export const contactInteractionTable: MySqlTableWithColumns<any> = mysqlTable('contact_interaction', {
//   ...baseTableConfig,
//   socketId: vc('socket_id'),
//   ip: vc('ip'),
//   userAgent: vc('user_agent'),
//   cookies: vc('cookies'),
//   domain: vc('domain'),
//   formData: json('form_data'),
// }, (table) => [
//   unique('socket_id_unique').on(table.socketId),
// ])

// import { mailTable } from '../node_modules/thalia/dist/server/mail.js'
// export { mailTable }


export const blogpostTable: MySqlTableWithColumns<any> = mysqlTable('blogpost', {
  ...baseTableConfig,
  shortname: vc('shortname'),
  title: vc('title'),
  summary: vc('summary', 1000),
  image: vc('image'),
  category: vc('category'),
  publish_date: date('publish_date'),
  published: boolean('published'),
}, (table) => [
  unique('shortname_unique').on(table.shortname),
])
