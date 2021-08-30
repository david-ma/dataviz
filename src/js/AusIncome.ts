import { Chart, decorateTable, $, d3 } from 'chart'
import 'datatables.net'
import _ from 'lodash';

console.log("Australian Income stuff");


var total = {};

d3.csv('/blogposts/AusIncome.csv', function(d:d3.DSVRowString<string>) {
  var blob = {
    percentile: parseInt(d.Percentile),
    sex: d.Sex,
    count: parseInt(d['Number of individuals ']),
    income: d['Ranged Taxable Income'].replace(/[$,]/g, '').match(/\d+/g).map(d => parseInt(d))
  }

  if(total[blob.percentile]) {
    total[blob.percentile].count += blob.count;
  } else {
    total[blob.percentile] = {
      percentile: parseInt(d.Percentile),
      sex: "Total",
      count: parseInt(d['Number of individuals ']),
      income: d['Ranged Taxable Income'].replace(/[$,]/g, '').match(/\d+/g).map(d => parseInt(d))
    };
  }

  return blob
}).then((data) => {

  data = _.union(data, _.flatMap(total)) as any;

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
    y.domain([0,
        Math.round((1.1 * d3.max(data, function (d) { return d.count })) / 10000) * 10000
      ])

    var types = [{
      label: "Male",
      color: "Blue"
    },{
      label: "Female",
      color: "Red"
    },{
      label: "Total",
      color: "black"
    }]

    types.forEach(type => {
      chart.plot.append('path')
      .data([chart.data.filter(d => d.sex === type.label)])
      .attr('class', 'line')
      .style('stroke', type.color)
      .attr('d', valueline.x(function (d:any) { return x(d.percentile) }))

    chart.plot.append('text')
      .data(chart.data.filter(d => d.sex === type.label).filter(d => d.percentile === 100))
      .text(type.label)
      .style('color', type.color)
      .attrs((d) => {
        return {
          x: chart.innerWidth + 10,
          y: y(d.count) + 5,
        };
      })
    })

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
