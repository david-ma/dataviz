import { Chart } from './chart'

console.log('Running example.ts')

$.when($.ready).then(function () {
  const chart = new Chart({
    element: 'chart',
    title: 'Example Chart',
    margin: 50,
    width: 800,
    height: 600,
    nav: false,
  }).scratchpad((chart: Chart) => {
    // chart.svg
  })
})
