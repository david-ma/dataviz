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

/**
 * Take a row and insert it into a d3 hierarchy at the appropriate place
 */
function hierarchyInsert(
  hierarchy: Branch,
  data: {
    permissions: string
    filesize: number
    timestamp: string
    path: string
    breadcrumbs: string[]
  }
) {
  if (data.breadcrumbs.length === 2 && data.breadcrumbs[1] === '') {
    hierarchy.children.push({
      children: [],
      name: data.breadcrumbs[0],
      filesize: data.filesize,
    })
  } else if (data.breadcrumbs.length > 1) {
    const nextLevel = hierarchy.children.find(
      (d) => 'children' in d && d.name === data.breadcrumbs[0]
    )
    if ('children' in nextLevel) {
      hierarchyInsert(nextLevel, {
        ...data,
        breadcrumbs: data.breadcrumbs.slice(1),
      })
      nextLevel.filesize += data.filesize
    } else {
      console.error('Node with no children? Folder with same name as a file?')
    }
  } else {
    hierarchy.children.push({
      name: data.breadcrumbs[0],
      filesize: data.filesize,
    })
  }
}

d3.csv('/filesizes.txt')
  .then((data) => {
    console.log(data)

    const hierarchy = {
      children: [],
      name: 'root',
      filesize: 0,
    }

    data.forEach(function (row) {
      Object.values(row).forEach(function (string) {
        if (string.length === 0) return
        if (string.includes('total size is')) return
        if (string.includes('bytes/sec')) return

        const [permissions, filesizeString, timestamp, path] = string.split(' ')
        files[path] = {
          permissions,
          filesize: parseInt(filesizeString),
          timestamp,
          path,
        }

        hierarchyInsert(hierarchy, {
          ...files[path],
          breadcrumbs: path.split('/'),
        })
        hierarchy.filesize += files[path].filesize
      })
    })
    return hierarchy
  })
  .then((hierarchy) => {
    console.log(files)
    console.log(hierarchy)

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
