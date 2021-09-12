import { Chart, d3 } from 'chart'

const green = '#00c200',
  brightgreen = '#5ff967',
  speed = 40,
  haltChance = 0.025,
  eraseChance = 0.05,
  boldChance = 0.1

const charset =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()'.split(
    ''
  )

function randomChar() {
  return charset[Math.floor(Math.random() * charset.length)]
}

type Board = d3.Selection<SVGSVGElement, any, HTMLElement, any>

class Char {
  board: Board
  self: any

  constructor(opts: { board: Board; col: number; line: number }) {
    this.board = opts.board

    this.self = this.board.append('text').attrs({
      x: 2 + opts.col * 6,
      y: 10 * (opts.line + 1),
      fill: green,
    })
  }

  drawChar(char: string) {
    this.self.text(char)
    return this
  }
  highlight() {
    this.self.attrs({
      'font-weight': 900,
      fill: 'white',
    })
    return this
  }
  lowlight() {
    if (Math.random() < boldChance) {
      this.self.attrs({
        'font-weight': 900,
        fill: brightgreen,
      })
    } else {
      this.self.attrs({
        'font-weight': 300,
        fill: green,
      })
    }
    return this
  }
}
class Column {
  board: Board
  lines: number
  col: number
  curLine: number
  chars: Array<Char>
  eraseLine: boolean

  constructor(opts: { col: number; lines: number; board: Board }) {
    this.col = opts.col
    this.lines = opts.lines
    this.board = opts.board
    this.curLine = null

    this.chars = []
    for (var i = 0; i < this.lines; i++) {
      this.chars.push(
        new Char({
          line: i,
          col: this.col,
          board: this.board,
        })
      )
    }
  }

  step() {
    if (this.curLine !== null) {
      const letter = this.eraseLine ? '' : randomChar()
      this.chars[this.curLine].drawChar(letter).highlight()
      if (this.curLine - 1 >= 0) {
        this.chars[this.curLine - 1].lowlight()
      }
      this.curLine++
      if (this.curLine >= this.lines || Math.random() < haltChance) {
        this.curLine = null
      }
    }
  }

  start() {
    this.curLine = 0
    if (this.eraseLine === null || this.eraseLine === true) {
      this.eraseLine = false
    } else if (Math.random() < eraseChance) {
      this.eraseLine = true
    }
  }
}
class Matrix {
  columns: Array<Column>

  constructor(opts: { board: Board; lines: number; cols: number }) {
    this.columns = []

    for (var i = 0; i < opts.cols; i++) {
      this.columns.push(
        new Column({
          col: i,
          lines: opts.lines,
          board: opts.board,
        })
      )
    }
  }

  addRandomDrop() {
    var col = Math.floor(Math.random() * this.columns.length)
    this.columns[col].start()
  }

  animate() {
    this.columns.forEach((col) => {
      col.step()
    })
  }
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

  setInterval(function () {
    matrix.animate()
    matrix.addRandomDrop()
  }, speed)
})
