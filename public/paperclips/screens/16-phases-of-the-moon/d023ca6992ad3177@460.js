// https://observablehq.com/@mbostock/phases-of-the-moon@460
function _1(md,year){return(
md`# Phases of the Moon

For the year ${year}, in the style of [Irwin Glusker](https://www.moma.org/explore/inside_out/2012/10/16/a-paean-to-the-phases-of-the-moon/).`
)}

function _chart(html,width,height,months,svg,monthScale,locale,days,d3,suncalc,dayScale,projection,path,hemisphere){return(
html`<svg
    viewBox="0 0 ${width} ${height}"
    style="margin: 0 -14px; display: block; background: #111;">
  <g style="font: 10px sans-serif; text-transform: uppercase;">
    ${months.map(d => {
      return svg`<g transform="translate(20,${monthScale(d)})">
        <text fill="#fff" dy="0.32em">${d.toLocaleString(locale, {month: "long"})}</text>
      </g>`;
    })}
  </g>
  <g text-anchor="middle" style="font: 5px sans-serif;">
    ${days.map(d => {
      const noon = d3.timeHour.offset(d, 12);
      const illum = suncalc.getMoonIllumination(noon);
      const angle = 180 - illum.phase * 360;
      return svg`<g transform="translate(${dayScale(d)},${monthScale(d)})">
        <circle r="10" fill="#333"></circle>
        <text fill="#fff" y="-10" dy="-0.4em">${d.getDate()}</text>
        <path fill="#fff" d="${projection.rotate([angle, 0]), path(hemisphere)}">
        <title>${d.toLocaleDateString()}</title>
      </g>`;
    })}
  </g>
</svg>`
)}

function _year(html,URLSearchParams){return(
html`<input type=number placeholder=year style="width:120px;" value=${+new URLSearchParams(new URL(document.baseURI).search).get("year") || new Date().getFullYear()} min=1900 max=2100 step=1>`
)}

function _locale(md)
{
  const form = md`<form>
  <input name=input type=text placeholder="Enter a locale (optional)" style="width:120px;">
  <i style="font-size:smaller;">[language](https://en.wikipedia.org/wiki/ISO_639-1)-[country](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code</i>
</form>`;
  form.input.oninput = event => {
    if (form.input.value) {
      try { (new Date).toLocaleString(form.input.value); }
      catch (error) { return event.stopImmediatePropagation(); }
    }
    form.value = form.input.value || undefined;
    form.dispatchEvent(new CustomEvent("input"));
  };
  form.onsubmit = event => event.preventDefault();
  form.value = Promise.resolve();
  return form; 
}


function _5(md){return(
md`---

## Appendix`
)}

function _projection(d3){return(
d3.geoOrthographic()
    .translate([0, 0])
    .scale(10)
)}

function _path(d3,projection){return(
d3.geoPath(projection)
)}

function _hemisphere(d3){return(
d3.geoCircle()()
)}

function _dayScale(d3,margin,width)
{
  const scale = d3.scalePoint()
      .domain(d3.range(1, 40))
      .range([margin.left, width - margin.right])
      .padding(1);
  return d => {
    const start = d3.timeMonth(d);
    const offset = start.getDay() || 7;
    return scale(d.getDate() + offset);
  };
}


function _monthScale(d3,margin,height)
{
  const scale = d3.scalePoint()
      .domain(d3.range(12))
      .range([margin.top, height - margin.bottom])
      .padding(1);
  return d => scale(d.getMonth());
}


function _days(year,d3)
{
  const now = new Date(year, 0, 1);
  const start = d3.timeYear(now);
  return d3.timeDays(start, d3.timeYear.offset(start, 1));
}


function _months(year,d3)
{
  const now = new Date(year, 0, 1);
  const start = d3.timeYear(now);
  return d3.timeMonths(start, d3.timeYear.offset(start, 1));
}


function _width(){return(
975
)}

function _height(){return(
480
)}

function _margin(){return(
{top: 0, right: 0, bottom: 0, left: 60}
)}

function _suncalc(require){return(
require("suncalc@1")
)}

function _d3(require){return(
require("d3@6")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md","year"], _1);
  main.variable(observer("chart")).define("chart", ["html","width","height","months","svg","monthScale","locale","days","d3","suncalc","dayScale","projection","path","hemisphere"], _chart);
  main.variable(observer("viewof year")).define("viewof year", ["html","URLSearchParams"], _year);
  main.variable(observer("year")).define("year", ["Generators", "viewof year"], (G, _) => G.input(_));
  main.variable(observer("viewof locale")).define("viewof locale", ["md"], _locale);
  main.variable(observer("locale")).define("locale", ["Generators", "viewof locale"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], _5);
  main.variable(observer("projection")).define("projection", ["d3"], _projection);
  main.variable(observer("path")).define("path", ["d3","projection"], _path);
  main.variable(observer("hemisphere")).define("hemisphere", ["d3"], _hemisphere);
  main.variable(observer("dayScale")).define("dayScale", ["d3","margin","width"], _dayScale);
  main.variable(observer("monthScale")).define("monthScale", ["d3","margin","height"], _monthScale);
  main.variable(observer("days")).define("days", ["year","d3"], _days);
  main.variable(observer("months")).define("months", ["year","d3"], _months);
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("suncalc")).define("suncalc", ["require"], _suncalc);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
