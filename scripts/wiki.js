const axios = require('axios'),
  fs = require('fs')

if (axios && fs) {
  console.log('axios and fs are loaded')
}
// console.log("hello world", fs)
// console.log("hello world", axios)

// Open /data/ship_of_theseus_revisions2.json

fs.readFile('data/ship_of_theseus_revisions_3.json', 'utf8', (err, data) => {
  var string = JSON.parse(data)
  console.log(string)
})

async function getArticleRevisions(title, maxRevisions) {
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=${title}&rvprop=timestamp|user|comment|content&rvlimit=${maxRevisions}&redirects=1&rvdir=newer`;

  try {
    const response = await axios.get(apiUrl);
    const pages = response.data.query.pages;

    // Extract revisions from the API response
    const revisions = Object.values(pages)[0]?.revisions || [];

    return revisions.map(revision => ({
      id: revision.revid,
      timestamp: revision.timestamp,
      comment: revision.comment,
      user: revision.user || 'Anonymous', // If the user is not available, set to 'Anonymous'
      content: revision['*']
    }));
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return [];
  }
}

function saveRevisionsToFile(revisions, filename) {
  const data = JSON.stringify(revisions, null, 1);

  fs.writeFile(filename, data, (err) => {
    if (err) {
      console.error('Error saving revisions to file:', err.message);
    } else {
      console.log(`Revisions saved to ${filename}`);
    }
  });
}

const articleTitle = 'Ship_of_Theseus';
const maxRevisions = 1000;
const outputFilename = 'data/ship_of_theseus_revisions_7.json';

(async () => {
  const revisions = await getArticleRevisions(articleTitle, maxRevisions);
  saveRevisionsToFile(revisions, outputFilename);
})();

// const diff = require('diff');

// async function getArticleRevisions(title, batchSize, totalRevisions) {
//   let revisions = [];

//   const totalPages = Math.ceil(totalRevisions / batchSize);

//   for (let page = 0; page < totalPages; page++) {
//     const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=${title}&rvprop=timestamp|user|content&rvlimit=${batchSize}&rvdir=newer&rvstart=${(page * batchSize) + 1}`;

//     try {
//       const response = await axios.get(apiUrl);
//       const pages = response.data.query.pages;

//       // Extract revisions from the API response
//       const pageRevisions = Object.values(pages)[0]?.revisions || [];
//       revisions = revisions.concat(pageRevisions.map(revision => ({
//         timestamp: revision.timestamp,
//         user: revision.user || 'Anonymous',
//         content: revision['*']
//       })));

//     } catch (error) {
//       console.error('Error fetching data:', error.message);
//       return [];
//     }
//   }

//   return revisions;
// }

// function highlightChanges(previousContent, currentContent) {
//   // ... (unchanged)
// }

// function saveRevisionsToFile(revisions, filename) {
//   const formattedRevisions = revisions.map((revision, index) => {
//     if (index > 0) {
//       const previousContent = revisions[index - 1].content;
//       revision.highlightedContent = highlightChanges(previousContent, revision.content);
//     }
//     return revision;
//   });

//   const data = JSON.stringify(formattedRevisions, null, 2);

//   fs.writeFile(filename, data, (err) => {
//     if (err) {
//       console.error('Error saving revisions to file:', err.message);
//     } else {
//       console.log(`Revisions saved to ${filename}`);
//     }
//   });
// }

// const articleTitle = 'Ship_of_Theseus';
// const batchSize = 50; // Adjust the batch size as needed
// const totalRevisions = 500; // Adjust the total number of revisions you want to download
// const outputFilename = 'ship_of_theseus_revisions.json';

// (async () => {
//   const revisions = await getArticleRevisions(articleTitle, batchSize, totalRevisions);
//   saveRevisionsToFile(revisions, outputFilename);
// })();

// const axios = require('axios');
// const fs = require('fs');
// const diff = require('diff');

// async function getArticleRevisions(title, startRevision, endRevision) {
//   const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=${title}&rvprop=timestamp|user|content&rvstart=${startRevision}&rvend=${endRevision}&rvdir=newer&rvlimit=500`;

//   try {
//     const response = await axios.get(apiUrl);
//     const pages = response.data.query.pages;

//     // Extract revisions from the API response
//     const revisions = Object.values(pages)[0]?.revisions || [];

//     return revisions.map(revision => ({
//       timestamp: revision.timestamp,
//       user: revision.user || 'Anonymous',
//       content: revision['*']
//     }));
//   } catch (error) {
//     console.error('Error fetching data:', error.message);
//     return [];
//   }
// }

// function highlightChanges(previousContent, currentContent) {
//   // ... (unchanged)
// }

// function saveRevisionsToFile(revisions, filename) {
//   const formattedRevisions = revisions.map((revision, index) => {
//     if (index > 0) {
//       const previousContent = revisions[index - 1].content;
//       revision.highlightedContent = highlightChanges(previousContent, revision.content);
//     }
//     return revision;
//   });

//   const data = JSON.stringify(formattedRevisions, null, 2);

//   fs.writeFile(filename, data, (err) => {
//     if (err) {
//       console.error('Error saving revisions to file:', err.message);
//     } else {
//       console.log(`Revisions saved to ${filename}`);
//     }
//   });
// }

// const articleTitle = 'Ship_of_Theseus';
// const startRevision = 351;
// const endRevision = 850;
// const outputFilename = 'ship_of_theseus_revisions.json';

// (async () => {
//   const revisions = await getArticleRevisions(articleTitle, startRevision, endRevision);
//   saveRevisionsToFile(revisions, outputFilename);
// })();
