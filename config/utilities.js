"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTemplates = exports.sanitise = exports.asyncForEach = exports.gitHash = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sass_1 = __importDefault(require("sass"));
const fsPromise = fs_1.default.promises;
let gitHash = new Date().getTime().toString();
exports.gitHash = gitHash;
try {
    const rawGitHash = fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'git-commit-version.txt'), 'utf8');
    exports.gitHash = gitHash = rawGitHash.split('-').pop().trim();
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
exports.asyncForEach = asyncForEach;
function sanitise(string) {
    return string.replace(/\W+/g, ' ').trim().replace(/\W/g, '_').toLowerCase();
}
exports.sanitise = sanitise;
async function loadTemplates(template, content = '') {
    return new Promise((resolve) => {
        const promises = [];
        const filenames = ['template', 'content'];
        promises.push(fsPromise.readFile(path_1.default.resolve(__dirname, '..', 'views', template), {
            encoding: 'utf8',
        }));
        promises.push(new Promise((resolve) => {
            if (Array.isArray(content) && content[0])
                content = content[0];
            fsPromise
                .readFile(path_1.default.resolve(__dirname, '..', 'views', 'content', content + '.mustache'), {
                encoding: 'utf8',
            })
                .then((result) => {
                try {
                    const scriptEx = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/g;
                    const styleEx = /<style\b.*>([^<]*(?:(?!<\/style>)<[^<]*)*)<\/style>/g;
                    const scripts = [...result.matchAll(scriptEx)].map((d) => d[0]);
                    const styles = [...result.matchAll(styleEx)].map((d) => d[1]);
                    let styleData = styles.join('\n');
                    sass_1.default.render({
                        data: styleData,
                        outputStyle: 'compressed',
                    }, function (err, sassResult) {
                        if (err) {
                            console.error(`Error reading SCSS from file: ${content}.mustache`);
                            console.error(err);
                        }
                        else {
                            styleData = sassResult.css.toString();
                        }
                        resolve({
                            content: result.replace(scriptEx, '').replace(styleEx, ''),
                            scripts: scripts.join('\n'),
                            styles: `<style>${styleData}</style>`,
                        });
                    });
                }
                catch (e) {
                    resolve({
                        content: result,
                    });
                }
            })
                .catch((e) => {
                fsPromise
                    .readFile(path_1.default.resolve(__dirname, '..', 'views', '404.mustache'), {
                    encoding: 'utf8',
                })
                    .then((result) => {
                    resolve(result);
                });
            });
        }));
        fsPromise
            .readdir(path_1.default.resolve(__dirname, '..', 'views', 'partials'))
            .then(function (d) {
            d.forEach(function (filename) {
                if (filename.indexOf('.mustache') > 0) {
                    filenames.push(filename.split('.mustache')[0]);
                    promises.push(fsPromise.readFile(path_1.default.resolve(__dirname, '..', 'views', 'partials', filename), {
                        encoding: 'utf8',
                    }));
                }
            });
            Promise.all(promises).then(function (array) {
                const results = {};
                filenames.forEach((filename, i) => {
                    results[filename] = array[i];
                });
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
exports.loadTemplates = loadTemplates;
