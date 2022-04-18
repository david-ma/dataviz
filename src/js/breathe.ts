import { Chart, decorateTable, $, d3 } from 'chart'

// import 'datatables.net'

console.log('Running breathe.ts')

/// <reference path="../../node_modules/@types/d3/index.d.ts" />
/// <reference path="../../node_modules/@types/d3-selection/index.d.ts" />
/// <reference path="../../node_modules/@types/d3-selection-multi/index.d.ts" />

type Vertex = [number, number]

type DataPoint = {
  index: number
  start: {
    vertices: Array<Vertex>
    transform: string
  }
  end: {
    vertices: Array<Vertex>
    transform: string
  }
}

let dataTable: DataTables.Api = null

const Tau = 2 * Math.PI

let n: number = 14
let size: number = 1400 / n

const pastels = [
  '#660b77',
  '#9e0142',
  '#d53e4f',
  '#f46d43',
  '#fdae61',
  '#fee08b',
  '#ffffbf',
  '#e6f598',
  '#abdda4',
  '#66c2a5',
  '#3288bd',
  '#5e4fa2',
] // eslint-disable-line
const monochrome = [...Array(n).keys()].map(
  (i) => `hsl(0,0%,${Math.floor(100 * (i / (n - 1)))}%)`
)
let colors = pastels

// d3.interpolate(colors)
// const interpolatedColors = d3.interpolateHslLong('#9e0142', '#5e4fa2')
// const interpolatedColors = d3.interpolateHslLong('#810081', '#ffa600') // eslint-disable-line

$.when($.ready).then(function () {
  const chart = new Chart({
    // eslint-disable-line
    title: 'Breathe In',
    element: 'breatheDiv',
    margin: 40,
    width: 600,
    height: 600,
    nav: false,
  }).scratchpad((chart: Chart) => {
    // Move the title to the bottom
    chart.svg
      .select('.chart-title')
      .attr('transform', `translate(${chart.width / 2},${chart.height - 15})`)

    const dataPoints: DataPoint[] = calculateDataPoints(n)

    chart.svg
      .selectAll('.line')
      .data(dataPoints, (d: DataPoint) => d.index)
      .enter()
      .insert('polyline', 'polyline')
      .classed('polyline', true)
      .each(updatePolylines)

    chart.svg
      .selectAll('.polygon')
      .data(dataPoints, (d: DataPoint) => d.index)
      .enter()
      .insert('polygon', 'polyline')
      .each(updatePolygons)

    callDraw(0)
  })
})

let speed: number = 400
d3.select('#speedSlider').on('change', function () {
  const input: number = parseInt($('#speedSlider').val() as string)
  speed = (101 - input) * 8

  timingData.forEach((d, i) => {
    timingData[i]['Draw Time (ms)'] = modifiedSpeed(i)
  })

  dataTable.cells(':nth-child(3)').every(function (i) {
    this.data(modifiedSpeed(i))
    return this
  })
})

function modifiedSpeed(i): number {
  const result = Math.floor((2 + Math.cos(Tau * (i / n))) * speed)
  // const result = d3.easePoly(i)
  return result
}

const timingData = calculateTimingData(n)

function calculateTimingData(n: number): any[] {
  const timingData = []
  for (let i = 2; i < n; i++) {
    timingData.push({
      Points: i,
      Shape: getName(i),
      'Draw Time (ms)': modifiedSpeed(i),
      'Fill Color': colors[(i - 2) % colors.length],
    })
  }
  return timingData
}

d3.select('#timing table').style('width', '100%')

dataTable = decorateTable(timingData, {
  element: '#timing table',
  order: [0, 'asc'],
  columnDefs: [
    {
      targets: 3,
      createdCell: function (td, cellData) {
        $(td).addClass('colorCell').css('background-color', cellData)
      },
    },
  ],
})

function getName(i: number): string {
  const names = [
    'Void',
    'Dot',
    'Line',
    'Triangle',
    'Square',
    'Pentagon',
    'Hexagon',
    'Heptagon',
    'Octagon',
    'Nonagon',
    'Decagon',
    'Hendecagon',
    'Dodecagon',
    'Tridecagon',
    'Tetradecagon',
    'Pentadecagon',
    'Hexadecagon',
    'Heptadecagon',
    'Octadecagon',
    'Enneadecagon',
    'Icosagon',
    'Henicosagon',
    'Doicosagon',
    'Triaicosagon',
  ]
  if (i < names.length) {
    return names[i]
  } else {
    return `${i}-gon`
  }
}

let currentTransition: d3.Selection<
  SVGPolylineElement,
  DataPoint,
  HTMLElement,
  any
>

function callReverse(i: number) {
  d3.select('.chart-title').text('Breathe Out')
  // currentTransition = d3.select<SVGPolylineElement, DataPoint>(`#polyline-${i}`)
  currentTransition = d3.select(`#polyline-${i}`)
  currentTransition
    .transition()
    .ease(d3.easeLinear)
    .duration(modifiedSpeed(i))
    .attr('points', (d) => d.start.vertices.map((d) => d.join(',')).join(' '))
    .attr('transform', (d) => d.start.transform)
    .on('end', (d, j, arr) => {
      d3.select(arr[j]).style('display', 'none')
      if (i > 0) {
        callReverse(i - 1)
      } else {
        callDraw(0)
      }
    })
}

function callDraw(i: number) {
  d3.select('.chart-title').text('Breathe In')
  // currentTransition = d3.select<SVGPolylineElement, DataPoint>(`#polyline-${i}`)
  currentTransition = d3.select(`#polyline-${i}`)
  currentTransition
    .style('display', 'inherit')
    .transition()
    .ease(d3.easeLinear)
    .duration(modifiedSpeed(i))
    .attr('points', (d) => d.end.vertices.map((d) => d.join(',')).join(' '))
    .attr('transform', (d) => d.end.transform)
    .on('end', () => {
      if (i < n - 3) {
        callDraw(i + 1)
      } else {
        setTimeout(() => {
          callReverse(i)
        }, speed / 2)
      }
    })
}

function poly(n): Array<Vertex> {
  const result: Array<Vertex> = []

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
    const transform = 1 / 4 + i / n - (i - 1 / (2 * n))

    result.push([
      x + r * Math.cos(Tau * transform) * 1,
      y + r * Math.sin(Tau * transform) * 1,
    ])
  }
  return result
}

function finalDistance(vertices: Array<Vertex>): number {
  const first = vertices[0]
  const last = vertices[vertices.length - 1]

  return Math.hypot(first[0] - last[0], first[1] - last[1]) || size
}

function scaleSize(vertices: Array<Vertex>, scale: number): Array<Vertex> {
  const result: Array<Vertex> = []
  vertices.forEach((vertex) => {
    result.push([vertex[0] * scale, vertex[1] * scale])
  })
  return result
}

function getStartVertices(vertices: Array<Vertex>): Array<Vertex> {
  const result: Array<Vertex> = []

  vertices.forEach((vertex) => {
    result.push(vertex)
  })
  const mid = Math.floor(vertices.length / 2)

  // console.log("vertices", vertices)

  if (vertices.length % 2 === 1) {
    // odd
    result.splice(mid, 0, result[mid])
  } else {
    // even
    // find the middle point of the middle 2, and then insert something
    const midPoint: Vertex = [
      (vertices[mid][0] + vertices[mid - 1][0]) / 2,
      (vertices[mid][1] + vertices[mid - 1][1]) / 2,
    ]
    // console.log(midPoint)

    result.splice(mid, 0, midPoint)
  }
  return result
}

$('input[name="outlines"]').on('change', () => {
  $('.polygon').toggleClass('hidden')
})

$('input[name="tabs"]').on('change', () => {
  $('.tabbedContent').toggleClass('selected')
})

$('input[name="colors"]').on('change', () => {
  if ($("input[name='colors']:checked").val() === 'pastels') {
    colors = pastels
  } else {
    colors = monochrome
  }

  // d3.selectAll<SVGPolylineElement, DataPoint>('polyline').each(function (
  d3.selectAll('polyline').each(function (d, i, k) {
    d3.select(k[i]).attr('fill', colors[d.index % colors.length])
  })

  timingData.forEach((d, i) => {
    timingData[i]['Fill Color'] = colors[i % colors.length]
  })

  dataTable.cells('.colorCell').every(function (i) {
    this.data(colors[i % colors.length])
    $(this.node()).css('background-color', colors[i % colors.length])
    return this
  })
})

d3.select('#verticesSlider').on('change', function () {
  n = parseInt($('#verticesSlider').val() as string)
  size = 1400 / n

  const dataPoints: DataPoint[] = calculateDataPoints(n)

  const timingData = calculateTimingData(n)

  dataTable.rows().remove()
  dataTable.rows.add(timingData).draw()

  currentTransition.interrupt()

  d3.select('svg')
    .selectAll('.polyline')
    .data(dataPoints, (d: DataPoint) => d.index)
    .each(updatePolylines)
    .enter()
    .insert('polyline', 'polyline')
    .classed('polyline', true)
    .each(updatePolylines)

  d3.select('svg')
    .selectAll('.polyline')
    .data(dataPoints, (d: DataPoint) => d.index)
    .exit()
    .remove()

  d3.select('svg')
    .selectAll('.polygon')
    .data(dataPoints, (d: DataPoint) => d.index)
    .each(updatePolygons)
    .enter()
    .insert('polygon', 'polyline')
    .each(updatePolygons)

  d3.select('svg')
    .selectAll('.polygon')
    .data(dataPoints, (d: DataPoint) => d.index)
    .exit()
    .remove()

  callDraw(0)
})

function updatePolylines(d, i, arr) {
  d3.select(arr[i])
    .attr('id', `polyline-${i}`)
    .attr('points', d.start.vertices.map((d) => d.join(',')).join(' '))
    .attr('transform', d.start.transform)
    .attr('fill', colors[i % colors.length])
    .attr('stroke', 'black')
    .style('display', 'none')
}

function updatePolygons(d, i, arr) {
  // d3.select<SVGPolygonElement, DataPoint>(arr[i]).attrs((d, i) => {
  d3.select(arr[i]).attrs((d, i) => {
    return {
      id: `polygon-${i}`,
      class: 'polygon',
      points: d.end.vertices.map((d) => d.join(',')).join(' '),
      transform: d.end.transform,
      stroke: 'lightgrey',
      'stroke-width': 1,
      fill: 'rgba(0,0,0,0)',
    }
  })
}

function calculateDataPoints(n: number): DataPoint[] {
  const allVertices: Array<Vertex[]> = []
  const dataPoints: DataPoint[] = []

  for (let i = 2; i < n; i++) {
    const vertices: Vertex[] = poly(i)
    allVertices.push(vertices)
  }

  allVertices.forEach((vertices, i) => {
    const distance = finalDistance(vertices)
    const ratio = size / distance
    vertices = scaleSize(vertices, ratio)

    const translateTarget = [300 - size / 2, 500]
    const translate = [
      translateTarget[0] - vertices[0][0],
      translateTarget[1] - vertices[0][1],
    ]

    const firstVertex: Array<Vertex> = [
      [0, 0],
      [0, 0],
    ]

    let startVertices =
      i > 0 ? getStartVertices(allVertices[i - 1]) : firstVertex

    const startDistance = finalDistance(startVertices)
    const startRatio = size / startDistance
    startVertices = scaleSize(startVertices, startRatio)
    const startTranslate = [
      translateTarget[0] - startVertices[0][0],
      translateTarget[1] - startVertices[0][1],
    ]

    if (i === 0) {
      startTranslate[0] = startTranslate[0] + size / 2
    }

    dataPoints.push({
      index: i,
      start: {
        vertices: startVertices,
        transform: `translate(${startTranslate.join(',')})`,
      },
      end: {
        vertices: vertices,
        transform: `translate(${translate.join(',')})`,
      },
    })
  })

  return dataPoints
}

globalThis.poly = poly
globalThis.Tau = Tau
