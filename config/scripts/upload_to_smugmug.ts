// For each photo in the database, upload it to smugmug

const AwesomePhoto = require('../db_bootstrap').seq.AwesomePhoto
import https from 'https'

AwesomePhoto.findAll({
  where: {
    smugmug_key: null,
  },
  limit: 30,
  order: [['id', 'DESC']],
}).then((photos) => {
  checkPhotosAndUpdate()
  checkPhotosAndUpdate()
  checkPhotosAndUpdate()
  checkPhotosAndUpdate()

  function checkPhotosAndUpdate() {
    if (photos.length > 0) {
      const photo = photos.pop()
      updatePhoto(photo, function () {
        checkPhotosAndUpdate()
      })
    }
  }
})

//  We should check the photo URL is a valid URL before trying to upload it
function updatePhoto(photo, callback) {
  console.log(`Updating photo ${photo.id} ${photo.url}`)
  https.get(
    'https://upload.david-ma.net/uploadByUrl',
    {
      headers: {
        target: photo.url,
        caption: photo.caption,
      },
    },
    (res) => {
      let rawData = ''

      res.on('data', (d) => {
        rawData += d
      })
      res.on('end', () => {
        const data = JSON.parse(rawData)
        photo
          .update({
            smugmug_url: data.smugmug_url,
            smugmug_key: data.smugmug_key,
            smugmug_album: data.smugmug_album,
          })
          .then((data) => {
            console.log(`Updated photo ${photo.id} ${data.smugmug_url}`)
            callback()
          })
      })
    }
  )
}
