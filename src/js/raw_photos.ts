// // Compare two folders, and see what is backed up and what isn't
console.log('hello from raw_photos.ts')

type FolderAnalysis = {
  folderName: string
  numberOfFiles: number
  files: {
    [filetype: string]: number
  }
  totalSize: number
  oldestFile: {
    filename: string
    timestamp: Date
  } | null
  newestFile: {
    filename: string
    timestamp: Date
  } | null
}

// Load JSON files:
Promise.all([d3.json('/backups/photos_macbook.json'), d3.json('/backups/photos_server.json')])
  .then(([macbook, server]: [FolderAnalysis[], FolderAnalysis[]]) => {
    console.log(macbook)
    console.log(server)

    // compare them
    for (const folder of server) {
      const macbookFolder = macbook.find((s) => s.folderName === folder.folderName)
      if (!macbookFolder) {
        console.log(folder.folderName, 'not found on server')
        continue
      }

      if (folder.numberOfFiles !== macbookFolder.numberOfFiles) {
        console.log(folder.folderName, 'number of files mismatch', folder.numberOfFiles, macbookFolder.numberOfFiles)
      }
      if (folder.totalSize !== macbookFolder.totalSize) {
        console.log(folder.folderName, 'total size mismatch', folder.totalSize, macbookFolder.totalSize)
      }
      if (folder.oldestFile?.filename !== macbookFolder.oldestFile?.filename) {
        console.log(
          folder.folderName,
          'oldest file mismatch',
          folder.oldestFile?.filename,
          macbookFolder.oldestFile?.filename,
        )
      }
      if (folder.newestFile?.filename !== macbookFolder.newestFile?.filename) {
        console.log(
          folder.folderName,
          'newest file mismatch',
          folder.newestFile?.filename,
          macbookFolder.newestFile?.filename,
        )
      }
      for (const filetype in folder.files) {
        if (folder.files[filetype] !== macbookFolder.files[filetype]) {
          console.log(
            folder.folderName,
            'filetype mismatch',
            filetype,
            folder.files[filetype],
            macbookFolder.files[filetype],
          )
        }
      }
    }
    return [macbook, server]
  })
  .then(([macbook, server]) => {
    d3.select('table#raw_photos_table tbody')
      .selectAll('tr')
      .data(macbook)
      .enter()
      .append('tr')
      .html(function (d) {
        return `<td>${d.folderName}</td><td>${d.numberOfFiles}</td><td>${d.totalSize}<br>${human_readable_size(d.totalSize)}</td><td>${d.oldestFile?.filename}<br>${d.oldestFile?.timestamp}</td><td>${d.newestFile?.filename}<br>${d.newestFile?.timestamp}</td>`
      })
  })

function human_readable_size(size: number) {
  size = parseInt(size.toString())
  if (size < 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}
