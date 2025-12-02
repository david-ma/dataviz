import { Chart, d3 } from './chart'

// UK center coordinates
const ukLat = 54.5
const ukLong = -2.0

new Chart({
  element: 'map',
  width: 800,
  height: 1000,
  margin: 0,
  nav: false,
}).scratchpad((chart) => {
  const w = chart.width
  const h = chart.height

  // Define map projection for UK
  const projection = d3
    .geoMercator()
    .center([ukLong, ukLat])
    .translate([w / 2, h / 2])
    .scale(2200)

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

  Promise.all([
    d3.json('/dataviz/uk.geojson')
      .catch(() => {
        // Fallback: return a simple bounding box if GeoJSON fails to load
        console.warn('UK GeoJSON not found. Please download UK GeoJSON from https://geojson-maps.ash.ms/ and save as /dataviz/uk.geojson')
        return {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { NAME: 'United Kingdom' },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-8.0, 49.5], [2.0, 49.5], [2.0, 61.0], [-8.0, 61.0], [-8.0, 49.5]
              ]]
            }
          }]
        }
      }),
    d3.csv('/dataviz/statues.csv'),
  ]).then(([ukGeoJson, statues]: [any, any]) => {
    // Draw UK map
    drawMap(ukGeoJson)
    
    // Draw statue markers
    drawStatues(statues)
  })

  function drawMap(json: any) {
    // Bind data and create one path per GeoJSON feature
    svg
      .append('g')
      .attr('id', 'shapes')
      .selectAll('path')
      .data(json.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', 'dimgray')
      .style('stroke-width', 1)
      .attr('fill', '#f0f0f0')
  }

  function drawStatues(statues: any[]) {
    // Filter to only statues with valid coordinates
    const validStatues = statues.filter((s: any) => s.lat && s.long && s.lat !== '' && s.long !== '')
    
    // Color scale for statue types
    const typeColor: { [key: string]: string } = {
      woman: '#e74c3c',
      goat: '#3498db',
    }

    // Draw markers
    const markers = svg
      .append('g')
      .attr('id', 'statues')
      .selectAll('circle')
      .data(validStatues)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => projection([parseFloat(d.long), parseFloat(d.lat)])?.[0] || 0)
      .attr('cy', (d: any) => projection([parseFloat(d.long), parseFloat(d.lat)])?.[1] || 0)
      .attr('r', 6)
      .attr('fill', (d: any) => typeColor[d.type] || '#95a5a6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.8)
      .on('mouseover', function(event: MouseEvent, d: any) {
        d3.select(this)
          .attr('r', 10)
          .attr('opacity', 1)
        
        // Show tooltip
        const tooltip = svg
          .append('g')
          .attr('id', 'tooltip')
          .attr('transform', `translate(${event.offsetX + 10},${event.offsetY - 10})`)
        
        tooltip
          .append('rect')
          .attr('width', 200)
          .attr('height', 60)
          .attr('fill', 'rgba(0, 0, 0, 0.8)')
          .attr('rx', 4)
        
        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 20)
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(d.name)
        
        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 35)
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .text(d.type === 'woman' ? 'Woman' : 'Goat')
        
        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 50)
          .attr('fill', '#ccc')
          .attr('font-size', '9px')
          .text(d.location)
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 6)
          .attr('opacity', 0.8)
        
        svg.select('#tooltip').remove()
      })

    // Add legend
    const legend = svg
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${w - 150}, 20)`)
    
    legend
      .append('rect')
      .attr('width', 130)
      .attr('height', 70)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#ccc')
      .attr('rx', 4)
    
    legend
      .append('text')
      .attr('x', 65)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text('Legend')
    
    // Woman marker
    legend
      .append('circle')
      .attr('cx', 20)
      .attr('cy', 35)
      .attr('r', 6)
      .attr('fill', typeColor.woman)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
    
    legend
      .append('text')
      .attr('x', 35)
      .attr('y', 39)
      .attr('font-size', '11px')
      .text('Woman')
    
    // Goat marker
    legend
      .append('circle')
      .attr('cx', 20)
      .attr('cy', 55)
      .attr('r', 6)
      .attr('fill', typeColor.goat)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
    
    legend
      .append('text')
      .attr('x', 35)
      .attr('y', 59)
      .attr('font-size', '11px')
      .text('Goat')

    // Add statistics
    const stats = svg
      .append('g')
      .attr('id', 'stats')
      .attr('transform', `translate(20, ${h - 80})`)
    
    const womanCount = validStatues.filter((s: any) => s.type === 'woman').length
    const goatCount = validStatues.filter((s: any) => s.type === 'goat').length
    
    stats
      .append('rect')
      .attr('width', 250)
      .attr('height', 60)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#ccc')
      .attr('rx', 4)
    
    stats
      .append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text('Statistics')
    
    stats
      .append('text')
      .attr('x', 10)
      .attr('y', 38)
      .attr('font-size', '11px')
      .text(`Women: ${womanCount}`)
    
    stats
      .append('text')
      .attr('x', 10)
      .attr('y', 53)
      .attr('font-size', '11px')
      .text(`Goats: ${goatCount}`)
  }
})
