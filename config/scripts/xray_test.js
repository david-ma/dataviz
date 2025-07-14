var AwesomePhoto = require('../db_bootstrap').seq.AwesomePhoto;
var x = require('x-ray')();
export function xray(html) {
    // Get the project IDs
    x(html, ['article.project@data-id'])(function (err, projects) {
        if (err) {
            console.log('ERROR', err);
        }
        console.log('Projects found in html:', projects);
        const tally = {
            total: projects.length,
            photos: 0,
            newPhotos: 0,
        };
        // Get the photos for each project
        Promise.all(projects.map((project) => {
            // console.log("Processing project ", project)
            new Promise((resolve, reject) => {
                x(html, `article.project[data-id=${project}]`, {
                    project: project,
                    photos: x(`a[rel="project-${project}-images"]`, [
                        {
                            awesome_project_id: project,
                            url: '@href',
                            caption: '@title',
                        },
                    ]),
                })(function (err, blob) {
                    if (err) {
                        console.log('ERROR', err);
                        reject(err);
                    }
                    // console.log("Blob is", blob)
                    // console.log(`Project ${project}:`, blob)
                    // Save the photos to the database
                    Promise.all(blob.photos.map((photo) => {
                        // console.log("Photo is", photo)
                        photo.awesome_project_id = project;
                        new Promise((resolve, reject) => {
                            tally.photos++;
                            AwesomePhoto.findOne({
                                where: {
                                    url: photo.url,
                                },
                            }).then((d) => {
                                if (d) {
                                    // console.log('Found existing record', d.id)
                                    // d.update(photo)
                                }
                                else {
                                    tally.newPhotos++;
                                    // console.log('Creating new record', photo.url)
                                    // console.log(photo)
                                    AwesomePhoto.create(photo).catch((error) => {
                                        console.log('Error creating new record', error);
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
//# sourceMappingURL=xray_test.js.map