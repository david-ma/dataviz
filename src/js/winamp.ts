import { Chart, d3 } from 'chart'

new Chart({
  element: 'viz',
  margin: 1,
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
        stroke: 'black',
      }
    })

  function animate() {
    const top = Math.random() * 50,
      bottom = Math.random() * 50,
      offset_top = Math.random() * 300,
      offset_bottom = Math.random() * 300
    chart.svg
      .selectAll('line')
      .transition()
      .ease(d3.easeQuad)
      .duration(3000)
      .attrs((d, i) => {
        return {
          x1: i * top + offset_top,
          x2: i * bottom + offset_bottom,
        }
      })
  }

  animate()

  window.setInterval(function () {
    animate()
  }, 3000)
})
