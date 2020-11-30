
import { Chart, decorateTable } from 'chart'
import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'

console.log('Running fistula.ts')

$.when($.ready).then(function () {
  const chart = new Chart({ // eslint-disable-line
    element: 'exampleDiv',
    margin: 20,
    width: 800,
    height: 600,
    nav: false
  }).scratchpad((chart :Chart) => {
    // chart.svg
    d3.csv("/dataviz/fistula.csv").then(d => {
      console.log(d);
    })

  })
})
