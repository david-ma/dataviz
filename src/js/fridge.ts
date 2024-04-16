import { Chart, d3 } from './chart'
console.log('running fridge.ts')

// https://codepen.io/hainersavimaa/pen/oLAGBq
// https://codepen.io/owlypixel/pen/mONPoL

$.when($.ready).then(() => {
  console.log(`hey jquery says we're ready`)

  const chart = new Chart({
    title: 'Fridge',
    element: 'fridge',
    margin: 40,
    width: 600,
    height: 600,
    nav: false,
  }).scratchpad((chart: Chart) => {
    chart.svg.append('rect').attrs({
      width: chart.width,
      height: chart.height,
      fill: 'lightgrey',
    })

    chart.svg
      .append('rect')
      .attrs({
        height: 450,
        width: 260,
        x: (chart.width - 260) / 2,
        y: 100,
        fill: '#f4f5fa',
        stroke: 'darkslateblue',
        'stroke-width': 8,
        rx: 30,
        id: 'fridge_door',
      })
      .append('rect')
      .attrs({
        height: 450,
        width: 45,
        x: (chart.width - 260) / 2,
        y: 100,
        fill: '#e5e6f7',
        // mask: 'url(svg#fridge_door)'
        // stroke: 'darkslateblue',
        // 'stroke-width': 8,
        // rx: 30,
      })

    chart.svg.append('line').attrs({
      x1: (chart.width - 260) / 2 + 32,
      y1: 120,
      x2: (chart.width - 260) / 2 + 32,
      y2: 200,
      stroke: '#b3b6e8',
      'stroke-width': 8,
      'stroke-linecap': 'round',
    })

    chart.svg.append('line').attrs({
      x1: (chart.width - 260) / 2 + 32,
      y1: 230,
      x2: (chart.width - 260) / 2 + 32,
      y2: 500,
      stroke: '#b3b6e8',
      'stroke-width': 8,
      'stroke-linecap': 'round',
    })

    chart.svg.append('line').attrs({
      x1: (chart.width - 260) / 2 + 40,
      y1: 215,
      x2: (chart.width - 260) / 2 + 230,
      y2: 215,
      stroke: 'darkslateblue',
      'stroke-width': 8,
      'stroke-linecap': 'round',
    })
  })
})
