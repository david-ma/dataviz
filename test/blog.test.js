"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const puppeteer = require('puppeteer');
const puppeteer = require("puppeteer");
const path = require("path");
// import { describe, expect, test } from '@jest/globals'
// import fs = require('fs')
// import { getLinks, checkLinks, validURL } from '../../../test/utilities'
// const jestConfig: any = require('../../../jest.config')
// const jestURL = jestConfig.globals.URL
const timeout = process.env.SLOWMO ? 30000 : 10000;
var database = require(path.resolve(__dirname, '..', 'config', 'db_bootstrap.js')).seq;
var site = 'dataviz';
describe('Test blogposts', () => {
    var blogposts;
    var browser;
    beforeAll(async () => {
        await database.Blogpost.findAll({
            where: {
                published: true,
            },
            order: [['publish_date', 'DESC']],
        }).then((results) => {
            blogposts = results.map((d) => d.dataValues);
        });
        browser = await puppeteer.launch({
        // headless: false,
        // slowMo: 250,
        });
    });
    afterAll(() => {
        // setTimeout(function () {
        browser.close().catch((e) => console.log(e));
        // }, timeout / 5)
    });
    test(`Check blogposts for console errors`, async () => {
        return await new Promise((resolve, reject) => {
            const promises = [];
            blogposts.forEach((blogpost) => {
                promises.push(browser.newPage().then(async (page) => {
                    page.on('error', (err) => {
                        console.error('PAGE LOG:', err.message);
                    });
                    page.on('pageerror', (err) => {
                        console.error('PAGE LOG:', err.message);
                    });
                    page.on('console', (mes) => {
                        if (mes.type() === 'error') {
                            reject(`Console Error in /blog/${blogpost.shortname}:\n${mes.text()}`);
                        }
                    });
                    page.setExtraHTTPHeaders({
                        'x-host': `${site}.com`,
                    });
                    page.setViewport({
                        width: 1920,
                        height: 1080,
                        isMobile: false,
                    });
                    await page.goto(`http://localhost:1337/blog/${blogpost.shortname}`);
                }));
            });
            Promise.all(promises)
                .then(() => {
                resolve(true);
            })
                .catch((error) => {
                console.error(error);
                reject(error);
            });
        });
    }, timeout);
    test(`war blog`, async (done) => {
        const page = await browser.newPage();
        page.on('console', (mes) => {
            if (mes.type() === 'error') {
                // console.error("ERROR!", mes.text())
                done(mes.text());
            }
        });
        await page.goto('http://localhost:1337/blog/war');
        await page.setViewport({ width: 1920, height: 1080, isMobile: false });
        await page.screenshot({
            path: './tmp/war.jpeg',
            type: 'jpeg'
        });
        await page.type('#birthyear', '1988');
        // await page.type('#deathyear', '1925') // cause an error on purpose?
        await page.click('input[type="button"]#drawPieChart');
        done();
    }, timeout);
});
