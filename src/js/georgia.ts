
import { Chart, decorateTable } from 'chart'
import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'

console.log('Running example.ts')


$.when($.ready).then(function () {
  const chart = new Chart({ // eslint-disable-line
    element: 'exampleDiv',
    margin: 20,
    width: 800,
    height: 600,
    nav: false
  }).scratchpad((chart :Chart) => {
    // chart.svg

  })
})


// d3.json("js/world-50m.json", function(error, world) {")






