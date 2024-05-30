console.log('files.ts')

import { d3, Chart, classifyName } from './chart'

type Filestatus = 'keep' | 'delete' | 'mixed'

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
  rsync?: string
  timestamp: string
  path: string
  name: string
  filetype: string
  filestatus: Filestatus
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
          let filetype = name.split('.').pop()

          if (path.slice(-1) === '/') {
            filetype = 'folder'
          } else {
            const doubleExtensions = [
              'tar',
              'gz',
              'zip',
              'txt',
              'bai',
              'out',
              'err',
              'log',
            ]
            if (doubleExtensions.indexOf(filetype) !== -1) {
              const archiveParts = name.split('.')
              if (archiveParts.length > 2) {
                filetype = archiveParts.slice(-2).join('.')
              }
            }
          }

          const node: FileNode = {
            filesize: parseInt(bytes),
            rsync,
            timestamp,
            path,
            name,
            filetype,
            filestatus: null,
          }

          return recordFile(node)
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
  if (!hierarchy.data) {
    console.log('Error, no data on this node', hierarchy)
    return
  }
  const data = hierarchy.data || {
    name: 'unknown',
    filestatus: 'delete',
  }
  const details = selection.append('details').attr('open', () => {
    if (
      hierarchy.depth === 0 ||
      data.name === 'BarcodeLengths' ||
      data.name === 'secondary_analysis' ||
      data.name === 'contracts'
    ) {
      return 'open'
    }
    return null
  })
  // .attr('open', () => {
  //   return hierarchy.depth < 2 ? 'open' : null
  // })

  const summary = details.append('summary').append('h4').classed('folder', true)
    .html(`<span class="foldername">${data.name}</span>
<span class="fileStatus">${showFileStatus(hierarchy)}</span>
<span class="filesize">${filesizeLabel(hierarchy.value)}</span>`)

  const ul = details.append('ul')
  hierarchy.children
    .sort((a, b) => {
      let first = a.value,
        second = b.value
      if (a.data && a.data.filetype === 'folder') {
        first = -first
      }
      if (b.data && b.data.filetype === 'folder') {
        second = -second
      }

      return second - first
    })
    .forEach((child) => {
      // Force child branch here
      // if (child.data === undefined) {

      // TODO: Empty folders should not appear as leaves?
      if (child.children !== undefined && child.children.length > 0) {
        const childData = child.data || {
          name: 'unknown',
          filestatus: 'delete',
        }

        const li = ul
          .insert('li', ':first-child')
          .attr('id', `directory-${classifyName(childData.name)}`)
          .on('mouseover', function (e, d) {
            // stop propogate
            e.stopPropagation()
            d3.select(`#folder-${classifyName(childData.name)}`).classed(
              'mouseover',
              true
            )
          })
          .on('mouseout', function (e, d) {
            d3.select(`#folder-${classifyName(childData.name)}`).classed(
              'mouseover',
              false
            )
          })
        drawDirs(child, li)
      } else {
        // We know it must be a leaf here.
        // const leafChild = child as d3.HierarchyNode<FileNode>
        const leafChild = child
        if (!leafChild.data) {
          console.log('Error, no data on this leaf node', hierarchy)
          return
        }

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
          name: 'misc files (not including: ' + mainFiletypes.join(', ') + ')',
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
        name: 'misc files (not including: ' + mainFiletypes.join(', ') + ')',
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

function recordFile(file: FileNode) {
  const filerecord = (filetypes[file.filetype] = filetypes[file.filetype] || {
    name: file.filetype,
    list: [],
    count: 0,
    filesize: 0,
  })

  filerecord.count += 1
  filerecord.filesize += file.filesize
  filerecord.list.push(file)
  return file
}

if (hash === '#home') {
  console.log('#home selected, trying to process file_audit_full.csv')
  d3.text(`/AGRF/file_audit_full.csv`)
    .then((fileBody: string): FileNode[] =>
      d3
        .csvParseRows(fileBody)
        .map((row, i, acc: any[]) => {
          const [bytes, timestamp, ...rest] = row

          const filesize = parseInt(bytes)
          const path = rest.join()
          const parts = path.split('/')
          const name = parts.pop() || parts.pop()
          let filetype = 'unknown'

          if (path.slice(-1) === '/') {
            filetype = 'folder'
          } else if (name.indexOf('.') !== -1) {
            filetype = name.split('.').pop().toLowerCase()
          }

          if (
            parts.length > 8 ||
            path.length > 512 ||
            (filetype !== 'folder' && filesize < 1024 * 1024 * 50) || // 50mb filesize cuts off the raw photos
            path.indexOf('node_modules') !== -1 ||
            path.indexOf('bower_components') !== -1 ||
            path.indexOf('/.') !== -1 ||
            path.indexOf('AppData') !== -1 ||
            path.indexOf('Media/Games') !== -1 ||
            path.indexOf('Cache') !== -1 ||
            path.indexOf('Frameworks') !== -1 ||
            path.indexOf('Contents') !== -1 ||
            path.indexOf('/lib/') !== -1 ||
            path.indexOf('plugins/') !== -1 ||
            path.indexOf('.lrdata/') !== -1 ||
            path.indexOf('/.git/') !== -1 ||
            path.indexOf('/.metadata/') !== -1 ||
            path.indexOf('/common/') !== -1 ||
            path.indexOf('/.retroarch/') !== -1 ||
            path.indexOf('/iPhoto Library/Masters/') !== -1 ||
            path.indexOf('/.meteor/') !== -1 ||
            path.indexOf('/src/') !== -1 ||
            path.indexOf('/iPhoto Library/Database') !== -1
          ) {
            // console.log('Rejecting', path)
            return null
          } else {
            const node: FileNode = {
              filesize,
              timestamp,
              path,
              name,
              filetype,
              filestatus: 'keep',
            }

            return recordFile(node)
          }
        })
        .filter((d) => d !== null)
    )
    .then(d3.stratify<FileNode>().path((d) => d.path))
    .then((root: d3.HierarchyNode<FileNode>) => {
      console.log('Here is the hierarchy', root)
      console.log(
        'There are this many filetypes:',
        Object.entries(filetypes).length
      )

      console.log('Filetypes', filetypes)

      root.sum((d: any) => {
        return d ? d.filesize : 0
      })

      const box = d3.select('#filestructure')

      // let shallow = getShallowHierarchy(root, 3)

      // console.log("Here's the shallow hierarchy", shallow)

      // drawDirs(shallow, box)
      drawDirs(root, box)

      // console.log('Test hierarchy', d3.hierarchy(hierarchy).depth)

      const myChart = new Chart({
        title: 'All my files',
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
      drawLegend(filetypes, d3.scaleOrdinal(d3.schemeCategory10))
    })
}

function getShallowHierarchy(
  hierarchy: d3.HierarchyNode<FileNode>,
  depth: number
): d3.HierarchyNode<FileNode> {
  if (!hierarchy.children) {
    return hierarchy
  }

  if (hierarchy.depth > depth) {
    return Object.assign({}, hierarchy, {
      ...hierarchy,
      height: depth - hierarchy.depth,
      // children: [],
      children: hierarchy.children.filter(
        (child) => child.data.filetype !== 'folder'
      ),
    })
  } else if (hierarchy.depth === depth) {
    return Object.assign({}, hierarchy, {
      ...hierarchy,
      height: depth - hierarchy.depth,
      children: hierarchy.children.map((child) =>
        getShallowHierarchy(child, depth)
      ),
    })
  } else {
    return hierarchy
  }
}

// if (!hierarchy.data.children || hierarchy.data.children.length === 0) {
//   return this
// } else

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
  if (!node.data) {
    console.log('Error, no data on this node', node)
    return ''
  }
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
    if (data.filetype === 'folder' && node.children) {
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
