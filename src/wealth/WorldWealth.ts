import * as _chart from '../js/chart';
import * as d3 from 'd3';

import $ from 'jquery';
import 'datatables.net';

console.log("Running WorldWealth.ts");

const charts = [];
let data = [];
const seasons = {};
let dataset = null;

console.log("Calling csv stuff");
d3.csv("/wealth/WorldWealth.csv", function(d:any, i, columns){
    console.log(d);
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


});




let warChart = null;


function decorateTable(dataset:{columns:[]}, newOptions?:{}) {
    var options:{} = {
        info: false,
        paging: false,
        search: false,
        searching: false,
        data: dataset,
        pageLength: 25,
        order: [[2, 'desc']],
        columns: dataset.columns.map(function(d){ return {
            title: d,
            data: d
        };})
    };
    if (newOptions) {
        Object.keys(newOptions).forEach(function(key) {
            options[key] = newOptions[key];
        });
    }
    $("#dataset table").DataTable(options);
}
