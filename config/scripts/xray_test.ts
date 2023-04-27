var seq = require('../db_bootstrap').seq
var xray = require('x-ray')()

var fs = require('fs')

const html = fs.readFileSync('output/test.html', {
  encoding: 'utf8',
})

// Get the project IDs
xray(html, ['article.project@data-id'])(function (err, projects) {
  if (err) {
    console.log('ERROR', err)
  }
  console.log('Projects:', projects)

  // Get the photos for each project
  projects.forEach((project) => {
    xray(html, `article.project[data-id=${project}]`, [
      {
        caption: `a[rel=project-${project}-images]@title`,
        url: `a[rel=project-${project}-images]@href`,
      },
    ])(function (err, photos) {
      if (err) {
        console.log('ERROR', err)
      }
      console.log(`Project ${project}:`, photos)
      // Save the photos to the database
      photos.forEach((photo) => {
        photo.awesome_project_id = project

        seq.AwesomePhoto.findOne({
          where: {
            url: photo.url,
          },
        }).then((d) => {
          if (d) {
            console.log('Found existing record', d.id)
            d.update(photo)
          } else {
            console.log('Creating new record', photo.id)
            seq.AwesomePhoto.create(photo).catch((error) => {
              console.log('Error', error)
            })
          }
        })
      })
    })
  })
})
