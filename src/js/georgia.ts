
import { Chart, decorateTable, d3 } from './chart.js'

// import { Chart } from './chart.js'
// import * as Chart from './chart.js'
// import Chart from './chart.js'
// import * as Chart from './chart'
// import { Chart } from 'chart'

// const Chart = require('./chart.js');

// console.log("Chart is:", Chart)
// console.log(Object.entries(Chart))

// // wait until chart is loaded, then do stuff?
// $.when($.ready).then(function () {
//   console.log('heyyyy')
//   console.log("Chart", Chart)
// })

// Chart.d3.select("body")

// import Test from './test.js'
// console.log('test', Test)

// const blah = new Test()

// import * as d3 from 'd3'
// import $ from 'jquery'
// import 'datatables.net'

// console.log('Running georgia.ts')


// $.when($.ready).then(function () {
//   const chart = new Chart({ // eslint-disable-line
//     element: 'exampleDiv',
//     margin: 20,
//     width: 800,
//     height: 600,
//     nav: false
//   }).scratchpad((chart :Chart) => {
//     // chart.svg

//   })
// })

d3.json("/world-50m.json")
  .then((data) => {
      console.log(data)
  })

// console.log(" hello ")
// console.log("World 2")

console.log("new change., do we see it?")