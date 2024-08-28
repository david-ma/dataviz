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
// clinical_2024_06_06.csv
// run_id,additional_bioinformatics,approved_to_send_out,archive_file_retention_date_fastq,archive_file_retention_date_vcf,archive_file_retention_days_fastq,archive_file_retention_days_vcf,basecalls_count,basecalls_present,basecalls_size,client_emails,client_username,contract_expected_fastq_count,contract_folder_bam_count,contract_folder_bam_size,contract_folder_fastq_checksum_count,contract_folder_fastq_count,contract_folder_fastq_size,contract_folder_keep_file_count,contract_folder_path,contract_folder_storage,contract_folder_vcf_count,contract_folder_vcf_size,contract_id,contract_pk,contract_sent,contract_sent_days_ago,contract_status,first_approver,has_archive_files_retention_period_passed_fastq,has_archive_files_retention_period_passed_vcf,has_archive_keep_file,has_current_secondary_analysis,has_retain_file,instrument_name,is_clinical,is_clinical_internal_or_reference,is_internal,logical_location,matching_contract_folders,purged,reference_data,run_number,second_approver,secondary_analysis_analyst,secondary_analysis_folder_count,secondary_analysis_folder_path,secondary_analysis_folder_size

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

var easy_wins = [
  'H5CWWDSX3_CAGRF21046364-23',
  'HW2GHDRXY_CAGRF21046364-16',
  'HCM37DSX3_CAGRF21046364-23',
  'H7K2KDSX5_CAGRF21046364-35',
  'HVW2CDRXY_CAGRF21046364-16',
  'H5CWWDSX3_CAGRF21046364-24',
  'H7HKJDSX5_CAGRF220711207-6',
  'HCM37DSX3_CAGRF21046364-24',
  'HJTNGDSX3_CAGRF22029669',
  'HJTNGDSX3_CAGRF22029669_demux_8983',
  'HCKNVDSX3_CAGRF22029811',
  'H3WGNDSX5_CAGRF220711207-1',
  'HWJMTDSX2_CAGRF21129338',
  'HK5N7DSX3_CAGRF22029669',
  'H7JT7DSX5_CAGRF220912078',
  'H3YVVDSX5_CAGRF220711207-1',
  'HW2GHDRXY_CAGRF21046364-17',
  'H7HKJDSX5_CAGRF220510631_demux_10273',
  'HK7V5DRX2_CAGRF220711294',
  'HFT37DRXY_CAGRF21035731',
  'HLHCVDSX2_CAGRF21035731',
  'H3CCWDSX3_CAGRF21035731',
  'HWJMTDSX2_CAGRF21129338-1',
  'HLMN2DRX3_CAGRF230615291',
  'HM27FDRXY_CAGRF21056905',
  'H7KHFDRX2_CAGRF22029669_demux_9120',
  'H3CCWDSX3_CAGRF12711',
  'HJVWWDSX3_CAGRF21035731-24',
  'HHLW5DSX7_CAGRF230213575',
  'H23WMDRXY_CAGRF20104215',
  'HC3JVDSX3_CAGRF21035731',
  'HFNLNDRX3_CAGRF220610939',
  'H7K2KDSX5_CAGRF21046364-37',
  'HJVWWDSX3_CAGRF21035731-25',
  'HJVWWDSX3_CAGRF21035731-23',
  'HVKMLDSX3_CAGRF21046364-34',
  'H7KHFDRX2_CAGRF22029669_demux_9121',
  'HVW2CDRXY_CAGRF21046364-17',
  'HVJHGDRXX_CAGRF20104215',
  'HWWC5DSX5_CAGRF220310041-4',
  'HH3JVDRXY_CAGRF20104215',
  'HT25LDRXY_CAGRF21087908',
  'HJJVLDSX3_CAGRF22029811',
  'HJFLHDSX2_CAGRF21046364-19',
  '22H7NMLT3_CAGRF23110168_demux_12951',
  'HJFLHDSX2_CAGRF21046364-16',
  'HM27FDRXY_CAGRF20104215',
  'HJFLHDSX2_CAGRF21046364-20',
  'HT25LDRXY_CAGRF22019402-4',
  'HJGVMDSX7_CAGRF230715533',
  'HJFLHDSX2_CAGRF21046364-18',
  'HFL2HDRXY_CAGRF21046364',
  'HLMLVDRX3_CAGRF230213575',
  'HL7JJDSX3_CAGRF22019402-9',
  'HWK2HDRXX_CAGRF20114368',
  'HVJJFDSX3_CAGRF21046364-34',
  'HV33MDSX5_CAGRF220711207-10',
  'HFYG5DSX3_CAGRF21046364-13',
  '22GYHHLT3_CAGRF23081352_demux_12849',
  'HL253DRXX_CAGRF20042025',
  'HJFLHDSX2_CAGRF21046364-17',
  'HJNFTDSX3_CAGRF220310041',
  'H7GYHDSX7_CAGRF230313853-2_demux_11326',
  'HCKNVDSX3_CAGRF21046364-28',
  'HLHC3DSX3_CAGRF22019402',
  'HHLTFDSX7_CAGRF230313853-4',
  'HTKTTDSX3_CAGRF220912022',
  'HLK7TDSX7_CAGRF230715533',
  'HFYGJDSX3_CAGRF21046364-14',
  'HFYGJDSX3_CAGRF21046364-15',
  'HTKTTDSX3_CAGRF220912078',
  'H7KHFDRX2_CAGRF21087908_demux_9120',
  'H7KHFDRX2_CAGRF21087908_demux_9143',
  'H5F3NDSX3_CAGRF21046364-21',
  'HF5NHDRXY_CAGRF21046364',
  'HWMHTDSX2_CAGRF21046364-17',
  'HFYG5DSX3_CAGRF21046364-14',
  'HFYGJDSX3_CAGRF21046364-13',
  'HVFK2DMXX_CAGRF21035636',
  'HHKW5DRXY_CAGRF21067141',
  'HFYG5DSX3_CAGRF21046364-15',
  'HC3JVDSX3_CAGRF21108639',
  'H5CVCDSX3_CAGRF21046364-21',
  'HV5MKDMXX_CAGRF20073103',
  'H7KFGDSX2_CAGRF21046364',
  'HVJYKDSX3_CAGRF21046364-34',
  'HWMHTDSX2_CAGRF21046364-19',
  'HHNM5DSX7_CAGRF230313853',
  'HJGVMDSX7_CAGRF21088051',
  'HWMHTDSX2_CAGRF21046364-16',
  'HV33MDSX5_CAGRF220711207-12',
  'HWMHTDSX2_CAGRF21046364-20',
  'HJVM5DSX3_CAGRF21046364-28',
  'H7JYGDSX5_CAGRF220811535',
  'HCKNWDSX3_CAGRF21046364-27',
  'HFGNLDSXY_CAGRF20021112-3',
  'H5CVCDSX3_CAGRF21046364-24',
  'HCL5KDSX3_CAGRF20104215',
  'H7JWFDSX5_CAGRF220711207-5',
  'H375LDSX3_CAGRF21118974',
  'HWMHTDSX2_CAGRF21046364-18',
  'HTVG2DSX2_CAGRF21098111',
  'HJK2JDSX3_CAGRF21046364-29',
  'HC3YTDSX3_CAGRF21108639',
  'HVJYKDSX3_CAGRF21046364-37',
  'H5CVCDSX3_CAGRF21046364-23',
  'HVJYKDSX3_CAGRF21046364-35',
  'HVJYKDSX3_CAGRF21046364-36',
  'HCKNWDSX3_CAGRF21046364-25',
  'H5CVCDSX3_CAGRF21046364-22',
  'H3YW5DSX5_CAGRF21046364-33',
  'HJK2JDSX3_CAGRF21046364-30',
  'HCKNWDSX3_CAGRF21046364-26',
  'HJK2JDSX3_CAGRF21046364-31',
  'H3YW5DSX5_CAGRF21046364-32',
  'H7GYHDSX7_CAGRF220711207-13_demux_11317',
  'H7GYHDSX7_CAGRF220711207-13_demux_11326',
  'H7GYHDSX7_CAGRF220711207-13',
  'H7GYHDSX7_CAGRF230313853-2',
  'HHLTFDSX7_CAGRF230313853-1',
  '22CF5LLT3_CAGRF23081082',
  'H7KWTDSX2_CAGRF21046364',
  'H3VCJDSX2_CAGRF21035636',
  'HGCMJDSX5_CAGRF220711207-6',
  'HV33MDSX5_CAGRF220711207-11',
  'HHN77DSX7_CAGRF230313853-1',
  'H3CCWDSX3_CAGRF21118974',
  '22JWNMLT3_CAGRF23101260',
  'H7K2VDSX2_CAGRF21046364',
  '22CFWFLT3_CAGRF23081082',
  'H7JYGDSX5_CAGRF220711294',
]

d3.csv('/AGRF/clinical_2024_06_06.csv')
  .then((data) => {
    console.log('clinical_2024_06_06.csv', data)
    return data.map((d: Clinical_Excel_Data) => {
      Object.entries(d).map(([key, value]) => {
        d[key] = value.trim()
      })
      return d
    })
  })
  .then((data) => {
    console.log('Clean-ish data from Excel', data)
  })

d3.json('/clinical')
  .then(function (JSONs: string[]) {
    return JSONs.filter((json) => easy_wins.includes(json.slice(0, -5)))
  })
  .then(function (JSONs: string[]) {
    console.log('Clinical Data', JSONs)
    Promise.all([
      d3.csv('/AGRF/clinical_2024_06_06.csv').then((data) => {
        console.log('clinical_2024_06_06.csv', data)
        return data.map((d: Clinical_Excel_Data) => {
          Object.entries(d).map(([key, value]) => {
            d[key] = value.trim()
          })
          return d
        })
      }),
      ...JSONs.map((json) => d3.json(`/AGRF/clinical/${json}`)),
    ])
      .then(function ([excelData, ...data]: [
        Clinical_Excel_Data[],
        ClinicalData
      ]) {
        const result: [Clinical_Excel_Data[], ClinicalData[]] = [
          excelData,
          data.sort((a, b) => {
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
          'Log ID',
          // 'Included',
          'Total File Size',
          'Total File Count',
          // 'BAMs',
          // 'Analyst<br>First Approver<br>Date',
          'Client Username',
          'Client Emails',
          'Contract Folder Path',
          'Analyst',
          'First Approver',
          'Date Sent',
          'Contract Dir',
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
          .each(function (d) {
            const { instrument, run, flowcell, contract_id } =
              extract_info_from_folder(d.contract_dir)
            const log_id = `${flowcell}_${contract_id}`

            var row2 = d3
              .select(this)
              .attr('id', `clinical_row2-${log_id}`)
              .classed('hidden', true)
            var tr = table
              .select('tbody')
              .insert('tr', `#clinical_row2-${log_id}`)
              .attr('id', `clinical_row-${log_id}`)

            tr.append('td')
              // .append('a')
              // .attr('href', `#x`)
              // .on('click', function () {
              //   $(`#clinical_row2-${log_id}`).toggleClass('hidden')
              // })
              .text(log_id)

            tr.append('td')
              .text(d.summary.include.file_size_human)
              // .style('display', 'none')
  //             .html(
  //               `
  // ${d.summary.include.file_count}&nbsp;files<br>${d.summary.include.file_size_human}`
  //             )
              // .datum(d)
              // .classed('green', (data) => {
              //   return data.summary.include.file_count < 1000
              // })

            tr.append('td')
              //           .html(
              //             `
              // ${d.summary.exclude.file_count}&nbsp;files<br>${d.summary.exclude.file_size_human}`
              //           )
              .text(d.summary.total.file_count)
              // .datum(d)
              // .classed('red', (data) => {
              //   if (data.summary.exclude.file_count > 0) {
              //     // tr.style('display', 'none')
              //     d3.select(this).attr(
              //       'title',
              //       "Warning: Exclusion rules applied, not an 'easy win'"
              //     )
              //     return true
              //   } else {
              //     return false
              //   }
              // })

            // tr.append('td')
            //   //           .html(
            //   //             `
            //   // ${d.summary.total.file_count}&nbsp;files<br>${d.summary.total.file_size_human}`
            //   //           )
            //   .text(d.summary.total.file_count)
            //   .datum(d)
            //   // .classed('green', (data) => {
            //   //   return data.summary.total.file_count < 1000
            //   // })
            //   .classed('red', (data) => {
            //     if (data.summary.total.file_size_bytes < 200000000) {
            //       // tr.style('display', 'none')
            //       d3.select(this).attr(
            //         'title',
            //         'Warning: Less than 200 MB of data'
            //       )
            //       return true
            //     } else {
            //       return false
            //     }
            //   })

            // tr.append('td').text(instrument)
            // tr.append('td').text(run)
            // tr.append('td').text(flowcell)

            tr.append('td')
              .style('display', 'none')
              .datum(d)
              .html((d) => {
                const bams = d.files.filter((file) => file[0].endsWith('.bam'))

                return bams.map((bam) => `${bam[2]} ${bam[0]}`).join('<br>')
              })
              .classed('red', (d) => {
                if (
                  d.files.filter((file) => file[0].endsWith('.bam')).length > 0
                ) {
                  // tr.style('display', 'none')
                  d3.select(this).attr('title', 'Warning: BAM files present')
                  return true
                } else {
                  return false
                }
              })

            const excel = excelData.find((d) => d.run_id === run)
            //           var analyst = tr.append('td').html(
            //             `${excel ? excel.secondary_analysis_analyst : ''}<br>
            // ${excel ? excel.first_approver : ''}<br>
            // ${excel ? excel.contract_sent : ''}
            // `
            //           )
            tr.append('td').text(excel.client_username)
            tr.append('td').text(excel.client_emails)
            tr.append('td').text(excel.contract_folder_path)
            

            tr.append('td').text(excel.secondary_analysis_analyst)
            tr.append('td').text(excel.first_approver)
            tr.append('td').text(excel.contract_sent)

            tr.append('td').text(d.contract_dir)

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


            if(d.files.length > 10000) {
              d3.select(`#clinical_row2-${log_id}`)
              .append('td')
              .attr('colspan', 7)
              .text(`Too many files to display: ${d.files.length}`)

              return
            }

            d3.select(`#clinical_row2-${log_id}`)
              .append('td')
              .attr('colspan', 3)
            drawTreeMap(d, log_id, `#clinical_row2-${log_id} td`)

            const inner_table = d3
              .select(`#clinical_row2-${log_id}`)
              .append('td')
              .attr('colspan', 4)
              .append('table')

            inner_table
              .append('thead')
              .append('tr')
              .selectAll('th')
              .data(['', 'File', 'Size', 'Status', 'Level'])
              .enter()
              .append('th')
              .text((d) => d)

            inner_table
              .append('tbody')
              .selectAll('tr')
              .data(d.files.filter((file) => file[4] !== 'included_folder'))
              .enter()
              .append('tr')
              .html((file) => {
                const file_relative_path = [
                  file[1].split(contract_id).pop(),
                  file[0],
                ]
                  .join('/')
                  .slice(1)

                const filetype = file[0].split('.').pop()
                const size = human_readable_size(parseInt(file[2]))

                return `<td style="background:${color(
                  filetype
                )}">x</td><td>${file_relative_path}</td><td>${size}</td><td>${
                  file[4]
                }</td><td>${file[5]}</td>`
              })
          })
      })
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
  if(data.files.length === 0) {
    return
  }

  if(data.files.length > 10000) {
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
        filetype: file[0].split('.').pop(),
        date_modified: file[3],
        status: file[4],
        level: file[5],
      }
    })
  const root = d3.stratify().path((d: any) => d.path)(files)
  root.sum((d: any) => (d ? d.filesize || 0 : 0))
  // console.log(root)
  // .then(d3.stratify<FileNode>().path((d) => d.path))

  const myChart = new Chart({
    element: `treemap-${log_id}`,
    margin: 5,
    width: 500,
    height: 500,
    nav: false,
  }).initTreemap({
    hierarchy: root,
    target: 'filesize',
    color,
  })
}

function extract_info_from_folder(folder: string) {
  // BASH regex from s3_sbatch_archive.sh
  // export regex_pattern="(/data/Analysis/)(.*)/(.*_.(.*))/contracts/(.*)"
  const regex_pattern =
    /\/data\/Analysis\/(.*)\/(.*_.(.*))\/contracts(?:_\d+)?\/(.*)/

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
