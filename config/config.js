"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const smugmug_1 = require("./smugmug");
const awesome_1 = require("./awesome");
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const mustache_1 = __importDefault(require("mustache"));
const lodash_1 = __importDefault(require("lodash"));
const fsPromise = fs_1.default.promises;
const formidable_1 = __importDefault(require("formidable"));
let xray, request, tabletojson;
let scrapingToolsLoaded = false;
if (scrapingToolsLoaded) {
    xray = require('x-ray')();
    request = require('request');
    tabletojson = require('tabletojson');
}
let gitHash = (new Date()).getTime().toString();
try {
    const rawGitHash = fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'git-commit-version.txt'), 'utf8');
    gitHash = rawGitHash.split('-').pop().trim();
}
catch (e) { }
async function asyncForEach(array, limit, callback) {
    let i = 0;
    for (; i < limit; i++) {
        doNextThing(i);
    }
    function doNextThing(index) {
        if (array[index]) {
            callback(array[index], index, array, function done() {
                doNextThing(i++);
            });
        }
    }
    return 1;
}
function sanitise(string) {
    return string.replace(/\W+/g, ' ').trim().replace(/\W/g, '_').toLowerCase();
}
async function loadTemplates(template, content = '') {
    return new Promise((resolve) => {
        const promises = [];
        const filenames = ['template', 'content'];
        promises.push(fsPromise.readFile(path_1.default.resolve(__dirname, '..', 'views', template), {
            encoding: 'utf8'
        }));
        promises.push(new Promise((resolve) => {
            if (Array.isArray(content) && content[0])
                content = content[0];
            fsPromise.readFile(path_1.default.resolve(__dirname, '..', 'views', 'content', content + '.mustache'), {
                encoding: 'utf8'
            }).then(result => {
                try {
                    const scriptEx = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/g;
                    const styleEx = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/g;
                    const scripts = [...result.matchAll(scriptEx)].map(d => d[0]);
                    const styles = [...result.matchAll(styleEx)].map(d => d[0]);
                    resolve({
                        content: result.replace(scriptEx, '').replace(styleEx, ''),
                        scripts: scripts.join('\n'),
                        styles: styles.join('\n')
                    });
                }
                catch (e) {
                    resolve({
                        content: result
                    });
                }
            }).catch((e) => {
                fsPromise.readFile(path_1.default.resolve(__dirname, '..', 'views', '404.mustache'), {
                    encoding: 'utf8'
                }).then(result => {
                    resolve(result);
                });
            });
        }));
        fsPromise.readdir(path_1.default.resolve(__dirname, '..', 'views', 'partials'))
            .then(function (d) {
            d.forEach(function (filename) {
                if (filename.indexOf('.mustache') > 0) {
                    filenames.push(filename.split('.mustache')[0]);
                    promises.push(fsPromise.readFile(path_1.default.resolve(__dirname, '..', 'views', 'partials', filename), {
                        encoding: 'utf8'
                    }));
                }
            });
            Promise.all(promises).then(function (array) {
                const results = {};
                filenames.forEach((filename, i) => { results[filename] = array[i]; });
                if (typeof results.content === 'object') {
                    results.scripts = results.content.scripts;
                    results.styles = results.content.styles;
                    results.content = results.content.content;
                }
                resolve(results);
            });
        });
    });
}
const base = 'https://www.digicamdb.com/';
let config = {
    services: {
        fridge_images: function (res, req, db) {
            const filter = [".DS_Store", "index.html"];
            fsPromise.readdir(path_1.default.resolve(__dirname, '..', 'public', 'fridge', 'images'))
                .then(function (images) {
                images = images.filter(d => filter.indexOf(d) === -1);
                res.end(JSON.stringify(images));
            });
        },
        scrapeAllCameras: function (res, req, db) {
            if (!scrapingToolsLoaded) {
                scrapingToolsLoaded = true;
                xray = require('x-ray')();
                request = require('request');
                tabletojson = require('tabletojson');
            }
            db.Scrape.findAll({
                where: {}
            }).then(function (d) {
                const results = d.map(d => d.dataValues);
                if (results.length > 0) {
                    asyncForEach(results, 20, function (d, i, array, done) {
                        const target = d.link;
                        const brand = d.title.split(/(?<=^\S+)\s/)[0].trim();
                        const model = d.title.split(/(?<=^\S+)\s/)[1].trim();
                        return db.Camera.findAll({
                            where: {
                                brand: brand,
                                model: model
                            }
                        }).then(function (d) {
                            if (d.length === 0) {
                                console.log(model);
                                request.get(base + target, function (err, response, html) {
                                    if (err) {
                                        console.log(err);
                                        res.end('error making request' + err);
                                    }
                                    xray(html, '.table_specs@html').then((d) => {
                                        if (d) {
                                            d = d.replace(/<span class="yes"><\/span>/g, 'Yes')
                                                .replace(/<span class="no"><\/span>/g, 'No');
                                            const data = tabletojson.convert(`<table>${d}</table>`)[0];
                                            const camera = data.reduce((obj, detail) => {
                                                obj[sanitise(detail[0])] = detail[1];
                                                return obj;
                                            }, {});
                                            db.Camera.create(camera);
                                            done();
                                        }
                                        else {
                                            console.log("Couldn't do this " + model);
                                            done();
                                        }
                                    }).catch(e => res.end('fail??? ' + JSON.stringify(e.message)));
                                });
                            }
                            else {
                                done();
                            }
                        });
                    });
                    res.end('Ok!');
                }
                else {
                    res.end('fail');
                }
            });
        },
        scrapeAllBrands: function (res, req, db) {
            if (!scrapingToolsLoaded) {
                scrapingToolsLoaded = true;
                xray = require('x-ray')();
                request = require('request');
                tabletojson = require('tabletojson');
            }
            const brands = ['canon', 'fujifilm', 'leica', 'nikon', 'olympus', 'panasonic', 'pentax', 'ricoh', 'samsung', 'sony', 'zeiss'];
            asyncForEach(brands, 1, function (brand, iterator, brands, done) {
                let lastPageReached = false;
                let i = 0;
                while (!lastPageReached && i < 20) {
                    i++;
                    console.log(`Scrapeing Page ${i} of ${brand}`);
                    request.get(`${base}cameras/${brand}/${i}/`, function (err, response, html) {
                        if (err) {
                            return err;
                        }
                        if (response.statusCode >= 400) {
                            return new Error('400 error');
                        }
                        xray(html, '.newest_div', [{
                                img: 'img@src',
                                title: 'a.newest',
                                link: 'a.newest@href',
                                year: 'span.font_smaller'
                            }])
                            .then(function (stuff) {
                            console.log(stuff);
                            if (stuff.length === 0)
                                lastPageReached = true;
                            stuff.forEach(function (camera) {
                                camera.title = camera.title.trim();
                                camera.brand = brand;
                                camera.year = camera.year.substr(1, 4);
                                db.Scrape.create(camera);
                            });
                        }).catch(err => console.log('ok error..', err));
                    });
                }
                done();
            }).then(function (d) {
                console.log('hello? ' + d);
                res.end('done?');
            });
        },
        camera: function (res, req, db, type = '') {
            const Op = db.Sequelize.Op;
            const promises = [];
            const brand = type.indexOf('_') > 0 ? type.split('_')[0] : '';
            const model = type.indexOf('_') > 0 ? type.split('_')[1].replace(/-/g, ' ') : '';
            promises.push(loadTemplates('camera.mustache'));
            promises.push(db.Camera.findAll({
                attributes: ['brand', 'model', 'year'],
                where: {
                    year: {
                        [Op.gt]: 2010
                    }
                }
            }));
            promises.push(db.Camera.findOne({
                where: {
                    brand: brand,
                    model: model
                }
            }));
            promises.push(db.Scrape.findOne({
                where: {
                    link: {
                        [Op.like]: `%${type}%`
                    }
                }
            }));
            Promise.all(promises).then(function ([views, allCameras, model, scrape]) {
                if (model) {
                    const data = {
                        gitHash: gitHash,
                        model: model.dataValues,
                        scrape: scrape.dataValues,
                        cameraData: JSON.stringify(model.dataValues),
                        allCameras: JSON.stringify(allCameras.map(d => `${d.brand} ${d.model} (${d.year})`))
                    };
                    const output = mustache_1.default.render(views.template, data, views);
                    res.end(output);
                }
                else {
                    res.end('No model found');
                }
            });
        },
        'brand-data': function (res, req, db, type) {
            db.Camera.findAll({
                where: {
                    brand: type
                }
            }).then(d => {
                res.end(JSON.stringify(d));
            });
        },
        brand: function (res, req, db, type) {
            const promises = [loadTemplates('brand.mustache')];
            promises.push(db.Camera.findAll({
                where: {
                    brand: type
                }
            }));
            promises.push(db.Family.findAll({
                where: {
                    brand: type
                }
            }));
            Promise.all(promises).then(function ([views, cameras, familes]) {
                const data = {
                    gitHash: gitHash
                };
                data.cameras = JSON.stringify(cameras);
                data.brand = type;
                data.familes = JSON.stringify(familes);
                const output = mustache_1.default.render(views.template, data, views);
                res.end(output);
            });
        },
        'all-cameras': function (res, req, db) {
            db.Camera.findAll({
                attributes: ['brand', 'model', 'year'],
                where: {
                    year: {
                        [db.Sequelize.Op.gt]: 2010
                    }
                }
            }).then(d => res.end(JSON.stringify(d.map(d => `${d.brand} ${d.model} (${d.year})`))));
        },
        fetchCamera: function (res, req, db, type) {
            console.log('Request for a camera..');
            db.Camera.findOne({
                where: {
                    name: type
                }
            }).then(function (d) {
                console.log(d);
                res.end(JSON.stringify(d));
            }).catch(e => {
                console.log('Error??', e);
                res.end('bad');
            });
        },
        upload: function (res, req) {
            const uploadFolder = 'websites/dataviz/data/campjs/';
            const form = new formidable_1.default.IncomingForm();
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.log('Error uploading!');
                    res.writeHead(500);
                    res.end(err);
                }
                else {
                    Object.keys(files).forEach((inputfield) => {
                        const file = files[inputfield];
                        const newLocation = uploadFolder + file.name;
                        fs_1.default.rename(file.path, newLocation, function (err) {
                            if (err) {
                                console.log('Error renaming file');
                                res.writeHead(500);
                                res.end(err);
                            }
                            else {
                                res.end('success');
                            }
                        });
                    });
                }
            });
        },
        curl: function (incomingResponse, incomingRequest, db, type) {
            const options = {
                host: 'www.github.com',
                port: 80,
                path: '/',
                method: 'GET'
            };
            const req = http_1.default.request(options, function (res) {
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
                });
            });
            req.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            req.on('close', function () {
                incomingResponse.end('Uhhh we did a thing');
            });
            req.end();
        }
    },
    mustacheIgnore: ['homepage', 'upload_experiment', 'camera', 'blog', '404'],
    controllers: {
        '': function homepage(router) {
            const promises = [loadTemplates('homepage.mustache')];
            Promise.all(promises).then(function ([views]) {
                const data = {
                    gitHash: gitHash
                };
                router.db.Blogpost.findAll({
                    where: {
                        published: true
                    },
                    order: [['publish_date', 'DESC']]
                }).then((results) => {
                    data.blogposts = results.map(d => d.dataValues);
                    const output = mustache_1.default.render(views.template, data, views);
                    router.res.end(output);
                });
            });
        },
        blog: function blogpost(router) {
            const promises = [loadTemplates('blog.mustache', router.path)];
            Promise.all(promises).then(function ([views]) {
                const data = {
                    gitHash: gitHash
                };
                router.db.Blogpost.findAll({
                    where: {
                        published: true
                    },
                    order: [['published', 'DESC']]
                }).then((results) => {
                    data.blogposts = results.map(d => d.dataValues);
                    data.blogpost = data.blogposts.filter(d => d.shortname === router.path[0]);
                    try {
                        const shortname = router.path[0];
                        data.typescript = `'/js/${shortname}.js'`;
                    }
                    catch (e) { }
                    const output = mustache_1.default.render(views.template, data, views);
                    router.res.end(output);
                });
            });
        },
        experiment: function (router) {
            const promises = [loadTemplates('upload_experiment.mustache')];
            Promise.all(promises).then(function ([views]) {
                const data = {
                    gitHash: gitHash
                };
                const output = mustache_1.default.render(views.template, data, views);
                router.res.end(output);
            });
        },
        stickers: function (router) {
            const promises = [loadTemplates('stickers.mustache')];
            Promise.all(promises).then(function ([views]) {
                const data = {
                    gitHash: gitHash
                };
                const output = mustache_1.default.render(views.template, data, views);
                router.res.end(output);
            });
        }
    }
};
exports.config = config;
if (fs_1.default.existsSync(path_1.default.resolve(__dirname, 'config.json'))) {
    exports.config = config = lodash_1.default.merge(config, smugmug_1.config);
}
else {
    console.warn("config.json not provided, skipping smugmug stuff");
}
exports.config = config = lodash_1.default.merge(config, awesome_1.config);
