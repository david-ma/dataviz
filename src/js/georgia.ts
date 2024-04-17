import { Chart, mapDistance, d3, Geoip, Coordinates } from './chart.js'

console.log('hey')

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
    // center: you,
    json: '/world.geo.json',
    zoom: 100,
    markers: updateChart(geoip.location, chart),
    update: updateChart,
  })
})

function updateChart(yourLocation: Coordinates, chart: Chart) {
  console.log('Updating chart', yourLocation)

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
    ...yourLocation,
    label: 'You are here',
    draggable: true,
  }

  const countryDistance = Math.floor(mapDistance(georgiaCountry, you))
  const stateDistance = Math.floor(mapDistance(georgiaState, you))

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

  console.log('distanceToCountry', distanceToCountry)
  console.log('distanceToState', distanceToState)

  if (distanceToCountry < distanceToState) {
    console.log("You're closer to the country")
    you.label = 'You are closer to Georgia (the country)'
  } else {
    console.log("You're closer to the state")
    you.label = 'You are closer to Georgia (the state)'
  }

  return [georgiaCountry, georgiaState, you]
}
