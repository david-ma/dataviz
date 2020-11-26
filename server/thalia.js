// moduleShim.ts
/**
 * This shim is required at the start of the thalia.js bundle
 * so that the AMD modules work properly.
 * And index.js must come after the modules have been defined.
 * Use 'files' in tsconfig to ensure correct order.
 * DKGM 12-Oct-2020
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define("requestHandlers", ["require", "exports", "fs", "mustache", "path"], function (require, exports, fs, mustache, path) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Website = exports.handle = void 0;
    const fsPromise = fs.promises;
    class Website {
        constructor(site, config) {
            if (typeof config === 'object') {
                this.name = site;
                this.data = ''; // Used to be false. Todo: Check if this is ok
                this.dist = ''; // Used to be false. Todo: Check if this is ok
                this.cache = typeof config.cache === 'boolean' ? config.cache : true;
                this.folder = typeof config.folder === 'string' ? config.folder : 'websites/' + site + '/public';
                this.domains = typeof config.domains === 'object' ? config.domains : [];
                this.pages = typeof config.pages === 'object' ? config.pages : {};
                this.redirects = typeof config.redirects === 'object' ? config.redirects : {};
                this.services = typeof config.services === 'object' ? config.services : {};
                this.controllers = typeof config.controllers === 'object' ? config.controllers : {};
                this.proxies = typeof config.proxies === 'object' ? config.proxies : {};
                this.sockets = typeof config.sockets === 'object' ? config.sockets : { on: [], emit: [] };
                this.security = typeof config.security === 'object' ? config.security : { loginNeeded: function () { return false; } };
                this.viewableFolders = config.viewableFolders || false;
            }
            else {
                console.log("Config isn't an object");
            }
        }
        ;
    }
    exports.Website = Website;
    const handle = {
        websites: {},
        index: { localhost: 'default' },
        loadAllWebsites: function () {
            const standAlone = !fs.existsSync('websites');
            if (standAlone) {
                console.log('Serving stand alone website');
                const workspace = '..';
                handle.index.localhost = workspace;
                const site = workspace;
                let config;
                try {
                    const start = Date.now();
                    if (fs.existsSync(path.resolve(__dirname, '..', 'config.js'))) {
                        config = require(path.resolve(__dirname, '..', 'config')).config;
                    }
                    else {
                        config = require(path.resolve(__dirname, '..', 'config', 'config')).config;
                    }
                    console.log(`Loading time: ${Date.now() - start} ms - config.js`);
                }
                catch (err) {
                    if (err.code !== 'MODULE_NOT_FOUND') {
                        console.log('Warning, your config script is broken!');
                        console.error(err);
                        console.log();
                    }
                    else {
                        console.log('Error in config.js!');
                        console.log(err);
                    }
                }
                config.standAlone = true;
                config.folder = path.resolve(__dirname, '..', 'public');
                handle.addWebsite(site, config);
                console.log('Setting workspace to current directory');
                handle.index.localhost = workspace;
            }
            else if (handle.index.localhost !== 'default') {
                console.log('Only load %s', handle.index.localhost);
                const site = handle.index.localhost;
                console.log('Adding site: ' + site);
                let config;
                try {
                    const start = Date.now();
                    if (fs.existsSync(path.resolve(__dirname, '..', 'websites', site, 'config.js'))) {
                        config = require(path.resolve(__dirname, '..', 'websites', site, 'config')).config;
                    }
                    else {
                        config = require(path.resolve(__dirname, '..', 'websites', site, 'config', 'config')).config;
                    }
                    console.log(`${Date.now() - start} ms - config.js for ${site}`);
                }
                catch (err) {
                    if (err.code !== 'MODULE_NOT_FOUND') {
                        console.log('Warning, your config script for ' + site + ' is broken!');
                        console.error(err);
                        console.log();
                    }
                    else {
                        console.log(`Error in ${site} config!`);
                        console.log(err);
                    }
                }
                config.cache = false;
                handle.addWebsite(site, config);
            }
            else {
                fs.readdirSync('websites/').forEach(function (site) {
                    if (fs.lstatSync('websites/' + site).isDirectory()) {
                        console.log('Adding site: ' + site);
                        let config;
                        try {
                            if (fs.existsSync(path.resolve(__dirname, '..', 'websites', site, 'config.js'))) {
                                config = require(path.resolve(__dirname, '..', 'websites', site, 'config')).config;
                            }
                            else {
                                config = require(path.resolve(__dirname, '..', 'websites', site, 'config', 'config')).config;
                            }
                        }
                        catch (err) {
                            if (err.code !== 'MODULE_NOT_FOUND') {
                                console.log('Warning, your config script for ' + site + ' is broken!');
                                console.error(err);
                                console.log();
                            }
                            else {
                                // Note, we want this to be silent if config.js is missing, because we can just serve the public/dist folders.
                                // but log an error if config.js requires something that is not available.
                                if (err.requireStack[0].indexOf('thalia.js') > 0) {
                                    console.log(`${site} does not use config.js, just serve the public folder`);
                                }
                                else {
                                    // Do we want errors to appear in standard error? Or standard log??? Both???
                                    console.error(`Error loading config for ${site}`);
                                    console.log(err);
                                    console.log();
                                }
                            }
                        }
                        handle.addWebsite(site, config);
                    }
                });
            }
        },
        // TODO: Make all of this asynchronous?
        // Add a site to the handle
        addWebsite: function (site, config) {
            config = config || {};
            handle.websites[site] = new Website(site, config);
            const baseUrl = config.standAlone ? path.resolve(__dirname, '..') : path.resolve(__dirname, '..', 'websites', site);
            // If dist or data exist, enable them.
            if (fs.existsSync(path.resolve(baseUrl, 'data'))) {
                handle.websites[site].data = path.resolve(baseUrl, 'data');
            }
            if (fs.existsSync(path.resolve(baseUrl, 'dist'))) {
                handle.websites[site].dist = path.resolve(baseUrl, 'dist');
            }
            Object.keys(handle.websites[site].proxies).forEach(function (proxy) {
                handle.proxies[proxy] = handle.websites[site].proxies[proxy];
            });
            // Add the site to the index
            handle.index[site + '.david-ma.net'] = site;
            handle.websites[site].domains.forEach(function (domain) {
                handle.index[domain] = site;
            });
            // If sequelize is set up, add it.
            if (fs.existsSync(path.resolve(baseUrl, 'db_bootstrap.js'))) {
                try {
                    const start = Date.now();
                    handle.websites[site].seq = require(path.resolve(baseUrl, 'db_bootstrap.js')).seq;
                    console.log(`${Date.now() - start} ms - Database bootstrap.js ${site}`);
                }
                catch (e) {
                    console.log(e);
                }
            }
            else if (fs.existsSync(path.resolve(baseUrl, 'config', 'db_bootstrap.js'))) {
                try {
                    const start = Date.now();
                    handle.websites[site].seq = require(path.resolve(baseUrl, 'config', 'db_bootstrap.js')).seq;
                    console.log(`${Date.now() - start} ms - Database bootstrap.js ${site}`);
                }
                catch (e) {
                    console.log(e);
                }
            }
            // If website has views, load them.
            if (fs.existsSync(path.resolve(baseUrl, 'views'))) {
                // Stupid hack for development if you don't want to cache the views :(
                handle.websites[site].readAllViews = function (cb) {
                    readAllViews(path.resolve(baseUrl, 'views')).then(d => cb(d));
                };
                handle.websites[site].readTemplate = function (template, content, cb) {
                    readTemplate(template, path.resolve(baseUrl, 'views'), content).then(d => cb(d));
                };
                readAllViews(path.resolve(baseUrl, 'views')).then(views => {
                    handle.websites[site].views = views;
                    fsPromise.readdir(path.resolve(baseUrl, 'views'))
                        .then(function (d) {
                        d.filter((d) => d.indexOf('.mustache') > 0).forEach((file) => {
                            const webpage = file.split('.mustache')[0];
                            if ((config.mustacheIgnore ? config.mustacheIgnore.indexOf(webpage) === -1 : true) &&
                                !handle.websites[site].controllers[webpage]) {
                                handle.websites[site].controllers[webpage] = function (controller) {
                                    if (handle.websites[site].cache) {
                                        controller.res.end(mustache.render(views[webpage], {}, views));
                                    }
                                    else {
                                        readAllViews(path.resolve(baseUrl, 'views')).then(views => {
                                            handle.websites[site].views = views;
                                            controller.res.end(mustache.render(views[webpage], {}, views));
                                        });
                                    }
                                };
                            }
                        });
                    }).catch((e) => console.log(e));
                });
            }
            // Unused feature? Commenting it out DKGM 2020-10-29
            // If the site has any startup actions, do them
            // if(config.startup){
            //     config.startup.forEach(function(action:any){
            //         action(handle.websites[site]);
            //     });
            // }
        },
        getWebsite: function (domain) {
            let site = handle.index.localhost;
            if (domain) {
                // if (handle.index.hasOwnProperty(domain)) {
                if (Object.prototype.hasOwnProperty.call(handle.index, domain)) {
                    site = handle.index[domain];
                }
                domain = domain.replace('www.', '');
                // if (handle.index.hasOwnProperty(domain)) {
                if (Object.prototype.hasOwnProperty.call(handle.index, domain)) {
                    site = handle.index[domain];
                }
            }
            return handle.websites[site];
        },
        proxies: {}
    };
    exports.handle = handle;
    handle.addWebsite('default', {});
    // TODO: handle rejection & errors?
    async function readTemplate(template, folder, content = '') {
        return new Promise((resolve) => {
            const promises = [];
            const filenames = ['template', 'content'];
            // Load the mustache template (outer layer)
            promises.push(fsPromise.readFile(`${folder}/${template}`, {
                encoding: 'utf8'
            }));
            // Load the mustache content (innermost layer)
            promises.push(new Promise((resolve) => {
                if (Array.isArray(content) && content[0])
                    content = content[0];
                fsPromise.readFile(`${folder}/content/${content}.mustache`, {
                    encoding: 'utf8'
                }).then((result) => {
                    const scriptEx = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/g;
                    const styleEx = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/g;
                    const scripts = [...result.matchAll(scriptEx)].map(d => d[0]);
                    const styles = [...result.matchAll(styleEx)].map(d => d[0]);
                    resolve({
                        content: result.replace(scriptEx, '').replace(styleEx, ''),
                        scripts: scripts.join('\n'),
                        styles: styles.join('\n')
                    });
                }).catch(() => {
                    fsPromise.readFile(`${folder}/404.mustache`, {
                        encoding: 'utf8'
                    }).then((result) => {
                        resolve(result);
                    });
                });
            }));
            // Load all the other partials we may need
            // Todo: Check folder exists and is not empty?
            fsPromise.readdir(`${folder}/partials/`)
                .then(function (d) {
                d.forEach(function (filename) {
                    if (filename.indexOf('.mustache') > 0) {
                        filenames.push(filename.split('.mustache')[0]);
                        promises.push(fsPromise.readFile(`${folder}/partials/${filename}`, {
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
    async function readAllViews(folder) {
        return new Promise((resolve, reject) => {
            fsPromise.readdir(folder).then((directory) => {
                Promise.all(directory.map((filename) => new Promise((resolve) => {
                    if (filename.indexOf('.mustache') > 0) {
                        fsPromise.readFile(`${folder}/${filename}`, 'utf8')
                            .then((file) => {
                            const name = filename.split('.mustache')[0];
                            resolve({
                                [name]: file
                            });
                        }).catch((e) => console.log(e));
                    }
                    else {
                        fsPromise.lstat(`${folder}/${filename}`).then((d) => {
                            if (d.isDirectory()) {
                                readAllViews(`${folder}/${filename}`)
                                    .then(d => resolve(d));
                            }
                            else {
                                // console.log(`${filename} is not a folder`);
                                resolve({});
                            }
                        });
                    }
                }))).then((array) => {
                    resolve(array.reduce((a, b) => Object.assign(a, b)));
                }, (reason) => {
                    console.log('Error in readAllViews', reason);
                    reject(reason);
                });
            }).catch((e) => console.log(e));
        });
    }
});
define("router", ["require", "exports", "fs", "mime", "zlib", "url"], function (require, exports, fs, mime, zlib, url) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.router = void 0;
    const router = function (website, pathname, response, request) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        const route = new Promise(function (resolve, reject) {
            try {
                const data = {
                    cookies: {},
                    words: []
                };
                if (request.headers.cookie) {
                    request.headers.cookie.split(';').forEach(function (d) {
                        data.cookies[d.split('=')[0].trim()] = d.substring(d.split('=')[0].length + 1).trim();
                    });
                }
                data.words = pathname
                    .split('/');
                // This should not be lowercase??? Keys are case sensitive!
                // .map(function(d){
                //     return d.toLowerCase();
                // });
                resolve(data);
            }
            catch (err) {
                console.log(err);
                reject(err);
            }
        });
        /**
           * The router should check what sort of route we're doing, and act appropriately.
           * Check:
           * - Security
           * - Redirects to outside websites
           * - Internal page alias
           * - Services / functions
           * - /data/ folder might have a file
           * - otherwise, we serve the file normally
           *
           * - When serving the file normally, we need to check the header to see if it can be zipped or should be zipped.
           */
        route.then(function (d) {
            if (typeof website.security !== 'undefined' && website.security.loginNeeded(pathname, d.cookies)) {
                website.services.login(response, request);
            }
            else {
                // If a page substitution exists, substitute it.
                if (typeof website.pages[d.words[1]] !== 'undefined') {
                    pathname = website.pages[d.words[1]];
                }
                // If there's a redirect, go to it
                if (typeof website.redirects[pathname] !== 'undefined') {
                    redirect(website.redirects[pathname]);
                    // if there's a service, use it
                }
                else if (typeof website.services[d.words[1]] === 'function') {
                    website.services[d.words[1]](response, request, website.seq, d.words[2]);
                    // if there are controllers, call the right one
                    // Note, this includes any top level mustache files, since they're loaded as generic, dataless controllers
                }
                else if (typeof website.controllers[d.words[1]] === 'function') {
                    website.controllers[d.words[1]]({
                        res: {
                            end: function (result) {
                                const acceptedEncoding = request.headers['accept-encoding'] || '';
                                const input = Buffer.from(result, 'utf8');
                                response.setHeader('Content-Type', 'text/html');
                                if (acceptedEncoding.indexOf('gzip') >= 0) {
                                    zlib.gzip(input, function (err, result) {
                                        if (err) {
                                            response.writeHead(503);
                                            response.end(err);
                                        }
                                        else {
                                            response.writeHead(200, { 'Content-Encoding': 'gzip' });
                                            response.end(result);
                                        }
                                    });
                                }
                                else if (acceptedEncoding.indexOf('deflate') >= 0) {
                                    zlib.deflate(input, function (err, result) {
                                        if (err) {
                                            response.writeHead(503);
                                            response.end(err);
                                        }
                                        else {
                                            response.writeHead(200, { 'Content-Encoding': 'deflate' });
                                            response.end(result);
                                        }
                                    });
                                }
                                else {
                                    response.end(result);
                                }
                            }
                        },
                        req: request,
                        db: website.seq || null,
                        views: website.views,
                        readAllViews: website.readAllViews,
                        readTemplate: website.readTemplate,
                        path: d.words.slice(2)
                    });
                    // if there is a matching data file
                }
                else if (website.data &&
                    fs.existsSync(website.data.concat(pathname)) &&
                    fs.lstatSync(website.data.concat(pathname)).isFile()) {
                    routeFile(website.data.concat(pathname));
                    // if there is a matching .gz file in the data folder
                }
                else if (website.data &&
                    fs.existsSync(website.data.concat(pathname).concat('.gz'))) {
                    response.setHeader('Content-Encoding', 'gzip');
                    routeFile(website.data.concat(pathname, '.gz'));
                    // if there is a matching compiled file
                }
                else if ((website.dist &&
                    fs.existsSync(website.dist.concat(pathname)) &&
                    fs.lstatSync(website.dist.concat(pathname)).isFile()) || (website.dist &&
                    fs.existsSync(website.dist.concat(pathname, '/index.html')) &&
                    fs.lstatSync(website.dist.concat(pathname, '/index.html')).isFile())) {
                    routeFile(website.dist.concat(pathname));
                }
                else {
                    // Otherwise, route as normal to the public folder
                    routeFile(website.folder.concat(pathname));
                }
            }
        }).catch(renderError);
        function renderError(d) {
            console.log('Error?', d);
            d = d
                ? {
                    code: 500,
                    message: JSON.stringify(d)
                }
                : {
                    code: 500,
                    message: '500 Server Error'
                };
            response.writeHead(d.code, {
                'Content-Type': 'text/html'
            });
            response.end(d.message);
        }
        function redirect(url) {
            if (typeof (url) === 'string') {
                console.log('Forwarding user to: ' + url);
                response.writeHead(303, { 'Content-Type': 'text/html' });
                response.end('<meta http-equiv="refresh" content="0; url=' + url + '">');
            }
            else {
                console.log('Error, url missing');
                response.writeHead(501, { 'Content-Type': 'text/plain' });
                response.end('501 URL Not Found\n');
            }
        }
        /**
           * Given a filename, serve it.
           *
           * Check that the file exists
           * Check the headers..?
           * zip/unzip if needed
           *
           * @param filename
           */
        function routeFile(filename) {
            fs.exists(filename, function (exists) {
                if (!exists) {
                    console.log('No file found for ' + filename);
                    response.writeHead(404, { 'Content-Type': 'text/plain' });
                    response.end('404 Page Not Found\n');
                    return;
                }
                const acceptedEncoding = request.headers['accept-encoding'] || '';
                const filetype = mime.getType(filename);
                response.setHeader('Content-Type', filetype);
                let router = function (file) {
                    response.writeHead(200);
                    response.end(file);
                };
                fs.stat(filename, function (err, stats) {
                    if (err) {
                        response.writeHead(503);
                        response.end(err);
                    }
                    else {
                        response.setHeader('Cache-Control', 'no-cache');
                        if (website.cache) {
                            if (stats.size > 10240) { // cache files bigger than 10kb?
                                // https://web.dev/http-cache/
                                response.setHeader('Cache-Control', 'public, max-age=600'); // store for 10 mins
                                response.setHeader('Expires', new Date(Date.now() + 86400000).toUTCString()); // expire 1 day from now
                                try {
                                    const queryObject = url.parse(request.url, true).query;
                                    if (queryObject.v) {
                                        // Set cache to 1 year if a cache busting query string is included
                                        response.setHeader('Cache-Control', 'public, max-age=31536000');
                                        response.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
                                    }
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            }
                        }
                        if (filetype && (filetype.slice(0, 4) === 'text' ||
                            filetype === 'application/json' ||
                            filetype === 'application/javascript')) {
                            response.setHeader('Content-Type', `${filetype}; charset=UTF-8`);
                            router = function (file) {
                                if (acceptedEncoding.indexOf('gzip') >= 0) {
                                    zlib.gzip(file, function (err, result) {
                                        if (err) {
                                            response.writeHead(503);
                                            response.end(err);
                                        }
                                        else {
                                            response.writeHead(200, { 'content-encoding': 'gzip' });
                                            response.end(result);
                                        }
                                    });
                                }
                                else if (acceptedEncoding.indexOf('deflate') >= 0) {
                                    zlib.deflate(file, function (err, result) {
                                        if (err) {
                                            response.writeHead(503);
                                            response.end(err);
                                        }
                                        else {
                                            response.writeHead(200, { 'content-encoding': 'deflate' });
                                            response.end(result);
                                        }
                                    });
                                }
                                else {
                                    response.writeHead(200);
                                    response.end(file);
                                }
                            };
                        }
                    }
                });
                fs.readFile(filename, function (err, file) {
                    if (err) {
                        fs.readdir(filename, function (e, dir) {
                            if (!e && dir && dir instanceof Array && dir.indexOf('index.html') >= 0) {
                                if (filename.lastIndexOf('/') === filename.length - 1) {
                                    filename += 'index.html';
                                }
                                else {
                                    if (filename.indexOf('?') !== -1) {
                                        filename = filename.split('?')[0] + '/index.html';
                                    }
                                    else {
                                        filename += '/index.html';
                                    }
                                }
                                // Note we don't have content type, caching, or zipping!!!!
                                fs.readFile(filename, (e, file) => router(file));
                            }
                            else {
                                let base = request.url.split('?')[0];
                                base = base.slice(-1) === '/' ? base : `${base}/`;
                                const slug = base.split('/').slice(-2).slice(0, 1)[0];
                                if (website.viewableFolders
                                    ? website.viewableFolders instanceof Array
                                        ? website.viewableFolders.indexOf(slug) !== -1
                                        : true
                                    : false) {
                                    const links = [];
                                    dir.forEach((file) => {
                                        links.push(`<li><a href="${base + file}">${file}</a></li>`);
                                    });
                                    const result = `<h1>Links</h1>
<ul>
${links.join('\n')}
</ul>`;
                                    response.writeHead(200, { 'Content-Type': 'text/html' });
                                    response.end(result);
                                }
                                else {
                                    console.log('Error 500, content protected? ' + filename);
                                    response.writeHead(500, { 'Content-Type': 'text/plain' });
                                    response.end('Error 500, content protected\n' + err);
                                }
                            }
                        });
                    }
                    else {
                        router(file);
                    }
                });
            });
        }
    };
    exports.router = router;
});
define("socket", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.socketInit = void 0;
    function socketInit(io, handle) {
        // console.log('Initialising Socket.io for site: ') // Which sites?
        Object.keys(handle.websites).forEach((siteName) => {
            io.of(`/${siteName}`).use((socket, next) => {
                const host = socket.handshake.headers.host;
                const website = handle.getWebsite(host);
                if (website.name === siteName) {
                    next();
                }
                else {
                    next(new Error('Wrong namespace for this site'));
                }
            }).on('connection', function (socket) {
                const host = socket.handshake.headers.host;
                const website = handle.getWebsite(host);
                // Simple logging
                console.log('Socket connection ' + socket.id + ' from ' + socket.handshake.headers.referer);
                website.sockets.on.forEach(function (d) {
                    socket.on(d.name, function (data) {
                        d.callback(socket, data, website.seq);
                    });
                });
                website.sockets.emit.forEach((emitter) => {
                    emitter(socket, website.seq);
                });
            });
        });
    }
    exports.socketInit = socketInit;
});
define("server", ["require", "exports", "socket", "http", "url", "http-proxy", "socket.io"], function (require, exports, socket_1, http, url, httpProxy, socketIO) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.start = void 0;
    let blacklist = [];
    try {
        blacklist = require('../blacklist').blacklist;
        console.log('This is the blacklist:', blacklist);
    }
    catch (e) { }
    // This part of the server starts the server on port 80 and logs stuff to the std.out
    function start(router, handle, port) {
        let server = null;
        function onRequest(request, response) {
            let spam = false;
            const ip = request.headers['X-Real-IP'] || request.headers['x-real-ip'] || request.connection.remoteAddress;
            if (ip) {
                blacklist.forEach(function (thing) {
                    if (ip.includes(thing)) {
                        spam = true;
                        // console.log(`Spam request from ${ip}`);
                        response.writeHead(403);
                        response.end('Go away');
                    }
                });
            }
            if (!spam) {
                const host = request.headers['test-host'] || request.headers.host;
                const proxyConfig = handle.proxies[host];
                const site = handle.getWebsite(host);
                const urlObject = url.parse(request.url, true);
                if (host !== 'www.monetiseyourwebsite.com') {
                    console.log();
                    console.log(`Request for ${host}${urlObject.href} At ${getDateTime()} From ${ip}`);
                }
                if (proxyConfig &&
                    (typeof proxyConfig.filter === 'undefined' ||
                        proxyConfig.filter === url.parse(request.url).pathname.split('/')[1])) {
                    if (typeof proxyConfig.passwords !== 'undefined' &&
                        Array.isArray(proxyConfig.passwords)) {
                        security(proxyConfig.passwords);
                    }
                    else {
                        webProxy(proxyConfig);
                    }
                }
                else {
                    router(site, urlObject.pathname, response, request);
                }
            }
            function webProxy(config) {
                const message = config.message || 'Error, server is down.';
                const target = `http://${config.host || '127.0.0.1'}:${config.port || 80}`;
                const proxyServer = httpProxy.createProxyServer({
                    // preserveHeaderKeyCase: true,
                    // autoRewrite: true,
                    // followRedirects: true,
                    // protocolRewrite: "http",
                    // changeOrigin: true,
                    target: target
                });
                proxyServer.on('error', function (err, req, res) {
                    'use strict';
                    console.log(err);
                    try {
                        res.writeHead(500);
                        res.end(message);
                    }
                    catch (e) {
                        console.log('Error doing proxy!', e);
                    }
                });
                proxyServer.web(request, response);
            }
            function security(passwords) {
                let decodedCookiePassword = false;
                const cookies = {};
                if (request.headers.cookie) {
                    request.headers.cookie.split(';').forEach(function (d) {
                        cookies[d.split('=')[0].trim()] = d.substring(d.split('=')[0].length + 1).trim();
                    });
                    decodedCookiePassword = decodeBase64(cookies.password);
                }
                const host = request.headers['test-host'] || request.headers.host;
                const urlObject = url.parse(request.url, true);
                const proxyConfig = handle.proxies[host];
                if (urlObject.query.logout) {
                    response.setHeader('Set-Cookie', ['password=;path=/;max-age=1']);
                    response.writeHead(200);
                    response.end('Logged out.');
                }
                else if (urlObject.query.password && passwords.indexOf(urlObject.query.password) >= 0) {
                    // console.log(url_object.query.password);
                    const password = encodeBase64(urlObject.query.password[0]);
                    // let password = encodeBase64(url_object.query.password);
                    response.setHeader('Set-Cookie', [`password=${password};path=/;expires=false`]);
                    webProxy(proxyConfig);
                }
                else if (decodedCookiePassword && passwords.indexOf(decodedCookiePassword) >= 0) {
                    webProxy(proxyConfig);
                }
                else {
                    response.writeHead(200);
                    response.end(simpleLoginPage);
                }
            }
        }
        console.log('Server has started on port: ' + port);
        server = http.createServer(onRequest).listen(port);
        // const io = new socketIO.listen(server, {})
        const io = socketIO.listen(server, {});
        socket_1.socketInit(io, handle);
        return server.on('upgrade', function (request, socket, head) {
            'use strict';
            const host = request.headers['test-host'] || request.headers.host;
            const proxyConfig = handle.proxies[host];
            if (proxyConfig) {
                httpProxy.createProxyServer({
                    ws: true,
                    target: {
                        host: proxyConfig.host || '127.0.0.1',
                        port: proxyConfig.port || 80
                    }
                }).ws(request, socket, head);
            }
        });
    }
    exports.start = start;
    function getDateTime() {
        //    var date = new Date();
        const date = new Date(Date.now() + 36000000);
        // add 10 hours... such a shitty way to make it australian time...
        let hour = date.getHours();
        hour = (hour < 10 ? '0' : '') + hour;
        let min = date.getMinutes();
        min = (min < 10 ? '0' : '') + min;
        const year = date.getFullYear();
        let month = date.getMonth() + 1;
        month = (month < 10 ? '0' : '') + month;
        let day = date.getDate();
        day = (day < 10 ? '0' : '') + day;
        return year + ':' + month + ':' + day + ' ' + hour + ':' + min;
    }
    function encodeBase64(string) {
        'use strict';
        // const buff = new Buffer(string)
        const buff = Buffer.from(string);
        return buff.toString('base64');
    }
    function decodeBase64(data) {
        'use strict';
        if (data) {
            // const buff = new Buffer(data, 'base64')
            const buff = Buffer.from(data, 'base64');
            return buff.toString('ascii');
        }
        else {
            return false;
        }
    }
    const simpleLoginPage = `<html>
<head>
<title>Login</title>
<style>
div {
    text-align: center;
    width: 300px;
    margin: 200px auto;
    background: lightblue;
    padding: 10px 20px;
    border-radius: 15px;
}
</style>
</head>
<body>
<div>
    <h1>Enter Password</h1>
    <form action="">
        <input type="password" placeholder="Enter Password" name="password" autofocus required>
        <button type="submit">Login</button>
    </form>
</div>
</body>
</html>`;
});
// index.ts
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function (require) {
    require(['server', 'router', 'requestHandlers', 'fs'], function (server, router, requestHandlers, fs) {
        let port = '1337'; // change the port here?
        const pattern = /^\d{0,5}$/;
        let workspace = 'default';
        if (process.argv[2] !== null && pattern.exec(process.argv[2])) {
            port = process.argv[2];
        }
        else if (process.argv[3] !== null && pattern.exec(process.argv[3])) {
            port = process.argv[3];
        }
        // Todo: we should check that the workspace exists, otherwise leave it as default
        if (process.argv[2] !== null && process.argv[2] !== undefined && !pattern.exec(process.argv[2])) {
            workspace = process.argv[2];
        }
        else if (process.argv[3] !== null && process.argv[3] !== undefined && !pattern.exec(process.argv[3])) {
            workspace = process.argv[3];
        }
        if (fs.existsSync(`websites/${workspace}`)) {
            console.log(`Setting workspace to websites/${workspace}`);
        }
        else if (fs.existsSync('config.js') || fs.existsSync('config/config.js')) {
            console.log('Thalia running in stand alone mode.');
        }
        else {
            console.error(`Error. ${workspace} is an invalid workspace`);
            process.exit(1);
        }
        requestHandlers.handle.index.localhost = workspace;
        requestHandlers.handle.loadAllWebsites();
        server.start(router.router, requestHandlers.handle, port);
    });
});
