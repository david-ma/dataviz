import fs from 'fs';
import path from 'path';
import sass from 'sass';
const fsPromise = fs.promises;
let gitHash = new Date().getTime().toString(); // use the start up time as fallback if a proper git hash is unavailable
try {
    const rawGitHash = fs.readFileSync(path.resolve(__dirname, 'git-commit-version.txt'), 'utf8');
    gitHash = rawGitHash.split('-').pop().trim();
}
catch (e) { }
// Asynchronous for each, doing a limited number of things at a time.
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
// TODO: handle rejection & errors?
async function loadTemplates(template, content = '') {
    return new Promise((resolve) => {
        const promises = [];
        const filenames = ['template', 'content'];
        // Load the mustache template (outer layer)
        promises.push(
        // fsPromise.readFile(`${__dirname}/../views/${template}`, {
        fsPromise.readFile(path.resolve(__dirname, '..', 'views', template), {
            encoding: 'utf8',
        }));
        // Load the mustache content (innermost layer)
        promises.push(new Promise((resolve) => {
            if (Array.isArray(content) && content[0])
                content = content[0];
            // fsPromise.readFile(`${__dirname}/../views/content/${content}.mustache`, {
            fsPromise
                .readFile(path.resolve(__dirname, '..', 'views', 'content', content + '.mustache'), {
                encoding: 'utf8',
            })
                .then((result) => {
                try {
                    const scriptEx = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/g;
                    const styleEx = /<style\b.*>([^<]*(?:(?!<\/style>)<[^<]*)*)<\/style>/g;
                    const scripts = [...result.matchAll(scriptEx)].map((d) => d[0]);
                    const styles = [...result.matchAll(styleEx)].map((d) => d[1]);
                    let styleData = styles.join('\n');
                    sass.render({
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
                // fsPromise.readFile(`${__dirname}/../views/404.mustache`, {
                fsPromise
                    .readFile(path.resolve(__dirname, '..', 'views', '404.mustache'), {
                    encoding: 'utf8',
                })
                    .then((result) => {
                    resolve(result);
                });
            });
        }));
        // Load all the other partials we may need
        // fsPromise.readdir(`${__dirname}/../views/partials/`)
        fsPromise
            .readdir(path.resolve(__dirname, '..', 'views', 'partials'))
            .then(function (d) {
            d.forEach(function (filename) {
                if (filename.indexOf('.mustache') > 0) {
                    filenames.push(filename.split('.mustache')[0]);
                    promises.push(
                    // fsPromise.readFile(`${__dirname}/../views/partials/${filename}`, {
                    fsPromise.readFile(path.resolve(__dirname, '..', 'views', 'partials', filename), {
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
export { gitHash, asyncForEach, sanitise, loadTemplates };
//# sourceMappingURL=utilities.js.map