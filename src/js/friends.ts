// @ts-nocheck

import { Chart, d3, $ } from './chart'

const margin = { top: 40, right: 40, bottom: 40, left: 40 }
const height = 600
const width = 900

type friend = {
  name: string
  timestamp: number
}

let bins = []
const buckets: friend[][] = []

const dateOpts: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

let test = null
globalThis.test = test

$.ajax({
  dataType: 'json',
  contentType: 'application/json',
  url: '/friends.json',
  error: function (e) {
    console.log('Error', e)
  },
  success: function (rawData: { test: {}; friends: friend[] }) {
    test = rawData.test

    const data: friend[] = rawData.friends.map((d) => {
      return { timestamp: d.timestamp * 1000, name: decodeFBEmoji(d.name) }
    })
    console.log('data', data)

    const x: d3.ScaleLinear<Number, Number> = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.timestamp))
      .range([margin.left, width - margin.right])

    bins = d3
      .histogram()
      .domain(x.domain() as [number, number])
      .thresholds(x.ticks(150))(data.map((d) => d.timestamp))

    console.log('bins', bins)

    data.forEach((dot) => {
      bins.forEach((bin, i) => {
        if (dot.timestamp > bin.x0 && dot.timestamp < bin.x1) {
          buckets[i] = buckets[i] || []
          buckets[i].push(dot)
        }
      })
    })

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(...buckets.filter((d) => d).map((d) => d.length))])
      .range([height - margin.bottom, margin.top])

    console.log('buckets', buckets)

    const header = d3.select('#friends table thead').append('tr')
    header.append('th')
    header.append('th').text('Date')
    header.append('th').text('Friends')
    header.append('th').text('Count')
    header.append('th').text('Notes')

    d3.select('#friends table tbody')
      .selectAll('tr')
      .data(buckets)
      .enter()
      .append('tr')
      .attr('id', (d, i) => `tr-${i}`)
      .each((d, i) => {
        if (d) {
          const tr = d3.select(`#tr-${i}`)
          tr.append('td').text(i)
          tr.append('td')
            .classed('dates', true)
            .text(new Date(bins[i].x0).toLocaleDateString('en-GB', dateOpts))

          tr.append('td').text(
            d
              .map((dot) => dot.name)
              .reverse()
              .join(', ')
          )
          tr.append('td').text(d.length)

          tr.append('td').append('textarea')
        }
      })

    new Chart({
      margin: margin,
      height: height,
      width: width,
      element: 'friends_chart',
      title: 'Friends over time',
      data: data,
      nav: false,
    }).scratchpad(function (chart: Chart) {
      console.log('hello, in scratchpad')
      console.log(chart.innerWidth)

      chart.svg
        .append('rect')
        .attr('x', chart.margin.left)
        .attr('y', chart.margin.top)
        .attr('height', chart.innerHeight)
        .attr('width', chart.innerWidth)
        .attr('fill', 'white')

      chart.svg
        .append('g')
        .attr('id', 'columns')
        .attr(
          'transform',
          `translate(${chart.margin.left}, ${chart.margin.top})`
        )

        globalThis.buckets = buckets

      const max = Math.max(...buckets.map((d) => d.length).filter((d) => d))
      console.log('Max', max)

      d3.select('#columns')
        .selectAll('rect')
        .data(buckets)
        .enter()
        .append('rect')
        
        // .attrs(function (bucket, i) {
        //   // console.log(d);
        //   // console.log(i);
        //   if (bucket) {
        //     return {
        //       height: bucket.length * (chart.innerHeight / max),
        //       width: chart.innerWidth / buckets.length,
        //       x: (i * chart.innerWidth) / buckets.length,
        //       y: chart.innerHeight - bucket.length * (chart.innerHeight / max),
        //       fill: 'grey',
        //       stroke: 'black',
        //     }
        //   } else {
        //     return {}
        //   }
        // })

      const xAxis = d3
        .axisBottom(x as any)
        .tickFormat(function (d: number) {
          // var date = new Date(d);
          // date.getUTCMonth()
          // return `${date.getUTCMonth()} ${date.getFullYear()}`
          return new Date(d).toLocaleDateString()
        })
        .tickSizeOuter(10)

      chart.svg
        .append('g')
        .attr(
          'transform',
          `translate(${0},${chart.margin.top + chart.innerHeight})`
        )
        .call(xAxis)

      const yAxis = d3
        .axisLeft(y)
        // .ticks(50)
        // .tickFormat(function(d :number){
        //     // return new Date(d).toLocaleDateString();
        //     return `${d}`
        // })
        .tickSizeOuter(10)

      chart.svg
        .append('g')
        .attr('transform', `translate(${chart.margin.left},${0})`)
        .call(yAxis)
    })
  },
})

// From https://dev.to/raicuparta/ditching-worthless-friends-with-facebook-data-and-javascript-3f2i
function decodeFBEmoji(fbString: string, verbose?: boolean): string {
  // Convert String to Array of hex codes
  const codeArray = fbString // starts as '\u00f0\u009f\u0098\u00a2'
    .split('')
    .map(
      (char) => char.charCodeAt(0) // convert '\u00f0' to 0xf0
    ) // result is [0xf0, 0x9f, 0x98, 0xa2]

  // Convert plain JavaScript array to Uint8Array
  const byteArray = Uint8Array.from(codeArray)

  if (verbose) {
    console.log('fbString', fbString)
    console.log(
      'hex',
      codeArray.map((char) => `\\u00${char.toString(16)}`).join('')
    )
    console.log('codeArray', codeArray)
    console.log('byteArray', byteArray)
  }

  // Decode byte array as a UTF-8 string
  return new TextDecoder('utf-8').decode(byteArray) // '😢'
}
