

console.log("Hello World");

const height = 600,
      width = 960

const svg = d3.select("#screen").append("svg")
  .attrs({
    viewBox: `0 0 ${width} ${height}`
  });

svg.append("rect")
  .attrs({
    x: 0,
    y: 0,
    height: height,
    width: width,
    fill: '#8357a4',
  });

const offset = 100

const banner = svg.append("rect")
  .attrs({
    x: offset,
    y: 50,
    height: 100,
    width: width - (offset * 2),
    fill: 'white'
  })

svg.append("text")
  .text("HELLO WORLD")
  .attrs({
    x: width / 2,
    y: 120,
    fill: '#8357a4',
    'font-size': '48px',
    'text-anchor': 'middle',
  })


globalThis.aniamteButton = function() {
  console.log("animate button clicked");
  banner.attrs({
    x: width / 2,
    width: 0,
  })
  .transition()
  .duration(1500)
  .attrs({
    x: offset,
    width: width - (offset * 2),
  })


}




