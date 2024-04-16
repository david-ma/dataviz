
import { Chart, decorateTable, d3 } from './chart'
// import * as d3 from 'd3'
// import $ from 'jquery'
// import 'datatables.net'

// console.log('Running georgia.ts')


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

d3.json("/world-50m.json")
  .then((data) => {
      console.log(data)
  })

console.log(" hello ")
console.log("World 2")
