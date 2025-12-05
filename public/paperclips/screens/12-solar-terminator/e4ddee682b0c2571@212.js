// https://observablehq.com/@d3/solar-terminator@212
function _1(md){return(
md`# Solar Terminator

It is currently night in the blue region.`
)}

function _map(DOM,width,height,d3,projection,graticule,land,night,sphere)
{
  const context = DOM.context2d(width, height);
  const path = d3.geoPath(projection, context);
  context.beginPath(), path(graticule), context.strokeStyle = "#ccc", context.stroke();
  context.beginPath(), path(land), context.fillStyle = "#000", context.fill();
  context.beginPath(), path(night), context.fillStyle = "rgba(0,0,255,0.3)", context.fill();
  context.beginPath(), path(sphere), context.strokeStyle = "#000", context.stroke();
  return context.canvas;
}


function _height(d3,projection,width,sphere)
{
  const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, sphere)).bounds(sphere);
  const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
  projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
  return dy;
}


function _projection(d3){return(
d3.geoNaturalEarth1()
)}

function _sun(solar)
{
  const now = new Date;
  const day = new Date(+now).setUTCHours(0, 0, 0, 0);
  const t = solar.century(now);
  const longitude = (day - now) / 864e5 * 360 - 180;
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
}


function _night(d3,antipode,sun){return(
d3.geoCircle()
    .radius(90)
    .center(antipode(sun))
  ()
)}

function _antipode(){return(
([longitude, latitude]) => [longitude + 180, -latitude]
)}

function _sphere(){return(
{type: "Sphere"}
)}

function _graticule(d3){return(
d3.geoGraticule10()
)}

function _land(topojson,world){return(
topojson.feature(world, world.objects.land)
)}

function _world(){return(
fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json").then(response => response.json())
)}

function _topojson(require){return(
require("topojson-client@3")
)}

function _d3(require){return(
require("d3-geo@1")
)}

function _solar(require){return(
require("solar-calculator@0.3/dist/solar-calculator.min.js")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("map")).define("map", ["DOM","width","height","d3","projection","graticule","land","night","sphere"], _map);
  main.variable(observer("height")).define("height", ["d3","projection","width","sphere"], _height);
  main.variable(observer("projection")).define("projection", ["d3"], _projection);
  main.variable(observer("sun")).define("sun", ["solar"], _sun);
  main.variable(observer("night")).define("night", ["d3","antipode","sun"], _night);
  main.variable(observer("antipode")).define("antipode", _antipode);
  main.variable(observer("sphere")).define("sphere", _sphere);
  main.variable(observer("graticule")).define("graticule", ["d3"], _graticule);
  main.variable(observer("land")).define("land", ["topojson","world"], _land);
  main.variable(observer("world")).define("world", _world);
  main.variable(observer("topojson")).define("topojson", ["require"], _topojson);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("solar")).define("solar", ["require"], _solar);
  return main;
}
