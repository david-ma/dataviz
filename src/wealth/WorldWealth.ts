// import * as _chart from '../chart';
import * as d3 from 'd3';
import 'd3-selection-multi';

import $ from 'jquery';
import 'datatables.net';

// import * as _chart from '../js/chart';
console.log("Running WorldWealth.ts");

// console.log(_chart);
// let Chart = _chart.Chart;

const charts = [];
let data = [];
const seasons = {};
let dataset = null;

let Chart = require('/js/chart');

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
    decorateTable(dataset);

    drawChart(dataset);


});


   function drawChart(data) {
    //    const birth = 1905;
    //    const current = 2020;
    //    const age = current - birth;


console.log("Hey,,,,");
console.log(data);

    //    console.log(age);

       const war = new Chart({
           element: "chart",
           data: data,
           nav: false,
           title: "Years of life spent at war"
       }).scratchpad(function(c){
console.log('scratch..');

        const   svg = c.plot,
                   width = c.innerWidth,
                   height = c.innerHeight;


           svg.append("line").attrs({
               x1: width * .15,
               x2: width * .85,
               y1: height * .5,
               y2: height * .5
           }).styles({
               stroke: 'black',
               'stroke-width': '2px'
           });

           console.log('heyyy');

           var graphLength = width * .7,
               marginLeft = width * .15;

//            data.forEach(function(d){
//                console.log(d);
//                var startPercent = (d.start - birth) / age,
//                    x = marginLeft + (graphLength * startPercent),
//                    endPercent = d.length / age,
//                    width = graphLength * endPercent;
// console.log(endPercent);
// console.log(graphLength);
// console.log(width);
//                svg.append("rect")
//                    .datum(d)
//                    .attrs({
//                        x: x,
//                        y: height * .55,
//                        width: width,
//                        height: '20'
//                    });
//            });

       });

   }






