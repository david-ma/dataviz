function _1(md){return(
md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">GeoTIFF contours II</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# GeoTIFF contours II

These contours are computed in equirectangular coordinates and then reprojected.`
)}

function _chart(html,contours,values,svg,path,invert,color){return(
html`<svg style="width: 100%; height: auto; display: block;" viewBox="0 0 960 500">
  <g stroke="#000" stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round">
    ${Array.from(contours(values), d => svg`<path d="${path(invert(d))}" fill="${color(d.value)}" />`)}
  </g>
</svg>`
)}

function _projection(d3){return(
d3.geoNaturalEarth1().precision(0.1)
)}

function _path(d3,projection){return(
d3.geoPath(projection)
)}

function _contours(d3,n,m){return(
d3.contours().size([n, m])
)}

function _color(d3,values){return(
d3.scaleSequential(d3.extent(values), d3.interpolateMagma)
)}

function _image(tiff){return(
tiff.getImage()
)}

async function _values(rotate,image){return(
rotate((await image.readRasters())[0])
)}

function _n(image){return(
image.getWidth()
)}

function _m(image){return(
image.getHeight()
)}

function _11(tex,md){return(
md`The *rotate* function rotates a GeoTIFF’s longitude from ${tex`[0, 360]`} to ${tex`[-180, +180]`}.`
)}

function _rotate(n,m){return(
function rotate(values) {
  var l = n >> 1;
  for (var j = 0, k = 0; j < m; ++j, k += n) {
    values.subarray(k, k + l).reverse();
    values.subarray(k + l, k + n).reverse();
    values.subarray(k, k + n).reverse();
  }
  return values;
}
)}

function _13(md){return(
md`The *invert* function converts [*x*, *y*] in pixel coordinates to [*longitude*, *latitude*]. This assumes the source GeoTIFF is in equirectangular coordinates.

Inverting the projection breaks the polygon ring associations: holes are no longer inside their exterior rings. Fortunately, since the winding order of the rings is consistent and we’re now in spherical coordinates, we can just merge everything into a single polygon!`
)}

function _invert(d3,n,m){return(
function invert(d) {
  const shared = {};

  let p = {
    type: "Polygon",
    coordinates: d3.merge(d.coordinates.map(polygon => {
      return polygon.map(ring => {
        return ring.map(point => {
          return [point[0] / n * 360 - 180, 90 - point[1] / m * 180];
        }).reverse();
      });
    }))
  };

  // Record the y-intersections with the antimeridian.
  p.coordinates.forEach(ring => {
    ring.forEach(p => {
      if (p[0] === -180) shared[p[1]] |= 1;
      else if (p[0] === 180) shared[p[1]] |= 2;
    });
  });

  // Offset any unshared antimeridian points to prevent their stitching.
  p.coordinates.forEach(ring => {
    ring.forEach(p => {
      if ((p[0] === -180 || p[0] === 180) && shared[p[1]] !== 3) {
        p[0] = p[0] === -180 ? -179.9995 : 179.9995;
      }
    });
  });

  p = d3.geoStitch(p);

  // If the MultiPolygon is empty, treat it as the Sphere.
  return p.coordinates.length
      ? {type: "Polygon", coordinates: p.coordinates}
      : {type: "Sphere"};
}
)}

function _tiff(FileAttachment,GeoTIFF){return(
FileAttachment("sfctmp.tiff").arrayBuffer()
  .then(buffer => GeoTIFF.fromArrayBuffer(buffer))
)}

function _GeoTIFF(require){return(
require("geotiff@2.0.7")
)}

function _d3(require){return(
require("d3@7", "d3-geo-projection@4")
)}

function _18(md){return(
md`Or, using [Observable Plot](/plot/)’s concise API (see [complete example](https://observablehq.com/@observablehq/plot-geotiff-contours)):`
)}

function _19(Plot,values,n){return(
Plot.plot({
  projection: "equal-earth",
  color: { scheme: "Magma" },
  marks: [Plot.contour(values, {
    x: (_, i) => i % n / 2 - 180,
    y: (_, i) => 90 - Math.floor(i / n) / 2,
    fill: values,
    thresholds: 10,
    stroke: "#000",
    strokeWidth: 0.5,
    clip: "sphere"
  })]
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["sfctmp.tiff", {url: new URL("./files/6954c8d84aa4a9b4de4dfcc4cbe86556571ecdcbbac8f587cc98207c9a613b03ad260859f796a61b2facf50b50038f113c8cd5f55c4fbe1e2c1bc785e8ac3805.tif", import.meta.url), mimeType: "image/tiff", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["html","contours","values","svg","path","invert","color"], _chart);
  main.variable(observer("projection")).define("projection", ["d3"], _projection);
  main.variable(observer("path")).define("path", ["d3","projection"], _path);
  main.variable(observer("contours")).define("contours", ["d3","n","m"], _contours);
  main.variable(observer("color")).define("color", ["d3","values"], _color);
  main.variable(observer("image")).define("image", ["tiff"], _image);
  main.variable(observer("values")).define("values", ["rotate","image"], _values);
  main.variable(observer("n")).define("n", ["image"], _n);
  main.variable(observer("m")).define("m", ["image"], _m);
  main.variable(observer()).define(["tex","md"], _11);
  main.variable(observer("rotate")).define("rotate", ["n","m"], _rotate);
  main.variable(observer()).define(["md"], _13);
  main.variable(observer("invert")).define("invert", ["d3","n","m"], _invert);
  main.variable(observer("tiff")).define("tiff", ["FileAttachment","GeoTIFF"], _tiff);
  main.variable(observer("GeoTIFF")).define("GeoTIFF", ["require"], _GeoTIFF);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer()).define(["Plot","values","n"], _19);
  return main;
}
