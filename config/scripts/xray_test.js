"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xray = void 0;
var seq = require('../db_bootstrap').seq;
var x = require('x-ray')();
function xray(html) {
    x(html, ['article.project@data-id'])(function (err, projects) {
        if (err) {
            console.log('ERROR', err);
        }
        console.log('Projects:', projects);
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
                console.log(`Project ${project}:`, blob);
                blob.photos.forEach((photo) => {
                    photo.awesome_project_id = project;
                    seq.AwesomePhoto.findOne({
                        where: {
                            url: photo.url,
                        },
                    }).then((d) => {
                        if (d) {
                            console.log('Found existing record', d.id);
                            d.update(photo);
                        }
                        else {
                            console.log('Creating new record', photo.url);
                            seq.AwesomePhoto.create(photo).catch((error) => {
                                console.log('Error', error);
                            });
                        }
                    });
                });
            });
        });
    });
}
exports.xray = xray;
