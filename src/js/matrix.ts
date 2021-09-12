import { Chart, _, d3 } from 'chart'

const green = '#00c200',
  brightgreen = '#5ff967'

const charset =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()'.split(
    ''
  )

function randomChar() {
  return charset[Math.floor(Math.random() * charset.length)]
}

type Board = d3.Selection<SVGSVGElement, any, HTMLElement, any>
class Column {
  board: Board
  lines: number
  col: number
  curLine: number

  constructor(opts: { col: number; lines: number; board: Board }) {
    this.col = opts.col
    this.lines = opts.lines
    this.board = opts.board
    this.curLine = 0
    this.step()
  }

  step() {
    const letter = randomChar()
    this.drawChar(this.curLine, this.col, letter)
    this.curLine++
  }

  drawChar(line, col, char) {
    this.board
      .append('text')
      .text(char)
      .attrs({
        x: 2 + col * 6,
        y: 10 * (line + 1),
        fill: green,
      })
  }
}
class Matrix {
  columns: Array<number>

  constructor(opts: { board: Board; lines: number; cols: number }) {
    // this.columns = [cols]

    var testCol = new Column({
      col: 5,
      lines: opts.lines,
      board: opts.board,
    })

    setInterval(function () {
      testCol.step()
    }, 40)
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

  var board: Board = chart.svg.append('g')

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
