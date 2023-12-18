
import { Chart, decorateTable } from 'chart'
// import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'

console.log('Running example.ts')
console.log("Hello World")

// Let's add a custom extension to Showdown to handle MediaWiki markup.
// Square brackets should become links [[ ]]
showdown.extension('wiki', function(){
  return [{
    type: 'output',
    regex: /\[\[([^\]]+)\]\]/g,
    replace: '<a href="https://en.wikipedia.org/wiki/$1" target="_blank">$1</a>'
    // regex: /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g,
    // replace: '<a href="$1" target="_blank">$2</a>'
  }];
})

var md = new showdown.Converter({openLinksInNewWindow: true,
extensions: ['wiki']});

d3.json("/ship_of_theseus_revisions_2.json")
  .then(function (data) {
    console.log("data", data)
    const first = data[0]
    d3.select("#exampleDiv").html(md.makeHtml(first.content))
  })


// $.when($.ready).then(function () {
//   const chart = new Chart({ // eslint-disable-line
//     element: 'exampleDiv',
//     margin: 20,
//     width: 800,
//     height: 600,
//     nav: false
//   }).scratchpad((chart :Chart) => {
//     // chart.svg

//   })
// })



