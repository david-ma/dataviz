import { Chart, _, d3 } from 'chart'

const green = '#00c200',
  brightgreen = '#5ff967'

class Matrix {
  columns: Array<number>

  constructor(opts: {
    board: d3.Selection<SVGSVGElement, any, HTMLElement, any>
    lines: number
    cols: number
  }) {
    // this.columns = [cols]
  }

  addRandomDrop() {}

  animate() {}
}

new Chart({
  element: 'matrix',
  margin: 0,
  nav: false,
}).scratchpad((chart) => {
  // set background
  chart.svg.append('rect').attrs({
    x: 0,
    y: 0,
    height: chart.innerHeight,
    width: chart.innerWidth,
    fill: 'black',
  })

  var lines = Math.floor(chart.innerHeight / 10), // 60
    cols = Math.floor(chart.innerWidth / 6) // 160

  var board: d3.Selection<SVGSVGElement, any, HTMLElement, any> =
    chart.svg.append('g')

  var matrix = new Matrix({
    lines: lines,
    cols: cols,
    board: board,
  })

  function drawChar(line, col, char) {
    board
      .append('text')
      .text(char)
      .attrs({
        x: 2 + col * 6,
        y: 10 * (line + 1),
        fill: green,
      })
  }
})
