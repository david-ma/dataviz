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
  .text((d) => d)
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
        console.log(files)
        console.log('Hierarchy', hierarchy)
        console.log('Filetypes', filetypes)

        // Draw legend
        drawLegend(filetypes)

        drawDirs(hierarchy, d3.select('#filestructure'))
        console.log('Test hierarchy', d3.hierarchy(hierarchy).depth)

        new Chart({
          title: filename,
          element: 'treemap',
          // data: [files],
          margin: { top: 10, right: 10, bottom: 10, left: 10 },
          width: 800,
          height: 400,
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
      })
  })

function drawDirs(hierarchy, selection) {
  // console.log(hierarchy)

  const details = selection.append('details').attr('open', true)
  const summary = details.append('summary')
  summary.append('h3').text(hierarchy.name)
  summary
    .append('p')
    .text(`Filesize: ${d3.format('.2f')(hierarchy.filesize / 1048576)} mb`)

  const ul = details.append('ul')
  hierarchy.children.forEach((child) => {
    const li = ul.append('li')
    if (child.children !== undefined && child.children.length > 0) {
      drawDirs(child, li)
    } else {
      if (child.filesize > 1073741824) {
        li.text(
          `${child.name} (${d3.format('.2f')(child.filesize / 1073741824)} gb)`
        )
      } else if (child.filesize > 1048576) {
        li.text(
          `${child.name} (${d3.format('.2f')(child.filesize / 1048576)} mb)`
        )
      } else if (child.filesize > 1024024) {
        li.text(
          `${child.name} (${d3.format('.2f')(child.filesize / 1024024)} mb)`
        )
      } else {
        li.text(`${child.name} (${d3.format('.2f')(child.filesize / 1024)} kb)`)
      }
    }
  })
}

function drawLegend(
  filetypes: {
    name: string
    count: number
    filesize: number
  }[]
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
      console.log('writing tr', d.name)
      const filesizeMB = d3.format('.2f')(d.filesize / 1048576)
      const filesizeGB = d3.format('.2f')(d.filesize / 1073741824)
      if (d.filesize / 1073741824 > 1) {
        return `<td>${d.name}</td><td>${d.count}</td><td>${filesizeGB} gb</td>`
      } else {
        return `<td>${d.name}</td><td>${d.count}</td><td>${filesizeMB} mb</td>`
      }
    })
  // .update()
}
