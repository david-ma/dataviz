import { Chart, _, d3 } from 'chart'

console.log("hello world")
drawMap(-33, 151, 'lol')


/**
 * Draws a 200x200 map of Australia, centered around the lat & long
 * Drops a marker at around 100x100 and writes a label underneath it
 * Modified from https://bl.ocks.org/GerardoFurtado/02aa65e5522104cb692e
 * @param lat Latitude
 * @param long Longitude
 * @param place Name of place
 */
 function drawMap (lat, long, place) {
  console.log('Drawing map', {
    lat: lat,
    long: long,
    place: place
  })

  // Width and height
  const w = 200
  const h = 200

  // Define map projection
  const projection = d3.geoMercator()
    .center([Math.floor(long), Math.floor(lat)])
    .translate([w / 2, h / 2])
    .scale(1000)

  // Define path generator
  const path = d3.geoPath()
    .projection(projection)

  const color = d3.scaleOrdinal()
    .range(['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'])

  // Create SVG
  const svg = d3.select('#map')
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('width', w)
    .attr('height', h)

  // Load in GeoJSON data
  d3.json('/aust.json').then((json :any) => {

    // Bind data and create one path per GeoJSON feature
    svg.selectAll('path')
      .data(json.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', 'dimgray') // @ts-ignore @types/d3 is missing this overload.
      .attr('fill', function (d, i) { return color(i) })

    // States
    svg.selectAll('text')
      .data(json.features)
      .enter()
      .append('text')
      .attr('fill', 'darkslategray')
      .attr('transform', function (d :any) { return 'translate(' + path.centroid(d) + ')' })
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('opacity', 0.5)
      .text(function (d :any) {
        return d.properties.STATE_NAME
      })

    // Append the name
    svg.append('text')
      .attr('x', 100)
      .attr('y', 85)
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('font-family', 'FontAwesome')
      .attr('text-anchor', 'middle')
      .classed('fa fa-map-marker', true)
      .text('\uf041')

    svg.append('text')
      .attr('x', 100)
      .attr('y', 100)
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('font-family', 'Roboto')
      .attr('text-anchor', 'middle')
      .text(place)
  })
}

globalThis.drawMap = drawMap
