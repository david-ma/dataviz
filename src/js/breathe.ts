
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

type DataPoint = {
  start: {
    vertices: Array<Vertex>;
    transform: string;
  };
  end : {
    vertices: Array<Vertex>;
    transform: string;
  };
}

const speed :number = 400
const size :number = 100
const n :number = 13
const colors = ['#9e0142','#d53e4f','#f46d43','#fdae61','#fee08b','#ffffbf','#e6f598','#abdda4','#66c2a5','#3288bd','#5e4fa2']

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

    const allVertices : Array<Vertex[]> = []

    for (let i = 2; i < n; i++) {
      const vertices : Vertex[] = poly(i)
      allVertices.push(vertices)
    }
    console.log(allVertices)

    var dataPoints : DataPoint[] = []

    allVertices.forEach((vertices, i) => {
      const distance = finalDistance(vertices)
      const ratio = size / distance
      vertices = scaleSize(vertices, ratio)

      const translateTarget = [250, 500]
      const translate = [translateTarget[0] - vertices[0][0], translateTarget[1] - vertices[0][1]]

      var firstVertex :Array<Vertex> = [[0,0],[0,0]]

      var startVertices = i > 0 ? getStartVertices(allVertices[i-1]) : firstVertex
      
      const s_distance = finalDistance(startVertices)
      const s_ratio = size / s_distance
      startVertices = scaleSize(startVertices, s_ratio)
      const s_translate = [translateTarget[0] - startVertices[0][0], translateTarget[1] - startVertices[0][1]]

      if(i === 0) { s_translate[0] = s_translate[0] + (size / 2) }

      dataPoints.push({
        start: {
          vertices: startVertices,
          transform: `translate(${s_translate.join(',')})`
        },
        end: {
          vertices: vertices,
          transform: `translate(${translate.join(',')})`
        }
      })
    })

    chart.svg.selectAll('.line')
      .data(dataPoints)
      .enter()
      .insert('polyline', 'polyline')
      .classed('.line', true)
      .each((d, i, k) => {

        window.setTimeout(() => {
          d3.select(k[i])
          .attr("id", `polyline-${i}`)
          .attr('points', d.start.vertices.map(d => d.join(',')).join(' '))
          .attr('transform', d.start.transform)
          .attrs({
            fill: colors[i],
            stroke: 'black'
          }).transition()
          .duration(speed)
          .ease(d3.easeLinear)
          .attr('points', d.end.vertices.map(d => d.join(',')).join(' '))
          .attr('transform', d.end.transform)
          .on('end', (d :DataPoint) => {
            console.log(d)
            if(d.start.vertices.length + 1 === n) {
              callReverse(i)
            }
          })
        }, speed * i)
      })
  })
})

function callReverse (i:number) {
  d3.select('.chart-title').text('Breathe Out')
  d3.select(`#polyline-${i}`)
    .transition()
    .ease(d3.easeLinear)
    .duration(speed)
    .attr('points', (d: DataPoint) => d.start.vertices.map(d => d.join(',')).join(' '))
    .attr('transform', (d: DataPoint) => d.start.transform)
    .on('end', (d,j,k) => {
      d3.select(k[j]).style('display', 'none')
      if(i > 0) {
        callReverse( i - 1)
      } else {
        callDraw(0)
      }
    })
}

function callDraw (i:number) {
  d3.select('.chart-title').text('Breathe In')
  d3.select(`#polyline-${i}`)
    .style('display', 'inherit')
    .transition()
    .ease(d3.easeLinear)
    .duration(speed)
    .attr('points', (d: DataPoint) => d.end.vertices.map(d => d.join(',')).join(' '))
    .attr('transform', (d: DataPoint) => d.end.transform)
    .on('end', (d,j,k) => {
      if(i < n - 3) {
        callDraw( i + 1)
      } else {
        callReverse(i)
      }
    })
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

  vertices.forEach(vertex => {
    result.push(vertex)
  })
  var mid = Math.floor(vertices.length / 2)

  // console.log("vertices", vertices)

  if(vertices.length % 2 === 1) { // odd
    result.splice(mid, 0, result[mid])
  } else { // even
    // find the middle point of the middle 2, and then insert something
    var midPoint :Vertex = [
      (vertices[mid][0] + vertices[mid - 1][0]) / 2
      ,
      (vertices[mid][1] + vertices[mid - 1][1]) / 2
    ]
    // console.log(midPoint)

    result.splice(mid, 0, midPoint)
  }
  return result
}

globalThis.poly = poly
globalThis.Tau = Tau
