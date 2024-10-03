console.log('hey, preflight.ts')

import { d3, Chart } from './chart'

type FileInfo = [
  name: string,
  dir: string,
  size_bytes: number,
  date_modified: number,
  agrf_data_type: string,
  agrf_data_level: string
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
        var files = phases[phase]

        d3.select('#moreButtons').selectAll('button').remove()

        d3.select('#moreButtons')
          .selectAll('button')
          .data(files)
          .enter()
          .append('button')
          .text((d) => d)
          .on('click', (event, file) => {
            d3.json(`/AGRF/preflight/preflight_${phase}/oct/${file}`).then(
              drawDashboard
            )
          })
      })
  })

d3.json(
  `/AGRF/preflight/preflight_phase3.1/oct/22KMGGLT3_CAGRF24010125.json`
).then(drawDashboard)

function drawDashboard(data: PreflightData) {
  d3.select('#preview').html(
    `<h3>Preview</h3><pre>${JSON.stringify(data, null, 2)}</pre>`
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

  var dataviz = dashboard.append('div').attr('id', 'dataviz')

  drawDataviz(dataviz, data)
}

function drawDataviz(
  dataviz: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  data: PreflightData
) {
  var files = data.list.include.files

  var svg = dataviz.append('svg').attr('width', 800).attr('height', 600)

  
}
