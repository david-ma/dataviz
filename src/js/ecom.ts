import { Chart, d3 } from './chart'

console.log('hello world')

const chart = d3.select('#chart')

const column_names = ['Date/Time', 'IP', 'User', 'Operation', 'Debtor', 'Debtors Name', 'Order Value', 'Search String']

const search_terms = []
const ip_addresses = {}
// const ip_lookups = []
let shaped_data = {}

let states = {}

Promise.all([d3.csv('/ubc/micronet_ecom_log.csv'), d3.tsv('/ubc/ip_lookup.tsv')])
  .then(([data, raw_ip_lookup]) => {
    const ip_lookup = Object.entries(raw_ip_lookup).reduce((acc: any, [index, { ip, geoip }]) => {
      if (geoip) {
        acc[ip] = JSON.parse(geoip)
      }
      return acc
    }, {})

    return [data, ip_lookup]
  })
  .then(([data, ip_lookup]) => {
    console.log('IP lookup', ip_lookup)
    console.log('Data', data)
    // Shape the data, group by Debtor
    shaped_data = data.reduce((acc: any, d: any, i: number) => {
      acc[d.Debtor] = acc[d.Debtor] || {
        interactions: [],
        searches: [],
        orders: [],
      }

      // Geoip lookup format
      // http://localhost:7777/geoip?ip=61.29.116.50
      if (d.IP) {
        window.setTimeout(() => {
          if (!ip_addresses[d.IP]) {
            const geoip = ip_lookup[d.IP]
            ip_addresses[d.IP] = {
              count: 1,
              Debtor: d.Debtor,
              'Debtors Name': d['Debtors Name'],
              date: d['Date/Time'],
              geoip,
            }

            if (geoip.subdivisions && geoip.subdivisions[0].names.en) {
              states[geoip.subdivisions[0].names.en] = states[geoip.subdivisions[0].names.en] || []
              states[geoip.subdivisions[0].names.en].push(d.IP)
            }

            drawIPAddresses(ip_addresses)
            // })
            // ip_lookups.push(promise)
          } else {
            ip_addresses[d.IP].count++
          }
        }, i * 1)
      }

      acc[d.Debtor].interactions.push(d)
      const search = d['Search String']
      if (search) {
        acc[d.Debtor].searches.push(search)
      }
      if (d['Order Value'] > 0) {
        acc[d.Debtor].orders.push(d)
      }
      return acc
    }, {})

    return shaped_data
  })
  .then((shaped_data) => {
    console.log(shaped_data)

    d3.select('#description').text(`There are ${Object.keys(shaped_data).length} different customers.`)

    // Get search terms
    // d3.select('#description').text(`The search terms are: ${search_terms.join(', ')}`)
  })

// #description area, write down how many different customers we have

let selected_state = 'All'
// other? anything that isn't:
// All, NSW, VIC, QLD, WA, SA, TAS, NT, ACT

function filterToState(selected_state) {
  console.log(`Selecting state ${selected_state}`)
  d3.selectAll('#ip_addresses table tbody tr').style('display', (ip: any) => {
    const row_state = ip_addresses[ip].geoip.subdivisions[0].names.en
    if (selected_state === 'All') {
      return 'table-row'
    }
    if (selected_state === 'Other') {
      return row_state === 'New South Wales' ||
        row_state === 'Victoria' ||
        row_state === 'Queensland' ||
        row_state === 'Western Australia' ||
        row_state === 'South Australia' ||
        row_state === 'Tasmania' ||
        row_state === 'Northern Territory' ||
        row_state === 'Australian Capital Territory'
        ? 'none'
        : 'table-row'
    }
    return selected_state === row_state ? 'table-row' : 'none'
  })
}
globalThis.filterToState = filterToState

const state_options = [
  'All',
  'New South Wales',
  'Victoria',
  'Queensland',
  'Western Australia',
  'South Australia',
  'Tasmania',
  'Other',
]

d3.select('#buttons')
  .selectAll('button')
  .data(state_options)
  .enter()
  .append('button')
  .text((d) => d)
  .on('click', (event, d) => {
    filterToState(d)
  })

function drawIPAddresses(ip_addresses) {
  const ip_addresses_list = d3.select('#ip_addresses table tbody')

  ip_addresses_list
    .selectAll('tr')
    .data(Object.keys(ip_addresses))
    .enter()
    .append('tr')
    .attr('data-state', (ip) => {
      return ip_addresses[ip].geoip.subdivisions[0].names.en
    })
    .each((d, i, nodes) => {
      const row = d3.select(nodes[i])
      row.append('td').text(ip_addresses[d].date).style('white-space', 'nowrap')

      row.append('td').text(d)
      row
        .append('td')
        .html(
          `${ip_addresses[d].geoip.country.names.en}<br>${ip_addresses[d].geoip.subdivisions[0].names.en}<br>${ip_addresses[d].geoip.city.names.en}`,
        )
      row.append('td').html(`${ip_addresses[d].geoip.location.latitude}, ${ip_addresses[d].geoip.location.longitude}`)
      row
        .append('td')
        .html(
          `<a href="/debtor/${ip_addresses[d].Debtor}">${ip_addresses[d].Debtor}</a><br>${ip_addresses[d]['Debtors Name']}<br>${shaped_data[ip_addresses[d].Debtor].interactions.length} interactions`,
        )
      row.append('td').html(shaped_data[ip_addresses[d].Debtor].orders.length)
      row
        .append('td')
        .html(
          `${shaped_data[ip_addresses[d].Debtor].searches.length} searches<br>${shaped_data[ip_addresses[d].Debtor].searches.join(', ')}`,
        )
      // row.append('td').append('textarea').classed('notes', true)
    })
}

/**
 * Draw a table with the data
 */
function drawTable(data) {
  const chart = d3.select('#chart')
  chart
    .append('table')
    .selectAll('tr')
    .data(data)
    .enter()
    .append('tr')
    .selectAll('td')
    .data((d) => Object.values(d))
    .enter()
    .append('td')
    .text((d) => d)
}

const map_settings = {
  australia: {
    width: 1300,
    height: 1200,
    lat: -28,
    long: 134,
  },
  vic: {
    width: 600,
    height: 600,
    lat: -36,
    long: 145,
  },
  nsw: {
    width: 600,
    height: 700,
    lat: -32.5,
    long: 147,
  },
  qld: {
    width: 600,
    height: 800,
    lat: -23,
    long: 145,
  },
  wa: {
    width: 700,
    height: 800,
    lat: -26,
    long: 122,
  },
}

new Chart({
  element: 'map',
  width: 1300,
  height: 1200,
  margin: 0,
  nav: false,
}).scratchpad((chart) => {
  var lat = -28,
    long = 134,
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
    .range(['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'])

  // Create SVG
  const svg = chart.svg

  d3.json('/aust.json').then((json) => {
    console.log(json)
    drawMap(json)
  })

  const timeFormat = d3.timeFormat('%-I:%M %p · %b %-d, %Y')

  function drawTweet(data, user, i = 0) {
    var tweets = d3.select('#tweets')

    var tweet = tweets.append('div').classed('tweet', true)

    tweet
      .append('img')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', 50)
      .attr('width', 50)
      .attr('src', user.profile_image_url_https)
      .style('border-radius', '50%')
      .style('border', 'solid 1px lightgrey')

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
      .attr('href', `https://twitter.com/${user.screen_name}/status/${data.id_str}`)

    const bottom = tweet.append('div').append('p')

    bottom.append('span').append('i').classed('fa', true).classed('fa-retweet', true)
    bottom.append('span').text(data.retweet_count)

    bottom.append('span').append('i').classed('fa', true).classed('fa-heart', true)
    bottom.append('span').text(data.favorite_count)

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
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 0)
      .attr('fill', '#FF0000')
      .attr('fill-opacity', 1)
      .attr('transform', (d: any) => {
        return `translate(${projection([long, lat])})`
      })
      .transition()
      .duration(2000)
      .attr('r', 20)
      .attr('fill-opacity', 0.01)
  }

  function drawFeature(lat: number, long: number) {
    svg
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 0)
      .attr('fill', '#FF0000')
      .attr('fill-opacity', 1)
      .attr('transform', (d: any) => {
        return `translate(${projection([long, lat])})`
      })
      .transition()
      .duration(2000)
      .attr('r', 20)
      .attr('fill-opacity', 0.01)
  }

  function drawMap(json) {
    console.log('Drawing map', json)
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
  return chart
})

function geocodesCenter(geocodes: string[]) {
  let totalLat = 0,
    totalLong = 0,
    weight: number = geocodes.length
  geocodes.forEach((geocode) => {
    const [lat, long, range]: number[] = geocode.split(',').map(parseFloat)

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
