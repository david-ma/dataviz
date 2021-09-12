import { Chart, d3 } from 'chart'

const green = '#00c200',
  brightgreen = '#5ff967',
  speed = 40,
  haltChance = 0.025,
  eraseChance = 0.05,
  boldChance = 0.1

const charset =
  'ﾘｸﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍﾘｸﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍﾘｸﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()'.split(
    ''
  )
const rabbit = `                              __
                     /\    .-" /
                    /  ; .'  .' 
                   :   :/  .'   
                    \  ;-.'     
       .--""""--..__/     \`.    
     .'           .'    \`o  \   
    /                    \`   ;  
   :                  \      :  
 .-;        -.         \`.__.-'  
:  ;          \     ,   ;       
'._:           ;   :   (        
    \/  .__    ;    \   \`-.     
     ;     "-,/_..--"\`-..__)    
     '""--.._:`

function randomChar() {
  return charset[Math.floor(Math.random() * charset.length)]
}

type Board = d3.Selection<SVGSVGElement, any, HTMLElement, any>

class Char {
  board: Board
  self: any
  burndown: number
  hiddenChar: string

  constructor(opts: { board: Board; col: number; line: number }) {
    this.board = opts.board

    this.self = this.board.append('text').attrs({
      x: 2 + opts.col * 6,
      y: 10 * (opts.line + 1),
      fill: green,
    })
  }

  setChar(char: string) {
    this.hiddenChar = char
    this.burndown = 15
  }

  drawChar(char: string) {
    if (this.burndown) {
      this.self.text(this.hiddenChar)
      this.burndown--
    } else {
      this.self.text(char)
    }
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
    if (this.burndown || Math.random() < boldChance) {
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
        if (this.curLine === this.lines) {
          this.chars[this.curLine - 1].lowlight()
        }
        this.curLine = null
      }
    }
  }

  setChar(opts: { line: number; char: string }) {
    this.chars[opts.line].setChar(opts.char)
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
  nLines: number

  constructor(opts: { board: Board; lines: number; cols: number }) {
    this.columns = []
    this.nLines = opts.lines

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

  write(string: string) {
    console.log('Writing', string)
    var lines = string.split('\n')
    var line = Math.floor(Math.random() * this.nLines),
      col = Math.floor(Math.random() * this.columns.length)

    lines.forEach((string, j) => {
      var array = string.trim().split('')
      array.unshift(' ')
      array.push(' ')
      if (col + array.length > this.columns.length) {
        col = this.columns.length - array.length - 3
      }

      array.forEach((char, i) => {
        this.columns[col + i].setChar({
          line: line + j,
          char: array[i],
        })
      })
    })
  }
}

new Chart({
  element: 'matrix',
  height: window.screen.height * 0.5,
  width: window.screen.width * 0.5,
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

  globalThis.matrix = matrix

  var phrases = [
    'The Matrix has you',
    'Hello, Neo',
    'Shitshitshit.',
    'Holy shit!',
    `The answer is coming, Neo.
    There is a window in front of you.
    Open it.`,
    "They're watching you, Neo.",
    `I know a lot about you. I\'ve been
    wanting to meet you for some time.`,
  ]

  setInterval(function () {
    matrix.animate()
    matrix.addRandomDrop()
    if (phrases[0]) {
      matrix.write(phrases.pop())
    }
  }, speed)
})
