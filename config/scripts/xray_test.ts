var AwesomePhoto = require('../db_bootstrap').seq.AwesomePhoto
var x = require('x-ray')()

// var fs = require('fs')
// var html = fs.readFileSync('output/test.html')
// xray(html)

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
          console.log('ERROR', err)
        }
        // console.log(`Project ${project}:`, blob)
        // Save the photos to the database
        blob.photos.forEach((photo) => {
          photo.awesome_project_id = project
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
          })
        })
      })
    })

    console.log('Done!')
    console.log(`Total projects: ${tally.total}`)
    // This tally doesn't work because the xray & sequelize calls are asynchronous
    // console.log(`Total photos found: ${tally.photos}`)
    // console.log(`New photos: ${tally.newPhotos}`)
  })
}
