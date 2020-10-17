import {Chart, decorateTable, d3} from 'chart';
import $ from 'jquery';
import 'datatables.net';


var margin = ({top: 20, right: 20, bottom: 30, left: 40})
var height = 600,
    width = 900;
var x, y;
var bins = [];
var buckets = [];

var dateOpts = { year: 'numeric', month: 'long', day: 'numeric' };

type friend = {
    "name": string;
    "timestamp": number;
}

var test = null;

    $.ajax( {
        dataType: 'json',
        contentType: "application/json",
        url: '/friends.json',
        error: function(e) {
            console.log("Error", e);
        },
        success: function(rawData :{
            "test": {},
            "friends": friend[]
        }) {

            test = rawData.test;

            var data :friend[] = rawData.friends.map(d => {return {timestamp: d.timestamp * 1000, name: decodeFBEmoji(d.name)}});
            console.log("data", data);

            var firstDate = data[0].timestamp,
                lastDate = data[data.length -1].timestamp;

            y = d3.scaleLinear()
                .domain([0, d3.max(bins, d => d.length)]).nice()
                .range([height - margin.bottom, margin.top])

            x = d3.scaleLinear()
                .domain(d3.extent(data, d => d.timestamp)).nice()
                .range([margin.left, width - margin.right])

            bins = d3.histogram()
                .domain(x.domain())
                .thresholds(x.ticks(40))(data.map(d => d.timestamp));

            console.log("bins", bins);

            data.forEach(dot => {
                bins.forEach((bin, i) => {
                    if(dot.timestamp > bin.x0 && dot.timestamp < bin.x1 ) {
                        buckets[i] = buckets[i] || [];
                        buckets[i].push(dot);
                    }
                })
            })

            console.log("buckets", buckets);

            var header = d3.select("#friends table thead").append("tr");
            header.append("th");
            header.append("th").text("Date");
            header.append("th").text("Friends");
            header.append("th").text("Count");
            header.append("th").text("Notes");


            d3.select("#friends table tbody")
                .selectAll("tr")
                .data(buckets)
                .enter()
                .append("tr").attr("id", (d,i) => `tr-${i}`)
                .each((d, i) => {
                    if(d) {

                        var tr = d3.select(`#tr-${i}`);
                        tr.append("td").text(i);
                        tr.append("td").classed("dates", true).text(new Date(bins[i].x0).toLocaleDateString("en-GB", dateOpts));

                        tr.append("td").text(d.map(dot => dot.name).reverse().join(", "))
                        tr.append("td").text(d.length);
                        
                        tr.append("td").append("textarea");
                    }
                })
        }
    });


// From https://dev.to/raicuparta/ditching-worthless-friends-with-facebook-data-and-javascript-3f2i
function decodeFBEmoji (fbString :string, verbose ?: boolean) :string {
  // Convert String to Array of hex codes
  const codeArray = (
    fbString  // starts as '\u00f0\u009f\u0098\u00a2'
    .split('')
    .map(char =>
      char.charCodeAt(0)  // convert '\u00f0' to 0xf0
    )
  );  // result is [0xf0, 0x9f, 0x98, 0xa2]


  // Convert plain JavaScript array to Uint8Array
  const byteArray = Uint8Array.from(codeArray);


  if(verbose) {
    console.log('fbString', fbString);
    console.log('hex', codeArray.map(char => `\\u00${char.toString(16)}`).join(''));
    console.log('codeArray', codeArray);  
    console.log('byteArray', byteArray);
  }

  // Decode byte array as a UTF-8 string
  return new TextDecoder('utf-8').decode(byteArray);  // '😢'
}
