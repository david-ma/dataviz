import { Chart, d3 } from './chart'
// import * as d3 from 'd3'
// import $ from 'jquery'
// import 'datatables.net'

console.log('Running genuary-25-02.ts')

const width = 1080,
  height = 1920

$.when($.ready).then(function () {
  const chart = new Chart({
    // eslint-disable-line
    element: 'day2viz',
    margin: 20,
    width,
    height,
    nav: false,
    renderer: 'canvas',
  })
    .scratchpad(reset_chart)
    .scratchpad((chart) => {
      // public/images/Balatro-red_deck.png
      // Draw this image
      const image = new Image()
      image.src = '/images/Balatro-red_deck.png'
      image.onload = function () {
        chart.context.drawImage(image, 0, 0)
      }
    })
})

function reset_chart(chart: Chart) {
  chart.context.fillStyle = '#213'
  chart.context.fillRect(0, 0, width, height)
  chart.svg.selectAll('*').remove()
}
