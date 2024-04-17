import { Chart, mapDistance, d3, Geoip, Coordinates } from './chart.js'

// Ingest data
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
  // Init chart

  chart.drawMap({
    json: '/world.geo.json',
    zoom: 100,
    markers: calculate(chart, geoip.location),
    calculate,
  })
})

function calculate(chart: Chart, yourCoordinates: Coordinates) {
  const georgiaCountry: Coordinates = {
    latitude: 42.3154,
    longitude: 43.3569,
    type: 'Country',
    url: 'https://en.wikipedia.org/wiki/Georgia_(country)',
    label: 'Georgia',
  }

  const georgiaState: Coordinates = {
    latitude: 32.1656,
    longitude: -82.9001,
    type: 'State',
    url: 'https://en.wikipedia.org/wiki/Georgia_(U.S._state)',
    label: 'Georgia',
  }

  const georgiaIsland: Coordinates = {
    latitude: -54.2833,
    longitude: -36.5,
    type: 'Island',
    url: 'https://en.wikipedia.org/wiki/South_Georgia_and_the_South_Sandwich_Islands',
    label: 'South Georgia',
  }

  const georgiaHamlet: Coordinates = {
    latitude: 50.173,
    longitude: -5.525,
    type: 'Hamlet',
    url: 'https://en.wikipedia.org/wiki/Georgia,_Cornwall',
    label: 'Georgia',
  }

  const you: Coordinates = {
    ...yourCoordinates,
    label: 'You are here',
    draggable: true,
  }

  georgiaCountry.distance = Math.floor(mapDistance(georgiaCountry, you))
  georgiaState.distance = Math.floor(mapDistance(georgiaState, you))
  georgiaIsland.distance = Math.floor(mapDistance(georgiaIsland, you))
  georgiaHamlet.distance = Math.floor(mapDistance(georgiaHamlet, you))

  const georgias = [
    georgiaCountry,
    georgiaState,
    georgiaIsland,
    georgiaHamlet,
  ].sort((a, b) => a.distance - b.distance)

  const statement = d3.select('#statement')
  const closestGeorgia = georgias[0]
  statement.text(
    `Your closest Georgia is ${closestGeorgia.label} (${closestGeorgia.type}), which is ${closestGeorgia.distance} km away`
  )

  you.label = `You are closer to ${closestGeorgia.label} (${closestGeorgia.type})`

  return [you, georgiaCountry, georgiaState, georgiaIsland, georgiaHamlet]
}
