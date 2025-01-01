console.log('hi world')

// https://docs.google.com/spreadsheets/d/e/2PACX-1vRr4KxsY4rarb-n5JNpXLuSpSf_QEDfaIRDzy2A2P34JBusGtLNky00aPiTHYYEztWUCSUvo9j9qDT9/pub?output=tsv
// Open this TSV

d3.tsv(
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRr4KxsY4rarb-n5JNpXLuSpSf_QEDfaIRDzy2A2P34JBusGtLNky00aPiTHYYEztWUCSUvo9j9qDT9/pub?output=tsv'
).then(function (data) {
  d3.select('#tuesday')
    .selectAll('div')
    .data(data)
    .enter()
    .append('div')
    .text(function (d) {
      return d.Activity
    })
})

// Draw a timeline from 8:45am to 10pm
// Draw a box for each activity
var box = d3.select("#tuesday")
var tues = box.append("svg").attr("width", 600).attr("height", 1000)
tues.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 600)
  .attr("height", 1000)
  .attr("fill", "grey")
  .attr("stroke", "black")
  .attr("stroke-width", 2)

