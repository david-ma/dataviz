
import { Chart, decorateTable } from 'chart'
import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'

console.log('Running go.ts')

type Square = {
  color :string
}

class Gameboard {
  squares : Square[][]

  constructor () {
    
  }
}

$.when($.ready).then(function () {
  const chart = new Chart({ // eslint-disable-line
    element: 'goBoard',
    margin: 10,
    width: 600,
    height: 800,
    nav: false
  }).scratchpad((chart :Chart) => {
    // chart.svg

  })
})
