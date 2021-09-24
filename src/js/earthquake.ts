import { Chart, d3 } from 'chart'

const earthquakeDay = new Date('2021-09-21T23:13:40.000Z')

new Chart({
  element: 'map',
  width: 600,
  height: 600,
  margin: 0,
  nav: false,
}).scratchpad((chart) => {
  var lat = -36,
    long = 145,
    w = chart.width,
    h = chart.height

  // Define map projection
  const projection = d3
    .geoMercator()
    .center([Math.floor(long), Math.floor(lat)])
    .translate([w / 2, h / 2])
    .scale(1600)

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
  const svg = chart.svg

  Promise.all([d3.json('/aust.json'), d3.json('/earthquakeTweets.json')]).then(
    ([json, twitter]: [any, any]) => {
      drawMap(json)
      svg.append('g').attr('id', 'pings')

      let timestamp = earthquakeDay.getTime()

      twitter.tweets.forEach((tweet, i) => {
        if (new Date(tweet.created_at) < earthquakeDay) {
          return
        }

        const geocodes = twitter.geocodes[tweet.id_str]
        const point = geocodesCenter(geocodes)

        const waitTime =
          (new Date(tweet.created_at).getTime() - timestamp) / 100
        setTimeout(() => {
          console.log('drawing tweet', i)
          pingMap(point[0], point[1])
          drawTweet(tweet, twitter.users[tweet.userId], i)
        }, waitTime)
      })
    }
  )

  const timeFormat = d3.timeFormat('%-I:%M %p · %b %-d, %Y')

  function drawTweet(data, user, i = 0) {
    var tweets = d3.select('#tweets')

    var tweet = tweets.append('div').classed('tweet', true)

    tweet
      .append('img')
      .attrs({
        x: 0,
        y: 0,
        height: 50,
        width: 50,
        src: user.profile_image_url_https,
      })
      .styles({
        'border-radius': '50%',
        border: 'solid 1px lightgrey',
      })

    var name = tweet.append('p')
    name
      .append('span')
      .text(user.name + ' ')
      .classed('name', true)
    name
      .append('span')
      .text('@' + user.screen_name)
      .classed('username', true)

    tweet.append('p').text(data.full_text)
    tweet
      .append('a')
      .text(timeFormat(new Date(data.created_at)))
      .attr(
        'href',
        `https://twitter.com/${user.screen_name}/status/${data.id_str}`
      )
    setTimeout(() => {
      tweet.remove()
    }, 1000)
  }

  function pingMap(lat: number, long: number) {
    d3.select('#pings')
      .append('circle')
      .datum({
        lat: lat,
        long: long,
      })
      .attrs({
        cx: 0,
        cy: 0,
        r: 0,
        fill: '#FF0000',
        'fill-opacity': 1,
      })
      .attr('transform', (d: any) => {
        return `translate(${projection([long, lat])})`
      })
      .transition()
      .duration(2000)
      .attr('r', 20)
      .attr('fill-opacity', 0.01)
  }

  function drawMap(json) {
    // Bind data and create one path per GeoJSON feature
    svg
      .append('g')
      .attr('id', 'shapes')
      .selectAll('path')
      .data(json.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', 'dimgray') // @ts-ignore @types/d3 is missing this overload.
      .attr('fill', function (d, i) {
        return color(i.toString())
      })

    svg
      .append('g')
      .attr('id', 'state_labels')
      .selectAll('text')
      .data(json.features)
      .enter()
      .append('text')
      .attr('fill', 'darkslategray')
      .attr('transform', function (d: any) {
        return `translate(${path.centroid(d)})`
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('opacity', 0.5)
      .text(function (d: any) {
        return d.properties.STATE_NAME
      })
  }
})

function geocodesCenter(geocodes: string[]) {
  let totalLat = 0,
    totalLong = 0,
    weight: number = geocodes.length
  geocodes.forEach((geocode) => {
    let [lat, long, range]: number[] = geocode.split(',').map(parseFloat)

    totalLat += lat
    totalLong += long
    if (range < 30) {
      totalLat += lat
      totalLong += long
      weight++
    }
    if (range < 15) {
      totalLat += lat
      totalLong += long
      weight++
    }
  })

  return [totalLat / weight, totalLong / weight]
}
