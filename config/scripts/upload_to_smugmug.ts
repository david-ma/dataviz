// For each photo in the database, upload it to smugmug

const AwesomePhoto = require('../db_bootstrap').seq.AwesomePhoto
import https from 'https'

AwesomePhoto.findAll({
  where: {
    smugmug_key: null,
  },
  limit: 1,
}).then((photos) => {
  photos.forEach((photo) => {
    console.log(`Found photo ${photo.id} with url ${photo.url}`)

    https.get(
      'http://upload.david-ma.net/uploadByUrl',
      {
        headers: {
          target: photo.url,
        },
      },
      (res) => {
        let rawData = ''

        res.on('data', (d) => {
          rawData += d
        })
        res.on('end', () => {
          const data = JSON.parse(rawData)
          console.log('Data', data)
          photo
            .update({
              smugmug_url: data.smugmug_url,
              smugmug_key: data.smugmug_key,
              smugmug_album: data.smugmug_album,
            })
            .then(() => {})
        })
      }
    )
  })
})
