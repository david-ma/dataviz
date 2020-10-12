const typestuff = "world";

import * as d3 from 'd3';
import {selection, select} from "d3-selection";
import "d3-selection-multi";
import 'd3-transition';
// import $ from 'jquery';

// Um... a stupid hack? This should be done better.
d3[<any>"select"] = select;



var val = $("body").val();
console.log(val);

console.log("hellooo");

// selection.
// d3select

d3.select("body").styles({
    background: 'red'
});


// exports.d3 = d3 ;
// export * from 'd3';
export { d3 }