import { Chart, decorateTable, $, d3 } from 'chart'
import 'datatables.net'

console.log("Australian Income stuff");



d3.csv('/blogposts/AusIncome.csv', function(d:d3.DSVRowString<string>) {
  var blob = {
    percentile: parseInt(d.Percentile),
    sex: d.Sex,
    count: parseInt(d['Number of individuals ']),
    income: d['Ranged Taxable Income'].replace(/[$,]/g, '').match(/\d+/g).map(d => parseInt(d))
  }

  return blob
}).then((data) => {

  new Chart({
    element: 'income',
    title: "Australian Income line graph",
    xLabel: "Percentile",
    yLabel: "Count",
    data: data,
    nav: false,
  }).scratchpad((chart) => {
    console.log('Drawing double line chart', chart.data);

    // set the ranges
    const x = d3.scaleLinear().range([0, chart.innerWidth])
    const y = d3.scaleLinear().range([chart.innerHeight, 0])

    // define the line
    const valueline = d3.line()
    // .curve(d3.curveBasis)
      .x(function (d:any) { return x(d.percentile) })
      .y(function (d:any) { return y(d.count) })

    x.domain(d3.extent(data, function (d) { return d.percentile }))
    y.domain([0, d3.max(data, function (d) { return d.count })])


    // y.domain([0, d3.max(months, function (d:any) { return d.value })])
    chart.plot.append('path')
      .data([chart.data.filter(d => d.sex === "Male")])
      .attr('class', 'line')
      .style('stroke', 'blue')
      .attr('d', valueline.x(function (d:any) { return x(d.percentile) }))

    chart.plot.append('path')
      .data([chart.data.filter(d => d.sex === "Female")])
      .attr('class', 'line')
      .style('stroke', 'red')
      .attr('d', valueline.x(function (d:any) { return x(d.percentile) }))

    chart.plot.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + chart.innerHeight + ')')
      .call(d3.axisBottom(x))

      // Add the Y Axis
    chart.plot.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y))

  })

  return data;
}).then(data => {
  console.log("data", data)
})


// "Number of individuals ": "80274"
// Percentile: "95"
// Ranged Taxable Income: "$164,547 to $176,374"
// Sex: "Male"
