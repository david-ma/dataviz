
import { Chart, decorateTable } from './chart'
import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'

const currentYear = new Date().getFullYear()

globalThis.celebrity = celebrity
function celebrity (birth, death) {
  $('#birthyear').val(birth)
  $('#deathyear').val(death)
  drawPieChart()
}

let AmericanWars = null

type war = {
    name : string;
    start : string | number;
    end : string | number;
    length : number;
}

console.log('Calling csv stuff')
d3.csv('/blogposts/AmericanWars.csv', <any> function (d :war) {
  d.start = parseInt(d.start as string)
  d.end = parseInt(d.end as string) || ''
  d.length = (d.end as any || currentYear) - d.start

  return d
}).then(function (data) {
  console.log(data)
  AmericanWars = data
  //    AmericanWars.columns.push("length");
  console.log('Start async stuff')
  decorateTable(AmericanWars, {
    element: '#AmericanWars table',
    order: [1, 'asc'],
    titles: ['War', 'Start', 'End']
  })

  drawPieChart()
  //        log("Finish async stuff");
})

$('#birthyear').on('keyup', function (e) {
  if (e.keyCode === 13) {
    drawPieChart()
  }
})

function drawPieChart () {
  //        if(warChart) warChart.remove();
  d3.select('#war_chart svg').remove()

  const birth = parseInt($('#birthyear').val() as string) || 1905

  const death = parseInt($('#deathyear').val() as string) || currentYear

  if (birth > currentYear) {
    alert("You haven't been born yet.")
  } else if (death < birth) {
    alert('You died before you were born???')
  }

  let peaceStart = birth // assuming that you were born during peacetime.
  let longestWar = 0

  const data = {}
  const totals :{
        peace : number;
        war : number;
    } = {
      peace: 0,
      war: 0
    }
  let totalYears = 0

  // Get a list of peacetime & wars for the person's life.
  AmericanWars.forEach(function (war, i) {
    if (!war.end) war.end = currentYear

    // If you were born during peacetime.. and your birth is after the war starts.
    // then add a peacetime & war to the stack.
    if (war.end > birth) {
      // Personal experience of the war. Person may be born after the war starts, or die before it ends.
      const thisWar = JSON.parse(JSON.stringify(war)) // Very stupid way to clone an object.

      // Create a peacetime block
      const peacetime = {
        name: `peace-${i}`,
        start: peaceStart,
        end: thisWar.start,
        length: thisWar.start - peaceStart
      }

      // if you were born during the war... change the lengths of the peacetime & the war
      if (birth > war.start && birth < war.end) {
        peacetime.length = 0
        thisWar.length = war.end - birth
      }

      if (death < thisWar.end) {
        thisWar.end = death
        thisWar.length = thisWar.end - thisWar.start

        if (death < thisWar.start) {
          thisWar.length = 0
          peacetime.end = death
          peacetime.length = peacetime.end - peacetime.start
        }
      }

      // update other helper variables
      if (thisWar.length > longestWar) longestWar = thisWar.length
      peaceStart = thisWar.end

      totals.war += thisWar.length
      totalYears += thisWar.length

      // add the peacetime & war to the stack.
      if (peacetime.length > 0) {
        data[2 * i] = peacetime
        totals.peace += peacetime.length
        totalYears += peacetime.length
      }
      if (thisWar.length > 0) {
        data[(2 * i) + 1] = thisWar
      }
    }
  })

  console.log('stack', data)

  console.log('Data is', data)

  new Chart({
    element: 'war_chart',
    data: data,
    nav: false
    //            title: "Number of years USA was at war, during your lifetime"
  }).scratchpad(function (c) {
    const svg = c.plot.append('g').attr('transform', 'translate(370,250)')
    const height = c.innerHeight

    const radius = height / 2.5

    // Compute the position of each group on the pie:
    const pie = d3.pie()
      .sort(null) // Do not sort group by size
      .value(function (d :any) { return d.value.length })
    const dataReady = pie((<any>d3).entries(data).reverse())
    console.log(dataReady)

    // The arc generator
    const arc = d3.arc()
      .innerRadius(radius * 0.7) // This is the size of the donut hole
      .outerRadius(radius * 0.8)

    // Another arc that won't be drawn. Just for labels positioning
    const outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll('allSlices')
      .data(dataReady)
      .enter()
      .append('path')
    //                .style("display", (d) => d.index % 2 == 0 ? "none" : '')
      .attr('d', arc)
      .attr('fill', 'red')
      .attr('fill', 'black')
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', (d) => data[d.data.key].name.indexOf('peace') === 0 ? 0.1 : (d.value / longestWar) * 0.5 + 0.3)

    // Add the polylines between chart and labels:
    svg
      .selectAll('allPolylines')
      .data(dataReady)
      .enter()
      .append('polyline')
      .style('display', (d) => data[d.data.key].name.indexOf('peace') === 0 ? 'none' : '')
      .attr('stroke', 'black')
      .style('fill', 'none')
      .attr('stroke-width', 1)
      .attr('points', function (d) {
        const posA = arc.centroid(d) // line insertion in the slice
        const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
        const posC = outerArc.centroid(d) // Label position = almost the same as posB
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1) // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC]
      })

    // Add the polylines between chart and labels:
    svg
      .selectAll('allLabels')
      .data(dataReady)
      .enter()
      .append('text')
      .style('display', (d) => data[d.data.key].name.indexOf('peace') === 0 ? 'none' : '')
      .text((d) => data[d.data.key].name)
      .attr('transform', function (d) {
        const pos = outerArc.centroid(d)
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1)
        return 'translate(' + pos + ')'
      })
      .style('text-anchor', function (d) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
      })

    const myPie = pie.value((d:any) => d.value)
    const innerData = myPie((<any>d3).entries(totals as object).reverse())

    // The arc generator
    //            var arc = d3.arc()
    arc.innerRadius(radius * 0)
      .outerRadius(radius * 0.65)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll('innerSlices')
      .data(innerData)
      .enter()
      .append('path')
    //                .style("display", (d) => d.index % 2 == 0 ? "none" : '')
      .attr('d', arc)
      .attr('fill', 'maroon')
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', (d) => d.index % 2 === 1 ? 0.1 : (d.value / longestWar) * 0.5 + 0.3)

    console.log('drawing legend...')

    const legend = c.plot.append('g').attr('transform', 'translate(220,0)')
    legend.selectAll('.legendLabel')
      .data(innerData)
      .enter()
      .append('g')
      .classed('legendLabel', true)
      .append('rect')
      .attr('x', 50)
      .attr('y', (d, i) => 20 + (30 * i))
      .attr('height', 20)
      .attr('width', 20)
      .attr('fill', 'maroon')
      .style('opacity', (d) => d.index % 2 === 1 ? 0.1 : (d.value / longestWar) * 0.5 + 0.3)

    d3.selectAll('.legendLabel')
      .append('text')
      .attr('x', 75)
      .attr('y', (d, i) => 35 + (30 * i))
      .text((d :any) => `${d.value} years of ${d.index % 2 === 1 ? 'peace' : 'war'}: ${d3.format('.0%')(d.value / totalYears)}`)
  })
}
