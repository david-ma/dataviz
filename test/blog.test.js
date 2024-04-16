"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = __importStar(require("puppeteer"));
const path = require("path");
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
        browser = await puppeteer.launch({});
    });
    afterAll(() => {
        browser.close().catch((e) => console.log(e));
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
        await page.click('input[type="button"]#drawPieChart');
        done();
    }, timeout);
});
