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
        projects.forEach((project) => {
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
                }
                blob.photos.forEach((photo) => {
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
                    });
                });
            });
        });
        console.log('Done!');
        console.log(`Total projects: ${tally.total}`);
    });
}
exports.xray = xray;
