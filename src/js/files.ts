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
  '20240124_LH00406_0051_B22J25VLT3-CAGRF12711.csv',

  // New format, has more rows
  'CAGRF23101260.csv',
  'CAGRF23110233-10.csv',
  'CAGRF24010125-new.csv',
]

const JSONs = [
  'CAGRF23101260.json',
  'CAGRF23110233-10.json',
  'CAGRF24010125.json',
]

const color = d3
  .scaleOrdinal()
  .range([
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#6a3d9a',
    '#ffff99',
    '#b15928',
  ])
  .domain([
    'fastq',
    'fastq.gz',
    'txt',
    'hist.txt',
    'json',
    'json.gz',
    'bam',
    'mate2',
    'mate1',
    'pairsam',
    'sam',
    'vcf',
    'gvcf',
    'tmp',
    'bed',
    'junction',
    'log',
    'pac',
    'fa',
    'bin',
    'out',
  ])

type FileNode = {
  filesize: number
  rsync?: string
  timestamp: string
  path: string
  name: string
  filetype: string
  filestatus: Filestatus
}

type FileJson = {
  files: {
    ETag: string
    Key: string
    LastModified: string
    Size: number
    StorageClass: string
    TagSet: { Key: string; Value: string }[]
    VersionId: string
  }[]
  deleteMarkers: {
    Key: string
    LastModified: string
    IsLatest: boolean
    VersionId: string
  }[]
}

d3.select('#jsonButtons')
  .selectAll('button')
  .data(JSONs)
  .enter()
  .append('button')
  .attr('id', (d) => d.split('.')[0])
  .text((d) => d.split('.')[0])
  .on('click', function (e, filename) {
    console.log('click', filename)

    d3.json(`/AGRF/new/${filename}`)
      .then((data: FileJson) => {
        return data.files
          .map((file) => {
            // console.log(file)
            const node: FileNode = {
              filesize: file.Size || 0,
              timestamp: file.LastModified,
              path: file.Key,
              name: file.Key.split('/').pop() || file.Key,
              filetype: file.Key.split('.').pop().toLowerCase(),
              filestatus: 'keep',
            }

            return recordFile(node)
          })
          .filter((d) => d !== null)
      })
      .then(d3.stratify<FileNode>().path((d) => d.path))
      .then((root: d3.HierarchyNode<FileNode>) => {
        console.log(root)
        root.sum((d) => {
          // console.log('Summing', d)
          if (d) {
            return d.filesize
          }
          return 0
        })

        const box = d3.select('#filestructure').datum(root)
        drawDirs(box)

        const myChart = new Chart({
          title: filename,
          element: 'treemap',
          margin: 10,
        }).initTreemap({
          hierarchy: root,
          target: 'filesize',
          color,
        })

        // Draw legend
        drawLegend(filetypes, myChart.color)
      })

    // .then((data: FileNode[]) => {
    //   console.log("Data", data);

    //   const root = d3
    //     .stratify<FileNode>()
    //     .id((d) => d.path)
    //     .parentId((d) => {
    //       const parts = d.path.split("/");
    //       parts.pop();
    //       return parts.join("/");
    //     })(data);

    //   root.each((node) => {
    //     if (!node.data) {
    //       console.log("Error, no data on this node", node);
    //       // node.data = {
    //       //   timestamp: "", // could find the child with the latest timestamp

    //       // }
    //     }}).sum((d) => d.filesize);
    //     return root;

    // })
  })

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
          let [bytes, rsync, timestamp, group, user, ...rest] = row
          if (row.length < 5) {
            ;[bytes, rsync, timestamp, ...rest] = row
          }

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
        }),
      )
      .then(d3.stratify<FileNode>().path((d) => d.path))
      .then((root: d3.HierarchyNode<FileNode>) => {
        root.sum((d) => d.filesize)

        const box = d3.select('#filestructure').datum(root)
        drawDirs(box)

        const myChart = new Chart({
          title: filename,
          element: 'treemap',
          margin: 10,
        }).initTreemap({
          hierarchy: root,
          target: 'filesize',
          color,
        })

        // Draw legend
        drawLegend(filetypes, myChart.color)
      })
  })

type ElementWithDatum<Datum> = d3.Selection<
  d3.BaseType,
  Datum,
  HTMLElement,
  any
>

export function drawDirs(
  selection: ElementWithDatum<d3.HierarchyNode<FileNode>>,
) {
  const hierarchy = selection.datum()
  if (!hierarchy.data) {
    console.log('Error, no data on this node, creating one', hierarchy)
    hierarchy.data = {
      filesize: 0,
      path: hierarchy.id,
      name: hierarchy.id.split('/').pop() || hierarchy.id,
      filetype: 'folder',
      filestatus: 'keep',
      timestamp: '', // could find the child with the latest timestamp
    }
  }

  const details = selection.append('details')
  const branches = details.append('ul')
  const leaves = details.append('ul')

  details
    .attr('open', () => (hierarchy.depth < 2 ? true : null))
    .on('toggle', function (e, d) {
      // Use a flag to prevent re-drawing, the "drawn" attribute
      // Consider using a flag on FileNode instead
      if (!d3.select(this).attr('drawn')) {
        d3.select(this).attr('drawn', true)
        const children = hierarchy.children || []
        const sorted = children.sort((a, b) => b.value - a.value)

        sorted.forEach((node) => {
          if (
            node.children !== undefined ||
            (node && node.data && node.data.filetype === 'folder')
          ) {
            drawDirs(branches.append('li').datum(node))
          } else {
            drawLeaf(leaves.append('li').datum(node))
          }
        })
      }
    })

  const summary = details.append('summary').datum(hierarchy)

  drawFolder(summary)

  function drawLeaf(element: ElementWithDatum<d3.HierarchyNode<FileNode>>) {
    const node = element.datum()
    return element.classed('file', true).html(`<span class="filename">${
      node.data.name
    }</span>
    <span class="fileStatus">${showFileStatus(node)}</span>
    <span class="filesize">${filesizeLabel(node.value)}</span>`)
  }

  function drawFolder(element: ElementWithDatum<d3.HierarchyNode<FileNode>>) {
    const node = element.datum()
    return element
      .html(
        `<span class="foldername">${node.data.name}</span>
    <span class="fileStatus">${showFileStatus(node)}</span>
    <span class="filesize">${filesizeLabel(node.value)}</span>`,
      )
      .classed('folder', true)
      .attr('id', `directory-${classifyName(node.id)}`)
      .on('mouseover', function (e, d) {
        e.stopPropagation()

        d3.select(`#folder-${classifyName(node.id)}`).classed('mouseover', true)
      })
      .on('mouseout', function (e, d) {
        d3.select(`#folder-${classifyName(node.id)}`).classed(
          'mouseover',
          false,
        )
      })
  }
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
  color: d3.ScaleOrdinal<string, any>,
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
    ],
  )

  d3.select('#legend table tbody')
    .selectAll('tr')
    .data(
      [
        total,
        misc,
        ...Object.values(filetypes).sort(
          (a: any, b: any) => b.filesize - a.filesize,
        ),
      ],
      (d: any) => d.name,
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
        }),
    ),
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

type AWS_S3_LIST_JSON = {
  Contents: {
    Key: string
    LastModified: string
    ETag: string
    ChecksumAlgorithm: string[]
    Size: number
    StorageClass: string
  }[]
}

if (hash === '#aws') {
  console.log('#aws selected, trying to process aws.tsv')
  d3.json(`/AGRF/aws.json`)
    .then((data: AWS_S3_LIST_JSON): FileNode[] => {
      return data.Contents.map((row) => {
        const node: FileNode = {
          filesize: row.Size,
          timestamp: row.LastModified,
          path: row.Key,
          name: row.Key.split('/').pop(),
          filetype: row.Key.split('.').pop().toLowerCase(),
          filestatus: 'keep',
        }
        recordFile(node)
        return node
      })
    })
    .then(d3.stratify<FileNode>().path((d) => d.path))
    .then((root: d3.HierarchyNode<FileNode>) => {
      root
        .each((node) => {
          if (!node.data) {
            node.data = {
              timestamp: '', // could find the child with the latest timestamp
              path: node.id,
              name: node.id.split('/').pop() || node.id,
              filetype: 'folder',
              filestatus: 'keep',
              filesize: 0,
            }
          }
        })
        .sum((data) => data.filesize)

      root.sum((data) => {
        return data ? data.filesize : 0
      })

      const box = d3.select('#filestructure').datum(root)
      drawDirs(box)

      // const myChart = new Chart({
      //   element: 'treemap',
      //   margin: 10,
      // })
      //   .initCanvas()
      //   .initTreemap({
      //     hierarchy: root,
      //     target: 'filesize',
      //     color,
      //   })

      // Draw legend
      drawLegend(filetypes, d3.scaleOrdinal(d3.schemeCategory10))
    })
}

// rsync -na --out-format='%l,%i,%M,%G,%U,%n'
// 20240709_LH00620_0027_A22KVHVLT3.csv
// Columns are:
// filesize, rsync, timestamp, owner, group, path

if (hash === '#rsync') {
  console.log(
    '#rsync selected, trying to process 20240709_LH00620_0027_A22KVHVLT3.csv',
  )
  d3.text(`/AGRF/20240709_LH00620_0027_A22KVHVLT3.csv`)
    .then((fileBody: string): FileNode[] =>
      d3.csvParseRows(fileBody).map((row) => {
        const [bytes, rsync, timestamp, owner, group, ...rest] = row
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
      }),
    )
    .then(d3.stratify<FileNode>().path((d) => d.path))
    .then((root: d3.HierarchyNode<FileNode>) => {
      console.log('Here is the hierarchy', root)
      console.log(
        'There are this many filetypes:',
        Object.entries(filetypes).length,
      )

      console.log('Filetypes', filetypes)

      root.sum((d: any) => {
        return d ? d.filesize : 0
      })

      const box = d3.select('#filestructure')

      // let shallow = getShallowHierarchy(root, 3)

      // console.log("Here's the shallow hierarchy", shallow)

      // drawDirs(shallow, box)
      drawDirs(box.datum(root))

      // console.log('Test hierarchy', d3.hierarchy(hierarchy).depth)

      const myChart = new Chart({
        element: 'treemap',
        margin: 10,
      }).initTreemap({
        hierarchy: root,
        target: 'filesize',
        color,
      })

      // Draw legend
      drawLegend(filetypes, d3.scaleOrdinal(d3.schemeCategory10))
    })
}

// rsync -na --out-format='%l,%i,%M,%n' / /dev/null
// rsync -naL --out-format='%l,%i,%M,%n' / /dev/null
// rsync -na --exclude-from=exclude.txt --out-format='%l,%i,%M,%n' / /tmp > pi4_audit.txt
//

var filtered_files: {
  [filter: string]: {
    name: string
    total_filesize: number
    files: FileNode[]
  }
} = {}

var filters: string[] = [
  'node_modules',
  'bower_components',
  'AppData',
  'Media/Games',
  'Cache',
  'Frameworks',
  'Contents',
  '/lib/',
  'plugins/',
  '.lrdata/',
  '/.git/',
  '/.metadata/',
  '/common/',
  '/.retroarch/',
  '/iPhoto Library/Masters/',
  '/.meteor/',
  '/src/',
  '/iPhoto Library/Database',
  '/.',
]

filters.forEach((filter) => {
  filtered_files[filter] = {
    name: filter,
    total_filesize: 0,
    files: [],
  }
})

if (hash === '#pi4') {
  console.log('#pi4 selected, trying to process pi4_audit.txt')
  d3.text(`/AGRF/pi4_audit.txt`)
    .then((fileBody: string): FileNode[] =>
      d3
        .csvParseRows(fileBody)
        .map(([bytes, rsync, timestamp, path]) => {
          const data: FileNode = {
            filesize: parseInt(bytes),
            rsync,
            timestamp,
            path,
            name: path.split('/').pop(),
            filetype: path.split('.').pop().toLowerCase(),
            filestatus: 'keep',
          }

          const filter = filters.find((filter) => path.indexOf(filter) !== -1)
          if (filter) {
            filtered_files[filter].total_filesize += data.filesize
            filtered_files[filter].files.push(data)
            return null
          } else {
            // return recordFile(data)
            return data
          }
        })
        .filter((d) => d !== null),
    )
    .then(d3.stratify<FileNode>().path((d) => d.path))
    .then((root: d3.HierarchyNode<FileNode>) => {
      // console.log('Here are the filtered files', filtered_files)
      console.log('Here is the hierarchy', root)

      // Object.entries(filtered_files).forEach(([filter, group]) => {
      //   console.log('Filter', filter, human_readable_size(group.total_filesize))
      // })

      // var git_files: {
      //   [folder: string]: {
      //     total_filesize: number
      //     files: FileNode[]
      //   }
      // } = {}

      // filtered_files['/.git/'].files.forEach((file) => {
      //   const parts = file.path.split('/')
      //   const git_folder = parts[parts.indexOf('.git') - 1]
      //   git_files[git_folder] = git_files[git_folder] || {
      //     total_filesize: 0,
      //     files: [],
      //   }
      //   git_files[git_folder].total_filesize += file.filesize
      //   git_files[git_folder].files.push(file)
      // })
      // console.log('Git files', git_files)
      // Object.entries(git_files).forEach(([folder, group]) => {
      //   console.log(
      //     'Git folder',
      //     folder,
      //     human_readable_size(group.total_filesize)
      //   )
      // })

      // console.log(
      //   'There are this many filetypes:',
      //   Object.entries(filetypes).length
      // )

      console.log('Filetypes', filetypes)

      root.sum((d: any) => {
        return d ? d.filesize : 0
      })

      const box = d3.select('#filestructure')

      // let shallow = getShallowHierarchy(root, 3)

      // console.log("Here's the shallow hierarchy", shallow)

      // drawDirs(shallow, box)
      // drawDirs(box.datum(root))

      // console.log('Test hierarchy', d3.hierarchy(hierarchy).depth)

      const myChart = new Chart({
        element: 'treemap',
        margin: 10,
      }).initTreemap({
        hierarchy: root,
        target: 'filesize',
        color,
      })

      // Draw legend
      // drawLegend(filetypes, d3.scaleOrdinal(d3.schemeCategory10))
    })
}

if (hash === '#home') {
  console.log('#home selected, trying to process file_audit_full.csv')
  d3.text(`/AGRF/file_audit_full.csv`)
    .then((fileBody: string): FileNode[] =>
      d3
        .csvParseRows(fileBody)
        .map((row) => {
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
        .filter((d) => d !== null),
    )
    .then(d3.stratify<FileNode>().path((d) => d.path))
    .then((root: d3.HierarchyNode<FileNode>) => {
      console.log('Here is the hierarchy', root)
      console.log(
        'There are this many filetypes:',
        Object.entries(filetypes).length,
      )

      console.log('Filetypes', filetypes)

      root.sum((d: any) => {
        return d ? d.filesize : 0
      })

      const box = d3.select('#filestructure')

      // let shallow = getShallowHierarchy(root, 3)

      // console.log("Here's the shallow hierarchy", shallow)

      // drawDirs(shallow, box)
      drawDirs(box.datum(root))

      // console.log('Test hierarchy', d3.hierarchy(hierarchy).depth)

      const myChart = new Chart({
        element: 'treemap',
        margin: 10,
      }).initTreemap({
        hierarchy: root,
        target: 'filesize',
        color,
      })

      // Draw legend
      drawLegend(filetypes, d3.scaleOrdinal(d3.schemeCategory10))
    })
}

function getShallowHierarchy(
  hierarchy: d3.HierarchyNode<FileNode>,
  depth: number,
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
        (child) => child.data.filetype !== 'folder',
      ),
    })
  } else if (hierarchy.depth === depth) {
    return Object.assign({}, hierarchy, {
      ...hierarchy,
      height: depth - hierarchy.depth,
      children: hierarchy.children.map((child) =>
        getShallowHierarchy(child, depth),
      ),
    })
  } else {
    return hierarchy
  }
}

// if (!hierarchy.data.children || hierarchy.data.children.length === 0) {
//   return this
// } else

// TODO:
// Not matching when secondary_analysis/secondary_analysis happens.
// I.e. When a secondary_analysis is inside a secondary_analysis
const filefilter = {
  secondary_analysis: [
    /^secondary_analysis\/Results.*/,
    /^secondary_analysis\/Intermediate.*/,
    /^secondary_analysis\/commands.*.txt$/,
    /^secondary_analysis\/parameters.*.txt$/,
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
    delete: '<span class="status red">Ignore</span>',
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

function human_readable_size(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let i = 0
  while (bytes >= 1024) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}
