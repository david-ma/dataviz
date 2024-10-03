console.log('hey, preflight.ts')

import { d3 } from './chart'

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
              (data: PreflightData) => {
                console.log(data)
                d3.select('#content_preview').html(
                  `<pre>${JSON.stringify(data, null, 2)}</pre>`
                )
              }
            )
          })
      })
  })
