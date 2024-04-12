import { Chart, d3 } from './chart'

const speed = 3000

new Chart({
  element: 'viz',
  margin: 0,
  height: 340,
  width: 600,
  nav: false,
}).scratchpad((chart) => {
  chart.svg
    .selectAll('line')
    .data(new Array(50))
    .enter()
    .append('line')
    .attr('x1', (d, i) => i * 5)
    .attr('y1', 0)
    .attr('x2', (d, i) => i * 15)
    .attr('y2', chart.height)

  function animate() {
    const top = (Math.random() - 0.5) * 50,
      bottom = (Math.random() - 0.5) * 50,
      offset_top = Math.random() * 300,
      offset_bottom = Math.random() * 300
    chart.svg
      .selectAll('line')
      .transition()
      .ease(d3.easeQuad)
      .duration(speed)
      .attr('x1', (d, i) => i * top + offset_top + i * i * 0.1)
      .attr('x2', (d, i) => i * bottom + offset_bottom + i * i * 0.1)
  }

  animate()

  window.setInterval(function () {
    animate()
  }, speed)
})
