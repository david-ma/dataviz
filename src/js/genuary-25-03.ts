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

  const message = 'I guess this is what 42 lines of code gets you.'

  const text = chart.svg
    .append('text')
    .text(message)
    .attr('x', 80)
    .attr('y', 100)
    .attr('fill', 'white')
    .attr('font-family', 'm6x11')
    .attr('font-size', '60px')
})

function reset_chart(chart: Chart) {
  chart.context.fillStyle = '#213'
  chart.context.fillRect(0, 0, width, height)
  chart.svg.selectAll('*').remove()
}
