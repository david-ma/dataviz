import { col } from 'sequelize'
import { Chart, d3 } from './chart'
// import * as d3 from 'd3'
// import $ from 'jquery'
// import 'datatables.net'

console.log('Running example.ts')

const width = 1080,
  height = 1920

let number_of_lines = 20,
  line_birth = 5,
  line_life = 20,
  line_death = 5,
  color_mode = 'rainbow'

let interval_pointer = null

$.when($.ready).then(function () {
  const chart = new Chart({
    // eslint-disable-line
    element: 'exampleDiv',
    margin: 20,
    width,
    height,
    nav: false,
  })
    .scratchpad(reset_chart)
    .scratchpad(draw_lines)

  d3.select('#refresh').on('click', function () {
    number_of_lines = safe_parse_int('#number_of_lines', 20)
    line_birth = safe_parse_int('#line_birth', 5)
    line_life = safe_parse_int('#line_life', 20)
    line_death = safe_parse_int('#line_death', 5)
    color_mode = $('#color_mode').val() as string

    console.log('Refreshing with these options:', {
      number_of_lines,
      line_birth,
      line_life,
      line_death,
      color_mode,
    })

    chart.scratchpad(reset_chart).scratchpad(draw_lines)
  })
})

function draw_lines(chart: Chart) {
  let counter = 0
  interval_pointer = window.setInterval(() => {
    counter++
    let color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    })`
    if (color_mode === 'rainbow') {
      color = d3.hsl((counter * 6) % 360, 1, 0.5).toString()
    }

    for (let i = 0; i < number_of_lines; i++) {
      drawLine(chart, color)
    }
  }, 1000)
}

function reset_chart(chart: Chart) {
  chart.svg.selectAll('*').remove()
  if (interval_pointer) {
    window.clearInterval(interval_pointer)
  }
  chart.svg
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#222')
}

function safe_parse_int(element_id, default_value) {
  const value = parseInt($(element_id).val())
  // return isNaN(value) ? default_value : value
  if (isNaN(value)) {
    alert(`Invalid value for ${element_id}`)
    return default_value
  } else {
    return value
  }
}

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
    .duration(line_birth * 1000)
    .attr('y2', randomY + randomDistance)
    .attr('stroke', color)

  // Clean up the lines after 20 seconds
  setTimeout(() => {
    line
      .transition()
      .duration(line_death * 1000)
      .attr('opacity', 0)
    setTimeout(() => {
      line.remove()
    }, line_death * 1000)
  }, line_life * 1000)
}
