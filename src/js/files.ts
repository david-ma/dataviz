console.log('files.ts')

import { d3, Chart } from './chart'

type Branch = {
  children: (Node | Branch)[]
  name: string
  filesize: number
}

type Node = {
  name: string
  filesize: number
}

const files = {}
const root: Branch = {
  children: [],
  name: 'root',
  filesize: 0,
}



d3.csv('/filesizes.txt')
  .then((data) => {
    console.log(data)

    data.forEach(function (row) {
      Object.values(row).forEach(function (string) {
        if (string.length === 0) return
        if (string.includes('total size is')) return
        if (string.includes('bytes/sec')) return

        const [permissions, filesize, timestamp, path] = string.split(' ')
        files[path] = {
          permissions,
          filesize,
          timestamp,
          path,
        }
        const pathParts = path.split('/')
        console.log('pathParts', pathParts)
        const last = pathParts.pop()
        if (last === '') {
          // files[path].filesize = 0

          // This is a folder
          root.children.push({
            children: [],
            name: pathParts.pop(),
            filesize: 0,
          })
        } else {
          // This is a file
          // const parent = pathParts.pop()
          // const branch = root.children.find((d) => d.name === parent)
          // branch.children.push({
          //   name: last,
          //   filesize,
          // })
          // branch.filesize += filesize
        }
      })
    })
  })
  .then(() => {
    console.log(files)

    new Chart({
      element: 'treemap',
      data: [files],
      width: 600,
      height: 800,
    })
    // .initTreemap({
    //   root,
    //   "asdf"}
    // )
  })
