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


function decorateTable(dataset) {
    $("#dataset table").DataTable({
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
    });
}


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
