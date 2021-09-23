import { Chart, _, d3 } from 'chart'

console.log('hello world')
// drawMap(-33, 151, 'lol')

new Chart({
  element: 'map',
  margin: 0,
  nav: false,
}).scratchpad((chart) => {
  var lat = -37,
    long = 143,
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

  // Load in GeoJSON data
  d3.json('/aust.json').then((json: any) => {

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
  })
})
