"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const smugmug_1 = require("./smugmug");
const awesome_1 = require("./awesome");
const camera_1 = require("./camera");
const utilities_1 = require("./utilities");
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const mustache_1 = __importDefault(require("mustache"));
const lodash_1 = __importDefault(require("lodash"));
const fsPromise = fs_1.default.promises;
const formidable_1 = __importDefault(require("formidable"));
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
            const promises = [utilities_1.loadTemplates('homepage.mustache')];
            Promise.all(promises).then(function ([views]) {
                const data = {
                    gitHash: utilities_1.gitHash
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
            const promises = [utilities_1.loadTemplates('blog.mustache', router.path)];
            Promise.all(promises).then(function ([views]) {
                const data = {
                    gitHash: utilities_1.gitHash
                };
                router.db.Blogpost.findAll({
                    where: {
                        published: true
                    },
                    order: [['publish_date', 'DESC']]
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
            const promises = [utilities_1.loadTemplates('upload_experiment.mustache')];
            Promise.all(promises).then(function ([views]) {
                const data = {
                    gitHash: utilities_1.gitHash
                };
                const output = mustache_1.default.render(views.template, data, views);
                router.res.end(output);
            });
        },
        stickers: function (router) {
            const promises = [utilities_1.loadTemplates('stickers.mustache')];
            Promise.all(promises).then(function ([views]) {
                const data = {
                    gitHash: utilities_1.gitHash
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
exports.config = config = lodash_1.default.merge(config, camera_1.config);
