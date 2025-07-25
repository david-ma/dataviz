console.log('hey, preflight.ts')

import { d3, Chart, decorateTable } from './chart'

type FileInfo = [
  name: string,
  dir: string,
  size_bytes: number,
  date_modified: number,
  agrf_data_type: string,
  agrf_data_level: string,
]

type PreflightData = {
  contract_dir: string
  errors: string[]
  list: {
    include: {
      files: FileInfo[]
      folders: FileInfo[]
      hidden: string[]
      symlinks: string[]
    }
    exclude: {
      files: FileInfo[]
      folders: FileInfo[]
      hidden: string[]
      symlinks: string[]
    }
  }
  summary: {
    include: {
      file_count: number
      file_size_bytes: number
      file_size_human: string
      hidden_count: number
      symlink_count: number
    }
    exclude: {
      file_count: number
      file_size_bytes: number
      file_size_human: string
      hidden_count: number
      symlink_count: number
    }
    total: {
      file_count: number
      file_size_bytes: number
      file_size_human: string
      hidden_count: number
      symlink_count: number
    }
    warnings: string[]
  }
  warnings: {
    [key: string]: string[]
  }
}

var phases = d3
  .json('/AGRF/preflight/phases.json')
  .then((phases: { [key: string]: string[] }) => {
    console.log(phases)

    d3.select('#buttons')
      .selectAll('button')
      .data(Object.keys(phases))
      .enter()
      .append('button')
      .text((d) => d)
      .on('click', (event, phase) => {
        d3.select('#phaseTable').html(`<h3>${phase}</h3><table></table>`)

        var files = phases[phase]

        var table = decorateTable(
          files.map((file) => {
            return {
              file: file,
            }
          }),
          {
            element: '#phaseTable table',
            paging: true,
            pageLength: 100,
            order: [[7, 'desc']],
            columns: [
              {
                data: 'file',
                title: 'Summary File',
                render: (data, type, row, meta) => {
                  if (type === 'display') {
                    var output = `<a href="#info" onclick="d3.json('/AGRF/preflight/preflight_${phase}/oct/${data}').then(drawDashboard)">${data}</a>`

                    if (row.postflight) {
                      output += `<br>
                    <a href="https://ap-southeast-2.console.aws.amazon.com/s3/buckets/agrf-prod-ngs-archive-analysis-c7c686d?region=ap-southeast-2&bucketType=general&prefix=${row.postflight.prefix}/&showversions=false" target="_blank">AWS S3 Folder</a>`
                    }

                    return output
                  }
                  return data
                },
              },
              // {
              //   data: 'contract_dir',
              //   title: 'Contract',
              // },
              {
                data: 'included',
                title: 'Included Files',
                render: (data, type, row, meta) => {
                  if (type === 'sort') {
                    return row.summary.include.file_count
                  }
                  if (type === 'display') {
                    if (row.summary) {
                      return `${row.summary.include.file_count} files<br>${row.summary.include.file_size_human}`
                    }
                  }
                  return data
                },
              },
              {
                data: 'excluded',
                title: 'Excluded Files',
                render: (data, type, row, meta) => {
                  if (type === 'sort') {
                    return row.summary.exclude.file_count
                  }
                  if (type === 'display') {
                    if (row.summary) {
                      return `${row.summary.exclude.file_count} files<br>${row.summary.exclude.file_size_human}`
                    }
                  }
                  return data
                },
              },
              {
                data: 'total',
                title: 'Total Files',
                render: (data, type, row, meta) => {
                  if (type === 'sort') {
                    return row.summary.total.file_count
                  }
                  if (type === 'display') {
                    if (row.summary) {
                      return `${row.summary.total.file_count} files<br>${row.summary.total.file_size_human}`
                    }
                  }
                  return data
                },
              },
              {
                data: 'warnings',
                title: 'Warnings',
                render: (data, type, row, meta) => {
                  if (type === 'sort') {
                    return row.summary.warnings.length
                  }
                  if (type === 'display') {
                    if (row.summary) {
                      return row.summary.warnings.join('<br>')
                    }
                  }
                  return data
                },
              },
              // {
              //   data: 'file',
              //   title: 'Small Files',
              //   render: (data, type, row, meta) => {
              //     if (row && row.summary && type === 'display') {
              //       if (row.summary) {
              //       return row.summary.include.files.reduce((acc, file) => {
              //         if (file[2] < 32000) {
              //           acc++
              //         }
              //         return acc
              //       }, 0)
              //     }
              //     return data
              //   },
              // },
              {
                data: 'file',
                title: 'Postflight',
                render: (data, type, row, meta) => {
                  if (type === 'display') {
                    var [log_id] = data.split('.')
                    return `<a href="#info" onclick="d3.json('/AGRF/preflight/preflight_${phase}/postflight/${log_id}_aws.json').then(drawDashboard)">${log_id}_aws.json</a>`
                  }
                  return data
                },
              },
              {
                data: 'postflight',
                title: 'Postflight Summary',
                render: (data, type, row, meta) => {
                  if (type === 'sort') {
                    return row.postflight.summary.include.object_count
                  }
                  if (type === 'display') {
                    if (row.postflight) {
                      return `${row.postflight.summary.include.object_count} files<br>${row.postflight.summary.include.file_size_human}`
                    }
                  }
                  return data
                },
              },
              {
                data: 'differences',
                title: 'Differences',
                render: (data, type, row, meta) => {
                  var differences = 0
                  if (row.summary) {
                    differences =
                      row.summary.include.file_count -
                      row.postflight.summary.include.object_count
                  }
                  if (type === 'sort') {
                    return Math.abs(differences)
                  }
                  if (type === 'display') {
                    if (differences > 0) {
                      return `+${differences} files`
                    } else if (differences < 0) {
                      return `${differences} files`
                    } else {
                      return 'No differences'
                    }
                  }
                  return data
                },
              },
              {
                data: 'postflight',
                title: 'Postflight Errors',
                render: (data, type, row, meta) => {
                  if (type === 'sort') {
                    return row.postflight.errors.length
                  }
                  if (type === 'display') {
                    if (row.postflight) {
                      return row.postflight.errors.join('<br>')
                    }
                  }
                  return data
                },
              },
            ],
          },
        )

        Promise.all([
          Promise.all(
            files.map((file) =>
              d3.json(`/AGRF/preflight/preflight_${phase}/oct/${file}`),
            ),
          ),
          Promise.all(
            files.map((file) =>
              d3
                .json(
                  `/AGRF/preflight/preflight_${phase}/postflight/${
                    file.split('.')[0]
                  }_aws.json`,
                )
                .catch((error) => {
                  // console.log("Error fetching postflight data", error)
                  return {
                    summary: {
                      include: {
                        object_count: 0,
                        file_size_human: '0 bytes',
                      },
                    },
                    error: file,
                  }
                }),
            ),
          ),
        ]).then(([preflight_data, postflight_data]) => {
          console.log('Preflight data', preflight_data)
          console.log('Postflight data', postflight_data)

          preflight_data.map((d: any, i) => {
            return {
              Files: d.contract_dir,
              postflight: postflight_data[i],
            }
          })

          preflight_data.forEach((d: any, i) => {
            table.row(i).data({
              ...d,
              file: files[i],
              postflight: postflight_data[i],
            })
          })

          table.draw()
        })
      })
    $('#buttons button').first().click()
  })

globalThis.drawDashboard = drawDashboard

function drawDashboard(data: PreflightData) {
  d3.select('#preview').html(
    `<h3>Preview</h3><pre>${JSON.stringify(data, null, 2)}</pre>`,
  )

  var dashboard = d3.select('#dashboard').html('')
  var summary = dashboard.append('div').attr('id', 'summary')
  summary.append('h1').text('Summary')

  var summaryTable = summary.append('table')
  summaryTable
    .append('thead')
    .append('tr')
    .selectAll('th')
    .data(['', 'Size', 'File Count', 'Hidden Files', 'Symlinks'])
    .enter()
    .append('th')
    .text((d) => d)

  summaryTable
    .append('tbody')
    .selectAll('tr')
    .data(Object.entries(data.summary))
    .enter()
    .append('tr')
    .html(([name, data]) => {
      if (Array.isArray(data)) {
        return `
          <td colspan="5">${data.join(' ')}</td>
        `
      }

      return `
        <td style="text-transform:capitalize">${name}</td>
        <td>${data.file_size_human}</td>
        <td>${data.file_count}</td>
        <td>${data.hidden_count}</td>
        <td>${data.symlink_count}</td>
      `
    })

  var dataviz = dashboard
    .append('div')
    .attr('id', 'dataviz')
    .html('<h1>Data Viz</h1>')

  drawDataviz(dataviz, data)
}

// const color = d3.scaleOrdinal(d3.schemeCategory10)
const color = d3.scaleOrdinal([
  '#FFFFFF', // white
  '#0100F5', // blue
  '#FE0000', // red
  '#F8D400', // yellow
  '#D3D3D3', // grey
  '#000', // black
])

function drawDataviz(
  dataviz: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  data: PreflightData,
) {
  var contract = data.contract_dir.split('/').pop()
  console.log('Contract: ', contract)

  var files = data.list.include.files.map((file) => {
    var directory = file[1]
    var filename = file[0]

    if (directory === '.') {
      directory = contract
    } else {
      directory = contract + '/' + directory
    }
    var path = directory + '/' + filename

    var filetype = filename.split('.').pop()

    return {
      name,
      directory,
      path,
      filesize: file[2],
      date_modified: file[3],
      agrf_data_type: file[4],
      agrf_data_level: file[5],
      filetype,
    }
  })

  dataviz.append('div').attr('id', 'treemap')

  const root = d3.stratify().path((d: any) => d.path)(files)
  root.sum((d: any) => (d ? d.filesize || 0 : 0))

  const myChart = new Chart({
    element: 'treemap',
    margin: 5,
    width: 500,
    height: 1000,
    nav: false,
  }).initTreemap({
    hierarchy: root,
    target: 'filesize',
    color,
  })
}
