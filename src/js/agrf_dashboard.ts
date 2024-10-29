console.log('Hello world')

import { d3, decorateTable, DataTableDataset, _ } from './chart'

d3.json('/dashboard_data').then((phases: string[][]) => {
  Promise.all(
    phases.map((phase, i) => {
      return Promise.all(
        phase.map((file) => {
          return Promise.all([
            d3.json(`/AGRF/dashboard/phase${i}/preflight_light/${file}`),
            // d3.json(`/AGRF/dashboard/phase${i}/postflight_aws/${file}`),
            // d3.json(`/AGRF/dashboard/phase${i}/postflight_vast/${file}`),
          ]).then(([preflight]: any) => {
            return {
              phase: `phase${i}`,
              ...preflight,
              // preflight,
              full: `/AGRF/dashboard/phase${i}/preflight_full/${file}`,
              aws: `/AGRF/dashboard/phase${i}/postflight_aws/${file}`,
              vast: `/AGRF/dashboard/phase${i}/postflight_vast/${file}`,
            }
          })
        })
      )
    })
  )
    .then((data) =>
      data.reduce((acc, phase) => {
        phase
          // Data must have a contract_dir folder
          .filter((folder) => folder.contract_dir)
          // If one of the warnings says that it's a symlink, we should exclude it
          .filter(
            (folder) =>
              !folder.summary.warnings.includes(
                'Contract directory is a symlink'
              )
          )
          .forEach((folder) => {
            acc.push(folder)
          })
        return acc
      }, [])
    )
    .then((data) => {
      var table = drawTable(data)
      const debouncedDraw = _.debounce(table.draw, 200)
      console.log(data)

      var summary_data = []

      const summaryTable = decorateTable(summary_data, {
        element: 'table#summary_table',
        titles: [
          'phase',
          'total_files',
          'include_files',
          'aws_files',
          'include_files_size',
          'aws_size',
        ],
        customRenderers: {
          include_files_size: (data, type, row, meta) => {
            return `${row.include_files_size} bytes<br>${human_readable_size(
              row.include_files_size
            )}`
          },
          aws_size: (data, type, row, meta) => {
            return `${row.aws_size} bytes<br>${human_readable_size(
              row.aws_size
            )}`
          },
        },
      })

      // var summary = drawSummary(data)

      const summarise = _.debounce(function (data) {
        console.log('Summarising')
        console.log(data)
        const summary_data = []
        data.forEach((folder) => {
          var phase = folder.phase.slice(-1)
          summary_data[phase] = summary_data[phase] || {
            phase: `phase${phase}`,
            total_files: 0,
            include_files: 0,
            aws_files: 0,
          }

          summary_data[phase].total_files += folder.total_file_count
          summary_data[phase].include_files += folder.include_file_count
          summary_data[phase].include_files_size =
            folder.include_file_size_bytes
          if (folder.aws_files) {
            summary_data[phase].aws_files +=
              folder.aws_files.summary.total.object_count
            summary_data[phase].aws_size =
              folder.aws_files.summary.total.file_size_bytes
          }
        })

        summaryTable.clear()
        summaryTable.rows.add(summary_data)

        summaryTable.draw()
      }, 200)

      data.forEach(function (folder, i) {
        d3.json(folder.aws).then((aws_data) => {
          folder.aws_files = aws_data
          table.row(i).data(folder)

          globalData[folder.log_id] = folder
          debouncedDraw()
          summarise(data)
        })
      })
      // return data
      // Promise.all(
      //   data.map(function (folder, i) {
      //     return d3.json(folder.aws).then(function (aws_data) {
      //       table.row(i).data({
      //         ...folder,
      //         aws_files: aws_data,
      //       })
      //       _.debounce(table.draw, 500)()
      //     }).then((aws_data) => {
      //       return {
      //         ...folder,
      //         aws_files: aws_data,
      //       }
      //     })
      //   })
      // ).then(function (data) {

      //   const counter = {}
      //   data.forEach((folder) => {
      //     counter[folder.phase] = counter[folder.phase] || {
      //       include_files: 0,
      //       include_size: 0,
      //       aws_objects: 0,
      //       aws_size: 0,
      //     }
      //     counter[folder.phase].include_files += folder.include_file_count
      //     counter[folder.phase].include_size += folder.include_file_size_bytes
      //     counter[folder.phase].aws_objects += folder.aws_files.summary.total.object_count
      //     counter[folder.phase].aws_size += folder.aws_files.summary.total.file_size_bytes
      //   })

      //   console.log(counter)
      // })
    })
})

const globalData = {}

function drawTable(dataset: DataTableDataset) {
  dataset.forEach((row) => {
    if (row.summary) {
      row.total_file_count = parseInt(row.summary.total.file_count)
      row.total_file_size_bytes = parseInt(row.summary.total.file_size_bytes)
      row.total_file_size_display = row.summary.total.file_size_human
      row.include_file_count = parseInt(row.summary.include.file_count)
      row.include_file_size_bytes = parseInt(
        row.summary.include.file_size_bytes
      )
      row.include_file_size_display = row.summary.include.file_size_human

      var regex = '(.*)/(.*_.(.*))/contracts.*/(.*)'
      var matches = row.contract_dir.match(regex)

      row.log_id = `${matches[3]}_${matches[4]}`
    }
  })

  return decorateTable(dataset, {
    element: 'table#my_table',
    titles: [
      'phase',
      'log_id',
      'total_files',
      'include_files',
      'aws_files',
      'difference',
    ],
    info: true,
    search: true,
    searching: true,
    paging: true,
    pageLength: 10,
    customData: {
      total_files: {
        sort: 'total_file_size_bytes',
        display: 'total_file_size_display',
      },
      include_files: {
        sort: 'include_file_size_bytes',
        display: 'include_file_size_display',
      },
    },
    customRenderers: {
      log_id: (data, type, row, meta) => {
        return `<a href="#none" onclick="displayFiles('${row.log_id}')">${row.log_id}</a><br>${row.contract_dir}`
      },
      total_files: (data, type, row, meta) => {
        if (row.total_file_count === undefined) {
          return 'Loading...'
        }
        return `${row.total_file_count}<br>${row.total_file_size_display}`
      },
      include_files: (data, type, row, meta) => {
        if (row.include_file_count === undefined) {
          return 'Loading...'
        }
        return `${row.include_file_count}<br>${row.include_file_size_display}`
      },
      aws_files: (data, type, row, meta) => {
        if (row.aws_files === undefined) {
          return 'Loading...'
        }
        const match =
          row.aws_files.summary.total.object_count == row.include_file_count
            ? 'green'
            : 'red'
        return `<span class="${match}">${row.aws_files.summary.total.object_count}<br>${row.aws_files.summary.total.file_size_human}</span>`
      },
      difference: (data, type, row, meta) => {
        if (row.aws_files === undefined) {
          return 'Loading...'
        }
        const diff =
          row.include_file_count - row.aws_files.summary.total.object_count
        return diff
      },
    },
  })
}

globalThis.displayFiles = function displayFiles(log_id) {
  console.log('Displaying files for', log_id)

  const tableBody = d3.select('#files_table tbody').html('')

  let original_files = []
  let intersection = []
  let aws_files = []

  d3.json(globalData[log_id].full)
    .then((full) => {
      globalData[log_id].full_data = full
      const data = globalData[log_id]
      console.log(data)

      // Remove /data/Analysis/ from the path
      const base_dir = data.contract_dir.replace('/data/Analysis/', '')
      // Normalise path so that /./ is removed
      original_files = _.concat(
        data.full_data.list.include.files,
        data.full_data.list.include.symlinks
      )
        .map(([filename, relative_path, ...rest]) =>
          `${base_dir}/${relative_path}/${filename}`.replace('/./', '/')
        )
        .sort()

      // Symlinks?

      // original_files = data.full_data.list.include.files.map(([filename, relative_path, ...rest]) => `${base_dir}/${relative_path}/${filename}`).sort()
      aws_files = data.aws_files.list.include
        .map((s3_object) => s3_object.Key)
        .sort()

      // Get the union of both files
      intersection = _.intersection(original_files, aws_files)

      const aws_only = _.difference(aws_files, original_files)
      const original_only = _.difference(original_files, aws_files)

      return {
        original_only,
        aws_only,
        intersection,
      }
    })
    .then(({ original_only, aws_only, intersection }) => {
      console.log('Displaying files', { original_only, aws_only, intersection })

      const max_length = Math.max(
        original_only.length,
        aws_only.length,
        intersection.length
      )

      for (let i = 0; i < max_length; i++) {
        const row = tableBody.append('tr')
        row.append('td').text(original_only[i] || '')
        row.append('td').text(intersection[i] || '')
        row.append('td').text(aws_only[i] || '')
      }
    })
}

// import { drawDirs } from './files'

// const jobs: {
//   [key: string]: Job[]
// } = {}

// // ['JobID', 'JobName', 'MaxRSS', 'UserCPU', 'CPUTime', 'AveCPU', 'Elapsed', 'State', 'ExitCode', 'Start', 'End']
// type Job = {
//   JobID: string
//   JobName: string
//   MaxRSS: string
//   UserCPU: string
//   CPUTime: string
//   AveCPU: string
//   Elapsed: string
//   State: string
//   ExitCode: string
//   Start: string
//   End: string
// }

// const color = d3
//   .scaleOrdinal()
//   .range([
//     '#a6cee3',
//     '#1f78b4',
//     '#b2df8a',
//     '#33a02c',
//     '#fb9a99',
//     '#e31a1c',
//     '#fdbf6f',
//     '#ff7f00',
//     '#cab2d6',
//     '#6a3d9a',
//     '#ffff99',
//     '#b15928',
//   ])
//   .domain([
//     'fastq',
//     'fastq.gz',
//     'txt',
//     'hist.txt',
//     'json',
//     'json.gz',
//     'bam',
//     'mate2',
//     'mate1',
//     'pairsam',
//     'sam',
//     'vcf',
//     'gvcf',
//     'tmp',
//     'bed',
//     'junction',
//     'log',
//     'pac',
//     'fa',
//     'bin',
//     'out',
//   ])

// const named_jobs = {}
// const bad_pks = [
//   '6166',
//   '6167',
//   '8251',
//   '9263',
//   '9613',
//   '9669',
//   '9811',
//   '9884',
//   '10019',
//   '10050',
//   '10067',
//   '10149',
//   '10245',
//   '10331',
//   '10491',
//   '12198',
//   '12323',
//   '12783',
//   '12953',
//   '12954',
//   '13355',
//   '14597',
//   '15768',
//   '15769',
//   '17690',
//   '19335',
//   '19342',
//   '19452',
//   '19671',
//   '19897',
// ]

// // ['Primary Key', 'Analysis Path', 'Contract Id', 'Run', 'Date Sent', 'Data Sender', 'Purge', 'Purge Approver', 'Purge Notes', 'Retention Notes', 'Retention Notes Author', 'Publish As Benchmarking Data', 'instrument_name', 'machine_model']
// type Contract = {
//   'Primary Key': string
//   'Analysis Path': string
//   'Contract Id': string
//   Run: string
//   'Date Sent': string
//   'Data Sender': string
//   Purge: string
//   'Purge Approver': string
//   'Purge Notes': string
//   'Retention Notes': string
//   'Retention Notes Author': string
//   'Publish As Benchmarking Data': string
//   instrument_name: string
//   machine_model: string
// }

// const contracts: {
//   [key: string]: Contract
// } = {}

// type FileInfoArray = [
//   filename: string,
//   directory: string,
//   filesize: string,
//   date_modified: string,
//   status: string,
//   level: string
// ]

// type ClinicalData = {
//   contract_dir: string
//   files: FileInfoArray[]
//   info: string[]
//   warnings: string[]
//   errors: string[]
//   summary: {
//     include: {
//       file_count: number
//       file_size_bytes: number
//       file_size_human: string
//     }
//     exclude: {
//       file_count: number
//       file_size_bytes: number
//       file_size_human: string
//     }
//     total: {
//       file_count: number
//       file_size_bytes: number
//       file_size_human: string
//     }
//   }
// }

// type Clinical_Excel_Data = {
//   run_id: string
//   additional_bioinformatics: string
//   approved_to_send_out: string
//   archive_file_retention_date_fastq: string
//   archive_file_retention_date_vcf: string
//   archive_file_retention_days_fastq: string
//   archive_file_retention_days_vcf: string
//   basecalls_count: string
//   basecalls_present: string
//   basecalls_size: string
//   client_emails: string
//   client_username: string
//   contract_expected_fastq_count: string
//   contract_folder_bam_count: string
//   contract_folder_bam_size: string
//   contract_folder_fastq_checksum_count: string
//   contract_folder_fastq_count: string
//   contract_folder_fastq_size: string
//   contract_folder_keep_file_count: string
//   contract_folder_path: string
//   contract_folder_storage: string
//   contract_folder_vcf_count: string
//   contract_folder_vcf_size: string
//   contract_id: string
//   contract_pk: string
//   contract_sent: string
//   contract_sent_days_ago: string
//   contract_status: string
//   first_approver: string
//   has_archive_files_retention_period_passed_fastq: string
//   has_archive_files_retention_period_passed_vcf: string
//   has_archive_keep_file: string
//   has_current_secondary_analysis: string
//   has_retain_file: string
//   instrument_name: string
//   is_clinical: string
//   is_clinical_internal_or_reference: string
//   is_internal: string
//   logical_location: string
//   matching_contract_folders: string
//   purged: string
//   reference_data: string
//   run_number: string
//   second_approver: string
//   secondary_analysis_analyst: string
//   secondary_analysis_folder_count: string
//   secondary_analysis_folder_path: string
//   secondary_analysis_folder_size: string
// }

// const pks = {}

// function filter_duplicate_log_ids(JSONs: string[]) {
//   // Filter out Contract Folders with duplicate log_ids
//   const counter: {
//     [key: string]: string[]
//   } = {}

//   JSONs.forEach((json) => {
//     const parts = json.split('_')
//     const log_id = `${parts[0]}_${parts[1]}`
//     if (counter[log_id]) {
//       counter[log_id].push(json)
//     } else {
//       counter[log_id] = [json]
//     }
//   })
//   return Object.values(counter)
//     .filter((jsons) => jsons.length == 1)
//     .flat()
// }

// function findDuplicates<T>(array: T[], keyFunction: (T) => string): T[] {
//   const collection = new Map<string, T[]>()
//   for (const item of array) {
//     const key = keyFunction(item)
//     collection.has(key)
//       ? collection.get(key).push(item)
//       : collection.set(key, [item])
//   }
//   return Array.from(collection.values())
//     .filter((items) => items.length > 1)
//     .flat()
// }
// function findUnique<T>(array: T[], keyFunction: (T) => string): T[] {
//   const collection = new Map<string, T[]>()
//   for (const item of array) {
//     const key = keyFunction(item)
//     collection.has(key)
//       ? collection.get(key).push(item)
//       : collection.set(key, [item])
//   }
//   return Array.from(collection.values())
//     .filter((items) => items.length == 1)
//     .flat()
// }

// globalThis.click_me = function (log_id: string) {
//   // @ts-ignore
//   toggleSlider('open')
//   d3.select(`#slideOutFooter div.content`).html('')

//   displayData(log_id)
// }

// function displayData(log_id: string) {
//   const box = d3.select(`#slideOutFooter div.content`)
//   d3.json(`/AGRF/clinical/${log_id}.json`).then(function (d: ClinicalData) {
//     box.append('h2').text(log_id)
//     const row = box.append('div').classed('row', true)

//     row
//       .append('div')
//       .classed('col-xs-6', true)
//       .attr('id', `footer-treemap-${log_id}`)

//     row
//       .append('div')
//       .classed('col-xs-6', true)
//       .classed('filestructure', true)
//       .attr('id', `footer-legend-${log_id}`)

//     drawTreeMap({
//       data: d,
//       log_id,
//       element_id: `#slideOutFooter div.content div#footer-treemap-${log_id}`,
//       legend_id: `#slideOutFooter div.content div#footer-legend-${log_id}`,
//     })
//   })

//   //   const inner_table = d3
//   //   .select(`#clinical_row2-${log_id}`)
//   //   .append('td')
//   //   .attr('colspan', columns.length - 4)
//   //   .append('table')

//   // inner_table
//   //   .append('thead')
//   //   .append('tr')
//   //   .selectAll('th')
//   //   .data(['Type', 'Filepath', 'Size', 'Status', 'Level'])
//   //   .enter()
//   //   .append('th')
//   //   .text((d) => d)

//   // inner_table
//   //   .append('tbody')
//   //   .selectAll('tr')
//   //   .data(
//   //     d.files.filter((file) => file[4] !== 'included_folder')
//   //   )
//   //   .enter()
//   //   .append('tr')
//   //   .html((file) => {
//   //     const file_relative_path = [
//   //       file[1].split(contract_id).pop(),
//   //       file[0],
//   //     ]
//   //       .join('/')
//   //       .slice(1)

//   //     const filetype = getFiletype(file[0])
//   //     const size = human_readable_size(parseInt(file[2]))

//   //     return `<td style="color: black; background:${color(
//   //       filetype
//   //     )}">${filetype}</td><td>${file_relative_path}</td><td>${size}</td><td>${
//   //       file[4]
//   //     }</td><td>${file[5]}</td>`
//   //   })
// }

// /**
//  * Add list to Sankey Node
//  * Apply filter to list to split the list into 2 outcomes
//  * Add the 2 outcomes as Sankey Nodes, then add the links between the nodes
//  * Bind the lists to DataTables
//  * Return the positive list
//  */
// function filter_list<T>({
//   data,
//   sankeyData,
//   filter,
//   uniqueKeyFunction,
//   names,
// }: {
//   data: T[]
//   sankeyData: SankeyData
//   filter?: (d: T) => boolean
//   uniqueKeyFunction?: (T) => string
//   names: {
//     original: string
//     positive: string
//     positiveID: string
//     negative: string
//     negativeID: string
//   }
// }) {
//   let positive: T[]
//   let negative: T[]
//   if (filter) {
//     positive = data.filter(filter)
//     negative = data.filter((d) => !filter(d))
//   } else if (uniqueKeyFunction) {
//     positive = findUnique(data, uniqueKeyFunction)
//     negative = findDuplicates(data, uniqueKeyFunction)
//   } else {
//     throw new Error('Must provide either filter or uniqueKeyFunction')
//   }

//   sankeyData.nodes.find((d) => d.name === names.original) ||
//     sankeyData.nodes.push({ name: names.original, category: 'Start' })

//   sankeyData.nodes.push({ name: names.positive, category: 'Good' })
//   sankeyData.nodes.push({ name: names.negative, category: 'Reject' })

//   sankeyData.links.push({
//     source: names.original,
//     target: names.positive,
//     value: positive.length,
//   })

//   sankeyData.links.push({
//     source: names.original,
//     target: names.negative,
//     value: negative.length,
//   })

//   decorateContractTable(positive, `table#${names.positiveID}`)
//   decorateContractTable(negative, `table#${names.negativeID}`)

//   return positive
// }

// d3.json('/clinical')
//   // .then(filter_duplicate_log_ids)
//   .then(function (JSONs: string[]) {
//     return Promise.all([
//       d3.csv('/AGRF/contract_list_for_purging_is_clinical_2024_08_28.csv'),
//       ...JSONs.map((json) =>
//         d3.json(`/AGRF/clinical_5/${json}`).catch((err) => {
//           console.error(err)
//           console.error(json)
//           return null
//         })
//       ),
//     ])
//       .then(function ([excelData, ...data]: [any, ClinicalData]) {
//         const result: [Clinical_Excel_Data[], ClinicalData[]] = [
//           excelData,
//           data.sort((a, b) => {
//             return a.summary.total.file_size_bytes <
//               b.summary.total.file_size_bytes
//               ? -1
//               : 1
//           }),
//         ]
//         return result
//       })
//       .then(function ([excelData, data]) {
//         type CombinedData = Clinical_Excel_Data & Partial<ClinicalData>

//         const combined: CombinedData[] = excelData.map((exData) => {
//           const clinical = data.find(
//             (c) => c.contract_dir === exData.contract_folder_path
//           )
//           if (!clinical) {
//             console.info('No clinical data for', exData.contract_folder_path)
//             return exData
//           }

//           return Object.assign(exData, clinical)
//         })

//         const sankeyData: SankeyData = {
//           nodes: [],
//           links: [],
//         }
//         // PurgeList,UniqueFolders,DuplicateFolders,UniquePK,DuplicatePK,LessThan200mb,MoreThan200mb,LessThan1000Files,MoreThan1000Files,CleanProject,DirtyProject,NoBams,ContainsBams

//         // contract_pk,Log ID,Total File Size,Total File Count,Analyst,First Approver,Contract Folder Path,Date Sent,Command

//         decorateContractTable(excelData, 'table#PurgeList')

//         const unique_folders = filter_list({
//           data: excelData,
//           sankeyData,
//           uniqueKeyFunction: (d) => d.contract_folder_path,
//           names: {
//             original: '"Clinical" Bioweb cases',
//             positive: 'Unique Folder',
//             positiveID: 'UniqueFolders',
//             negative: 'Duplicate Folder',
//             negativeID: 'DuplicateFolders',
//           },
//         })

//         const unique_contract_pks = filter_list({
//           data: unique_folders,
//           sankeyData,
//           uniqueKeyFunction: (d) => d.contract_pk,
//           names: {
//             original: 'Unique Folder',
//             positive: 'Unique contract_pk',
//             positiveID: 'UniquePK',
//             negative: 'Duplicate contract_pk',
//             negativeID: 'DuplicatePK',
//           },
//         })
//           .map((d) => {
//             const clinical = data.find(
//               (c) => c.contract_dir === d.contract_folder_path
//             )
//             return {
//               ...d,
//               ...clinical,
//             }
//           })
//           .filter((d) => bad_pks.includes(d.contract_pk) === false)

//         const more_than_200mb = filter_list({
//           data: unique_contract_pks,
//           sankeyData,
//           filter: (d) => d.summary.total.file_size_bytes > 200_000_000,
//           names: {
//             original: 'Unique contract_pk',
//             positive: 'More than 200 mb total folder size',
//             positiveID: 'MoreThan200mb',
//             negative: 'Less than 200 mb total folder size',
//             negativeID: 'LessThan200mb',
//           },
//         })

//         const less_than_1000_files = filter_list({
//           data: more_than_200mb,
//           sankeyData,
//           filter: (d) => d.summary.total.file_count < 1_000,
//           names: {
//             original: 'More than 200 mb total folder size',
//             positive: 'Less than 1000 files',
//             positiveID: 'LessThan1000Files',
//             negative: 'More than 1000 files',
//             negativeID: 'MoreThan1000Files',
//           },
//         })

//         const clean_project_folder = filter_list({
//           data: less_than_1000_files,
//           sankeyData,
//           filter: (d) => d.summary.exclude.file_count == 0,
//           names: {
//             original: 'Less than 1000 files',
//             positive: 'Clean Project Folder',
//             positiveID: 'CleanProject',
//             negative: 'Dirty Project Folder',
//             negativeID: 'DirtyProject',
//           },
//         })

//         Promise.all(
//           clean_project_folder.map((d) => {
//             const info = extract_info_from_folder(d.contract_folder_path)
//             return d3.json(
//               `/AGRF/clinical/${info.flowcell}_${info.contract_id}.json`
//             )
//           })
//         )
//           .then((fullClinicalData: ClinicalData[]) => {
//             return clean_project_folder.map((exData) => {
//               const clinical = fullClinicalData.find(
//                 (c) => c.contract_dir === exData.contract_folder_path
//               )
//               if (!clinical) {
//                 console.info(
//                   'No full clinical data for',
//                   exData.contract_folder_path
//                 )
//                 return exData
//               }

//               return Object.assign(exData, clinical)
//             })
//           })
//           .then((fullClinicalData: CombinedData[]) => {
//             const no_bams = filter_list({
//               data: fullClinicalData,
//               sankeyData,
//               filter: (d) =>
//                 d.files.filter((file) => file[0].endsWith('.bam')).length == 0,
//               names: {
//                 original: 'Clean Project Folder',
//                 positive: 'No BAM files',
//                 positiveID: 'NoBams',
//                 negative: 'BAM files present',
//                 negativeID: 'ContainsBams',
//               },
//             })

//             sankeyData.nodes.push({ name: 'Upload Phase 1', category: 'End' })

//             sankeyData.links.push({
//               source: 'No BAM files',
//               target: 'Upload Phase 1',
//               value: no_bams.length,
//             })

//             sankeyData.nodes.push({ name: 'Upload Phase 2', category: 'End' })
//             sankeyData.links.push({
//               source: 'BAM files present',
//               target: 'Upload Phase 2',
//               value: fullClinicalData.length - no_bams.length,
//             })

//             sankeyData.nodes.push({ name: 'Upload Phase 3', category: 'End' })
//             sankeyData.links.push({
//               source: 'Dirty Project Folder',
//               target: 'Upload Phase 3',
//               value: less_than_1000_files.length - clean_project_folder.length,
//             })
//             sankeyData.links.push({
//               source: 'More than 1000 files',
//               target: 'Upload Phase 3',
//               value: more_than_200mb.length - less_than_1000_files.length,
//             })
//             sankeyData.links.push({
//               source: 'Less than 200 mb total folder size',
//               target: 'Upload Phase 3',
//               value: unique_contract_pks.length - more_than_200mb.length,
//             })

//             sankeyData.nodes.push({ name: 'Upload Phase 4', category: 'End' })
//             sankeyData.links.push({
//               source: 'Duplicate contract_pk',
//               target: 'Upload Phase 4',
//               value: unique_folders.length - unique_contract_pks.length,
//             })
//             sankeyData.links.push({
//               source: 'Duplicate Folder',
//               target: 'Upload Phase 4',
//               value: excelData.length - unique_folders.length,
//             })

//             drawSankey(sankeyData)
//           })

//         const table = d3.select('table#clinical')
//         const columns = [
//           'contract_pk',
//           'Log ID',
//           'Total File Size',
//           'Total File Count',
//           // 'Client Username',
//           // 'Client Emails',
//           'Analyst',
//           'First Approver',
//           'Contract Folder Path',
//           'Date Sent',
//           'Command',
//           // 'Contract Dir',
//           // 'Secondary Analysis Folder Path',
//         ]

//         table
//           .select('thead')
//           .append('tr')
//           .selectAll('th')
//           .data(columns)
//           .enter()
//           .append('th')
//           .html(function (d) {
//             return d
//           })

//         table
//           .select('tbody')
//           .selectAll('tr')
//           .data(data)
//           .enter()
//           .append('tr')
//           .each(function (d, i) {
//             const { instrument, run, flowcell, contract_id } =
//               extract_info_from_folder(d.contract_dir)
//             const excel = excelData.find(
//               (ex) => ex.contract_folder_path === d.contract_dir
//             )
//             if (!excel) {
//               console.error('No excel data for', d.contract_dir)
//               return
//             }
//             combined.push({ ...d, ...excel })

//             const contract_pk = excel.contract_pk.split('.')[0]
//             if (bad_pks.includes(contract_pk)) {
//               d3.select(this).remove()
//               return
//             }
//             // pks[contract_pk] ? pks[contract_pk]++ : (pks[contract_pk] = 1)

//             const log_id = `${flowcell}_${contract_id}`
//             // const row_id = `row-${excel.contract_pk}`

//             var row2 = d3
//               .select(this)
//               .attr('id', `clinical_row2-${log_id}`)
//               .classed('hidden', true)

//             var tr = table
//               .select('tbody')
//               .insert('tr', `#clinical_row2-${log_id}`)
//               .attr('id', `clinical_row-${log_id}`)

//             // Index
//             tr.append('td')
//               .append('a')
//               .attr(
//                 'href',
//                 `http://bioweb02.agrf.org.au/nextgenpipeline/admin/nextgenruns/contract/${contract_pk}/change/`
//               )
//               .attr('target', '_blank')
//               .text(contract_pk)

//             var log_id_td = tr
//               .append('td')
//               .classed('log_id_td', true)
//               .style('text-wrap', 'nowrap')

//             log_id_td
//               .append('a')
//               .attr('href', `#x`)
//               .on('click', function () {
//                 drawSecondRow(log_id)
//                 $(`#clinical_row2-${log_id}`).toggleClass('hidden')
//               })
//               .text(log_id)

//             log_id_td.append('p').text(log_id)

//             tr.append('td').text(d.summary.include.file_size_human)

//             tr.append('td').text(d.summary.total.file_count)

//             // tr.append('td').text(instrument)
//             // tr.append('td').text(run)
//             // tr.append('td').text(flowcell)

//             // tr.append('td')
//             //   .style('display', 'none')
//             //   .datum(d)
//             //   .html((d) => {
//             //     const bams = d.files.filter((file) => file[0].endsWith('.bam'))

//             //     return bams.map((bam) => `${bam[2]} ${bam[0]}`).join('<br>')
//             //   })
//             //   .classed('red', (d) => {
//             //     if (
//             //       d.files.filter((file) => file[0].endsWith('.bam')).length > 0
//             //     ) {
//             //       // tr.style('display', 'none')
//             //       d3.select(this).attr('title', 'Warning: BAM files present')
//             //       return true
//             //     } else {
//             //       return false
//             //     }
//             //   })

//             //           var analyst = tr.append('td').html(
//             //             `${excel ? excel.secondary_analysis_analyst : ''}<br>
//             // ${excel ? excel.first_approver : ''}<br>
//             // ${excel ? excel.contract_sent : ''}
//             // `
//             //           )
//             // tr.append('td').text(excel.client_username)
//             // tr.append('td').text(excel.client_emails.split(',').join(', '))

//             tr.append('td').text(excel.secondary_analysis_analyst)
//             tr.append('td').text(excel.first_approver)

//             tr.append('td')
//               .text(excel.contract_folder_path)
//               .datum(d)
//               .classed('red', (d) => {
//                 if (excel.contract_folder_path !== d.contract_dir) {
//                   return true
//                 } else {
//                   return false
//                 }
//               })

//             tr.append('td')
//               .style('white-space', 'nowrap')
//               .text(excel.contract_sent)

//             tr.append('td')
//               .style('white-space', 'nowrap')
//               .append('code')
//               .text(
//                 `cloudian_cache_workaround.sh ${
//                   d.contract_dir.split('/data/Analysis/')[1]
//                 } clinical ${excel.contract_sent}`
//               )

//             // tr.append('td').text(d.contract_dir)
//             // tr.append('td').text(excel.secondary_analysis_folder_path)

//             // d3.select(this).append('td').text(d['Primary Key'])
//             // d3.select(this).append('td').text(d['Analysis Path'])
//             // d3.select(this).append('td').text(d['Contract Id'])
//             // d3.select(this).append('td').text(d['Run'])
//             // d3.select(this).append('td').text(d['Date Sent'])
//             // d3.select(this).append('td').text(d['Data Sender'])
//             // d3.select(this).append('td').text(d['Purge'])
//             // d3.select(this).append('td').text(d['Purge Approver'])
//             // d3.select(this).append('td').text(d['Purge Notes'])
//             // d3.select(this).append('td').text(d['Retention Notes'])
//             // d3.select(this).append('td').text(d['Retention Notes Author'])
//             // d3.select(this).append('td').text(d['Publish As Benchmarking Data'])
//             // d3.select(this).append('td').text(d['instrument_name'])
//             // d3.select(this).append('td').text(d['machine_model'])

//             function drawSecondRow(log_id) {
//               d3.json(`/AGRF/clinical/${log_id}.json`).then(
//                 (d: ClinicalData) => {
//                   // if row has already been drawn, skip
//                   if (d3.select(`#clinical_row2-${log_id} svg`).node()) {
//                     // console.log("Already done, skipping!")
//                     return
//                   }

//                   if (d.files.length === 0 || d.files.length > 10000) {
//                     d3.select(`#clinical_row2-${log_id}`)
//                       .append('td')
//                       .attr('colspan', columns.length)
//                       .text(`Too many files to display: ${d.files.length}`)

//                     return
//                   }

//                   d3.select(`#clinical_row2-${log_id}`)
//                     .append('td')
//                     .attr('colspan', 4)
//                     .append('div')
//                     .classed('followScroll', true)

//                   drawTreeMap({
//                     data: d,
//                     log_id,
//                     element_id: `#clinical_row2-${log_id} td div`,
//                     legend_id: null,
//                   })

//                   const inner_table = d3
//                     .select(`#clinical_row2-${log_id}`)
//                     .append('td')
//                     .attr('colspan', columns.length - 4)
//                     .append('table')

//                   inner_table
//                     .append('thead')
//                     .append('tr')
//                     .selectAll('th')
//                     .data(['Type', 'Filepath', 'Size', 'Status', 'Level'])
//                     .enter()
//                     .append('th')
//                     .text((d) => d)

//                   inner_table
//                     .append('tbody')
//                     .selectAll('tr')
//                     .data(
//                       d.files.filter((file) => file[4] !== 'included_folder')
//                     )
//                     .enter()
//                     .append('tr')
//                     .html((file) => {
//                       const file_relative_path = [
//                         file[1].split(contract_id).pop(),
//                         file[0],
//                       ]
//                         .join('/')
//                         .slice(1)

//                       const filetype = getFiletype(file[0])
//                       const size = human_readable_size(parseInt(file[2]))

//                       return `<td style="color: black; background:${color(
//                         filetype
//                       )}">${filetype}</td><td>${file_relative_path}</td><td>${size}</td><td>${
//                         file[4]
//                       }</td><td>${file[5]}</td>`
//                     })
//                 }
//               )
//             }
//           })

//         return combined
//       })
//     // .then(() => {
//     //   // Get the "Bad" PKs
//     //   console.log('PKs', pks)
//     //   var filtered = Object.entries(pks).filter(([pk, count]:any) => count > 1).map(([pk, count]:any) => pk)
//     //   console.log('Filtered', filtered)
//     // })
//   })
//   .then(function (data) {
//     console.log('clinical data', data)
//     var options = {
//       element: 'table#DataTable',
//     }

//     const output = decorateTable(data, options)
//     console.log('Datatables Output', output)

//     data.forEach((d) => {})
//   })

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

// // d3.json(`/AGRF/clinical_jsons/${log_id}.json`).then(
// // )

// Promise.all([
//   d3.csv('/AGRF/mysql_reference_contracts_2024-08-19.csv').then((data) => {
//     data.forEach((contract: Contract) => {
//       contracts[log_id_from_contract(contract)] = contract
//     })
//     return contracts
//   }),
//   d3
//     .dsv('|', '/AGRF/slurm_logs_2024_08_19.csv')
//     .then(function (data) {
//       // console.log(data)
//       // console.log(Object.keys(data[0]))

//       data.forEach(function (d: Job) {
//         // console.log(d)
//         const id = d['JobID'].split('.')[0] || d['JobID']

//         if (id in jobs) {
//           jobs[id].push(d)
//         } else {
//           jobs[id] = [d]
//         }
//       })
//       return jobs
//     })
//     .then(function (jobs) {
//       // console.log('jobs', jobs)
//       // console.log(`Number of jobs: ${Object.entries(jobs).length}`)
//       Object.entries(jobs).forEach(function ([jobId, jobGroup]) {
//         // console.log(jobId)
//         const log_id = get_log_id(jobGroup)

//         if (log_id) {
//           if (log_id in named_jobs) {
//             named_jobs[log_id].push(jobGroup)
//           } else {
//             named_jobs[log_id] = [jobGroup]
//           }
//         }
//       })
//       // console.log(named_jobs)
//       // console.log(`Number of named jobs: ${Object.entries(named_jobs).length}`)
//       // console.log(Object.keys(named_jobs))
//       return named_jobs
//     }),
// ]).then(function ([contracts, named_jobs]) {
//   const table = d3.select('table#internal-reference')

//   const thead = table.append('thead')
//   const tbody = table.append('tbody')

//   const columns = ['Log ID', 'Included', 'Excluded', 'Total', 'Warnings']
//   // const columns = ['Log ID', 'Jobs', 'Purge', 'Analysis Path', 'Date Sent']
//   thead
//     .append('tr')
//     .selectAll('th')
//     .data(columns)
//     .enter()
//     .append('th')
//     .text(function (d) {
//       return d
//     })

//   const rows = tbody
//     .selectAll('tr')
//     .data(Object.entries(contracts))
//     .enter()
//     .append('tr')
//     .each(function ([log_id, contract]: [string, Contract]) {
//       // if (log_id !== '22FG5GLT3_CAGRF12711') {
//       //   return
//       // }

//       var row2 = d3
//         .select(this)
//         .attr('id', `row2-${log_id}`)
//         .classed('hidden', true)

//       var modal = row2.append('td')
//       modal.append('div').attr('id', `treemap-${log_id}`)

//       var row = tbody
//         .insert('tr', `#row2-${log_id}`)
//         .attr('id', `row-${log_id}`)
//       var row_id = row.append('td').append('a').attr('href', `#x`).text(log_id)

//       row2
//         .append('td')
//         .attr('id', `modal-${log_id}`)
//         .attr('colspan', columns.length)
//         .text(`Second row for ${log_id}`)

//       // d3.select(this).append('td').text(named_jobs[log_id])
//       // d3.select(this).append('td').text(contract.Purge)
//       // d3.select(this).append('td').text(contract['Analysis Path'])
//       // d3.select(this).append('td').text(contract['Date Sent'])

//       // d3.json(`/AGRF/clinical_jsons/${log_id}.json`).then(
//       // d3.json(`/AGRF/summary_jsons/${log_id}.json`).then(
//       //   function (data: any) {
//       //     row_id.on('click', function () {
//       //       $(`#row2-${log_id}`).toggleClass('hidden')
//       //       drawTreeMap(data, log_id)
//       //     })

//       //     row
//       //       .append('td')
//       //       .append('a')
//       //       .attr('href', `#x`)
//       //       .on('click', function () {
//       //         $(`#row-${log_id} .files`).toggleClass('hidden')
//       //       })
//       //       .html(
//       //         `${data.summary.include.file_count} files<br>${data.summary.include.file_size_human}`
//       //       )
//       //     row
//       //       .append('td')
//       //       .append('a')
//       //       .attr('href', `#x`)
//       //       .on('click', function () {
//       //         $(`#row-${log_id} .info`).toggleClass('hidden')
//       //       })
//       //       .html(
//       //         `${data.summary.exclude.file_count} files<br>${data.summary.exclude.file_size_human}`
//       //       )
//       //     row
//       //       .append('td')
//       //       .html(
//       //         `${data.summary.total.file_count} files<br>${data.summary.total.file_size_human}`
//       //       )

//       //     var warnings = row.append('td').append('ul')
//       //     data.warnings.forEach((warning) => {
//       //       warnings.append('li').text(warning)
//       //     })

//       //     var fileBox = modal
//       //       .append('td')
//       //       // .classed('hidden files', true)
//       //       .append('ul')
//       //     data.files.forEach((file) => {
//       //       // console.log(file)
//       //       if (file[4] !== 'exclude' && file[4] !== 'included_folder') {
//       //         fileBox
//       //           .append('li')
//       //           .text(`${file[1].replace('s3_archive_tmp/./', '')}/${file[0]}`)
//       //       }
//       //     })

//       //     var infoBox = modal
//       //       .append('td')
//       //       // .classed('hidden info', true)
//       //       .append('ul')
//       //     data.info.forEach((info) => {
//       //       infoBox.append('li').text(info)
//       //     })
//       //   },
//       //   (error) => {
//       //     // row.remove()
//       //     row.append('td').text('Uploaded from VAST')
//       //     row2.remove()

//       //     var summary = row.append('td').attr('colspan', 3).append('ul')
//       //     // named_jobs[log_id].forEach((jobGroup) => {
//       //     //   jobGroup.forEach((job) => {
//       //     //     summary.append('li').text(job.JobName)
//       //     //   })
//       //     // })
//       //     // summary.text(JSON.stringify(named_jobs[log_id]))

//       //     // d3.select(this).append('td').text(contract.Purge)
//       //     // d3.select(this).append('td').text(contract['Analysis Path'])
//       //     // d3.select(this).append('td').text(contract['Date Sent'])
//       //   }
//       // )
//     })
// })

// function drawTreeMap({ data, log_id, element_id, legend_id }) {
//   if (data.files.length === 0) {
//     return
//   }

//   if (data.files.length > 10000) {
//     return
//   }

//   // d3.select(`#row2-${log_id} td`)
//   d3.select(element_id).html('').append('div').attr('id', `treemap-${log_id}`)

//   // console.log(data)
//   const contract = data.contract_dir.split('/').pop()
//   const omit_prefix = data.contract_dir

//   const files = data.files
//     .filter((file) => file[4] !== 'included_folder')
//     .map((file) => {
//       return {
//         path: `${contract}${file[1].replace(omit_prefix, '')}/${file[0]}`,
//         name: `${contract}${file[1].replace(omit_prefix, '')}/${file[0]}`,
//         filename: file[0],
//         directory: file[1],
//         filesize: file[2],
//         filetype: getFiletype(file[0]),
//         date_modified: file[3],
//         status: file[4],
//         level: file[5],
//       }
//     })
//   const root = d3.stratify().path((d: any) => d.path)(files)
//   root.sum((d: any) => (d ? d.filesize || 0 : 0))
//   console.log(root)
//   // .then(d3.stratify<FileNode>().path((d) => d.path))

//   const myChart = new Chart({
//     element: `treemap-${log_id}`,
//     margin: 5,
//     width: 500,
//     height: 1000,
//     nav: false,
//   }).initTreemap({
//     hierarchy: root,
//     target: 'filesize',
//     color,
//   })

//   if (legend_id) {
//     const legend = d3.select(legend_id).datum(root)

//     // @ts-ignore
//     drawDirs(legend)
//   }
// }

// function extract_info_from_folder(folder: string) {
//   // BASH regex from s3_sbatch_archive.sh
//   // regex_pattern="(/data/Analysis/)(.*)/(.*_.(.*))/contracts/(.*)"
//   // regex_pattern="(.*)/(.*_.(.*))/contracts.*/([^_]*)(_.*)?"

//   const regex_pattern =
//     /\/data\/Analysis\/(.*)\/(.*_.(.*))\/contracts(?:_\d+)?\/([^_]*)(?:_.*)?/

//   const match = folder.match(regex_pattern)
//   if (!match) {
//     console.error('No match for folder', folder)
//     return null
//   }
//   const [_, instrument, run, flowcell, contract_id] = match
//   return { instrument, run, flowcell, contract_id }
// }

// // Possible Job names:
// // ['s3_sbatch_archive_ACJ2FVM5_CAGRF12711', 'batch', 's3_ACJ2FVM5_CAGRF12711_etag_contract', 's3_ACJ2FVM5_CAGRF12711_etag_secondary', 's3_ACJ2FVM5_CAGRF12711_etag_secondary', 's3_ACJ2FVM5_CAGRF12711_etag_secondary', 's3_ACJ2FVM5_CAGRF12711_etag_secondary', 's3_ACJ2FVM5_CAGRF12711_archive_vast', 's3_ACJ2FVM5_CAGRF12711_archive_aws']
// // ['s3_archive_using_temp_folder-22HWGTLT3_CAGRF23081352']
// // aws_s3_archive_DP2NN_CAGRF12711
// // s3_etag_HTVFHDRX2_CAGRF12711
// function get_log_id(jobs: Job[]) {
//   const cloudian_workaround_regex = /s3_archive_using_temp_folder-(.*)/,
//     sbatch_regex = /s3_sbatch_archive_(.*)/,
//     etag_regex = /s3_(.*)_etag_.*/,
//     archive_regex = /s3_(.*)_archive_.*/,
//     old_archive_regex = /.*_s3_archive_(.*)/,
//     old_etag_regex = /s3_etag_(.*)/

//   const regexes = [
//     cloudian_workaround_regex,
//     sbatch_regex,
//     etag_regex,
//     archive_regex,
//     old_archive_regex,
//     old_etag_regex,
//   ]

//   const job_names = jobs.map((job) => job.JobName)

//   const job_name = regexes.reduce((acc, regex) => {
//     if (acc) return acc
//     const match = job_names.find((name) => name.match(regex))
//     return match ? match.match(regex) : null
//   }, null)

//   if (!job_name) {
//     // console.log('No match found')
//     // console.log(job_names)
//     return null
//   } else {
//     return job_name[1]
//   }
// }

// function log_id_from_contract(contract: Contract) {
//   const run = contract.Run,
//     contract_id = contract['Contract Id'],
//     flowcell = run.split('_').pop().slice(1)
//   return `${flowcell}_${contract_id}`
// }

// // Process the fresh list of clinical contracts. Remove the ones that have already been processed.
// //
// // Promise.all([
// //   d3
// //     .csv('/AGRF/contract_list_old.csv')
// //     .then((data) => data.map((d) => d.contract_folder_path)),
// //   d3
// //     .csv('/AGRF/contract_list_new.csv')
// //     .then((data) => data.map((d) => d.contract_folder_path)),
// // ]).then(([old_list, new_list]) => {
// //   console.log("Old List", old_list)
// //   console.log("New List", new_list)

// //   const fresh_stuff = []
// //   new_list.forEach((contract) => {
// //     if (old_list.indexOf(contract) === -1) {
// //       fresh_stuff.push(contract)
// //     }
// //   })
// //   return fresh_stuff
// // }).then((fresh_stuff) => {
// //   console.log('Fresh Stuff', fresh_stuff)
// //   console.log(JSON.stringify(fresh_stuff, null, 2))
// // })

// // d3.csv('/AGRF/contract_list_for_purging_is_clinical_2024_08_28.csv')
// //   .then((data) => data.map((d) => d.contract_folder_path))
// //   .then(JSON.stringify)
// //   .then(console.log)

// function getFiletype(filename) {
//   if (!filename) {
//     throw new Error('No filename provided')
//   }

//   const doubleExtensions = [
//     'tar',
//     'gz',
//     'zip',
//     'txt',
//     'bai',
//     'out',
//     'err',
//     'log',
//   ]
//   let filetype = 'unknown'

//   let parts = filename.split('.')
//   if (parts.length > 1) {
//     filetype = parts.pop()
//   }

//   if (doubleExtensions.includes(filetype) && parts.length > 1) {
//     filetype = parts.pop() + '.' + filetype
//   }

//   return filetype
// }

// import * as d3sankey from 'd3-sankey'

// import * as stdlib from '@observablehq/stdlib'
// import { run } from 'node:test'
// var library = new stdlib.Library()
// const DOM = library.DOM

// type SankeyNode = {
//   name: string
//   category: string
// }
// type SankeyLink = {
//   source: string
//   target: string
//   value: number
// }
// type SankeyData = {
//   nodes: SankeyNode[]
//   links: SankeyLink[]
// }

// function drawSankey(data: SankeyData) {
//   // Specify the dimensions of the chart.
//   const width = 1500
//   const height = 400
//   const format = d3.format(',.0f')

//   // Create a SVG container.
//   const svg = d3
//     // .create('svg')
//     .select('#sankey')
//     .append('svg')
//     // .attr('width', width)
//     // .attr('height', height)
//     .attr('viewBox', [0, 0, width, height])
//   // .attr('style', 'max-width: 100%; height: auto; font: 20px sans-serif;')

//   // Constructs and configures a Sankey generator.
//   const sankey = d3sankey
//     .sankey()
//     .nodeId((d: any) => d.name)
//     .nodeAlign(d3sankey.sankeyLeft) // d3.sankeyLeft, etc.
//     .nodeWidth(15)
//     .nodePadding(10)
//     .extent([
//       [1, 5],
//       [width - 1, height - 5],
//     ])

//   // Applies it to the data. We make a copy of the nodes and links objects
//   // so as to avoid mutating the original.
//   const { nodes, links } = sankey({
//     nodes: data.nodes.map((d: any) => Object.assign({}, d)),
//     links: data.links.map((d: any) => Object.assign({}, d)),
//   })

//   // Defines a color scale.
//   const color = d3
//     .scaleOrdinal(d3.schemeCategory10)
//     .domain(['Start', 'End', 'Good', 'Reject'])

//   // Creates the rects that represent the nodes.
//   const rect = svg
//     .append('g')
//     .attr('stroke', '#000')
//     .selectAll()
//     .data(nodes)
//     .join('rect')
//     .attr('x', (d) => d.x0)
//     .attr('y', (d) => d.y0)
//     .attr('height', (d) => d.y1 - d.y0)
//     .attr('width', (d) => d.x1 - d.x0)
//     .attr('fill', (d: any) => color(d.category))

//   // Adds a title on the nodes.
//   rect.append('title').text((d: any) => `${d.name}\n${format(d.value)} TWh`)

//   // Creates the paths that represent the links.
//   const link = svg
//     .append('g')
//     .attr('fill', 'none')
//     .attr('stroke-opacity', 0.5)
//     .selectAll()
//     .data(links)
//     .join('g')
//     .style('mix-blend-mode', 'multiply')

//   var linkColor = 'source-target'
//   // Creates a gradient, if necessary, for the source-target color option.
//   if (linkColor === 'source-target') {
//     const gradient = link
//       .append('linearGradient')
//       .attr('id', (d: any) => (d.uid = DOM.uid('link')).id)
//       .attr('gradientUnits', 'userSpaceOnUse')
//       .attr('x1', (d: any) => d.source.x1)
//       .attr('x2', (d: any) => d.target.x0)
//     gradient
//       .append('stop')
//       .attr('offset', '0%')
//       .attr('stop-color', (d: any) => color(d.source.category))
//     gradient
//       .append('stop')
//       .attr('offset', '100%')
//       .attr('stop-color', (d: any) => color(d.target.category))
//   }

//   link
//     .append('path')
//     .attr('d', d3sankey.sankeyLinkHorizontal())
//     .attr(
//       'stroke',
//       linkColor === 'source-target'
//         ? (d: any) => d.uid
//         : linkColor === 'source'
//         ? (d: any) => color(d.source.category)
//         : linkColor === 'target'
//         ? (d: any) => color(d.target.category)
//         : linkColor
//     )
//     .attr('stroke-width', (d) => Math.max(1, d.width))

//   link
//     .append('title')
//     .text(
//       (d: any) => `${d.source.name} → ${d.target.name}\n${format(d.value)} TWh`
//     )

//   // Adds labels on the nodes.
//   svg
//     .append('g')
//     .selectAll()
//     .data(nodes)
//     .join('text')
//     .attr('x', (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
//     .attr('y', (d) => (d.y1 + d.y0) / 2)
//     .attr('dy', '0.35em')
//     .attr('text-anchor', (d) => (d.x0 < width / 2 ? 'start' : 'end'))
//     .text((d: any) => `${d.name} (${format(d.value)})`)

//   return svg.node()
// }
