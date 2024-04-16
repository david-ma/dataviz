import { Chart, mapDistance, d3, Geoip, Coordinates } from './chart.js'

console.log('hey')

Promise.all([
  d3.json('https://monetiseyourwebsite.com/geoip'),
  new Chart({
    // eslint-disable-line
    element: 'exampleDiv',
    margin: 20,
    width: 800,
    height: 600,
    nav: false,
  }),
]).then(([geoip, chart]: [Geoip, Chart]) => {
  console.log('geoip', geoip)
  console.log(JSON.stringify(geoip))

  const georgiaCountry: Coordinates = {
    latitude: 42.3154,
    longitude: 43.3569,
    label: 'Georgia',
  }

  const georgiaState: Coordinates = {
    latitude: 32.1656,
    longitude: -82.9001,
    label: 'Georgia',
  }

  const you: Coordinates = {
    ...geoip.location,
    label: 'You are here',
    drag: d3
      .drag()
      .on('start', function () {
        console.log('starting a drag')
        // d3.select(this).raise().classed('active', true)
      })
      .on('drag', function () {
        console.log('dragging')
      })
      .on('end', function () {
        console.log('drag ended')
      }),
  }

  const countryDistance = Math.floor(mapDistance(georgiaCountry, you))
  const stateDistance = Math.floor(mapDistance(georgiaState, you))

  console.log(`You are ${countryDistance}km from Georgia (country)`)
  console.log(`You are ${stateDistance}km from Georgia (state)`)
  const statement = d3.select('#statement')
  if (countryDistance < stateDistance) {
    statement.text(
      `You are ${countryDistance} km from Georgia (country). This is closer than Georgia (state), which is ${stateDistance} km away from you.`
    )
  } else {
    statement.text(
      `You are ${stateDistance} km from Georgia (state). This is closer than Georgia (country), which is ${countryDistance} km away from you.`
    )
  }
  // calculate which Georgia is closer
  const distanceToCountry = Math.sqrt(
    Math.pow(georgiaCountry.latitude - you.latitude, 2) +
      Math.pow(georgiaCountry.longitude - you.longitude, 2)
  )

  const distanceToState = Math.sqrt(
    Math.pow(georgiaState.latitude - you.latitude, 2) +
      Math.pow(georgiaState.longitude - you.longitude, 2)
  )

  if (distanceToCountry < distanceToState) {
    you.label = 'You are closer to Georgia (the country)'
  } else {
    you.label = 'You are closer to Georgia (the state)'
  }

  chart.map({
    // lat: geoip.location.latitude,
    // long: geoip.location.longitude,
    // place: geoip.country.names.en,
    // center: geoip.location,
    json: '/world.geo.json',
    zoom: 100,
    markers: [georgiaCountry, georgiaState, you],
  })
})

// drawMap(-17, 131, "asdf")

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
//   const chart = new Chart({
//     // eslint-disable-line
//     element: 'exampleDiv',
//     margin: 20,
//     width: 800,
//     height: 600,
//     nav: false,
//   }).scratchpad((chart: Chart) => {
//     const svg = chart.svg
//     // chart.svg

//     // Define map projection
//     const projection = d3
//       .geoMercator()
//       .center([Math.floor(long), Math.floor(lat)])
//       .translate([w / 2, h / 2])
//       .scale(1000)
//     // Define path generator
//     const path = d3.geoPath().projection(projection)

//     d3.json('/world.geo.json').then((json) => {
//       console.log('JSON', json)
//       // Bind data and create one path per GeoJSON feature
//       svg
//         .selectAll('path')
//         .data(json.features)
//         .enter()
//         .append('path')
//         .attr('d', path)
//         .attr('stroke', 'dimgray') // @ts-ignore @types/d3 is missing this overload.
//         .attr('fill', function (d, i) {
//           return color(i)
//         })

//       // States
//       svg
//         .selectAll('text')
//         .data(json.features)
//         .enter()
//         .append('text')
//         .attr('fill', 'darkslategray')
//         .attr('transform', function (d: any) {
//           return 'translate(' + path.centroid(d) + ')'
//         })
//         .attr('text-anchor', 'middle')
//         .attr('dy', '.35em')
//         .style('opacity', 0.5)
//         .text(function (d: any) {
//           return d.properties.STATE_NAME
//         })

//       // Append the name
//       svg
//         .append('text')
//         .attr('x', w / 2)
//         .attr('y', h / 2 - 15)
//         .attr('font-size', 16)
//         .attr('font-weight', 'bold')
//         .attr('font-family', 'FontAwesome')
//         .attr('text-anchor', 'middle')
//         .classed('fa fa-map-marker', true)
//         .text('\uf041')

//       svg
//         .append('text')
//         .attr('x', w / 2)
//         .attr('y', h / 2)
//         .attr('font-size', 16)
//         .attr('font-weight', 'bold')
//         .attr('font-family', 'Roboto')
//         .attr('text-anchor', 'middle')
//         .text(place)
//     })
//   })
// })

// console.log(" hello ")
// console.log("World 2")

console.log('new change., do we see it?')
console.log('another new change')
