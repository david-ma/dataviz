
console.log("Running WorldWealth.ts");


// import * as d3 from 'd3';
// import Chart from '../js/chart';
/*
import * as chartExports from '../js/chart';
var d3 = chartExports.d3,
    Chart = chartExports.Chart,
    decorateTable = chartExports.decorateTable;
*/

// import {d3, Chart, decorateTable} from '../js/chart';

const charts = [];
let data = [];
const seasons = {};
let dataset = null;

let regions = [];
let treemapData = {
    children: [],
    total: 0,
    name: "Wealth"
}

console.log("Calling csv stuff");
d3.csv("/wealth/WorldWealth.csv", function(d:any, i, columns){
    if(!d.wealth_b) d.wealth_b = 0;
    if(d.region) {
        return d;
    } else {
        return null;
    }

}).then(function(data){
    console.log(data);
    dataset = data;

    console.log("Start async stuff");

// Table options:
    var tableOptions = {
        element: "#dataset table"
    }
    decorateTable(dataset, tableOptions);



    drawTreemap(dataset);


});


function drawTreemap(data) {

    const war = new Chart({
        element: "chart",
        data: data,
        width: 1800,
        height: 900,
        nav: false,
        title: "World Wealth 2019, Billions of $"
    }).scratchpad(function(c){

        const   svg = c.plot,
                width = c.innerWidth,
                height = c.innerHeight;
console.log(treemapData);
        // Here the size of each leave is given in the 'value' field in input data
        var root = d3.hierarchy(treemapData)
            .sum( (d:any) => d.value );

        d3.treemap()
            .size([width, height])
            .paddingTop(28)
            .paddingRight(7)
            .paddingInner(3)      // Padding between each rectangle
            //.paddingOuter(6)
            //.padding(20)
            (root)

  // prepare a color scale
  var color = d3.scaleOrdinal()
    .domain(regions)
    .range(c.colours)
    // .range(['#d53e4f','#fc8d59','#fee08b','#ffffbf','#e6f598','#99d594','#3288bd'])

    console.log(Math.max(...treemapData.children.map(d => d.total)));
  // And a opacity scale
  var opacity = d3.scaleLinear()
    .domain([10, Math.max(...treemapData.children.map(d => d.total))])
    .range([.5,1])

  // use this information to add rectangles:
  svg
    .selectAll("rect.region")
    .data(root.leaves())
    .enter()
    .append("rect")
        .classed("region", true)
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function(d){ 
            console.log(d);
            // return 'red'
            return d.parent ? color(d.parent.data.name) : "rgba(0,0,0,0)";
        })
        .style("opacity", function(d:any){
            return d.parent ? opacity.domain([10, d.parent.total])(d.data.value) : 1;
        })

  // and to add the text labels
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
      .text(function(d){ return d.data.name.replace('mister_','') })
      .attr("font-size", "19px")
      .attr("fill", "white")

  // and to add the text labels
  svg
    .selectAll("vals")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+35})    // +20 to adjust position (lower)
      .text(function(d){ return d.data.value })
      .attr("font-size", "11px")
      .attr("fill", "black")

  // Add title for the 3 groups
  svg
    .selectAll("titles")
    .data(root.descendants().filter(function(d){return d.depth==1}))
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0})
      .attr("y", function(d){ return d.y0+21})
      .text(function(d){ return d.data.name })
      .attr("font-size", "19px")
      .attr("fill",  function(d){ return color(d.data.name)} )

        });

    }











