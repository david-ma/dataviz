// @ts-nocheck

console.log('Hello World')

const height = 600,
  width = 960

const screens = d3.select('#screens')

// Screen 1
const svg = screens.append('svg').attrs({
  viewBox: `0 0 ${width} ${height}`,
})

svg.append('rect').attrs({
  x: 0,
  y: 0,
  height: height,
  width: width,
  fill: '#8357a4',
})

const offset = 100

const banner = svg.append('rect').attrs({
  x: offset,
  y: 50,
  height: 100,
  width: width - offset * 2,
  fill: 'white',
})

svg
  .append('text')
  .text('HELLO WORLD')
  .attrs({
    x: width / 2,
    y: 120,
    fill: '#8357a4',
    'font-size': '48px',
    'text-anchor': 'middle',
  })

svg.style('display', 'none')

const screen2 = screens.append('svg').attrs({
  viewBox: `0 0 ${width} ${height}`,
})

screen2.append('rect').attrs({
  x: 0,
  y: 0,
  height: height,
  width: width,
  fill: '#b91321',
})

screen2.append('rect').attrs({
  x: width / 3, // third
  y: height / 4,
  height: height / 3,
  width: width / 3,
  stroke: 'white',
  fill: 'none',
  'stroke-width': 0.5,
})

var lines = []
for (var i = 0; i < 10; i++) {
  var top = height / 4
  var bottom = 2 * height / 4

  lines.push({
    x1: width / 3,
    x2: width / 3,
    y1: top,
    y2: bottom,
  })
}

lines.forEach((line) => {
  screen2
    .append('line')
    .attrs({
      x1: line.x1,
      y1: line.y1,
      x2: line.x2,
      y2: line.y2,
      stroke: 'white',
      'stroke-width': 0.5,
    })
})



// 4x4 block of text
var text = []
for (var i = 0; i < 4; i++) {
  text.push([
    '0' + Math.floor(Math.random() * 1000000000),
    '0' + Math.floor(Math.random() * 1000000000),
    '0' + Math.floor(Math.random() * 1000000000),
    '0' + Math.floor(Math.random() * 1000000000),
  ])
}

var textY = (height / 10) * 7
text.forEach((row, i) => {
  console.log("Row", row)
  row.forEach((number, j) => {
    screen2
    .append('text')
    .text(number)
    .attrs({
      x: width / 3 + j * 100,
      y: textY + i * 15,
      fill: 'white',
      'font-size': '10px',
      'text-anchor': 'start',
      // Lucida Console???
      'font-family': 'Lucida Grande, monospace',
      // 'font-family': 'monospace',
    })
  })
})

globalThis.aniamteButton = function () {
  console.log('animate button clicked')
  banner
    .attrs({
      x: width / 2,
      width: 0,
    })
    .transition()
    .duration(1500)
    .attrs({
      x: offset,
      width: width - offset * 2,
    })
}
