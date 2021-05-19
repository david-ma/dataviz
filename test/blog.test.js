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
        setTimeout(function () {
            browser.close().catch((e) => console.log(e));
        }, 15000);
    });
    test(`Test dataviz blogposts`, async () => {
        return await new Promise((resolve, reject) => {
            const promises = [];
            blogposts.forEach((blogpost) => {
                promises.push(browser.newPage().then((page) => {
                    page.on('error', (err) => {
                        console.error('PAGE LOG:', err.message);
                    });
                    page.on('pageerror', (err) => {
                        console.error('PAGE LOG:', err.message);
                    });
                    page.setExtraHTTPHeaders({
                        'x-host': `${site}.com`,
                    });
                    page.setViewport({
                        width: 1920,
                        height: 1080,
                        isMobile: false,
                    });
                    page.goto(`http://localhost:1337/blog/${blogpost.shortname}`, {
                        waitUntil: 'networkidle0',
                    });
                }));
            });
            Promise.all(promises)
                .then(() => {
                console.log('Done!');
                resolve(true);
            })
                .catch((error) => {
                console.error(error);
                reject(error);
            });
        });
    }, timeout);
});
