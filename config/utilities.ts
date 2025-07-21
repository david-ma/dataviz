import fs from 'fs'
import path from 'path'

let gitHash: string = new Date().getTime().toString() // use the start up time as fallback if a proper git hash is unavailable
try {
  const rawGitHash = fs.readFileSync(
    path.resolve(__dirname, 'git-commit-version.txt'),
    'utf8',
  )
  gitHash = rawGitHash?.split('-')?.pop()?.trim() ?? ''
} catch (e) {}

export { gitHash }
