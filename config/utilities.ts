import fs from 'fs'
import path from 'path'

let gitHash: string = new Date().getTime().toString() // use the start up time as fallback if a proper git hash is unavailable
try {
  const rawGitHash = fs.readFileSync(
    path.resolve(import.meta.dirname, 'git-commit-version.txt'),
    'utf8',
  )
  gitHash = rawGitHash.split('-').pop().trim()
} catch (e) {}

// Asynchronous for each, doing a limited number of things at a time.
async function asyncForEach(
  array: any[],
  limit: number,
  callback: (item: any, index: number, array: any[]) => void,
) {
  let i: number = 0

  for (; i < limit; i++) {
    doNextThing(i)
  }

  function doNextThing(index: number) {
    if (array[index]) {
      callback(array[index], index, array, function done() {
        doNextThing(i++)
      })
    }
  }

  return 1
}

export { gitHash, asyncForEach }
