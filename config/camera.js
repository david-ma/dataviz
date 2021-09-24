"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const utilities_1 = require("./utilities");
const mustache_1 = __importDefault(require("mustache"));
let xray, request, tabletojson;
let scrapingToolsLoaded = false;
if (scrapingToolsLoaded) {
    xray = require('x-ray')();
    request = require('request');
    tabletojson = require('tabletojson');
}
const base = 'https://www.digicamdb.com/';
let config = {
    services: {
        scrapeAllCameras: function (res, req, db) {
            if (!scrapingToolsLoaded) {
                scrapingToolsLoaded = true;
                xray = require('x-ray')();
                request = require('request');
                tabletojson = require('tabletojson');
            }
            db.Scrape.findAll({
                where: {},
            }).then(function (d) {
                const results = d.map((d) => d.dataValues);
                if (results.length > 0) {
                    utilities_1.asyncForEach(results, 20, function (d, i, array, done) {
                        const target = d.link;
                        const brand = d.title.split(/(?<=^\S+)\s/)[0].trim();
                        const model = d.title.split(/(?<=^\S+)\s/)[1].trim();
                        return db.Camera.findAll({
                            where: {
                                brand: brand,
                                model: model,
                            },
                        }).then(function (d) {
                            if (d.length === 0) {
                                console.log(model);
                                request.get(base + target, function (err, response, html) {
                                    if (err) {
                                        console.log(err);
                                        res.end('error making request' + err);
                                    }
                                    xray(html, '.table_specs@html')
                                        .then((d) => {
                                        if (d) {
                                            d = d
                                                .replace(/<span class="yes"><\/span>/g, 'Yes')
                                                .replace(/<span class="no"><\/span>/g, 'No');
                                            const data = tabletojson.convert(`<table>${d}</table>`)[0];
                                            const camera = data.reduce((obj, detail) => {
                                                obj[utilities_1.sanitise(detail[0])] = detail[1];
                                                return obj;
                                            }, {});
                                            db.Camera.create(camera);
                                            done();
                                        }
                                        else {
                                            console.log("Couldn't do this " + model);
                                            done();
                                        }
                                    })
                                        .catch((e) => res.end('fail??? ' + JSON.stringify(e.message)));
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
            const brands = [
                'canon',
                'fujifilm',
                'leica',
                'nikon',
                'olympus',
                'panasonic',
                'pentax',
                'ricoh',
                'samsung',
                'sony',
                'zeiss',
            ];
            utilities_1.asyncForEach(brands, 1, function (brand, iterator, brands, done) {
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
                        xray(html, '.newest_div', [
                            {
                                img: 'img@src',
                                title: 'a.newest',
                                link: 'a.newest@href',
                                year: 'span.font_smaller',
                            },
                        ])
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
                        })
                            .catch((err) => console.log('ok error..', err));
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
            promises.push(utilities_1.loadTemplates('camera.mustache'));
            promises.push(db.Camera.findAll({
                attributes: ['brand', 'model', 'year'],
                where: {
                    year: {
                        [Op.gt]: 2010,
                    },
                },
            }));
            promises.push(db.Camera.findOne({
                where: {
                    brand: brand,
                    model: model,
                },
            }));
            promises.push(db.Scrape.findOne({
                where: {
                    link: {
                        [Op.like]: `%${type}%`,
                    },
                },
            }));
            Promise.all(promises).then(function ([views, allCameras, model, scrape]) {
                if (model) {
                    const data = {
                        gitHash: utilities_1.gitHash,
                        model: model.dataValues,
                        scrape: scrape.dataValues,
                        cameraData: JSON.stringify(model.dataValues),
                        allCameras: JSON.stringify(allCameras.map((d) => `${d.brand} ${d.model} (${d.year})`)),
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
                    brand: type,
                },
            }).then((d) => {
                res.end(JSON.stringify(d));
            });
        },
        brand: function (res, req, db, type) {
            const promises = [utilities_1.loadTemplates('brand.mustache')];
            promises.push(db.Camera.findAll({
                where: {
                    brand: type,
                },
            }));
            promises.push(db.Family.findAll({
                where: {
                    brand: type,
                },
            }));
            Promise.all(promises).then(function ([views, cameras, familes]) {
                const data = {
                    gitHash: utilities_1.gitHash,
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
                        [db.Sequelize.Op.gt]: 2010,
                    },
                },
            }).then((d) => res.end(JSON.stringify(d.map((d) => `${d.brand} ${d.model} (${d.year})`))));
        },
        fetchCamera: function (res, req, db, type) {
            console.log('Request for a camera..');
            db.Camera.findOne({
                where: {
                    name: type,
                },
            })
                .then(function (d) {
                console.log(d);
                res.end(JSON.stringify(d));
            })
                .catch((e) => {
                console.log('Error??', e);
                res.end('bad');
            });
        },
    },
};
exports.config = config;
