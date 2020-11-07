
import { Chart } from 'chart'
import * as d3 from 'd3'
import $ from 'jquery'
// import 'datatables.net';

console.log('Running breathe.ts')

type LineData = {
  start: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  },
  end: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }
}

const speed :number = 2000
const size :number = 100

$.when($.ready).then(function () {
  const chart = new Chart({ // eslint-disable-line
    title: 'Breathe In',
    element: 'breatheDiv',
    margin: 40,
    width: 600,
    height: 600,
    nav: false
  }).scratchpad((chart :Chart) => {
    const svg = chart.svg

    // Put the title on the bottom
    chart.svg.select('.chart-title')
      .attr('transform', `translate(${chart.width / 2},${chart.height - 15})`)

    const n = 14

    const allVertices :Array<Array<Vertex>> = []

    for (let i = 2; i < n; i++) {
      const vertices : Array<Vertex> = poly(i)
      allVertices.push(vertices)
    }
    console.log(allVertices)

    chart.svg.selectAll('.line')
      .data(allVertices)
      .enter()
      .append('polyline')
      .classed('.line', true)
      .each((d, i, k) => {

        const distance = finalDistance(d)
        const ratio = size / distance
        d = scaleSize(d, ratio)

        const translateTarget = [250, 500]
        const translate = [translateTarget[0] - d[0][0], translateTarget[1] - d[0][1]]

        var startVertices = i > 0 ? getStartVertices(allVertices[i-1]) : [[0,0],[0,0]]

        d3.select(k[i]).attrs({
          points: d.map(d => d.join(',')).join(' '),
          fill: 'rgba(0,0,0,0)',
          stroke: 'black'
        })
        .attrs({
          transform: `translate(${translate.join(',')})`
        })
      })

    /*
    svg.selectAll('.originalLine')
      .data(original)
      .enter()
      .append('line')
      .classed('originalLine', true)
      .attrs({
        x1: chart.width / 2,
        y1: chart.height * 0.8,
        x2: chart.width / 2,
        y2: chart.height * 0.8
      }).transition()
      .duration(speed)
      .attrs({
        x1: (chart.width / 2) - size,
        x2: (chart.width / 2) + size
      }).on('end', function () {
        svg.selectAll('.triangleLine')
          .data(triangle)
          .enter()
          .append('line')
          .classed('triangleLine', true)
          .attr('x1', d => d.start.x1)
          .attr('y1', d => d.start.y1)
          .attr('x2', d => d.start.x2)
          .attr('y2', d => d.start.y2)
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('x1', d => d.end.x1)
          .attr('y1', d => d.end.y1)
          .attr('x2', d => d.end.x2)
          .attr('y2', d => d.end.y2)
          .on('end', function () {
            let count = 0
            svg.selectAll('.squareLine')
              .data(square)
              .enter()
              .append('line')
              .classed('squareLine', true)
              .attr('x1', d => d.start.x1)
              .attr('y1', d => d.start.y1)
              .attr('x2', d => d.start.x2)
              .attr('y2', d => d.start.y2)
              .transition()
              .duration(speed)
              .attr('x1', d => d.end.x1)
              .attr('y1', d => d.end.y1)
              .attr('x2', d => d.end.x2)
              .attr('y2', d => d.end.y2)
              .on('end', () => {
                count++
                if (count === square.length) {
                  callReverse()
                }
              })
          })
      })
      */
  })
})

function callReverse () {
  d3.select('.chart-title').text('Breathe Out')

  reverse(d3.selectAll('.squareLine'))
    .then(() => reverse(d3.selectAll('.triangleLine')))
    .then(() => reverse(d3.selectAll('.originalLine')))
    .then(callDraw)

  function reverse (lines : d3.Selection<SVGLineElement, LineData, HTMLElement, any>) {
    return new Promise(function (resolve) {
      lines
        .transition()
        .duration(speed)
        .attr('x1', d => d.start.x1)
        .attr('y1', d => d.start.y1)
        .attr('x2', d => d.start.x2)
        .attr('y2', d => d.start.y2)
        .on('end', () => {
          lines.style('display', 'none')
          resolve()
        })
    })
  }
}

function callDraw () {
  d3.select('.chart-title').text('Breathe In')

  draw(d3.selectAll('.originalLine'))
    .then(() => draw(d3.selectAll('.triangleLine')))
    .then(() => draw(d3.selectAll('.squareLine')))
    .then(callReverse)

  function draw (lines : d3.Selection<SVGLineElement, LineData, HTMLElement, any>) {
    return new Promise(function (resolve) {
      lines
        .style('display', 'inherit')
        .transition()
        .duration(speed)
        .attr('x1', d => d.end.x1)
        .attr('y1', d => d.end.y1)
        .attr('x2', d => d.end.x2)
        .attr('y2', d => d.end.y2)
        .on('end', resolve)
    })
  }
}

type Vertex = [number, number]

const Tau = 2 * Math.PI

function poly (n) :Array<Vertex> {
  const result :Array<Vertex> = []

  for (let i = 0; i < n; i++) {
    const x = 0
    const y = 0
    const r = 50

    /*
      We always want the first coordinates to be [-1, 0]
      and the last to always be [1,0]:

      const start_x = Math.cos(Tau * 0.5) //  x1 = -1
      const start_y = Math.sin(Tau * 0.5) //  y1 = 0
      const end_x = Math.cos(Tau * 1) //      x2 = 1 
      const end_y = Math.sin(Tau * 1) //      y2 = 0

      So use this formula, to get the results we want:
    */
    const transform = (1 / 4) + (i / n) - (i-1 / (2 *n))

    result.push([
      x + r * Math.cos(Tau * transform) * 1,
      y + r * Math.sin(Tau * transform) * 1
    ])
  }
  return result
}

function finalDistance (vertices: Array<Vertex>) :number {
  const first = vertices[0]
  const last = vertices[vertices.length - 1]

  return Math.hypot(first[0] - last[0], first[1] - last[1]) || size
}

function scaleSize (vertices: Array<Vertex>, scale: number) : Array<Vertex> {
  const result : Array<Vertex> = []
  vertices.forEach(vertex => {
    result.push([
      vertex[0] * scale,
      vertex[1] * scale
    ])
  })
  return result
}

function getStartVertices(vertices: Array<Vertex>) : Array<Vertex> {
  const result : Array<Vertex> = []
  return result
}

globalThis.poly = poly
globalThis.Tau = Tau
