// https://observablehq.com/@michael-keith/draggable-globe-in-d3@203
function _1(md){return(
md`# Draggable globe in D3`
)}

function _2(html){return(
html`<div id="map" style="width: 100%;"></div>`
)}

function _world_json(FileAttachment){return(
FileAttachment("world.json")
)}

async function _4(d3,world_json)
{
  let width = d3.select("#map").node().getBoundingClientRect().width
  let height = 500
  const sensitivity = 75

  let projection = d3.geoOrthographic()
    .scale(250)
    .center([0, 0])
    .rotate([0,-30])
    .translate([width / 2, height / 2])


  const initialScale = projection.scale()
  let path = d3.geoPath().projection(projection)

  let svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  let globe = svg.append("circle")
    .attr("fill", "#EEE")
    .attr("stroke", "#000")
    .attr("stroke-width", "0.2")
    .attr("cx", width/2)
    .attr("cy", height/2)
    .attr("r", initialScale)

  svg.call(d3.drag().on('drag', () => {
    const rotate = projection.rotate()
    const k = sensitivity / projection.scale()
    projection.rotate([
      rotate[0] + d3.event.dx * k,
      rotate[1] - d3.event.dy * k
    ])
    path = d3.geoPath().projection(projection)
    svg.selectAll("path").attr("d", path)
  }))
    .call(d3.zoom().on('zoom', () => {
      if(d3.event.transform.k > 0.3) {
        projection.scale(initialScale * d3.event.transform.k)
        path = d3.geoPath().projection(projection)
        svg.selectAll("path").attr("d", path)
        globe.attr("r", projection.scale())
      }
      else {
        d3.event.transform.k = 0.3
      }
    }))

  let map = svg.append("g")

  let data = await world_json.json()

  map.append("g")
    .attr("class", "countries" )
    .selectAll("path")
    .data(data.features)
    .enter().append("path")
    .attr("class", d => "country_" + d.properties.name.replace(" ","_"))
    .attr("d", path)
    .attr("fill", "white")
    .style('stroke', 'black')
    .style('stroke-width', 0.3)
    .style("opacity",0.8)

  //Optional rotate
  d3.timer(function(elapsed) {
    const rotate = projection.rotate()
    const k = sensitivity / projection.scale()
    projection.rotate([
      rotate[0] - 1 * k,
      rotate[1]
    ])
    path = d3.geoPath().projection(projection)
    svg.selectAll("path").attr("d", path)
  },200)

}


function _d3(require){return(
require("https://d3js.org/d3.v4.min.js")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["world.json", {url: new URL("./files/cbb0b433d100be8f4c48e19de6f0702d83c76df3def6897d7a4ccdb48d2f5f039bc3ae1141dd1005c253ca13c506f5824ae294f4549e5af914d0e3cb467bd8b0.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["html"], _2);
  main.variable(observer("world_json")).define("world_json", ["FileAttachment"], _world_json);
  main.variable(observer()).define(["d3","world_json"], _4);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
