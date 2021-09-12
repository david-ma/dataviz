import { Chart, _, d3 } from 'chart'

var darkgreen = "#223c02",
    brightgreen = "#98e142"

new Chart({
  element: 'matrix',
  margin: 0,
  nav: false,
}).scratchpad((chart) => {
  chart.svg.append('rect').attrs({
    x: 0,
    y: 0,
    height: chart.innerHeight,
    width: chart.innerWidth,
    fill: 'black',
  })

  chart.svg.append("text").text("Hello World").attrs({
    x: 2,
    y: 20,
    fill: "green"
  });

})
