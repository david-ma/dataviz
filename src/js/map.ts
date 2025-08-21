import { Chart, decorateTable } from './chart'
import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'
import { parse } from 'path'

console.log('Running map.ts')

$.when($.ready).then(function () {
  const chart = new Chart({
    // eslint-disable-line
    element: 'exampleDiv',
    margin: 20,
    width: 800,
    height: 600,
    nav: false,
  }).scratchpad((chart: Chart) => {
    console.log(chart)

    d3.csv('/dataviz/aiatsis_austlang_endpoint_001.csv', function (row) {
      console.log(row)
      return row
    }).then((d) => {})
  })
})

drawMap(-17, 131, 'asdf')

var x = document.getElementById('demo')
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition)
  } else {
    x.innerHTML = 'Geolocation is not supported by this browser.'
  }
}

function showPosition(position) {
  x.innerHTML =
    'Latitude: ' +
    position.coords.latitude +
    '<br>Longitude: ' +
    position.coords.longitude
}

getLocation()

function drawMap(lat, long, place) {
  console.log('Drawing map', {
    lat: lat,
    long: long,
    place: place,
  })

  // Width and height
  const w = 600
  const h = 600

  // Define map projection
  const projection = d3
    .geoMercator()
    .center([Math.floor(long), Math.floor(lat)])
    .translate([w / 2, h / 2])
    .scale(1000)

  // Define path generator
  const path = d3.geoPath().projection(projection)

  const color = d3
    .scaleOrdinal()
    .range([
      '#8dd3c7',
      '#ffffb3',
      '#bebada',
      '#fb8072',
      '#80b1d3',
      '#fdb462',
      '#b3de69',
      '#fccde5',
      '#d9d9d9',
    ])

  // Create SVG
  const svg = d3
    .select('#map-canvas')
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('width', w)
    .attr('height', h)

  // Load in GeoJSON data
  d3.json('/dataviz/aust.json').then((json: any) => {
    // Bind data and create one path per GeoJSON feature
    svg
      .selectAll('path')
      .data(json.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', 'dimgray') // @ts-ignore @types/d3 is missing this overload.
      .attr('fill', function (d, i) {
        return color(i.toString())
      })

    // States
    svg
      .selectAll('text')
      .data(json.features)
      .enter()
      .append('text')
      .attr('fill', 'darkslategray')
      .attr('transform', function (d: any) {
        return 'translate(' + path.centroid(d) + ')'
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('opacity', 0.5)
      .text(function (d: any) {
        return d.properties.STATE_NAME
      })

    // Append the name
    svg
      .append('text')
      .attr('x', w / 2)
      .attr('y', h / 2 - 15)
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('font-family', 'FontAwesome')
      .attr('text-anchor', 'middle')
      .classed('fa fa-map-marker', true)
      .text('\uf041')

    svg
      .append('text')
      .attr('x', w / 2)
      .attr('y', h / 2)
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('font-family', 'Roboto')
      .attr('text-anchor', 'middle')
      .text(place)
  })
}

drawMarker(-23, 131, 'hello')
function drawMarker(lat, long, place) {
  console.log('Drawing marker', {
    lat: lat,
    long: long,
    place: place,
  })

  // Width and height
  const w = 600
  const h = 600

  // Define map projection
  const projection = d3
    .geoMercator()
    .center([Math.floor(long), Math.floor(lat)])
    .translate([w / 2, h / 2])
    .scale(1000)

  // Define path generator
  const path = d3.geoPath().projection(projection)

  const color = d3
    .scaleOrdinal()
    .range([
      '#8dd3c7',
      '#ffffb3',
      '#bebada',
      '#fb8072',
      '#80b1d3',
      '#fdb462',
      '#b3de69',
      '#fccde5',
      '#d9d9d9',
    ])

  // Create SVG
  const svg = d3.select('#map-canvas svg')

  // Append the name
  svg
    .append('text')
    .attr('x', w / 2)
    .attr('y', h / 2 - 15)
    .attr('font-size', 16)
    .attr('font-weight', 'bold')
    .attr('font-family', 'FontAwesome')
    .attr('text-anchor', 'middle')
    .classed('fa fa-map-marker', true)
    .text('\uf041')

  svg
    .append('text')
    .attr('x', w / 2)
    .attr('y', h / 2)
    .attr('font-size', 16)
    .attr('font-weight', 'bold')
    .attr('font-family', 'Roboto')
    .attr('text-anchor', 'middle')
    .text(place)
}
globalThis.drawMap = drawMap
