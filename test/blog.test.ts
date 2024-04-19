/**
 * @jest-environment node
 */

// const puppeteer = require('puppeteer');
import * as puppeteer from 'puppeteer'
import path = require('path')
import { SeqObject } from 'thalia'

// import { describe, expect, test } from '@jest/globals'
// import fs = require('fs')
// import { getLinks, checkLinks, validURL } from '../../../test/utilities'
// const jestConfig: any = require('../../../jest.config')
// const jestURL = jestConfig.globals.URL
const timeout = process.env.SLOWMO ? 30000 : 10000

var database: SeqObject = require(path.resolve(
  __dirname,
  '..',
  'config',
  'db_bootstrap.js'
)).seq

var site = 'dataviz'
const blogs = [
  'war',
  'wealth',
  'georgia',
  'matrix',
  'breathe',
  'AusIncome',
  'winamp',
  'earthquake',
]

describe('Test blogposts', () => {
  var blogposts: any[]
  var browser: puppeteer.Browser

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
      // headless: false,
      // slowMo: 250,
    })
  })

  afterAll(() => {
    // setTimeout(function () {
    browser.close().catch((e) => console.log(e))
    // }, timeout / 5)
  })

  test(
    `Check blogposts for console errors`,
    async () => {
      return await new Promise((resolve, reject) => {
        const promises: Array<Promise<any>> = []

        blogposts.forEach((blogpost) => {
          promises.push(
            browser.newPage().then(async (page) => {
              page.on('error', (err) => {
                console.error('PAGE LOG:', err.message)
              })
              page.on('pageerror', (err) => {
                console.error('PAGE LOG:', err.message)
              })
              page.on('console', (mes) => {
                if (mes.type() === 'error') {
                  reject(
                    `Console Error in /blog/${
                      blogpost.shortname
                    }:\n${mes.text()}`
                  )
                }
              })

              page.setExtraHTTPHeaders({
                'x-host': `${site}.com`,
              })
              page.setViewport({
                width: 1920,
                height: 1080,
                isMobile: false,
              })
              await page.goto(
                `http://localhost:1337/blog/${blogpost.shortname}`
              )
            })
          )
        })

        Promise.all(promises)
          .then(() => {
            resolve(true)
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      })
    },
    timeout
  )

  test(
    `georgia blog`,
    async () => {
      const page = await browser.newPage()

      page.on('console', (mes) => {
        if (mes.type() === 'error') {
          // console.error("ERROR!", mes.text())
          // done(mes.text())
          return mes.text()
        }
      })

      await page.goto('http://localhost:1337/blog/georgia')
      await page.setViewport({ width: 1920, height: 1080, isMobile: false })
      await page.screenshot({
        path: './coverage/georgia.jpeg',
        type: 'jpeg',
      })

      // await page.type('#birthyear', '1988')
      // await page.type('#deathyear', '1925') // cause an error on purpose?
      // await page.click('input[type="button"]#drawPieChart')

      return
    }
  )

  test(
    `war blog`,
    async () => {
      const page = await browser.newPage()

      page.on('console', (mes) => {
        if (mes.type() === 'error') {
          // console.error("ERROR!", mes.text())
          // done(mes.text())
          return mes.text()
        }
      })

      await page.goto('http://localhost:1337/blog/war')
      await page.setViewport({ width: 1920, height: 1080, isMobile: false })
      await page.screenshot({
        path: './coverage/war.jpeg',
        type: 'jpeg',
      })

      await page.type('#birthyear', '1988')
      // await page.type('#deathyear', '1925') // cause an error on purpose?
      await page.click('input[type="button"]#drawPieChart')

      return
    },
    timeout
  )

  blogs.forEach((blogpost) => {
    test(`Check ${blogpost} for console errors`, async () => {
      const page = await browser.newPage()

      page.on('error', (err) => {
        console.error('PAGE LOG:', err.message)
      })
      page.on('pageerror', (err) => {
        console.error('PAGE LOG:', err.message)
      })
      page.on('console', (mes) => {
        if (mes.type() === 'error') {
          console.error(`Console Error in /blog/${blogpost}:\n${mes.text()}`)
        }
      })

      page.setViewport({
        width: 1920,
        height: 1080,
        isMobile: false,
      })
      await page.goto(`http://localhost:1337/blog/${blogpost}`)
    })
  })
})
