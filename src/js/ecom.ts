console.log('hello world')

const chart = d3.select('#chart')

const column_names = ['Date/Time', 'IP', 'User', 'Operation', 'Debtor', 'Debtors Name', 'Order Value', 'Search String']

const search_terms = []
const ip_addresses = {}
const ip_lookups = []

d3.csv('/ubc/micronet_ecom_logs_20251005.csv').then(data => {
  // Shape the data, group by Debtor
  const shaped_data = data.reduce((acc: any, d: any, i: number) => {
    acc[d.Debtor] = acc[d.Debtor] || {
      interactions: [],
      searches: [],
      orders: []
    }

    // http://localhost:7777/geoip?ip=61.29.116.50
    if(d.IP) {
      window.setTimeout(() => {
        if(!ip_addresses[d.IP]) {
        const promise = 
          d3.json(`http://localhost:7777/geoip?ip=${d.IP}`).then(geoip => {
            ip_addresses[d.IP] = {
              count: 1,
              geoip
            }
            console.log(geoip)
            drawIPAddresses(ip_addresses)
          })
          ip_lookups.push(promise)
        } else {
          ip_addresses[d.IP].count++
        }
      }, i * 10)
    }

    acc[d.Debtor].interactions.push(d)
    acc[d.Debtor].searches.push(d['Search String'])
    if(d['Order Value'] > 0) {
      acc[d.Debtor].orders.push(d)
    }
    return acc
  }, {})

  return shaped_data  
}).then(shaped_data => {
  console.log(shaped_data)

  d3.select('#description').text(`There are ${Object.keys(shaped_data).length} different customers.`)

  const ip_addresses_list = d3.select('#description').append('div').append("ul")
 
  
  Promise.all(ip_lookups).then(() => {
    console.log(ip_addresses)
    Object.keys(ip_addresses).forEach(ip => {
      console.log(ip, ip_addresses[ip])
  
      ip_addresses_list.append('li').text(`${ip} (${ip_addresses[ip].count}) ${ip_addresses[ip].location.country.names.en}`)
    })
  })

  // Get search terms
  // d3.select('#description').text(`The search terms are: ${search_terms.join(', ')}`)
})


// #description area, write down how many different customers we have

function drawIPAddresses(ip_addresses) {
  const ip_addresses_list = d3.select('#ip_addresses table tbody')

  ip_addresses_list
      .selectAll('tr')
      .data(Object.keys(ip_addresses))
      .enter()
      .append('tr')
      .each((d, i, nodes) => {
        const row = d3.select(nodes[i])
        console.log(ip_addresses[d])
        row.append('td').text(d)
        row.append('td').text(ip_addresses[d].count)
        row.append('td').text(ip_addresses[d].geoip.country.names.en)
        row.append('td').text(ip_addresses[d].geoip.subdivisions[0].names.en)
        row.append('td').text(ip_addresses[d].geoip.city.names.en)
        row.append('td').text(`${ip_addresses[d].geoip.location.latitude}, ${ip_addresses[d].geoip.location.longitude}`)
      })
      // .selectAll('td')
      // .data(d => [d, ip_addresses[d].count, ip_addresses[d].location.country.names.en, ip_addresses[d].location.region.names.en, ip_addresses[d].location.city.names.en, ip_addresses[d].location.latitude, ip_addresses[d].location.longitude])
      // .enter()
      // .append('td')
      // .text(d => d)

  // ip_addresses_list.selectAll('li').remove()
  // Object.keys(ip_addresses).forEach(ip => {
  //   ip_addresses_list.append('li').text(`${ip} (${ip_addresses[ip].count}) ${ip_addresses[ip].location.country.names.en}`)
  // })
}



/**
 * Draw a table with the data
 */
function drawTable(data) {
  const chart = d3.select('#chart')
  chart.append('table')
    .selectAll('tr')
    .data(data)
    .enter()
    .append('tr')
    .selectAll('td')
    .data(d => Object.values(d))
    .enter()
    .append('td')
    .text(d => d)
}

