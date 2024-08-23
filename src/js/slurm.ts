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

const named_jobs = {}

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
      console.log('jobs', jobs)
      console.log(`Number of jobs: ${Object.entries(jobs).length}`)
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
      console.log(named_jobs)
      console.log(`Number of named jobs: ${Object.entries(named_jobs).length}`)
      console.log(Object.keys(named_jobs))
      return named_jobs
    }),
]).then(function ([contracts, named_jobs]) {
  const table = d3.select('table#contracts')

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
      if (log_id !== '22FG5GLT3_CAGRF12711') {
        return
      }

      var row2 = d3.select(this).attr('id', `row2-${log_id}`)
      // .classed('hidden', true)
      var row = tbody
        .insert('tr', `#row2-${log_id}`)
        .attr('id', `row-${log_id}`)
      row
        .append('td')
        .append('a')
        .attr('href', `#`)
        .on('click', function () {
          $(`#row2-${log_id}`).toggleClass('hidden')
        })
        .text(log_id)

      row2
        .append('td')
        .attr('id', `modal-${log_id}`)
        .attr('colspan', columns.length)
        .text(`Second row for ${log_id}`)

      // d3.select(this).append('td').text(named_jobs[log_id])
      // d3.select(this).append('td').text(contract.Purge)
      // d3.select(this).append('td').text(contract['Analysis Path'])
      // d3.select(this).append('td').text(contract['Date Sent'])

      d3.json(`/AGRF/summary_jsons/${log_id}.json`).then(
        function (data: any) {
          row
            .append('td')
            .append('a')
            .attr('href', `#`)
            .on('click', function () {
              $(`#row-${log_id} .files`).toggleClass('hidden')
            })
            .html(
              `${data.summary.include.file_count} files<br>${data.summary.include.file_size_human}`
            )
          row
            .append('td')
            .append('a')
            .attr('href', `#`)
            .on('click', function () {
              $(`#row-${log_id} .info`).toggleClass('hidden')
            })
            .html(
              `${data.summary.exclude.file_count} files<br>${data.summary.exclude.file_size_human}`
            )
          row
            .append('td')
            .html(
              `${data.summary.total.file_count} files<br>${data.summary.total.file_size_human}`
            )

          var warnings = row.append('td').append('ul')
          data.warnings.forEach((warning) => {
            warnings.append('li').text(warning)
          })

          var fileBox = row
            .append('td')
            .classed('hidden files', true)
            .append('ul')
          data.files.forEach((file) => {
            // console.log(file)
            if (file[4] !== 'exclude' && file[4] !== 'included_folder') {
              fileBox
                .append('li')
                .text(`${file[1].replace('s3_archive_tmp/./', '')}/${file[0]}`)
            }
          })

          var infoBox = row
            .append('td')
            .classed('hidden info', true)
            .append('ul')
          data.info.forEach((info) => {
            infoBox.append('li').text(info)
          })

          var modal = d3.select(`#modal-${log_id}`)
          modal.html('')
          modal
            .append('a')
            .attr('href', '#')
            .text('Click me')
            .on('click', function () {
              drawTreeMap(modal, data, log_id)
            })

          if (log_id == '22FG5GLT3_CAGRF12711') {
            drawTreeMap(modal, data, log_id)
          }
        },
        (error) => {
          row.remove()
          row2.remove()
        }
      )
    })
})

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

function drawTreeMap(container, data, log_id) {
  console.log(data)
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
        filetype: file[0].split('.').pop(),
        date_modified: file[3],
        status: file[4],
        level: file[5],
      }
    })
  const root = d3.stratify().path((d: any) => d.path)(files)
  root.sum((d: any) => (d ? d.filesize || 0 : 0))
  console.log(root)
  // .then(d3.stratify<FileNode>().path((d) => d.path))

  container.append('div').attr('id', 'treemap')

  const myChart = new Chart({
    title: log_id,
    element: 'treemap',
    margin: 50,
    nav: false,
  }).initTreemap({
    hierachy: root,
    target: 'filesize',
    color,
  })
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
