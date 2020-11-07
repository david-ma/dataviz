
import { Chart, decorateTable } from 'chart'
import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'

console.log('Running breathe.ts')

type Vertex = [number, number]

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

const Tau = 2 * Math.PI

const size :number = 100
const n :number = 13
const colors = ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'] // eslint-disable-line

// d3.interpolate(colors)
// const interpolatedColors = d3.interpolateHslLong('#9e0142', '#5e4fa2')
const interpolatedColors = d3.interpolateHslLong('#810081', '#ffa600') // eslint-disable-line

$.when($.ready).then(function () {
  const chart = new Chart({ // eslint-disable-line
    title: 'Breathe In',
    element: 'breatheDiv',
    margin: 40,
    width: 600,
    height: 600,
    nav: false
  }).scratchpad((chart :Chart) => {
    // Move the title to the bottom
    chart.svg.select('.chart-title')
      .attr('transform', `translate(${chart.width / 2},${chart.height - 15})`)

    const allVertices : Array<Vertex[]> = []

    for (let i = 2; i < n; i++) {
      const vertices : Vertex[] = poly(i)
      allVertices.push(vertices)
    }
    console.log(allVertices)

    const dataPoints : DataPoint[] = []

    allVertices.forEach((vertices, i) => {
      const distance = finalDistance(vertices)
      const ratio = size / distance
      vertices = scaleSize(vertices, ratio)

      const translateTarget = [250, 500]
      const translate = [translateTarget[0] - vertices[0][0], translateTarget[1] - vertices[0][1]]

      const firstVertex :Array<Vertex> = [[0, 0], [0, 0]]

      let startVertices = i > 0 ? getStartVertices(allVertices[i - 1]) : firstVertex

      const startDistance = finalDistance(startVertices)
      const startRatio = size / startDistance
      startVertices = scaleSize(startVertices, startRatio)
      const startTranslate = [translateTarget[0] - startVertices[0][0], translateTarget[1] - startVertices[0][1]]

      if (i === 0) { startTranslate[0] = startTranslate[0] + (size / 2) }

      dataPoints.push({
        start: {
          vertices: startVertices,
          transform: `translate(${startTranslate.join(',')})`
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
        d3.select(k[i])
          .attr('id', `polyline-${i}`)
          .attr('points', d.start.vertices.map(d => d.join(',')).join(' '))
          .attr('transform', d.start.transform)
          .attrs({
            fill: colors[i],
            // fill: interpolatedColors(i / (dataPoints.length - 1)),
            // fill: 'rgba(0,0,0,0)',
            stroke: 'black',
            display: 'none'
          })
      })

    callDraw(0)
  })
})

const speed :number = 400

function modifiedSpeed (i) :number {
  const result = ((2 + Math.cos(Tau * ((i / n)))) * speed)
  // const result = d3.easePoly(i)
  return result
}

const timingData = []

for (let i = 2; i < n; i++) {
  timingData.push({
    Vertices: i,
    Shape: getName(i),
    'Drawing time (ms)': Math.floor(modifiedSpeed(i)),
    // 'Fill Color': interpolatedColors(i / (n - 1))
    'Fill Color': colors[i - 2]
  })
}

decorateTable(timingData, {
  element: 'table#timing',
  order: [[0, 'asc']],
  columnDefs: [{
    targets: 3,
    createdCell: function (td, cellData) {
      $(td).css('background-color', cellData)
    }
  }]
})

function getName (i :number) :string {
  const names = ['Void', 'Dot', 'Line', 'Triangle', 'Square', 'Pentagon', 'Hexagon', 'Heptagon', 'Octagon', 'Nonagon', 'Decagon', 'Hendecagon', 'Dodecagon', 'Tridecagon', 'Tetradecagon', 'Pentadecagon', 'Hexadecagon', 'Heptadecagon', 'Octadecagon', 'Enneadecagon', 'Icosagon', 'Henicosagon', 'Doicosagon', 'Triaicosagon']
  if (i < names.length) {
    return names[i]
  } else {
    return `${i}-gon`
  }
}

function callReverse (i:number) {
  d3.select('.chart-title').text('Breathe Out')
  d3.select(`#polyline-${i}`)
    .transition()
    .ease(d3.easeLinear)
    .duration(modifiedSpeed(i))
    .attr('points', (d: DataPoint) => d.start.vertices.map(d => d.join(',')).join(' '))
    .attr('transform', (d: DataPoint) => d.start.transform)
    .on('end', (d, j, k) => {
      d3.select(k[j]).style('display', 'none')
      if (i > 0) {
        callReverse(i - 1)
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
    .duration(modifiedSpeed(i))
    .attr('points', (d: DataPoint) => d.end.vertices.map(d => d.join(',')).join(' '))
    .attr('transform', (d: DataPoint) => d.end.transform)
    .on('end', () => {
      if (i < n - 3) {
        callDraw(i + 1)
      } else {
        setTimeout(() => {
          callReverse(i)
        },
        speed / 2)
      }
    })
}

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
    const transform = (1 / 4) + (i / n) - (i - 1 / (2 * n))

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

function getStartVertices (vertices: Array<Vertex>) : Array<Vertex> {
  const result : Array<Vertex> = []

  vertices.forEach(vertex => {
    result.push(vertex)
  })
  const mid = Math.floor(vertices.length / 2)

  // console.log("vertices", vertices)

  if (vertices.length % 2 === 1) { // odd
    result.splice(mid, 0, result[mid])
  } else { // even
    // find the middle point of the middle 2, and then insert something
    const midPoint :Vertex = [
      (vertices[mid][0] + vertices[mid - 1][0]) / 2,
      (vertices[mid][1] + vertices[mid - 1][1]) / 2
    ]
    // console.log(midPoint)

    result.splice(mid, 0, midPoint)
  }
  return result
}

globalThis.poly = poly
globalThis.Tau = Tau
