import { Chart, _, d3 } from 'chart'

const green = "#00c200",
    brightgreen = "#5ff967"

new Chart({
  element: 'matrix',
  margin: 0,
  nav: false,
}).scratchpad((chart) => {
  chart.svg.append('rect').attrs({
    x: 0,
    y: 0,
    height: chart.innerHeight,
    width: chart.innerWidth,
    fill: 'black',
  })

  chart.svg.append("text").text("Hello World").attrs({
    x: 2,
    y: 10,
    fill: green
  });



  var board = chart.svg.append("g");
  
  var word = "Hello World"

  word.split("").forEach((char, col) => {
    drawChar(1, col, char);
  })

  function drawChar(line, col, char) {
    board.append('text').text(char).attrs({
      x: 2 + (col * 6),
      y: 10 * (line + 1),
      fill: green
    })
  }

})
