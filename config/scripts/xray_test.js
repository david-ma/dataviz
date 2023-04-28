"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xray = void 0;
var AwesomePhoto = require('../db_bootstrap').seq.AwesomePhoto;
var x = require('x-ray')();
function xray(html) {
    x(html, ['article.project@data-id'])(function (err, projects) {
        if (err) {
            console.log('ERROR', err);
        }
        console.log('Projects:', projects);
        const tally = {
            total: projects.length,
            photos: 0,
            newPhotos: 0,
        };
        Promise.all(projects.map((project) => {
            new Promise((resolve, reject) => {
                x(html, `article.project[data-id=${project}]`, {
                    project: project,
                    photos: x(`a[rel="project-${project}-images"]`, [
                        {
                            url: '@href',
                            caption: '@title',
                        },
                    ]),
                })(function (err, blob) {
                    if (err) {
                        console.log('ERROR', err);
                        reject(err);
                    }
                    Promise.all(blob.photos.map((photo) => {
                        new Promise((resolve, reject) => {
                            photo.awesome_project_id = project;
                            tally.photos++;
                            AwesomePhoto.findOne({
                                where: {
                                    url: photo.url,
                                },
                            }).then((d) => {
                                if (d) {
                                }
                                else {
                                    tally.newPhotos++;
                                    AwesomePhoto.create(photo).catch((error) => {
                                        console.log('Error', error);
                                    });
                                }
                                resolve('done');
                            });
                        });
                    })).then((d) => {
                        resolve(blob);
                    });
                });
            });
        })).then((d) => {
            console.log('Done!');
            console.log(`Total projects: ${tally.total}`);
            console.log(`Total photos found: ${tally.photos}`);
            console.log(`New photos: ${tally.newPhotos}`);
        });
    });
}
exports.xray = xray;
