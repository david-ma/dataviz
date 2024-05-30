console.log('files.ts')

import { d3, Chart, classifyName } from './chart'

type Filestatus = 'keep' | 'delete' | 'mixed'

// type Branch = {
//   children: (Leaf | Branch)[]
//   name: string
//   filetype: string
//   filestatus: Filestatus
//   path: string
//   filesize: number
// }

// type Leaf = {
//   name: string
//   filesize: number
//   filetype: string
//   filestatus: Filestatus
//   path: string
//   children: Branch[]
// }

type File = {
  filesize: number
  timestamp: string
  path: string
}

const files: {
  [path: string]: File
} = {}

const filetypes: {
  [filetype: string]: {
    name: string
    list: FileNode[]
    count: number
    filesize: number
  }
} = {}

/**
 * Take a row and insert it into a d3 hierarchy at the appropriate place
 */
// function hierarchyInsert(
//   hierarchy: Branch,
//   data: {
//     filesize: number
//     timestamp: string
//     path: string
//     breadcrumbs: string[]
//   }
// ) {
//   // console.log("Processing", data.path)
//   if (data.breadcrumbs.length === 2 && data.breadcrumbs[1] === '') {
//     // Found a Folder
//     hierarchy.children.push({
//       children: new Array<Leaf>(),
//       name: data.breadcrumbs[0],
//       path: data.path,
//       filetype: 'folder',
//       filesize: data.filesize,
//       filestatus: null,
//     })
//   } else if (data.breadcrumbs.length > 1) {
//     // Go deeper
//     const nextLevel = hierarchy.children.find(
//       (d) => 'children' in d && d.name === data.breadcrumbs[0]
//     )
//     if ('children' in nextLevel) {
//       hierarchyInsert(nextLevel, {
//         ...data,
//         breadcrumbs: data.breadcrumbs.slice(1),
//       })
//       // nextLevel.filesize += data.filesize
//     } else {
//       console.error('Node with no children? Folder with same name as a file?')
//     }
//   } else {
//     let extension = data.breadcrumbs[0].split('.').pop()

//     if (data.breadcrumbs[0].indexOf('.') === -1) {
//       extension = 'unknown'
//     } else {
//       const archiveExtensions = ['tar', 'gz', 'zip', 'txt']
//       // const archiveExtensions = ['gz']
//       if (
//         archiveExtensions.includes(extension) &&
//         data.breadcrumbs[0].split('.').length > 2
//       ) {
//         extension = data.breadcrumbs[0].split('.').slice(-2).join('.')
//       }

//       extension = extension.toLowerCase() || 'unknown'
//     }

//     // Found a file
//     const leaf: Leaf = {
//       children: [],
//       name: data.breadcrumbs[0],
//       filesize: data.filesize,
//       path: data.path,
//       filetype: extension,
//       filestatus: null,
//     }

//     const filetype = (filetypes[leaf.filetype] = filetypes[leaf.filetype] || {
//       name: leaf.filetype,
//       list: [],
//       count: 0,
//       filesize: 0,
//     })

//     filetype.count += 1
//     filetype.filesize += leaf.filesize
//     filetype.list.push(leaf)

//     hierarchy.children.push(leaf)
//   }
// }

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
  'CAGRF12711-4.csv',
]

type FileNode = {
  filesize: number
  rsync: string
  timestamp: string
  path: string
  name: string
  filetype: string
  filestatus: Filestatus
  // data?: FileNode
}

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
      .then((fileBody: string): FileNode[] =>
        d3.csvParseRows(fileBody).map((row) => {
          const [bytes, rsync, timestamp, ...rest] = row
          const path = rest.join()
          const parts = path.split('/')
          const name = parts.pop() || parts.pop()
          const filetype = name.split('.').pop()

          const node: FileNode = {
            filesize: parseInt(bytes),
            rsync,
            timestamp,
            path,
            name,
            filetype,
            filestatus: null,
          }

          const filerecord = (filetypes[node.filetype] = filetypes[
            node.filetype
          ] || {
            name: node.filetype,
            list: [],
            count: 0,
            filesize: 0,
          })

          filerecord.count += 1
          filerecord.filesize += node.filesize
          filerecord.list.push(node)

          return node
        })
      )
      .then(d3.stratify<FileNode>().path((d) => d.path))
      .then((root: d3.HierarchyNode<FileNode>) => {
        root.sum((d) => d.filesize)

        const box = d3.select('#filestructure')
        drawDirs(root, box)

        // console.log('Test hierarchy', d3.hierarchy(hierarchy).depth)

        const myChart = new Chart({
          title: filename,
          element: 'treemap',
          // data: [files],
          margin: { top: 10, right: 10, bottom: 10, left: 10 },
          width: 600,
          height: 600,
        }).initTreemap({
          data: root,
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
  hierarchy: d3.HierarchyNode<FileNode>,
  selection: d3.Selection<d3.BaseType, unknown, HTMLElement, any>
) {
  const details = selection.append('details').attr('open', () => {
    if (
      hierarchy.depth === 0 ||
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

  const summary = details.append('summary').append('h4').classed('folder', true)
    .html(`<span class="foldername">${hierarchy.data.name}</span>
<span class="fileStatus">${showFileStatus(hierarchy)}</span>
<span class="filesize">${filesizeLabel(hierarchy.value)}</span>`)

  const ul = details.append('ul')
  hierarchy.children
    .sort((a, b) => {
      let first = a.value,
        second = b.value
      if (a.data.filetype === 'folder') {
        first = -first
      }
      if (b.data.filetype === 'folder') {
        second = -second
      }

      return second - first
    })
    .forEach((child) => {
      // Force child branch here
      // if (child.data === undefined) {

      // TODO: Empty folders should not appear as leaves?
      if (child.children !== undefined && child.children.length > 0) {
        // if (child.data.filetype === 'folder') {
        // If it's a folder / branch
        // console.log('Drawing folder', child)
        const li = ul
          .insert('li', ':first-child')
          .attr('id', `directory-${classifyName(child.data.name)}`)
          .on('mouseover', function (e, d) {
            // stop propogate
            e.stopPropagation()
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
        // We know it must be a leaf here.
        // const leafChild = child as d3.HierarchyNode<FileNode>
        const leafChild = child

        const li = ul.append('li').classed('file', true)
          .html(`<span class="filename">${leafChild.data.name}</span>
<span class="fileStatus">${showFileStatus(leafChild)}</span>
<span class="filesize">${filesizeLabel(child.value)}</span>`)
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
    [filetype: string]: {
      name: string
      list: FileNode[]
      count: number
      filesize: number
    }
  },
  color: d3.ScaleOrdinal<string, any>
) {
  const mainFiletypes = [
    'fastq.gz',
    'bam',
    'bai',
    'vcf',
    'vcf.gz',
    'hist.txt',
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

// Feature flag, experimental stuff?
if (false) {
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
            path: '',
            filetype: 'folder',
            filesize: 0,
            filestatus: null,
          }

          data.forEach(function ({ bytes, timestamp, path }) {
            files[path] = {
              filesize: bytes,
              timestamp,
              path,
            }

            // hierarchyInsert(hierarchy, {
            //   ...files[path],
            //   breadcrumbs: path.split('/'),
            // })
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
}

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
// $('#CAGRF220610939').trigger('click')
// }, 100)
const hash = window.location.hash
if (CSVs.map((d) => d.split('.')[0]).indexOf(hash)) {
  $(hash).trigger('click')
}

// if (hash === '#home') {
//   console.log('#home selected, trying to process file_audit_full.csv')
//   d3.text(`/AGRF/file_audit_full.csv`)
//     .then((text) => {
//       return d3.csvParseRows(text).map((row, i, acc: any[]) => {
//         const [bytes, timestamp, ...path] = row
//         return { bytes: parseInt(bytes), timestamp, path: path.join() }
//       })
//     })
//     .then((data) => {
//       console.log('CSV read', data)
//       console.log('Now trying to build a hierarchy')
//       const hierarchy = {
//         children: [],
//         name: 'root',
//         path: '',
//         filetype: 'folder',
//         filesize: 0,
//         filestatus: null,
//       }

//       data.forEach(function ({ bytes, timestamp, path }) {
//         files[path] = {
//           filesize: bytes,
//           timestamp,
//           path,
//         }

//         // hierarchyInsert(hierarchy, {
//         //   ...files[path],
//         //   breadcrumbs: path.split('/'),
//         // })
//       })
//       return [hierarchy, filetypes]
//     })
//     .then(([hierarchy, filetypes]: [Branch, any]) => {
//       console.log('Here is the hierarchy', hierarchy)
//       console.log(
//         'There are this many filetypes:',
//         Object.entries(filetypes).length
//       )
//       console.log('Filetypes', filetypes)

//       let root = d3.hierarchy(hierarchy).sum((d: any) => d.filesize)
//       const box = d3.select('#filestructure')

//       let shallow = getShallowHierarchy(root, 3)

//       drawDirs(shallow, box)

//       // console.log('Test hierarchy', d3.hierarchy(hierarchy).depth)

//       // const myChart = new Chart({
//       //   title: "All my files",
//       //   element: 'treemap',
//       //   // data: [files],
//       //   margin: { top: 10, right: 10, bottom: 10, left: 10 },
//       //   width: 600,
//       //   height: 600,
//       // }).initTreemap({
//       //   data: hierarchy,
//       //   target: 'filesize',
//       //   mouseover: (d) => {
//       //     console.log('Mousing over!', d)
//       //   },
//       //   mouseout: (d) => {
//       //     console.log('Mouse Out!', d)
//       //   },
//       // })

//       // Draw legend
//       // drawLegend(filetypes, d3.scaleOrdinal(d3.schemeCategory10))
//     })
// }

// function getShallowHierarchy(
//   hierarchy: d3.HierarchyNode<FileNode>,
//   depth: number
// ) {
//   if (!hierarchy.data.children || hierarchy.data.children.length === 0) {
//     return this
//   } else if (hierarchy.depth === depth) {
//     // const filesize = hierarchy.data.children.reduce((acc, child) => acc + child.data.filesize, 0)
//     // return {
//     //   name: hierarchy.data.name,
//     //   filesize: filesize,
//     //   children: [],
//     // }
//   } else {
//     return {
//       ...hierarchy,
//       children: hierarchy.data.children.map((child) =>
//         getShallowHierarchy(child, depth)
//       ),
//     }
//   }
// }

const filefilter = {
  secondary_analysis: [
    /secondary_analysis\/Results.*/,
    /secondary_analysis\/Intermediate.*/,
    /secondary_analysis\/commands.*.txt$/,
    /secondary_analysis\/parameters.*.txt$/,
  ],
}

// DATA_TYPE_TAG_MAPPING_NESTED = {
//   "fastq": ["*.fastq.gz"],
//   "bam": ["*.bam"],
//   "vcf": ["*.gvcf.gz", "*.vcf.gz"],
//   "lab-records": ["commands*.txt", "parameters*.txt"],
//   "auxiliary": ["*.md5", "*.sha1"],
// }
// const data_type_tags = {
//   fastq: ['*.fastq.gz'],
//   bam: ['*.bam'],
//   vcf: ['*.gvcf.gz', '*.vcf.gz'],
//   'lab-records': ['commands*.txt', 'parameters*.txt'],
//   auxiliary: ['*.md5', '*.sha1'],
// }

/**
 * Determine if we should keep or delete a file
 * Return it's tags if it should be tagged
 */
function showFileStatus(node: d3.HierarchyNode<FileNode>) {
  const status = node.data.filestatus || getFileStatus(node)
  const fileflag = {
    keep: '<span class="status green">Keep</span>',
    delete: '<span class="status red">Delete</span>',
    mixed: '<span class="status yellow">Mixed</span>',
  }
  return fileflag[status]
}

function getFileStatus(node: d3.HierarchyNode<FileNode>) {
  const data = node.data
  if (!data.filestatus) {
    if (data.filetype === 'folder') {
      const childStatuses = node.children.map((child) => getFileStatus(child))
      const uniqueStatuses = [...new Set(childStatuses)]
      if (childStatuses.length === 0) {
        data.filestatus = 'delete'
      } else if (uniqueStatuses.length === 1) {
        data.filestatus = uniqueStatuses[0]
        // console.log('Setting', data.path, data.filestatus)
      } else {
        data.filestatus = 'mixed'
      }
    } else {
      data.filestatus = 'keep'
      Object.entries(filefilter).forEach(([foldername, patterns]) => {
        if (data.path.includes(foldername)) {
          const match = patterns.find((pattern) => pattern.test(data.path))
          if (!match) {
            data.filestatus = 'delete'
          }
        }
      })
    }
  }

  return data.filestatus
}
