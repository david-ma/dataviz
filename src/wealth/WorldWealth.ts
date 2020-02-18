import * as _chart from '../js/chart';
import * as d3 from 'd3';

// let Chart = _chart.Chart;


console.log("hello?");


// const charts = [];
// let data = [];
// const seasons = {};
// let dataset = null;

// console.log("Calling csv stuff");
// d3.csv("/wealth/WorldWealth.csv", function(d, i, columns){
//     console.log(d);
//     if(!d.wealth_b) d.wealth_b = 0;
//     if(d.region) {
//         return d;
//     } else {
//         return null;
//     }

// }).then(function(data){
//     console.log(data);
//     dataset = data;
// //        dataset.columns.push("length");
//     console.log("Start async stuff");
//     decorateTable(dataset);
//     drawPieChart(dataset);
// //        log("Finish async stuff");
// });




// let warChart = null;

// function drawPieChart() {
// //        if(warChart) warChart.remove();
//     d3.select("#war_chart svg").remove();

//     const birth = parseInt($("#birthyear").val()) || 1905;
//     const current = 2020;
//     const age = current - birth;
// //        const death = 1950;
// //        const age = death - birth;
//     let peaceStart = birth;
//     let longestWar = 0;

//     var data = {};
//     var totals = {
//         peace: 0,
//         war: 0
//     };
//     var totalYears = 0;

//     dataset.forEach(function(war,i){
// //            if(death < (war.end || 2020)) {
// //            } else if(war.start - peaceStart > 0 || birth < (war.end || 2020)) {
//             if(war.start - peaceStart > 0 || birth < (war.end || 2020)) {
//             var peacetime = {
//                 name: `peace-${i}`,
//                 start: peaceStart,
//                 end: war.start,
//                 length: war.start - peaceStart
//             };



//             data[(2*i)+1] = war;

//             if (birth > war.start && birth < war.end) data[(2*i)+1].length = war.end - birth;

//             if(war.length > longestWar) longestWar = war.length;
//             peaceStart = war.end;

//             if (peacetime.length > 0) {
//                 data[2*i] = peacetime;
//                 totals.peace += peacetime.length;
//                 totalYears += peacetime.length;
//             }


//             totals.war += data[(2*i)+1].length;
//             totalYears += data[(2*i)+1].length;
//         }

//     });
// console.log("Data is", data);

//     warChart = new Chart({
//         element: "war_chart",
//         data: data,
//         nav: false
// //            title: "Number of years USA was at war, during your lifetime"
//     }).scratchpad(function(c){
//         const   svg = c.plot.append("g").attr("transform","translate(370,250)"),
//             width = c.innerWidth,
//             height = c.innerHeight;


//         var radius = height / 2.5;

// // Compute the position of each group on the pie:
//         var pie = d3.pie()
//             .sort(null) // Do not sort group by size
//             .value(function(d) {return d.value.length; })
//         var data_ready = pie(d3.entries(data).reverse())
// console.log(data_ready);

// // The arc generator
//         var arc = d3.arc()
//             .innerRadius(radius * 0.7)         // This is the size of the donut hole
//             .outerRadius(radius * 0.8)

// // Another arc that won't be drawn. Just for labels positioning
//         var outerArc = d3.arc()
//             .innerRadius(radius * 0.9)
//             .outerRadius(radius * 0.9)

// // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
//         svg
//             .selectAll('allSlices')
//             .data(data_ready)
//             .enter()
//             .append('path')
// //                .style("display", (d) => d.index % 2 == 0 ? "none" : '')
//             .attr('d', arc)
//             .attr('fill', 'red')
//             .attr('fill', 'black')
//             .attr("stroke", "white")
//             .style("stroke-width", "2px")
//             .style("opacity", (d) => d.index % 2 == 1 ? 0.1 : (d.value / longestWar) * 0.5 + 0.3)

// // Add the polylines between chart and labels:
//         svg
//             .selectAll('allPolylines')
//             .data(data_ready)
//             .enter()
//             .append('polyline')
//             .style("display", (d) => d.index % 2 == 1 ? "none" : '')
//             .attr("stroke", "black")
//             .style("fill", "none")
//             .attr("stroke-width", 1)
//             .attr('points', function(d) {
//                 var posA = arc.centroid(d) // line insertion in the slice
//                 var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
//                 var posC = outerArc.centroid(d); // Label position = almost the same as posB
//                 var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
//                 posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
//                 return [posA, posB, posC]
//             })

// // Add the polylines between chart and labels:
//         svg
//             .selectAll('allLabels')
//             .data(data_ready)
//             .enter()
//             .append('text')
//             .style("display", (d) => d.index % 2 == 1 ? "none" : '')
//             .text( (d) => data[d.data.key].name )
//             .attr('transform', function(d) {
//                 var pos = outerArc.centroid(d);
//                 var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
//                 pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
//                 return 'translate(' + pos + ')';
//             })
//             .style('text-anchor', function(d) {
//                 var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
//                 return (midangle < Math.PI ? 'start' : 'end')
//             })


//         var innerData = pie
//             .value((d) => d.value)
//             (d3.entries(totals).reverse());

// // The arc generator
// //            var arc = d3.arc()
//         arc.innerRadius(radius * 0)
//             .outerRadius(radius * 0.65);


// // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
//         svg
//             .selectAll('innerSlices')
//             .data(innerData)
//             .enter()
//             .append('path')
//             //                .style("display", (d) => d.index % 2 == 0 ? "none" : '')
//             .attr('d', arc)
//             .attr('fill', 'maroon')
//             .attr("stroke", "white")
//             .style("stroke-width", "2px")
//             .style("opacity", (d) => d.index % 2 == 1 ? 0.1 : (d.value / longestWar) * 0.5 + 0.3);


//         console.log("drawing legend...");

//         var legend = c.plot.append("g").attr("transform", "translate(220,0)");
//             legend.selectAll('.legendLabel')
//                 .data(innerData)
//                 .enter()
//                 .append("g")
//                 .classed("legendLabel", true)
//                 .append('rect')
//                 .attr('x', 50)
//                 .attr('y', (d,i) => 20+(30*i))
//                 .attr('height', 20)
//                 .attr('width', 20)
//                 .attr('fill', 'maroon')
//                 .style("opacity", (d) => d.index % 2 == 1 ? 0.1 : (d.value / longestWar) * 0.5 + 0.3);

//             d3.selectAll('.legendLabel')
//                 .append("text")
//                 .attr('x', 75)
//                 .attr('y', (d,i) => 35+(30*i))
//                 .text((d) => `${d.value} years of ${d.index % 2 == 1 ? 'peace' : 'war'}: ${d3.format(".0%")(d.value / totalYears)}`);

//     });
// }


// function decorateTable(dataset) {
//     console.log('dataset', dataset);
//     console.log("Start decorating table");
//     $("#dataset table").dataTable({
//         "bInfo" : false,
//         "bPaginate": false,
//         "bFilter": false,
//         data: dataset,
//         pageLength: 25,
//         order: [[1, 'asc']],
//         columns: dataset.columns.map(function(d){ return {
//             title: d,
//             data: d
//         };})
//     });

//     console.log("Finished decorating table");
// }


// const md = new showdown.Converter({
//     openLinksInNewWindow: true
// });

//     $("#explain").html(md.makeHtml(`
// # Number of years USA was at war, during your lifetime
// ## Originally on [The Washington Post](https://www.washingtonpost.com/politics/2020/01/08/nearly-quarter-americans-have-never-experienced-us-time-peace/) by [@pbump](https://twitter.com/pbump)

// I redrew Philip Bump's diagram from his article "Nearly a quarter of Americans have never experienced the U.S. in a time of peace" as an exercise to practice d3.js.

// Simply enter your birth year here & it will recalculate the diagram.`));


// $("#explain2").html(md.makeHtml(`Note that the "start" & "end" years reflect USA's involvement in the war, not the total length of each war.

// And yes, I know that you're supposed to improve the diagram for [#makeovermonday](https://www.makeovermonday.co.uk/), but I'm just doing this as a warmup exercise. Maybe next week I'll change the diagram more.

// Todo:
//  * Give the user a slider instead of text box?
//  * Better labels, e.g. Years each war started
//  * Hoverover for labels?
//  * Use better words
//  * Add more wars & death date option, perhaps add historic figures? E.g. "What % of Theodore Roosevelt's life was the US at war?"
//  `));
