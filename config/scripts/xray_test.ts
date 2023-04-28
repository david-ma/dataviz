var AwesomePhoto = require('../db_bootstrap').seq.AwesomePhoto
var x = require('x-ray')()

// var fs = require('fs')
// var html = fs.readFileSync('output/test.html')
// xray(html)

type ProjectBlob = {
  project: number
  photos: Array<{
    awesome_project_id: number
    url: string
    caption: string
  }>
}

export function xray(html) {
  // Get the project IDs
  x(html, ['article.project@data-id'])(function (err, projects) {
    if (err) {
      console.log('ERROR', err)
    }
    console.log('Projects:', projects)
    const tally = {
      total: projects.length,
      photos: 0,
      newPhotos: 0,
    }

    // Get the photos for each project
    Promise.all(
      projects.map((project) => {
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
          })(function (err, blob: ProjectBlob) {
            if (err) {
              console.log('ERROR', err)
              reject(err)
            }

            // console.log(`Project ${project}:`, blob)
            // Save the photos to the database
            Promise.all(
              blob.photos.map((photo) => {
                new Promise((resolve, reject) => {
                  tally.photos++

                  AwesomePhoto.findOne({
                    where: {
                      url: photo.url,
                    },
                  }).then((d) => {
                    if (d) {
                      // console.log('Found existing record', d.id)
                      // d.update(photo)
                    } else {
                      tally.newPhotos++
                      // console.log('Creating new record', photo.url)
                      AwesomePhoto.create(photo).catch((error) => {
                        console.log('Error', error)
                      })
                    }
                    resolve('done')
                  })
                })
              })
            ).then((d) => {
              resolve(blob)
            })
          })
        })
      })
    ).then((d) => {
      console.log('Done!')
      console.log(`Total projects: ${tally.total}`)
      console.log(`Total photos found: ${tally.photos}`)
      console.log(`New photos: ${tally.newPhotos}`)
    })
  })
}
