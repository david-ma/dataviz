import { Chart, d3 } from 'chart'

const speed = 3000

new Chart({
  element: 'viz',
  margin: 1,
  height: 340,
  width: 600,
  nav: false,
}).scratchpad((chart) => {
  chart.svg
    .selectAll('line')
    .data(new Array(50))
    .enter()
    .append('line')
    .attrs((d, i) => {
      return {
        x1: i * 5,
        y1: 0,
        x2: i * 15,
        y2: chart.innerHeight,
      }
    })

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
      .attrs((d, i) => {
        return {
          x1: i * top + offset_top + i * i * 0.1,
          x2: i * bottom + offset_bottom + i * i * 0.1,
        }
      })
  }

  animate()

  window.setInterval(function () {
    animate()
  }, speed)
})
