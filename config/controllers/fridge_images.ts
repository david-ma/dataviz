import path from 'path'
import fs from 'fs'

export const fridgeImagesController = function (res: any, req: any, db: any) {
  const basePath = path.resolve(__dirname, '..', 'data', 'fridge')
  const requiredDirs = ['az_images', 'ruby_images', 'renee_images'] as const

  const missingDir = requiredDirs.find(
    (dir) => !fs.existsSync(path.resolve(basePath, dir)),
  )

  if (missingDir) {
    res.end('No images')
    return
  }

  const filter = ['.DS_Store', '.gitignore', 'david.png', 'grace.png', 'index.html', 'printed']

  Promise.all([
    fs.promises.readdir(path.resolve(basePath, 'az_images')),
    fs.promises.readdir(path.resolve(basePath, 'ruby_images')),
    fs.promises.readdir(path.resolve(basePath, 'renee_images')),
  ]).then(function ([az, ruby, renee]) {
    const images = az
      .filter((d) => filter.indexOf(d) === -1)
      .map((d) => 'az_images/' + d)
      .concat(ruby.filter((d) => filter.indexOf(d) === -1).map((d) => 'ruby_images/' + d))
      .concat(renee.filter((d) => filter.indexOf(d) === -1).map((d) => 'renee_images/' + d))

    res.end(JSON.stringify(images))
  })
}

