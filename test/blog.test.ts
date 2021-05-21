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
    setTimeout(function () {
      browser.close().catch((e) => console.log(e))
    }, timeout)
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
})
