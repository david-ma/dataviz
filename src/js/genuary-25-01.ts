import { Chart, d3 } from './chart'
// import * as d3 from 'd3'
// import $ from 'jquery'
// import 'datatables.net'

console.log('Running example.ts')

const width = 1080,
  height = 1920

$.when($.ready).then(function () {
  const chart = new Chart({
    // eslint-disable-line
    element: 'exampleDiv',
    margin: 20,
    width,
    height,
    nav: false,
  })
    .scratchpad(function background(chart: Chart) {
      chart.svg
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#222')
    })
    .scratchpad(function drawLines(chart: Chart) {
      let counter = 0
      window.setInterval(() => {
        counter++
        const color = d3.hsl((counter * 6) % 360, 1, 0.5).toString()
        for (let i = 0; i < 30; i++) {
          drawLine(chart, color)
        }
      }, 1000)
    })
})

function drawLine(chart: Chart, color = 'white') {
  const line = chart.svg.append('line')
  const randomX = Math.random() * width
  const randomY = Math.random() * height
  const randomDistance = Math.random() * 1000

  line
    .attr('x1', randomX)
    .attr('y1', randomY)
    .attr('x2', randomX)
    .attr('y2', randomY)
    .attr('opacity', 1)
    .transition()
    .duration(5000)
    .attr('y2', randomY + randomDistance)
    .attr('stroke', color)

  // Clean up the lines after 20 seconds
  setTimeout(() => {
    line.transition().duration(5000).attr('opacity', 0)
    setTimeout(() => {
      line.remove()
    }, 5000)
  }, 20000)
}
