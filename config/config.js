"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const thalia_1 = require("thalia");
const smugmug_1 = require("./smugmug");
const utilities_1 = require("./utilities");
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const fsPromise = fs_1.default.promises;
const formidable_1 = __importDefault(require("formidable"));
let config = {
    services: {
        fridge_images: function (res, req, db) {
            const basePath = path_1.default.resolve(__dirname, '..', 'data', 'fridge');
            if (!fs_1.default.existsSync(path_1.default.resolve(basePath, 'az_images')) ||
                !fs_1.default.existsSync(path_1.default.resolve(basePath, 'ruby_images')) ||
                !fs_1.default.existsSync(path_1.default.resolve(basePath, 'renee_images'))) {
                res.end('No images');
                return;
            }
            const filter = [
                '.DS_Store',
                '.gitignore',
                'david.png',
                'grace.png',
                'index.html',
                'printed',
            ];
            Promise.all([
                fsPromise.readdir(path_1.default.resolve(basePath, 'az_images')),
                fsPromise.readdir(path_1.default.resolve(basePath, 'ruby_images')),
                fsPromise.readdir(path_1.default.resolve(basePath, 'renee_images')),
            ]).then(function ([az, ruby, renee]) {
                var images = az
                    .filter((d) => filter.indexOf(d) === -1)
                    .map((d) => 'az_images/' + d)
                    .concat(ruby
                    .filter((d) => filter.indexOf(d) === -1)
                    .map((d) => 'ruby_images/' + d))
                    .concat(renee
                    .filter((d) => filter.indexOf(d) === -1)
                    .map((d) => 'renee_images/' + d));
                res.end(JSON.stringify(images));
            });
        },
        dashboard_data: function (res, req, db) {
            const phases = [
                'phase0',
            ];
            Promise.all(phases.map((phase) => {
                return fsPromise
                    .readdir(path_1.default.resolve(__dirname, '..', 'data', 'AGRF', 'dashboard', phase, 'preflight_light'))
                    .then((files) => {
                    return files
                        .filter((d) => d.indexOf('.json') > -1)
                        .map((d) => d.replace('.json.gz', '.json'));
                });
            })).then((results) => {
                res.end(JSON.stringify(results));
            });
        },
        lims_logs: function (res, req, db) {
            const basePath = path_1.default.resolve(__dirname, '..', 'data', 'AGRF', 'IISLogs');
            if (!fs_1.default.existsSync(path_1.default.resolve(basePath))) {
                res.end('No data');
                return;
            }
            fsPromise
                .readdir(path_1.default.resolve(basePath))
                .then((files) => files.filter((d) => d.indexOf('.log.gz') > -1))
                .then((files) => files.map((d) => d.replace('.log.gz', '.log')))
                .then((files) => files.slice(1103, 2000))
                .then((files) => res.end(JSON.stringify(files)));
        },
        summary_jsons: function (res, req, db) {
            const basePath = path_1.default.resolve(__dirname, '..', 'data', 'AGRF', 'summary_jsons');
            if (!fs_1.default.existsSync(path_1.default.resolve(basePath))) {
                res.end('No data');
                return;
            }
            fsPromise
                .readdir(path_1.default.resolve(basePath))
                .then((files) => files.filter((d) => d.indexOf('.json') > -1))
                .then((files) => files.map((d) => d.replace('.json.gz', '.json')))
                .then((files) => res.end(JSON.stringify(files)));
        },
        clinical: function (res, req) {
            const basePath = path_1.default.resolve(__dirname, '..', 'data', 'AGRF', 'clinical');
            if (!fs_1.default.existsSync(path_1.default.resolve(basePath))) {
                res.end('No data');
                return;
            }
            fsPromise
                .readdir(path_1.default.resolve(basePath))
                .then((files) => files.filter((d) => d.indexOf('.json') > -1))
                .then((files) => files.map((d) => d.replace('.json.gz', '.json')))
                .then((files) => res.end(JSON.stringify(files)));
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
                method: 'GET',
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
        },
    },
    mustacheIgnore: ['homepage', 'upload_experiment', 'camera', 'blog', '404'],
    controllers: {
        '': function homepage(router) {
            if (!router.db) {
                router.res.end('Database not connected');
            }
            else {
                const promises = [new Promise(router.readAllViews)];
                Promise.all(promises).then(function ([views]) {
                    const data = {
                        gitHash: utilities_1.gitHash,
                    };
                    router.db.Blogpost.findAll({
                        where: {
                            published: true,
                        },
                        order: [['publish_date', 'DESC']],
                    }).then((results) => {
                        data.blogposts = results.map((d) => d.dataValues);
                        const template = router.handlebars.compile(views.homepage);
                        (0, thalia_1.loadViewsAsPartials)(views, router.handlebars);
                        router.res.end(template(data));
                    });
                });
            }
        },
        blog: function blogpost(router) {
            if (!router.db) {
                router.res.end('Database not connected');
            }
            else {
                const promises = [new Promise(router.readAllViews)];
                Promise.all(promises).then(function ([views]) {
                    const data = {
                        gitHash: utilities_1.gitHash,
                    };
                    router.db.Blogpost.findAll({
                        where: {
                            published: true,
                        },
                        order: [['publish_date', 'DESC']],
                    }).then((results) => {
                        data.blogposts = results.map((d) => d.dataValues);
                        data.blogpost = data.blogposts.filter((d) => d.shortname === router.path[0]);
                        try {
                            const shortname = router.path[0];
                            data.typescript = `"/js/${shortname}.js"`;
                        }
                        catch (e) { }
                        const template = router.handlebars.compile(views.blog);
                        (0, thalia_1.setHandlebarsContent)(views[router.path[0]], router.handlebars).then(() => {
                            router.handlebars.registerHelper('parseArray', (array, options) => array.split(',').map(options.fn).join(''));
                            try {
                                (0, thalia_1.loadViewsAsPartials)(views, router.handlebars);
                                router.res.end(template(data));
                            }
                            catch (error) {
                                console.log('Error in dataviz/blog');
                                console.log(error);
                                router.res.end('Error loading content:<br>' + error.message);
                            }
                        }, (error) => {
                            console.log('Error in dataviz/blog');
                            console.log(error);
                            router.res.end('Error loading content');
                        });
                    });
                });
            }
        },
    },
};
exports.config = config;
if (fs_1.default.existsSync(path_1.default.resolve(__dirname, 'config.json'))) {
    exports.config = config = lodash_1.default.merge(config, smugmug_1.config);
}
else {
    console.warn('config.json not provided, skipping smugmug stuff');
}
