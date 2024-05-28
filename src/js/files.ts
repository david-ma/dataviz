console.log('files.ts')

import { d3, Chart, classifyName } from './chart'

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
    let extension = data.breadcrumbs[0].split('.').pop()

    const archiveExtensions = ['tar', 'gz', 'zip']
    if (
      archiveExtensions.includes(extension) &&
      data.breadcrumbs[0].split('.').length > 2
    ) {
      extension = data.breadcrumbs[0].split('.').slice(-2).join('.')
    }

    extension = extension.toLowerCase() || 'unknown'

    // Found a file
    const leaf: Leaf = {
      children: [],
      name: data.breadcrumbs[0],
      filesize: data.filesize,
      filetype: extension,
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

const CSVs = [
  'A22H3JVLT3.csv',
  'B2272MKLT3.csv',
  'CAGRF12711.csv',
  'CAGRF220610939.csv',
  'CAGRF23110233-9.csv',
  'CAGRF24010007.csv',
  'CAGRF24010125.csv',
  'CAGRF24010169-1.csv',
  'CAGRF24020097.csv',
  'CAGRF24020290.csv',
]

d3.select('#buttons')
  .selectAll('button')
  .data(CSVs)
  .enter()
  .append('button')
  .attr('id', (d) => d.split('.')[0])
  .text((d) => d.split('.')[0])
  .on('click', function (e, filename) {
    console.log('click', filename)

    d3.text(`/AGRF/${filename}`)
      .then((text) => {
        return d3.csvParseRows(text).map((row, i, acc: any[]) => {
          const [bytes, rsync, timestamp, path] = row
          return { bytes: parseInt(bytes), rsync, timestamp, path }
        })
      })
      .then((data) => {
        const hierarchy = {
          children: [],
          name: 'root',
          filesize: 0,
        }

        data.forEach(function ({ bytes, timestamp, path }) {
          files[path] = {
            filesize: bytes,
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
        let root = d3.hierarchy(hierarchy).sum((d: any) => d.filesize)
        const box = d3.select('#filestructure')

        if (root.children.length === 1) {
          root = root.children[0]
        }
        drawDirs(root, box)

        console.log('Test hierarchy', d3.hierarchy(hierarchy).depth)

        const myChart = new Chart({
          title: filename,
          element: 'treemap',
          // data: [files],
          margin: { top: 10, right: 10, bottom: 10, left: 10 },
          width: 600,
          height: 600,
        }).initTreemap({
          data: hierarchy,
          target: 'filesize',
          mouseover: (d) => {
            console.log('Mousing over!', d)
          },
          mouseout: (d) => {
            console.log('Mouse Out!', d)
          },
        })

        // Draw legend
        drawLegend(filetypes, myChart.color)
      })
  })

function drawDirs(
  hierarchy: d3.HierarchyNode<Branch>,
  selection: d3.Selection<d3.BaseType, unknown, HTMLElement, any>
) {
  // console.log(hierarchy)

  const details = selection.append('details').attr('open', () => {
    if (
      hierarchy.depth === 1 ||
      hierarchy.data.name === 'BarcodeLengths' ||
      hierarchy.data.name === 'secondary_analysis' ||
      hierarchy.data.name === 'contracts'
    ) {
      return 'open'
    }
    return null
  })
  // .attr('open', () => {
  //   return hierarchy.depth < 2 ? 'open' : null
  // })

  const summary = details.append('summary')
  summary
    .append('h4')
    .text(`>${hierarchy.data.name}`)
    .append('span')
    .classed('filesize', true)
    .text(filesizeLabel(hierarchy.value))

  const ul = details.append('ul')
  hierarchy.children
    .sort((a, b) => b.value - a.value)
    .forEach((child) => {
      if (child.children !== undefined && child.children.length > 0) {
        // If it's a folder
        // console.log('Drawing folder', child)
        const li = ul
          .insert('li', ':first-child')
          .attr('id', `directory-${classifyName(child.data.name)}`)
          .on('mouseover', function (e, d) {
            d3.select(`#folder-${classifyName(child.data.name)}`).classed(
              'mouseover',
              true
            )
          })
          .on('mouseout', function (e, d) {
            d3.select(`#folder-${classifyName(child.data.name)}`).classed(
              'mouseover',
              false
            )
          })
        drawDirs(child, li)
      } else {
        const li = ul.append('li').attr('class', 'file')
        li.html(
          `${child.data.name} <span class="filesize">${filesizeLabel(
            child.value
          )}</span>`
        )
      }
    })
}

function filesizeLabel(filesize: number, binary: boolean = true, tb = true) {
  if (binary) {
    if (tb && filesize > 1024 * 1024 * 1024 * 1024) {
      return `${d3.format('.2f')(filesize / (1024 * 1024 * 1024 * 1024))} TiB`
    } else if (filesize > 1024 * 1024 * 1024) {
      return `${d3.format('.2f')(filesize / (1024 * 1024 * 1024))} GiB`
    } else if (filesize > 1024 * 1024) {
      return `${d3.format('.2f')(filesize / (1024 * 1024))} MiB`
    } else {
      return `${d3.format('.2f')(filesize / 1024)} KiB`
    }
  }
  if (tb && filesize > 1000000000000) {
    return `${d3.format('.2f')(filesize / 1000000000000)} TB`
  } else if (filesize > 1000000000) {
    return `${d3.format('.2f')(filesize / 1000000000)} GB`
  } else if (filesize > 1000000) {
    return `${d3.format('.2f')(filesize / 1000000)} MB`
  } else {
    return `${d3.format('.2f')(filesize / 1000)} KB`
  }
}

function drawLegend(
  filetypes: {
    name: string
    count: number
    filesize: number
  }[],
  color: d3.ScaleOrdinal<string, any>
) {
  const mainFiletypes = [
    'fastq.gz',
    'bam',
    'bai',
    'vcf',
    'vcf.gz',
    'gvcf',
    'gvcf.gz',
    // 'bed', // bedgraph? bedpe? Is this a main one to keep?
  ]

  const [total, misc] = Object.values(filetypes).reduce(
    ([total, misc], file) => {
      total = {
        name: 'total',
        count: total.count + file.count,
        filesize: total.filesize + file.filesize,
      }
      if (!mainFiletypes.includes(file.name)) {
        misc = {
          name: 'misc files (no: ' + mainFiletypes.join(', ') + ')',
          count: misc.count + file.count,
          filesize: misc.filesize + file.filesize,
        }
      }
      return [total, misc]
    },
    [
      {
        name: 'total',
        count: 0,
        filesize: 0,
      },
      {
        name: 'misc files (no: ' + mainFiletypes.join(', ') + ')',
        count: 0,
        filesize: 0,
      },
    ]
  )

  d3.select('#legend table tbody')
    .selectAll('tr')
    .data(
      [
        total,
        misc,
        ...Object.values(filetypes).sort(
          (a: any, b: any) => b.filesize - a.filesize
        ),
      ],
      (d: any) => d.name
    )
    // .join(
    //   function(enter) {
    //     return enter.html((d: any) => {
    //       console.log("writing tr", d.name)
    //       const filesizeMB = d3.format('.2f')(d.filesize / 1048576)
    //       const filesizeGB = d3.format('.2f')(d.filesize / 1073741824)
    //       if (d.filesize / 1073741824 > 1) {
    //         return `<td>${d.name}</td><td>${d.count}</td><td>${filesizeGB} gb</td>`
    //       } else {
    //         return `<td>${d.name}</td><td>${d.count}</td><td>${filesizeMB} mb</td>`
    //       }
    //     })
    //   },
    //   function(update) {
    //     return update
    //   },
    //   function(exit){
    //     return exit
    //   }

    // )
    .enter()
    .append('tr')
    .html((d: any) => {
      let thisColor = color(d.name)
      if (d.name === 'total' || d.name.includes('misc files')) {
        thisColor = 'transparent'
      }

      return `<td style="background-color:${thisColor}"></td><td>${
        d.name
      }</td><td>${d.count}</td><td>${filesizeLabel(d.filesize)}</td>`
    })
  // .update()
}

const allFiles = {}

Promise.all(
  CSVs.map((filename) =>
    d3
      .text(`/AGRF/${filename}`)
      .then((text) => {
        return d3.csvParseRows(text).map((row, i, acc: any[]) => {
          const [bytes, rsync, timestamp, path] = row
          return { bytes: parseInt(bytes), rsync, timestamp, path }
        })
      })
      .then((data) => {
        const hierarchy = {
          children: [],
          name: 'root',
          filesize: 0,
        }

        data.forEach(function ({ bytes, timestamp, path }) {
          files[path] = {
            filesize: bytes,
            timestamp,
            path,
          }

          hierarchyInsert(hierarchy, {
            ...files[path],
            breadcrumbs: path.split('/'),
          })
        })

        let root = d3.hierarchy(hierarchy).sum((d: any) => d.filesize)
        return [root, filetypes]
      })
  )
).then((results) => {
  results.forEach(([root, filetypes]: [any, any], i) => {
    console.log(CSVs[i], filesizeLabel(root.value, false, false))
    allFiles[CSVs[i]] = {
      root,
      filesize: root.value,
      hr: filesizeLabel(root.value),
      filetypes,
    }
  })
  console.log('All files', allFiles)
})

// CSVs.forEach((filename) => {
//   // const filename = 'A22H3JVLT3.csv'
//   // $('#A22H3JVLT3').trigger('click')

//   d3.text(`/AGRF/${filename}`)
//     .then((text) => {
//       return d3.csvParseRows(text).map((row, i, acc: any[]) => {
//         const [bytes, rsync, timestamp, path] = row
//         return { bytes: parseInt(bytes), rsync, timestamp, path }
//       })
//     })
//     .then((data) => {
//       const hierarchy = {
//         children: [],
//         name: 'root',
//         filesize: 0,
//       }

//       data.forEach(function ({ bytes, timestamp, path }) {
//         files[path] = {
//           filesize: bytes,
//           timestamp,
//           path,
//         }

//         hierarchyInsert(hierarchy, {
//           ...files[path],
//           breadcrumbs: path.split('/'),
//         })
//       })
//       return [hierarchy, filetypes]
//     })
//     .then(([hierarchy, filetypes]: [Branch, any]) => {
//       let root = d3.hierarchy(hierarchy).sum((d: any) => d.filesize)

//       console.log('Folder data', root.value)
//     })
// })

// Wait
// setTimeout(() => {
// $('#CAGRF12711').trigger('click')
// $('#CAGRF12711').trigger('click')
// }, 100)
