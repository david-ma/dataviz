import { Chart, mapDistance, d3, Geoip, Coordinates } from './chart.js'

const georgias: Coordinates[] = [
  {
    latitude: 42.3154,
    longitude: 43.3569,
    type: 'Country',
    url: 'https://en.wikipedia.org/wiki/Georgia_(country)',
    label: 'Georgia',
  },
  {
    latitude: 32.1656,
    longitude: -82.9001,
    type: 'State',
    url: 'https://en.wikipedia.org/wiki/Georgia_(U.S._state)',
    label: 'Georgia',
  },
]

const extraGeorgias: Coordinates[] = [
  {
    latitude: 50.173,
    longitude: -5.525,
    type: 'Hamlet',
    url: 'https://en.wikipedia.org/wiki/Georgia,_Cornwall',
    label: 'Georgia',
  },
  {
    latitude: -54.2833,
    longitude: -36.5,
    type: 'Island',
    url: 'https://en.wikipedia.org/wiki/South_Georgia_and_the_South_Sandwich_Islands',
    label: 'South Georgia',
  },
]

// Ingest data
Promise.all([
  d3.json('https://monetiseyourwebsite.com/geoip'),
  new Chart({
    // eslint-disable-line
    element: 'georgiaChart',
    margin: 20,
    width: 800,
    height: 600,
    nav: false,
  }),
]).then(([geoip, chart]: [Geoip, Chart]) => {
  // Init chart

  // gz_2010_us_040_00_5m.json
  chart.drawMap({
    json: '/world-50.geo.json',
    usa: '/gz_2010_us_040_00_5m.json',
    aus: '/aust.json',
    zoom: 100,
    markers: calculate(chart, geoip.location),
    calculate,
  })

  // For button#addButton
  globalThis.addExtraGeorgia = function () {
    if (extraGeorgias.length > 0) georgias.push(extraGeorgias.pop())
    if (extraGeorgias.length === 0) d3.select('#addButton').text("That's all the Georgias!").attr("disabled", true)

    chart.drawMap({
      json: '/world-50.geo.json',
      zoom: 100,
      markers: calculate(chart, geoip.location),
      calculate,
    })
  }
})

function calculate(chart: Chart, yourCoordinates: Coordinates) {
  const you: Coordinates = {
    ...yourCoordinates,
    label: 'You are here',
    draggable: true,
  }

  georgias.forEach((georgia) => {
    georgia.distance = Math.floor(mapDistance(georgia, you))
  })

  const sortedGeorgias = georgias.sort((a, b) => a.distance - b.distance)

  const statement = d3.select('#statement')
  const closestGeorgia = georgias[0]
  statement.text(
    `Your closest Georgia is ${closestGeorgia.label} (${closestGeorgia.type}), which is ${closestGeorgia.distance} km away`
  )

  you.label = `You are closer to ${closestGeorgia.label} (${closestGeorgia.type})`

  return [you, ...sortedGeorgias]
}
