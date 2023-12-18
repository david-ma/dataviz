const axios = require('axios'),
  fs = require('fs')

// console.log("hello world", fs)
// console.log("hello world", axios)

async function getArticleRevisions(title, maxRevisions, newestId) {
  console.log('newestId', newestId)
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=${title}&rvprop=ids|tags|timestamp|user|comment|content&rvlimit=${maxRevisions}&redirects=1&rvdir=newer&rvstartid=${parseInt(newestId) + 1}`

  try {
    const response = await axios.get(apiUrl)
    const pages = response.data.query.pages

    // Extract revisions from the API response
    const revisions = Object.values(pages)[0]?.revisions || []

    console.log(revisions)

    return revisions.map((revision) => ({
      id: revision.revid,
      timestamp: revision.timestamp,
      comment: revision.comment,
      contentformat: revision.contentformat,
      contentmodel: revision.contentmodel,
      tags: revision.tags,
      user: revision.user || 'Anonymous', // If the user is not available, set to 'Anonymous'
      content: revision['*'],
    }))
  } catch (error) {
    console.error('Error fetching data:', error.message)
    return []
  }
}

function saveRevisionsToFile(revisions, filename) {
  const data = JSON.stringify(revisions, null, 1)
  console.log('Writing to file', revisions.length)

  fs.writeFile(filename, data, (err) => {
    if (err) {
      console.error('Error saving revisions to file:', err.message)
    } else {
      console.log(`Revisions saved to ${filename}`)
    }
  })
}

const articleTitle = 'Ship_of_Theseus'
const maxRevisions = 50
const outputFilename = 'data/ship_of_theseus_revisions.json'

;(async () => {
  var newestId = 0
  var records = []

  fs.readFile(outputFilename, 'utf8', (err, data) => {
    records = JSON.parse(data)
    records.forEach((record) => {
      if (record.id > newestId) {
        newestId = record.id
      }
    })

    getArticleRevisions(articleTitle, maxRevisions, newestId).then((revisions) => {
      saveRevisionsToFile(
        records.concat(revisions),
        outputFilename
      )
    })

  })
})()
