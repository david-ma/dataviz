console.log('AGRF Monthly data usage')

import { d3, Chart, decorateTable, DataTableDataset, _ } from './chart'

const important_columns = [
  // "contract_sent",
  // 'basecalls_size',
  'contract_folder_fastq_size',
  'contract_folder_bam_size',
  'contract_folder_vcf_size',
  'secondary_analysis_folder_size',
]

const months = {}

const runs = {}

const disk_usage_cols = [
  'bytes',
  'run_id',
  'contract_id',
  'demux_pk',
  'path',
  'storage',
  'user',
  'date_sent',
  'size_human_readable',
]

function drawContractFolders(data) {
  d3.select('#contract_folders table').selectAll('tr').data(data).append(data)
}

d3.csv('/AGRF/disk_usage_2025-02-11.csv').then((data) => {
  console.log('disk_usage_2025-02-11.csv', data)
})

const monthly_data = {}
d3.json('/agrf_monthly_data')
  .then((data) => data[1])
  .then((data) => {
    console.log('agrf_monthly_data', data)
    console.log(Object.keys(data[0]))

    drawReadLookingGraph(data)

    // 'id', 'path', 'run_id', 'contract_folder', 'contract_id', 'demux_id', 'storage_platform', 'data_size'
    // stop_timestamp

    // Bucket the data by month.
    var total_data_used = 0
    var total_disk_used = 0
    data.forEach((row) => {
      row.bytes = parseInt(row.bytes)
      row.preflight_bytes = parseInt(row.preflight_bytes)
      row.size = Math.max(row.bytes, row.preflight_bytes)
      total_data_used += row.size
      total_disk_used += row.bytes

      if (!row.stop_timestamp) {
        // console.log('No stop_timestamp', row)
        return
      }
      const parts = row.stop_timestamp.split('-')

      if (parts[0]) {
        const month = `${parts[0]}-${parts[1]}`
        monthly_data[month] = monthly_data[month] || {
          disk_size: 0,
          total_size: 0,
          total_rows: 0,
          rows: [],
        }
        monthly_data[month].rows.push(row)
        monthly_data[month].disk_size += row.bytes
        monthly_data[month].total_size += row.size
        monthly_data[month].total_rows += 1
        monthly_data[month].human_readable_size = human_readable_size(
          monthly_data[month].total_size,
        )
      }
    })
    console.log('Total data used', human_readable_size(total_data_used))
    console.log('Total disk used', human_readable_size(total_disk_used))
    return monthly_data
  })
  .then((monthly_data) => {
    console.log('monthly_data', monthly_data)

    const shaped_data = Object.entries(monthly_data)
      .map(([month, data]: any) => {
        return {
          timestamp: d3.timeParse('%Y-%m')(month),
          month,
          rows: data.rows,
          disk_size: data.disk_size,
          total_size: data.total_size,
          total_rows: data.total_rows,
          human_readable_size: data.human_readable_size,
        }
      })
      .sort((a: any, b: any) => a.timestamp - b.timestamp)

    new Chart({
      title: 'Monthly Data Usage (sent date) red = data on VAST',
      element: 'data_per_month',
      data: shaped_data
        // .slice(-24),
        // .slice(-12), // Last 12 months
        .slice(-6),
      nav: false,
    }).scratchpad((chart: any) => {
      console.log('Chart', chart)
      console.log(chart.data)

      const x = d3.scaleTime().range([0, chart.innerWidth])
      const y = d3.scaleLinear().range([chart.innerHeight, 0])
      // .domain([0, 1])

      const valueline = d3
        .line()
        .x((d: any) => x(d.timestamp))
        .y((d: any) => y(d.total_size))

      const disk_line = d3
        .line()
        .x((d: any) => x(d.timestamp))
        .y((d: any) => y(d.disk_size))

      // x.domain(d3.extent(chart.data, (d: any) => d.timestamp) as [Date, Date])
      // Add an extra month to the end
      x.domain([
        // chart.data[0].timestamp,
        // Add month to start
        d3.timeMonth.offset(chart.data[0].timestamp, -1),
        d3.timeMonth.offset(chart.data[chart.data.length - 1].timestamp, 1),
      ])

      // y.domain(d3.extent(chart.data, (d) => d.total_size) as [number, number])
      y.domain([
        0,
        d3.max(chart.data, (d: any) => Math.max(d.total_size, d.disk_size)) *
          1.2,
      ])

      const xAxis = d3.axisBottom(x)
      const yAxis = d3
        .axisLeft(y)
        .tickFormat((d: number) => human_readable_size(d))

      chart.svg
        .append('g')
        .attr(
          'transform',
          `translate(${chart.margin.left},${
            chart.innerHeight + chart.margin.top
          })`,
        )
        .call(xAxis)

      chart.svg
        .append('g')
        .attr(
          'transform',
          `translate(${chart.margin.left},${chart.margin.top})`,
        )
        .call(yAxis)

      const columnWidth =
        (chart.innerWidth - chart.margin.left * 2) / chart.data.length

      console.log('Drawing blue columns', chart.data)

      chart.plot
        .selectAll('rect.blue-total')
        .data(chart.data)
        .enter()
        .append('rect')
        .classed('blue-total', true)
        .attr('x', (d) => x(d.timestamp) - columnWidth / 2)
        .attr('y', (d) => y(d.total_size))
        .attr('width', columnWidth)
        .attr('height', (d) => chart.innerHeight - y(d.total_size))
        .attr('fill', 'steelblue')

      chart.plot
        .selectAll('rect.disk')
        .data(chart.data)
        .enter()
        .append('rect')
        .attr('class', 'disk')
        .attr('x', (d) => x(d.timestamp) - columnWidth / 2)
        .attr('y', (d) => y(d.disk_size))
        .attr('width', columnWidth)
        .attr('height', (d) => chart.innerHeight - y(d.disk_size))
        .attr('fill', 'red')

      // Create label positions with force layout
      // const labels = chart.data
      //   .map((d) => ({
      //     x: x(d.timestamp),
      //     y: y(d.disk_size),
      //     text: human_readable_size(d.disk_size),
      //   }))
      //   .concat(
      //     chart.data.map((d) => ({
      //       x: x(d.timestamp),
      //       y: y(d.total_size),
      //       text: human_readable_size(d.total_size),
      //     }))
      //   )

      // const simulation = d3
      //   .forceSimulation(labels)
      //   .force('collision', d3.forceCollide().radius(30))
      //   .force(
      //     'x',
      //     d3.forceX((d) => d.x)
      //   )
      //   .force(
      //     'y',
      //     d3.forceY((d) => d.y)
      //   )
      //   .stop()

      // // Run the simulation
      // for (let i = 0; i < 300; i++) simulation.tick()

      // // Add connecting lines first (so they're behind the labels)
      // const connections = chart.plot
      //   .selectAll('line.label-connector')
      //   .data(labels)
      //   .enter()
      //   .append('line')
      //   .attr('class', 'label-connector')
      //   .attr('x1', (d) => d.x)
      //   .attr('y1', (d) => d.y)
      //   .attr('x2', (d) => d.originalX || d.x)
      //   .attr('y2', (d) => d.originalY || d.y)
      //   .style('stroke', '#999')
      //   .style('stroke-width', 0.5)
      //   .style('stroke-dasharray', '2,2')
      //   .style('opacity', 1)

      // // Place labels using calculated positions
      // chart.plot
      //   .selectAll('text.disk')
      //   .data(labels)
      //   .enter()
      //   .append('text')
      //   .attr('class', 'disk')
      //   .attr('x', (d) => d.x)
      //   .attr('y', (d) => d.y)
      //   .text((d) => d.text)

      chart.plot
        .selectAll('text')
        .data(chart.data)
        .enter()
        .append('text')
        .style('text-anchor', 'middle')
        .attr('x', (d) => x(d.timestamp))
        .attr('y', (d) => y(d.total_size))
        .attr('dy', '-0.1em')
        // .attr('dx', '1em')
        .text((d) => d.human_readable_size)

      chart.plot
        .selectAll('text.disk')
        .data(chart.data)
        .enter()
        .append('text')
        .attr('class', 'disk')
        .style('text-anchor', 'middle')
        .attr('x', (d) => x(d.timestamp))
        .attr('y', (d) => y(d.disk_size))
        .attr('dy', '0.8em')
        // .attr('dx', '1em')
        .text((d) => human_readable_size(d.disk_size))

      // chart.plot
      //   .append('path')
      //   .data([chart.data])
      //   .attr('class', 'line')
      //   .attr('d', valueline)

      // chart.plot
      //   .append('path')
      //   .data([chart.data])
      //   .attr('class', 'line')
      //   .style('stroke', 'red')
      //   .attr('d', disk_line)

      // chart.plot
      //   .selectAll('circle')
      //   .data(chart.data)
      //   .enter()
      //   .append('circle')
      //   .attr('cx', (d) => x(d.timestamp))
      //   .attr('cy', (d) => y(d.total_size))
      //   .attr('r', 5)
      //   .attr('fill', 'red')

      // Draw a legend in the top right corner

      const chart_data = chart.data.reduce((acc, d) => acc + d.total_size, 0)
      const chart_disk = chart.data.reduce((acc, d) => acc + d.disk_size, 0)
      const total_disk = shaped_data.reduce((acc, d) => acc + d.disk_size, 0)

      const legend = chart.svg
        .append('g')
        .attr('transform', 'translate(-80,90)')
      legend
        .append('rect')
        .attr('x', chart.innerWidth - 100)
        .attr('y', 10)
        .attr('width', 220)
        .attr('height', 80)
        .attr('fill', 'white')
        .attr('stroke', 'black')
      legend
        .append('text')
        .attr('x', chart.innerWidth - 80)
        .attr('y', 30)
        .text(`Data seen here: ${human_readable_size(chart_data)}`)
      legend
        .append('rect')
        .attr('x', chart.innerWidth - 95)
        .attr('y', 20)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', 'steelblue')
      legend
        .append('text')
        .attr('x', chart.innerWidth - 80)
        .attr('y', 50)
        .text(`Data seen here: ${human_readable_size(chart_disk)}`)
      legend
        .append('rect')
        .attr('x', chart.innerWidth - 95)
        .attr('y', 40)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', 'red')
      legend
        .append('text')
        .attr('x', chart.innerWidth - 80)
        .attr('y', 70)
        .text(`Total Data: ${human_readable_size(total_disk)}`)
      legend
        .append('rect')
        .attr('x', chart.innerWidth - 95)
        .attr('y', 60)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', 'red')
    })
  })

type DataBucket = {
  start: Date
  stop: Date
  working_data: number
  stored_data: number
  cloud_data: number
}
type DataRow = {
  name: string
  start: Date
  stop: Date
  clean: Date
  purge: Date
  expire: Date

  height: number
  size: number
}

function drawStreamGraph(data: DataRow[]) {
  console.log('Drawing stream graph', data)

  const sampled_data: DataBucket[] = []
  // For all months from 2022-01 to 2025-01, add a row
  for (let i = 0; i < 36; i++) {
    const month = d3.timeMonth.offset(d3.timeParse('%Y-%m')('2022-01'), i)
    sampled_data.push({
      start: month,
      stop: d3.timeMonth.offset(d3.timeParse('%Y-%m')('2022-01'), i + 1),
      working_data: 0,
      stored_data: 0,
      cloud_data: 0,
    })
  }

  // For each row in the data, add it to the sampled data (month buckets)
  data.forEach((row) => {
    // For each row, and each month, add the size to the correct bucket
    for (let i = 0; i < sampled_data.length; i++) {
      const bucket = sampled_data[i]
      addDataToBucket(bucket, row)
    }
  })

  // Draw a stream graph based on this
  console.log('Sampled data', sampled_data)

  var stackedData = d3
    .stack()
    .offset(d3.stackOffsetWiggle)
    .keys(['working_data', 'stored_data', 'cloud_data'])
  // (sampled_data)
  // (
  // sampled_data.reduce((acc, d) => {
  //   acc.push(d)
  //   return acc
  // }, []))

  console.log('Stacked data', stackedData)

  new Chart({
    title: 'Data Usage at any given time',
    element: 'stream_graph',
    data: stackedData,
    nav: false,
  }).scratchpad((chart) => {
    const x = d3.scaleTime().range([0, chart.innerWidth])
    const y = d3.scaleLinear().range([chart.innerHeight, 0])

    const area = d3
      .area()
      .x((d, i) => x(sampled_data[i].start))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))

    // color palette
    var color = d3.scaleOrdinal().range(d3.schemeDark2)

    chart.svg
      .selectAll('path.myLayers')
      .data(stackedData)
      .enter()
      .append('path')
      .attr('class', 'myArea')
      .style('fill', function (d) {
        return color(d.key)
      })
      .attr('d', area)

    console.log('Finished Drawing stream chart')
  })
}

function addDataToBucket(bucket: DataBucket, row: DataRow) {
  if (bucket.stop < row.start) {
    // Don't do anything
  } else if (bucket.stop < row.stop) {
    // Add to working data
    // Might need to double or triple this number?
    bucket.working_data += row.size * 3
  } else if (bucket.stop < row.clean) {
    bucket.stored_data += row.size * 2
  } else if (bucket.stop < row.purge) {
    bucket.stored_data += row.size
  } else if (bucket.stop < row.expire) {
    bucket.cloud_data += row.size
  }
}

drawExampleContractLifecycle()
function drawExampleContractLifecycle() {
  const chart = new Chart({
    element: 'contract_lifecycle',
    title: 'Example Contract Lifecycle',
    nav: false,
  }).scratchpad((chart) => {
    // Y is TeraBytes
    const y = d3
      .scaleLinear()
      .range([chart.innerHeight / 2, 0])
      .domain([0, 5])

    // X is time, in days
    const x = d3.scaleLinear().range([0, chart.innerWidth]).domain([0, 130])

    // Draw a box for the contract
    const data = [
      {
        label: 'Demux',
        size: 1,
        days: 5,
        day: 1,
        storage: 'vast',
      },
      {
        label: 'Analysis',
        size: 2,
        days: 14,
        day: 6,
        storage: 'vast',
      },
      {
        label: 'Delivered to client',
        size: 2,
        days: 14,
        day: 20,
        storage: 'vast',
      },
      {
        label: 'Backed up to AWS',
        size: 1,
        days: 90,
        day: 34,
        storage: 'aws',
      },
    ]

    const svg = chart.svg
      .append('g')
      .attr('transform', `translate(${chart.margin.left},${chart.margin.top})`)
      .classed('graph', true)

    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => x(d.day))
      .attr('y', (d, i) => y(d.size))
      .attr('width', (d) => x(d.days))
      .attr('height', (d) => chart.innerHeight / 2 - y(d.size))
      .attr('fill', (d) => (d.storage === 'vast' ? 'red' : 'steelblue'))
      .attr('opacity', 0.5)
      .attr('stroke', 'black')

    svg
      .selectAll('text.rect-label')
      .data(data)
      .enter()
      .append('g')
      .classed('rect-label', true)
      .each((d, i, nodes) => {
        const group = d3.select(nodes[i])
        group
          .append('text')
          .datum(d)
          .attr('x', (d) => (x(d.days) + x(d.day)) / 2)
          .attr('y', (d) => chart.innerHeight / 4 - 30 + ((i + 1) % 2) * 20)
          .text((d) => d.label)
        group
          .append('line')
          .datum(d)
          .attr('x1', (d) => (x(d.days) + x(d.day)) / 2)
          .attr('x2', (d) => (x(d.days) + x(d.day)) / 2)
          .attr('y1', chart.innerHeight / 4 - 30 + ((i + 1) % 2) * 20)
          .attr('y2', (d) => y(d.size))
          .attr('stroke-dasharray', '2,2')
          .attr('stroke', 'grey')
      })

    // Draw x and y axis
    const xAxis = d3.axisBottom(x)
    const yAxis = d3.axisLeft(y)

    chart.svg
      .append('g')
      .attr(
        'transform',
        `translate(${chart.margin.left},${
          chart.innerHeight / 2 + chart.margin.top
        })`,
      )
      .call(xAxis)
      .append('text')
      .attr('x', chart.innerWidth / 2)
      .attr('y', 40)
      .text('Days')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .attr('font-size', '1.5em')

    chart.svg
      .append('g')
      .attr('transform', `translate(${chart.margin.left},${chart.margin.top})`)
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chart.innerHeight / 4)
      .attr('y', -40)
      .text('TeraBytes')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .attr('font-size', '1.5em')
  })
}

function drawReadLookingGraph(data: any) {
  console.log('drawReadLookingGraph', data)

  const mapped_data = data
    // .filter(
    //   (row) =>
    //     (parseInt(row.preflight_bytes) || parseInt(row.bytes)) > 100000000000
    // )
    // .filter((row) => row.stop_timestamp)
    .map((row) => {
      // stop + 90 days
      // "2024-06-19T01:11:02.774Z"
      const start = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ')(row.start_timestamp)
      const stop = row.stop_timestamp
        ? d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ')(row.stop_timestamp)
        : new Date()
      const clean = d3.timeDay.offset(stop, 14)
      const purge = d3.timeDay.offset(stop, 60)
      const expire = d3.timeDay.offset(stop, 90)
      const size = parseInt(row.preflight_bytes) || parseInt(row.bytes)

      return {
        name: row.contract_id,
        start: new Date(start),
        stop: new Date(stop),
        clean: new Date(clean),
        purge: new Date(purge),
        expire: new Date(expire),
        height: Math.max(1, size / 100000000000),
        size,
      }
    })
    .sort((a, b) => a.start - b.start)

  // drawStreamGraph(mapped_data)

  new Chart({
    title: 'Folders stored on VAST on any given date',
    element: 'read_looking_graph',
    height: 1000,
    width: 2000,
    data: mapped_data,
  }).scratchpad((chart) => {
    // const y = d3.scaleLinear().range([chart.innerHeight, 0])
    // const x = d3.scaleLinear().range([0, chart.innerWidth])
    const x = d3
      .scaleTime() // Changed from scaleLinear to scaleTime
      // .scaleLinear()
      .range([0, chart.innerWidth])
      .domain([
        // 2022-01-01
        // 2025-01-01
        // d3.timeParse('%Y-%m-%d')('2022-01-01'),
        d3.timeParse('%Y-%m-%d')('2024-09-01'),

        // chart.data[0].start,
        chart.data[chart.data.length - 1].expire,
        // d3.min(chart.data, (d: any) => d.start),
        // d3.max(chart.data, (d: any) => d.end),
      ])

    const y = d3
      .scaleLinear()
      .range([chart.innerHeight, 0])
      .domain([0, d3.max(chart.data, (d: any) => parseInt(d.size))])

    // Draw rectangles for each time period
    const svg = chart.svg
      .append('g')
      .classed('graph', true)
      .attr('transform', `translate(${chart.margin.left},${chart.margin.top})`)

    let offset = 0
    const multiplier = 2.5
    svg
      .selectAll('g.folder')
      .data(chart.data)
      .enter()
      .append('g')
      .attr('transform', (d, i) => {
        offset += d.height
        d.offset = offset
        return `translate(${x(d.start)},${
          (offset / (chart.data.length * multiplier)) * chart.innerHeight
          // Math.random() * chart.innerHeight
        })`
      })
      // .attr('x', (d) => x(d.start))
      // .attr('y', Math.random() * chart.innerHeight)
      .classed('folder', true)
      .on('mouseover', function (e, d) {
        console.log(d.name)
      })
      .each((d, i, nodes) => {
        const folder = d3.select(nodes[i])
        // const height = Math.max(1, d.size / 100000000000)
        // offset += height

        folder
          .append('rect')
          .attr('x', 0)
          .attr('y', -d.height / multiplier)
          .attr('width', x(d.stop) - x(d.start))
          .attr('height', d.height / multiplier)
          .attr('fill', 'red')
          .attr('opacity', 0.5)

        folder
          .append('rect')
          // .attr('y', d.offset)
          .attr('y', -d.height / multiplier)
          .attr('x', x(d.stop) - x(d.start))
          .attr('width', x(d.expire) - x(d.stop))
          .attr('height', d.height / multiplier)
          .attr('fill', 'steelblue')
          .attr('opacity', 0.5)
      })

    // Add axes
    const xAxis = d3.axisBottom(x)
    // const yAxis = d3.axisLeft(y).tickFormat((d: any) => human_readable_size(d))

    chart.svg
      .append('g')
      .attr(
        'transform',
        `translate(${chart.margin.left},${
          chart.innerHeight + chart.margin.top
        })`,
      )
      .call(xAxis)

    // Draw a line at 2025-02-17
    svg
      .append('line')
      .attr('x1', x(d3.timeParse('%Y-%m-%d')('2025-02-17')))
      .attr('x2', x(d3.timeParse('%Y-%m-%d')('2025-02-17')))
      .attr('y1', 0)
      .attr('y2', chart.innerHeight)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)

    // chart.svg
    //   .append('g')
    //   .call(yAxis)
    //   .attr('transform', `translate(${chart.margin.left},${chart.margin.top})`)
    // chart.svg
    //   .selectAll('rect.read')
    //   .data(chart.data)
    //   .enter()
    //   .append('rect')
    //   .attr('x')
  })
}

d3.tsv('/AGRF/disk_usage_agrf.tsv')
  .then((data) => {
    console.log(data)
    // drawContractFolders(data)
    data.forEach((row, id) => {
      runs[row.run_id] = runs[row.run_id] || {
        data: {},
        size: 0,
      }
      runs[row.run_id].data[id] = row
      runs[row.run_id].size += parseInt(row.bytes)
      runs[row.run_id].human_readable_size = human_readable_size(
        runs[row.run_id].size,
      )
    })
    return runs
  })
  .then((runs: any) => {
    // console.log(runs)

    var data = Object.entries(runs).sort(
      (a: any, b: any) => b[1].size - a[1].size,
    )
    const cols = ['size', 'run_id', 'contracts']
    d3.select('#runs table thead')
      .append('tr')
      .selectAll('th')
      .data(cols)
      .enter()
      .append('th')
      .text((d) => d)

    d3.select('#runs table tbody')
      .selectAll('tr')
      .data(data)
      .enter()
      .append('tr')
      .attr('id', ([run_id, d]) => `row-${run_id}`)
      .each(([run_id, data]: any) => {
        // console.log(data)
        var tr = d3.select(`#row-${run_id}`)
        tr.append('td').html(`${data.size}<br>${data.human_readable_size}`)
        tr.append('td').html(
          `${run_id}<br><pre style='font-size:0.7em;padding:0 1em'>/data/Analysis/NovaSeqX/${run_id}</pre>`,
        )

        var contracts = Object.entries(data.data) //.sort((a,b) => a[1].demux_pk - b[1].demux_pk)
        var td = tr.append('td').append('details')
        td.append('summary').text(`> ${contracts.length} contract folders`)

        var table = td.append('table')
        var thead = table.append('thead').append('tr')
        thead.append('th').text('demux_pk')
        thead.append('th').text('contract_id')
        thead.append('th').text('owner')
        thead.append('th').text('size')
        thead.append('th').text('date_sent')

        table
          .append('tbody')
          .selectAll('tr')
          .data(contracts)
          .enter()
          .append('tr')
          .attr('id', ([row_id, d]) => `row-${row_id}`)
          .each(([row_id, row_data]: any) => {
            var row = d3.select(`#row-${row_id}`)
            row.append('td').text(row_data.demux_pk)
            row.append('td').text(row_data.contract_id)
            row.append('td').text(row_data.user)
            row.append('td').text(row_data.size_human_readable)
            row.append('td').text(row_data.date_sent)
          })
        // .text((d:any) => `${d.contract_id} - ${d.user}`)
      })
  })

function test_one() {
  d3.csv('/AGRF/contract_list_base_2025_01_28.csv')
    .then((data) => {
      console.log(data)
      console.log(data.columns)
      // Bucket by month
      data.forEach((row) => {
        const parts = row.contract_sent.split('-')
        if (parts[0]) {
          const month = `${parts[0]}-${parts[1]}`
          const blob = {
            total_size: 0,
          }
          important_columns.forEach((column) => {
            blob[column] = parseInt(row[column]) || 0
            blob.total_size += blob[column]
          })
          if (blob.total_size > 0) {
            months[month] = months[month] || []
            months[month].push(blob)
          }
        }
      })
      return months
    })
    .then((months: any) => {
      console.log(months)
      let running_total = 0
      Object.entries(months).forEach(([month, data]: any) => {
        const total_size = data.reduce((acc, row) => acc + row.total_size, 0)
        running_total += total_size
        console.log(month, human_readable_size(total_size))
      })
      console.log('Total', human_readable_size(running_total))
    })
}

function loadDashboard() {
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
          }),
        )
      }),
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
                  'Contract directory is a symlink',
                ),
            )
            .forEach((folder) => {
              acc.push(folder)
            })
          return acc
        }, []),
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
                row.include_files_size,
              )}`
            },
            aws_size: (data, type, row, meta) => {
              return `${row.aws_size} bytes<br>${human_readable_size(
                row.aws_size,
              )}`
            },
          },
        })

        // var summary = drawSummary(data)

        const summarise = _.debounce(function (data) {
          console.log('Summarising')
          console.log(data)
          const summary_data = [0, 1, 2, 3, 4, 5, 6].map((phase) => {
            return {
              phase: `phase${phase}`,
              total_files: 0,
              include_files: 0,
              include_files_size: 0,
              aws_files: 0,
              aws_size: 0,
            }
          })
          data.forEach((folder) => {
            // console.log("looking at a folder", folder.contract_dir)
            var phase = folder.phase.slice(-1)
            // summary_data[phase] = summary_data[phase] || {
            //   phase: `phase${phase}`,
            //   total_files: 0,
            //   include_files: 0,
            //   aws_files: 0,
            // }

            summary_data[phase].total_files += folder.total_file_count
            summary_data[phase].include_files += folder.include_file_count
            summary_data[phase].include_files_size +=
              folder.include_file_size_bytes
            if (folder.aws_files) {
              summary_data[phase].aws_files +=
                folder.aws_files.summary.total.object_count
              summary_data[phase].aws_size +=
                folder.aws_files.summary.total.file_size_bytes
            }
          })
          // console.log("summary_data", summary_data)

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
}
const globalData = {}

function drawTable(dataset: DataTableDataset) {
  dataset.forEach((row) => {
    if (row.summary) {
      row.total_file_count = parseInt(row.summary.total.file_count)
      row.total_file_size_bytes = parseInt(row.summary.total.file_size_bytes)
      row.total_file_size_display = row.summary.total.file_size_human
      row.include_file_count =
        parseInt(row.summary.include.file_count) +
        parseInt(row.summary.include.symlink_count)
      row.include_file_size_bytes = parseInt(
        row.summary.include.file_size_bytes,
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
    columnDefs: [
      {
        targets: [2, 3, 4, 5],
        type: 'num',
      },
    ],
    customRenderers: {
      log_id: (data, type, row, meta) => {
        return `<a href="#none" onclick="displayFiles('${row.log_id}')">${row.log_id}</a><br>${row.contract_dir}`
      },
      total_files: (data, type, row, meta) => {
        if (row.total_file_count === undefined) {
          return 'Loading...'
        }
        if (type === 'sort') {
          return row.total_file_count
        }
        return `${row.total_file_count}<br>${row.total_file_size_display}`
      },
      include_files: (data, type, row, meta) => {
        if (row.include_file_count === undefined) {
          return 'Loading...'
        }
        if (type === 'sort') {
          return row.include_file_count
        }
        return `${row.include_file_count}<br>${row.include_file_size_display}`
      },
      aws_files: (data, type, row, meta) => {
        if (row.aws_files === undefined) {
          return 'Loading...'
        }
        if (type === 'sort') {
          return row.aws_files.summary.total.object_count
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
        data.full_data.list.include.symlinks,
      )
        .map(([filename, relative_path, ...rest]) =>
          `${base_dir}/${relative_path}/${filename}`.replace('/./', '/'),
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
        intersection.length,
      )

      for (let i = 0; i < max_length; i++) {
        const row = tableBody.append('tr')
        row.append('td').text(original_only[i] || '')
        row.append('td').text(intersection[i] || '')
        row.append('td').text(aws_only[i] || '')
      }
    })
}

// draw_mounted_vast()
function draw_mounted_vast() {
  d3.tsv('/AGRF/vast_allocation.tsv').then((data: any) => {
    console.log('VAST allocated disk', data)
    // clean
    data.forEach((row: any) => {
      row.size = parseInt(row.size)
      row.available = parseInt(row.available)
      row.used = parseInt(row.used)
      row.tree = `vast/${row.mountpoint}`
    })

    const used = data.map((row) => {
      return {
        ...row,
        size: row.used,
        filetype: 'used',
        tree: `vast/${row.mountpoint}/used`,
      }
    })
    const available = data.map((row) => {
      return {
        ...row,
        size: row.available,
        filetype: 'available',
        tree: `vast/${row.mountpoint}/available`,
      }
    })

    const root = d3.stratify().path((d: any) => d.tree)(
      data.concat(used, available),
    )
    root.sum((d: any) => (d ? d.size || 0 : 0))
    console.log('root', root)
    var chart = new Chart({
      title: 'VAST Allocated Disk',
      element: 'mounted_vast',
    }).initTreemap({
      hierarchy: root,
      target: 'size',
      color: d3.scaleOrdinal(d3.schemeCategory10),
    })
  })
}

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
