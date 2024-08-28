console.log('Hello world')

import { d3, Chart, classifyName } from './chart'

const jobs: {
  [key: string]: Job[]
} = {}

// ['JobID', 'JobName', 'MaxRSS', 'UserCPU', 'CPUTime', 'AveCPU', 'Elapsed', 'State', 'ExitCode', 'Start', 'End']
type Job = {
  JobID: string
  JobName: string
  MaxRSS: string
  UserCPU: string
  CPUTime: string
  AveCPU: string
  Elapsed: string
  State: string
  ExitCode: string
  Start: string
  End: string
}

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

const named_jobs = {}
const bad_pks = [
  '6166',
  '6167',
  '8251',
  '9263',
  '9613',
  '9669',
  '9811',
  '9884',
  '10019',
  '10050',
  '10067',
  '10149',
  '10245',
  '10331',
  '10491',
  '12198',
  '12323',
  '12783',
  '12953',
  '12954',
  '13355',
  '14597',
  '15768',
  '15769',
  '17690',
  '19335',
  '19342',
  '19452',
  '19671',
  '19897',
]

// ['Primary Key', 'Analysis Path', 'Contract Id', 'Run', 'Date Sent', 'Data Sender', 'Purge', 'Purge Approver', 'Purge Notes', 'Retention Notes', 'Retention Notes Author', 'Publish As Benchmarking Data', 'instrument_name', 'machine_model']
type Contract = {
  'Primary Key': string
  'Analysis Path': string
  'Contract Id': string
  Run: string
  'Date Sent': string
  'Data Sender': string
  Purge: string
  'Purge Approver': string
  'Purge Notes': string
  'Retention Notes': string
  'Retention Notes Author': string
  'Publish As Benchmarking Data': string
  instrument_name: string
  machine_model: string
}

const contracts: {
  [key: string]: Contract
} = {}

type FileInfoArray = [
  filename: string,
  directory: string,
  filesize: string,
  date_modified: string,
  status: string,
  level: string
]

type ClinicalData = {
  contract_dir: string
  files: FileInfoArray[]
  info: string[]
  warnings: string[]
  errors: string[]
  summary: {
    include: {
      file_count: number
      file_size_bytes: number
      file_size_human: string
    }
    exclude: {
      file_count: number
      file_size_bytes: number
      file_size_human: string
    }
    total: {
      file_count: number
      file_size_bytes: number
      file_size_human: string
    }
  }
}

type Clinical_Excel_Data = {
  run_id: string
  additional_bioinformatics: string
  approved_to_send_out: string
  archive_file_retention_date_fastq: string
  archive_file_retention_date_vcf: string
  archive_file_retention_days_fastq: string
  archive_file_retention_days_vcf: string
  basecalls_count: string
  basecalls_present: string
  basecalls_size: string
  client_emails: string
  client_username: string
  contract_expected_fastq_count: string
  contract_folder_bam_count: string
  contract_folder_bam_size: string
  contract_folder_fastq_checksum_count: string
  contract_folder_fastq_count: string
  contract_folder_fastq_size: string
  contract_folder_keep_file_count: string
  contract_folder_path: string
  contract_folder_storage: string
  contract_folder_vcf_count: string
  contract_folder_vcf_size: string
  contract_id: string
  contract_pk: string
  contract_sent: string
  contract_sent_days_ago: string
  contract_status: string
  first_approver: string
  has_archive_files_retention_period_passed_fastq: string
  has_archive_files_retention_period_passed_vcf: string
  has_archive_keep_file: string
  has_current_secondary_analysis: string
  has_retain_file: string
  instrument_name: string
  is_clinical: string
  is_clinical_internal_or_reference: string
  is_internal: string
  logical_location: string
  matching_contract_folders: string
  purged: string
  reference_data: string
  run_number: string
  second_approver: string
  secondary_analysis_analyst: string
  secondary_analysis_folder_count: string
  secondary_analysis_folder_path: string
  secondary_analysis_folder_size: string
}

const pks = {}

d3.json('/clinical')
  .then(function (JSONs: string[]) {
    // Filter out Contract Folders with duplicate log_ids
    const counter: {
      [key: string]: string[]
    } = {}

    JSONs.forEach((json) => {
      const parts = json.split('_')
      const log_id = `${parts[0]}_${parts[1]}`
      if (counter[log_id]) {
        counter[log_id].push(json)
      } else {
        counter[log_id] = [json]
      }
    })
    return Object.values(counter)
      .filter((jsons) => jsons.length == 1)
      .flat()
    // .map((jsons) => jsons[0])
  })
  // .then(function (JSONs: string[]) {
  //   return JSONs.slice(0, 50)
  // })
  .then(function (JSONs: string[]) {
    console.log('Clinical Data', JSONs)
    Promise.all([
      d3
        .csv('/AGRF/contract_list_for_purging_is_clinical_2024_08_28.csv')
        .then((data) => {
          return data.map((d: Clinical_Excel_Data) => {
            Object.entries(d).map(([key, value]) => {
              d[key] = value.trim()
            })
            return d
          })
        }),
      ...JSONs.map((json) =>
        d3.json(`/AGRF/clinical_5/${json}`).catch((err) => {
          console.error(err)
          console.error(json)
          return null
        })
      ),
    ])
      .then(function ([excelData, ...data]: [
        Clinical_Excel_Data[],
        ClinicalData
      ]) {
        const result: [Clinical_Excel_Data[], ClinicalData[]] = [
          excelData,
          data
            // .filter((folder) => {
            //   if (folder === null) {
            //     return false
            //   } else if (folder.summary.exclude.file_count > 0) {
            //     return false
            //   } else if (folder.summary.total.file_size_bytes < 200_000_000) {
            //     return false
            //   } else if (folder.summary.total.file_count > 1_000) {
            //     return false
            //   // } else if (
            //   //   folder.files.filter((file) => file[0].endsWith('.bam')).length >
            //   //   0
            //   // ) {
            //   //   return false
            //   } else {
            //     return true
            //   }
            // })
            .sort((a, b) => {
              return a.summary.total.file_size_bytes <
                b.summary.total.file_size_bytes
                ? -1
                : 1
            }),
        ]
        return result
      })
      .then(function ([excelData, data]) {
        // console.log('Excel data', excelData)
        // console.log('All Clinical JSON data', data)

        const table = d3.select('table#clinical')
        const columns = [
          'contract_pk',
          'Log ID',
          'Total File Size',
          'Total File Count',
          // 'Client Username',
          // 'Client Emails',
          'Analyst',
          'First Approver',
          'Contract Folder Path',
          'Date Sent',
          'Command',
          // 'Contract Dir',
          // 'Secondary Analysis Folder Path',
        ]

        table
          .select('thead')
          .append('tr')
          .selectAll('th')
          .data(columns)
          .enter()
          .append('th')
          .html(function (d) {
            return d
          })

        table
          .select('tbody')
          .selectAll('tr')
          .data(data)
          .enter()
          .append('tr')
          .each(function (d, i) {
            const { instrument, run, flowcell, contract_id } =
              extract_info_from_folder(d.contract_dir)
            const excel = excelData.find(
              (ex) => ex.contract_folder_path === d.contract_dir
            )
            if (!excel) {
              console.error('No excel data for', d.contract_dir)
              return
            }
            const contract_pk = excel.contract_pk.split('.')[0]
            if (bad_pks.includes(contract_pk)) {
              d3.select(this).remove()
              return
            }
            // pks[contract_pk] ? pks[contract_pk]++ : (pks[contract_pk] = 1)

            const log_id = `${flowcell}_${contract_id}`
            // const row_id = `row-${excel.contract_pk}`

            var row2 = d3
              .select(this)
              .attr('id', `clinical_row2-${log_id}`)
              .classed('hidden', true)

            var tr = table
              .select('tbody')
              .insert('tr', `#clinical_row2-${log_id}`)
              .attr('id', `clinical_row-${log_id}`)

            // Index
            tr.append('td')
              .append('a')
              .attr(
                'href',
                `http://bioweb02.agrf.org.au/nextgenpipeline/admin/nextgenruns/contract/${contract_pk}/change/`
              )
              .attr('target', '_blank')
              .text(contract_pk)

            var log_id_td = tr
              .append('td')
              .classed('log_id_td', true)
              .style('text-wrap', 'nowrap')

            log_id_td
              .append('a')
              .attr('href', `#x`)
              .on('click', function () {
                $(`#clinical_row2-${log_id}`).toggleClass('hidden')
              })
              .text(log_id)

            log_id_td.append('p').text(log_id)

            tr.append('td').text(d.summary.include.file_size_human)

            tr.append('td').text(d.summary.total.file_count)

            // tr.append('td').text(instrument)
            // tr.append('td').text(run)
            // tr.append('td').text(flowcell)

            // tr.append('td')
            //   .style('display', 'none')
            //   .datum(d)
            //   .html((d) => {
            //     const bams = d.files.filter((file) => file[0].endsWith('.bam'))

            //     return bams.map((bam) => `${bam[2]} ${bam[0]}`).join('<br>')
            //   })
            //   .classed('red', (d) => {
            //     if (
            //       d.files.filter((file) => file[0].endsWith('.bam')).length > 0
            //     ) {
            //       // tr.style('display', 'none')
            //       d3.select(this).attr('title', 'Warning: BAM files present')
            //       return true
            //     } else {
            //       return false
            //     }
            //   })

            //           var analyst = tr.append('td').html(
            //             `${excel ? excel.secondary_analysis_analyst : ''}<br>
            // ${excel ? excel.first_approver : ''}<br>
            // ${excel ? excel.contract_sent : ''}
            // `
            //           )
            // tr.append('td').text(excel.client_username)
            // tr.append('td').text(excel.client_emails.split(',').join(', '))

            tr.append('td').text(excel.secondary_analysis_analyst)
            tr.append('td').text(excel.first_approver)

            tr.append('td')
              .text(excel.contract_folder_path)
              .datum(d)
              .classed('red', (d) => {
                if (excel.contract_folder_path !== d.contract_dir) {
                  return true
                } else {
                  return false
                }
              })

            tr.append('td')
              .style('white-space', 'nowrap')
              .text(excel.contract_sent)

            tr.append('td')
              .style('white-space', 'nowrap')
              .append('code')
              .text(
                `cloudian_cache_workaround.sh ${
                  d.contract_dir.split('/data/Analysis/')[1]
                } clinical ${excel.contract_sent}`
              )

            // tr.append('td').text(d.contract_dir)
            // tr.append('td').text(excel.secondary_analysis_folder_path)

            // d3.select(this).append('td').text(d['Primary Key'])
            // d3.select(this).append('td').text(d['Analysis Path'])
            // d3.select(this).append('td').text(d['Contract Id'])
            // d3.select(this).append('td').text(d['Run'])
            // d3.select(this).append('td').text(d['Date Sent'])
            // d3.select(this).append('td').text(d['Data Sender'])
            // d3.select(this).append('td').text(d['Purge'])
            // d3.select(this).append('td').text(d['Purge Approver'])
            // d3.select(this).append('td').text(d['Purge Notes'])
            // d3.select(this).append('td').text(d['Retention Notes'])
            // d3.select(this).append('td').text(d['Retention Notes Author'])
            // d3.select(this).append('td').text(d['Publish As Benchmarking Data'])
            // d3.select(this).append('td').text(d['instrument_name'])
            // d3.select(this).append('td').text(d['machine_model'])

            // if (d.files.length > 10000) {
            //   d3.select(`#clinical_row2-${log_id}`)
            //     .append('td')
            //     .attr('colspan', columns.length)
            //     .text(`Too many files to display: ${d.files.length}`)

            //   return
            // }

            // d3.select(`#clinical_row2-${log_id}`)
            //   .append('td')
            //   .attr('colspan', 4)
            //   .append('div')
            //   .classed('followScroll', true)

            // drawTreeMap(d, log_id, `#clinical_row2-${log_id} td div`)

            // const inner_table = d3
            //   .select(`#clinical_row2-${log_id}`)
            //   .append('td')
            //   .attr('colspan', columns.length - 4)
            //   .append('table')

            // inner_table
            //   .append('thead')
            //   .append('tr')
            //   .selectAll('th')
            //   .data(['Type', 'Filepath', 'Size', 'Status', 'Level'])
            //   .enter()
            //   .append('th')
            //   .text((d) => d)

            // inner_table
            //   .append('tbody')
            //   .selectAll('tr')
            //   .data(d.files.filter((file) => file[4] !== 'included_folder'))
            //   .enter()
            //   .append('tr')
            //   .html((file) => {
            //     const file_relative_path = [
            //       file[1].split(contract_id).pop(),
            //       file[0],
            //     ]
            //       .join('/')
            //       .slice(1)

            //     const filetype = getFiletype(file[0])
            //     const size = human_readable_size(parseInt(file[2]))

            //     return `<td style="color: black; background:${color(
            //       filetype
            //     )}">${filetype}</td><td>${file_relative_path}</td><td>${size}</td><td>${
            //       file[4]
            //     }</td><td>${file[5]}</td>`
            //   })
          })
      })
    // .then(() => {
    //   // Get the "Bad" PKs
    //   console.log('PKs', pks)
    //   var filtered = Object.entries(pks).filter(([pk, count]:any) => count > 1).map(([pk, count]:any) => pk)
    //   console.log('Filtered', filtered)
    // })
  })

function human_readable_size(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let i = 0
  while (bytes >= 1024) {
    bytes /= 1024
    i++
  }
  // return `${bytes.toFixed(2)} ${units[i]}`
  return `${bytes.toFixed(2)} ${units[i]}`
}

// d3.json(`/AGRF/clinical_jsons/${log_id}.json`).then(
// )

Promise.all([
  d3.csv('/AGRF/mysql_reference_contracts_2024-08-19.csv').then((data) => {
    data.forEach((contract: Contract) => {
      contracts[log_id_from_contract(contract)] = contract
    })
    return contracts
  }),
  d3
    .dsv('|', '/AGRF/slurm_logs_2024_08_19.csv')
    .then(function (data) {
      // console.log(data)
      // console.log(Object.keys(data[0]))

      data.forEach(function (d: Job) {
        // console.log(d)
        const id = d['JobID'].split('.')[0] || d['JobID']

        if (id in jobs) {
          jobs[id].push(d)
        } else {
          jobs[id] = [d]
        }
      })
      return jobs
    })
    .then(function (jobs) {
      // console.log('jobs', jobs)
      // console.log(`Number of jobs: ${Object.entries(jobs).length}`)
      Object.entries(jobs).forEach(function ([jobId, jobGroup]) {
        // console.log(jobId)
        const log_id = get_log_id(jobGroup)

        if (log_id) {
          if (log_id in named_jobs) {
            named_jobs[log_id].push(jobGroup)
          } else {
            named_jobs[log_id] = [jobGroup]
          }
        }
      })
      // console.log(named_jobs)
      // console.log(`Number of named jobs: ${Object.entries(named_jobs).length}`)
      // console.log(Object.keys(named_jobs))
      return named_jobs
    }),
]).then(function ([contracts, named_jobs]) {
  const table = d3.select('table#internal-reference')

  const thead = table.append('thead')
  const tbody = table.append('tbody')

  const columns = ['Log ID', 'Included', 'Excluded', 'Total', 'Warnings']
  // const columns = ['Log ID', 'Jobs', 'Purge', 'Analysis Path', 'Date Sent']
  thead
    .append('tr')
    .selectAll('th')
    .data(columns)
    .enter()
    .append('th')
    .text(function (d) {
      return d
    })

  const rows = tbody
    .selectAll('tr')
    .data(Object.entries(contracts))
    .enter()
    .append('tr')
    .each(function ([log_id, contract]: [string, Contract]) {
      // if (log_id !== '22FG5GLT3_CAGRF12711') {
      //   return
      // }

      var row2 = d3
        .select(this)
        .attr('id', `row2-${log_id}`)
        .classed('hidden', true)

      var modal = row2.append('td')
      modal.append('div').attr('id', `treemap-${log_id}`)

      var row = tbody
        .insert('tr', `#row2-${log_id}`)
        .attr('id', `row-${log_id}`)
      var row_id = row.append('td').append('a').attr('href', `#x`).text(log_id)

      row2
        .append('td')
        .attr('id', `modal-${log_id}`)
        .attr('colspan', columns.length)
        .text(`Second row for ${log_id}`)

      // d3.select(this).append('td').text(named_jobs[log_id])
      // d3.select(this).append('td').text(contract.Purge)
      // d3.select(this).append('td').text(contract['Analysis Path'])
      // d3.select(this).append('td').text(contract['Date Sent'])

      // d3.json(`/AGRF/clinical_jsons/${log_id}.json`).then(
      // d3.json(`/AGRF/summary_jsons/${log_id}.json`).then(
      //   function (data: any) {
      //     row_id.on('click', function () {
      //       $(`#row2-${log_id}`).toggleClass('hidden')
      //       drawTreeMap(data, log_id)
      //     })

      //     row
      //       .append('td')
      //       .append('a')
      //       .attr('href', `#x`)
      //       .on('click', function () {
      //         $(`#row-${log_id} .files`).toggleClass('hidden')
      //       })
      //       .html(
      //         `${data.summary.include.file_count} files<br>${data.summary.include.file_size_human}`
      //       )
      //     row
      //       .append('td')
      //       .append('a')
      //       .attr('href', `#x`)
      //       .on('click', function () {
      //         $(`#row-${log_id} .info`).toggleClass('hidden')
      //       })
      //       .html(
      //         `${data.summary.exclude.file_count} files<br>${data.summary.exclude.file_size_human}`
      //       )
      //     row
      //       .append('td')
      //       .html(
      //         `${data.summary.total.file_count} files<br>${data.summary.total.file_size_human}`
      //       )

      //     var warnings = row.append('td').append('ul')
      //     data.warnings.forEach((warning) => {
      //       warnings.append('li').text(warning)
      //     })

      //     var fileBox = modal
      //       .append('td')
      //       // .classed('hidden files', true)
      //       .append('ul')
      //     data.files.forEach((file) => {
      //       // console.log(file)
      //       if (file[4] !== 'exclude' && file[4] !== 'included_folder') {
      //         fileBox
      //           .append('li')
      //           .text(`${file[1].replace('s3_archive_tmp/./', '')}/${file[0]}`)
      //       }
      //     })

      //     var infoBox = modal
      //       .append('td')
      //       // .classed('hidden info', true)
      //       .append('ul')
      //     data.info.forEach((info) => {
      //       infoBox.append('li').text(info)
      //     })
      //   },
      //   (error) => {
      //     // row.remove()
      //     row.append('td').text('Uploaded from VAST')
      //     row2.remove()

      //     var summary = row.append('td').attr('colspan', 3).append('ul')
      //     // named_jobs[log_id].forEach((jobGroup) => {
      //     //   jobGroup.forEach((job) => {
      //     //     summary.append('li').text(job.JobName)
      //     //   })
      //     // })
      //     // summary.text(JSON.stringify(named_jobs[log_id]))

      //     // d3.select(this).append('td').text(contract.Purge)
      //     // d3.select(this).append('td').text(contract['Analysis Path'])
      //     // d3.select(this).append('td').text(contract['Date Sent'])
      //   }
      // )
    })
})

function drawTreeMap(data, log_id, element_id) {
  if (data.files.length === 0) {
    return
  }

  if (data.files.length > 10000) {
    return
  }

  // d3.select(`#row2-${log_id} td`)
  d3.select(element_id).html('').append('div').attr('id', `treemap-${log_id}`)

  // console.log(data)
  const contract = data.contract_dir.split('/').pop()
  const omit_prefix = data.contract_dir

  const files = data.files
    .filter((file) => file[4] !== 'included_folder')
    .map((file) => {
      return {
        path: `${contract}${file[1].replace(omit_prefix, '')}/${file[0]}`,
        name: `${contract}${file[1].replace(omit_prefix, '')}/${file[0]}`,
        filename: file[0],
        directory: file[1],
        filesize: file[2],
        filetype: getFiletype(file[0]),
        date_modified: file[3],
        status: file[4],
        level: file[5],
      }
    })
  const root = d3.stratify().path((d: any) => d.path)(files)
  root.sum((d: any) => (d ? d.filesize || 0 : 0))
  console.log(root)
  // .then(d3.stratify<FileNode>().path((d) => d.path))

  const myChart = new Chart({
    element: `treemap-${log_id}`,
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

function extract_info_from_folder(folder: string) {
  // BASH regex from s3_sbatch_archive.sh
  // regex_pattern="(/data/Analysis/)(.*)/(.*_.(.*))/contracts/(.*)"
  // regex_pattern="(.*)/(.*_.(.*))/contracts.*/([^_]*)(_.*)?"

  const regex_pattern =
    /\/data\/Analysis\/(.*)\/(.*_.(.*))\/contracts(?:_\d+)?\/([^_]*)(?:_.*)?/

  const match = folder.match(regex_pattern)
  if (!match) {
    console.error('No match for folder', folder)
    return null
  }
  const [_, instrument, run, flowcell, contract_id] = match
  return { instrument, run, flowcell, contract_id }
}

// Possible Job names:
// ['s3_sbatch_archive_ACJ2FVM5_CAGRF12711', 'batch', 's3_ACJ2FVM5_CAGRF12711_etag_contract', 's3_ACJ2FVM5_CAGRF12711_etag_secondary', 's3_ACJ2FVM5_CAGRF12711_etag_secondary', 's3_ACJ2FVM5_CAGRF12711_etag_secondary', 's3_ACJ2FVM5_CAGRF12711_etag_secondary', 's3_ACJ2FVM5_CAGRF12711_archive_vast', 's3_ACJ2FVM5_CAGRF12711_archive_aws']
// ['s3_archive_using_temp_folder-22HWGTLT3_CAGRF23081352']
// aws_s3_archive_DP2NN_CAGRF12711
// s3_etag_HTVFHDRX2_CAGRF12711
function get_log_id(jobs: Job[]) {
  const cloudian_workaround_regex = /s3_archive_using_temp_folder-(.*)/,
    sbatch_regex = /s3_sbatch_archive_(.*)/,
    etag_regex = /s3_(.*)_etag_.*/,
    archive_regex = /s3_(.*)_archive_.*/,
    old_archive_regex = /.*_s3_archive_(.*)/,
    old_etag_regex = /s3_etag_(.*)/

  const regexes = [
    cloudian_workaround_regex,
    sbatch_regex,
    etag_regex,
    archive_regex,
    old_archive_regex,
    old_etag_regex,
  ]

  const job_names = jobs.map((job) => job.JobName)

  const job_name = regexes.reduce((acc, regex) => {
    if (acc) return acc
    const match = job_names.find((name) => name.match(regex))
    return match ? match.match(regex) : null
  }, null)

  if (!job_name) {
    // console.log('No match found')
    // console.log(job_names)
    return null
  } else {
    return job_name[1]
  }
}

function log_id_from_contract(contract: Contract) {
  const run = contract.Run,
    contract_id = contract['Contract Id'],
    flowcell = run.split('_').pop().slice(1)
  return `${flowcell}_${contract_id}`
}

// Process the fresh list of clinical contracts. Remove the ones that have already been processed.
//
// Promise.all([
//   d3
//     .csv('/AGRF/contract_list_old.csv')
//     .then((data) => data.map((d) => d.contract_folder_path)),
//   d3
//     .csv('/AGRF/contract_list_new.csv')
//     .then((data) => data.map((d) => d.contract_folder_path)),
// ]).then(([old_list, new_list]) => {
//   console.log("Old List", old_list)
//   console.log("New List", new_list)

//   const fresh_stuff = []
//   new_list.forEach((contract) => {
//     if (old_list.indexOf(contract) === -1) {
//       fresh_stuff.push(contract)
//     }
//   })
//   return fresh_stuff
// }).then((fresh_stuff) => {
//   console.log('Fresh Stuff', fresh_stuff)
//   console.log(JSON.stringify(fresh_stuff, null, 2))
// })

// d3.csv('/AGRF/contract_list_for_purging_is_clinical_2024_08_28.csv')
//   .then((data) => data.map((d) => d.contract_folder_path))
//   .then(JSON.stringify)
//   .then(console.log)

function getFiletype(filename) {
  if (!filename) {
    throw new Error('No filename provided')
  }

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
  let filetype = 'unknown'

  let parts = filename.split('.')
  if (parts.length > 1) {
    filetype = parts.pop()
  }

  if (doubleExtensions.includes(filetype) && parts.length > 1) {
    filetype = parts.pop() + '.' + filetype
  }

  return filetype
}
