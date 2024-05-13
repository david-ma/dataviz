console.log('files.ts')

import { d3, Chart } from './chart'

type Branch = {
  children: (Leaf | Branch)[]
  name: string
  filesize: number
}

type Leaf = {
  name: string
  filesize: number
  filetype: string
  children: Branch[]
}

const files = {}
const root: Branch = {
  children: [],
  name: 'root',
  filesize: 0,
}

const filetypes = {}

// class Hierarchy {
//   children: (Node | Branch)[]
//   name: string
//   tally: number
//   tallyLabel?: string

//   constructor() {
//     this.children = []
//     this.name = 'root'
//     this.tally = 0
//   }

//   addData(branch: Branch,
//     data: { name: string; filesize: number }) {
//     this.children.push(data)
//     this.tally += data.filesize
//   }
// }

/**
 * Take a row and insert it into a d3 hierarchy at the appropriate place
 */
function hierarchyInsert(
  hierarchy: Branch,
  data: {
    filesize: number
    timestamp: string
    path: string
    breadcrumbs: string[]
  }
) {
  // console.log("Processing", data.path)
  if (data.breadcrumbs.length === 2 && data.breadcrumbs[1] === '') {
    // Found a Folder
    hierarchy.children.push({
      children: [],
      name: data.breadcrumbs[0],
      filesize: data.filesize,
    })
  } else if (data.breadcrumbs.length > 1) {
    // Go deeper
    const nextLevel = hierarchy.children.find(
      (d) => 'children' in d && d.name === data.breadcrumbs[0]
    )
    if ('children' in nextLevel) {
      hierarchyInsert(nextLevel, {
        ...data,
        breadcrumbs: data.breadcrumbs.slice(1),
      })
      // nextLevel.filesize += data.filesize
    } else {
      console.error('Node with no children? Folder with same name as a file?')
    }
  } else {
    if (data.filesize < 10485760) return

    // Found a file
    const leaf: Leaf = {
      children: [],
      name: data.breadcrumbs[0],
      filesize: data.filesize,
      filetype: data.breadcrumbs[0].split('.').pop(),
    }

    const filetype = (filetypes[leaf.filetype] = filetypes[leaf.filetype] || {
      name: leaf.filetype,
      list: [],
      count: 0,
      filesize: 0,
    })

    filetype.count += 1
    filetype.filesize += leaf.filesize
    filetype.list.push(leaf)

    hierarchy.children.push(leaf)
  }
}

// d3.csv('/filesizes.txt')
d3.csv('/file_audit.csv')
  .then((data) => {
    console.log(data)

    const hierarchy = {
      children: [],
      name: 'root',
      filesize: 0,
    }

    data.forEach(function ({ bytes, timestamp, path }) {
      files[path] = {
        filesize: parseInt(bytes),
        // filesize,
        timestamp,
        path,
      }

      hierarchyInsert(hierarchy, {
        ...files[path],
        breadcrumbs: path.split('/'),
      })
    })
    return [hierarchy, filetypes]
  })
  .then(([hierarchy, filetypes]: [Branch, any]) => {
    console.log(files)
    console.log('Hierarchy', hierarchy)
    console.log('Filetypes', filetypes)

    // Draw legend
    drawLegend(filetypes)

    drawDirs(hierarchy, d3.select('#filestructure'))
    console.log('Test hierarchy', d3.hierarchy(hierarchy).depth)

    new Chart({
      element: 'treemap',
      // data: [files],
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      width: 800,
      height: 400,
    }).initTreemap({
      data: hierarchy,
      target: 'filesize',
    })
  })

function drawDirs(hierarchy, selection) {
  const details = selection.append('details').attr('open', true)
  details.append('summary').text(hierarchy.name)
  const ul = details.append('ul')
  hierarchy.children.forEach((child) => {
    const li = ul.append('li')
    if (child.children !== undefined) {
      drawDirs(child, li)
    } else {
      // li.text(child.name)
      li.text(`${child.name} (${Math.floor(child.filesize / 1024)} kb)`)
    }
  })
}

function drawLegend(filetypes) {
  // filetypes = filetypes.sort((a, b) => b.filesize - a.filesize)

  // const filesizeMB = d3.format(".2f")(d.filesize / 1048576);

  d3.select('#legend table tbody')
    .selectAll('tr')
    .data(
      Object.values(filetypes).sort((a: any, b: any) => b.filesize - a.filesize)
    )
    .enter()
    .append('tr')
    .html((d: any) => {
      const filesizeMB = d3.format('.2f')(d.filesize / 1048576)
      return `<td>${d.name}</td><td>${d.count}</td><td>${filesizeMB} mb</td>`
    })
}
