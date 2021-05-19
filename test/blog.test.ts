// const puppeteer = require('puppeteer');
import * as puppeteer from 'puppeteer'
import path = require('path')
import { seqObject } from '../config/db_bootstrap'

// import { describe, expect, test } from '@jest/globals'
// import fs = require('fs')
// import { getLinks, checkLinks, validURL } from '../../../test/utilities'
// const jestConfig: any = require('../../../jest.config')
// const jestURL = jestConfig.globals.URL
const timeout = process.env.SLOWMO ? 30000 : 10000

var database: seqObject = require(path.resolve(
  __dirname,
  '..',
  'config',
  'db_bootstrap.js'
)).seq

var site = 'dataviz'
// database.Blogpost.findAll({
//   where: {
//     published: true,
//   },
//   order: [['publish_date', 'DESC']],
// }).then((results: any) => {
//   results.forEach((result: any) => {
//     test(`Test blogposts: ${result.dataValues.title}`, async () => {
//       return await new Promise((resolve, reject) => {
//         let promises: Array<Promise<any>>

//         puppeteer.launch().then((browser) => {
//           browser.newPage().then((page) => {
//             promises = [
//               page.setExtraHTTPHeaders({
//                 'x-host': `${site}.com`,
//               }),
//               page.setViewport({ width: 1920, height: 1080, isMobile: false }),
//             ]

//             Promise.all(promises).then(() => {
//               console.log('hey')

//               resolve(true)
//             })
//           })
//         })
//       })
//     })
//   })
// })

describe('Test blogposts', () => {
  var blogposts: any[]
  var browser: puppeteer.Browser
  var page: puppeteer.Page

  beforeAll(async () => {
    await database.Blogpost.findAll({
      where: {
        published: true,
      },
      order: [['publish_date', 'DESC']],
    }).then((results: any) => {
      blogposts = results.map((d: any) => d.dataValues)
    })

    browser = await puppeteer.launch({
      headless: false,
      slowMo: 250,
    })
    page = await browser.newPage()
  })

  afterAll(() => {
    // page.close()
    // browser.close()
  })

  test(
    `Test dataviz blogposts`,
    async () => {
      return await new Promise((resolve, reject) => {
        let promises: Array<Promise<any>>
        page.on('error', (msg) => console.error('PAGE LOG:', msg.message))
        promises = [
          page.setExtraHTTPHeaders({
            'x-host': `${site}.com`,
          }),
          page.setViewport({
            width: 1920,
            height: 1080,
            isMobile: false,
          }),
          browser.newPage().then((newPage) => {
            newPage.goto(`http://localhost:1337/blog/breathe`, {
              waitUntil: 'networkidle2',
            })
          }),
          browser.newPage().then((newPage) => {
            newPage.goto(`http://localhost:1337/blog/war`, {
              waitUntil: 'networkidle2',
            })
          }),
          browser.newPage().then((newPage) => {
            newPage.goto(`http://localhost:1337/blog/wealth`, {
              waitUntil: 'networkidle2',
            })
          }),
          // page.goto('http://localhost:1337/blog/breathe'),
        ]

        Promise.all(promises).then(() => {
          console.log(blogposts)
          resolve(true)
          //   blogposts.forEach(function (blogpost) {
          //     await page
          //       .goto(`http://localhost:1337/blog/${blogpost.shortname}`, {
          //         waitUntil: 'networkidle2',
          //       })
          //       .then((d) => {
          //         console.log("it's ok")
          //       })
          //       .catch((e) => {
          //         console.error(e)
          //         // reject(e)
          //       })
          //   })

          //   // resolve(true)
        })
      })
    },
    timeout
  )
})
