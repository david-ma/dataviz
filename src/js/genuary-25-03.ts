import { Chart, d3 } from './chart'

const width = 1920,
  height = 1080

$.when($.ready).then(function () {
  const chart = new Chart({
    element: 'datavizChart',
    margin: 20,
    width,
    height,
    nav: false,
    renderer: 'canvas',
  }).scratchpad(reset_chart)

  const message = [
    'I guess this is what 42 lines of code gets you.',
    'I hope you like it.',
    "Oh right, I'm supposed to be drawing something.",
    'I guess I should start now.',
    'Oops.',
  ]

  const text = chart.svg
    .append('g')
    .selectAll('text')
    .data(message)
    .enter()
    .append('text')
    .text((d) => d)
    .attr('x', 80)
    .attr('y', (d, i) => 80 + i * 80)
    .attr('fill', 'white')
    .attr('font-family', 'm6x11')
    .attr('font-size', '60px')
})

function reset_chart(chart: Chart) {
  chart.context.fillStyle = '#213'
  chart.context.fillRect(0, 0, width, height)
  chart.svg.selectAll('*').remove()
}
