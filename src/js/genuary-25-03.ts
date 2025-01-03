import { Chart, d3 } from './chart'

const chart = new Chart({
  element: 'datavizChart',
  nav: false,
  renderer: 'canvas',
}).scratchpad((chart) => {
  const message = [
    'I guess this is what 42 lines of code gets you.',
    'I hope you like it.',
    "Oh right, I'm supposed to be drawing something.",
    'I guess I should start now.',
    'Oops.',
  ]

  const text = chart.svg
    .append('g')
    .classed('message', true)
    .selectAll('text')
    .data(message)
    .enter()
    .append('text')
    .text((d) => d)
    .attr('x', 80)
    .attr('y', (d, i) => 120 + i * 80)
    .attr('font-family', 'm6x11')
    .attr('font-size', '42px')
})
