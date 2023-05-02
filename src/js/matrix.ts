import { Chart, _ } from 'chart'

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

const rabbit = (globalThis.rabbit = `                              __
 Neo                 /\    .-" /
 Follow the         /  ; .'  .' 
 white rabbit      :   :/  .'   
                    \  ;-.'     
       .--""""--..__/     \`.    
     .'           .'    \`o  \   
    /                    \`   ;  
   :                  \      :  
 .-;        -.         \`.__.-'  
:  ;          \     ,   ;       
'._:           ;   :   (        
    \/  .__    ;    \   \`-.     
 bug ;     "-,/_..--"\`-..__)    
     '""--.._:`)

const quotes = [
  'The Matrix has you',
  'Hello, Neo',
  'Holy shit!',
  `The answer is coming, Neo.
  There is a window in front of you.
  Open it.`,
  "They're watching you, Neo.",
  `I know a lot about you. I've been
  wanting to meet you for some time.`,
  `How about I just give you the finger
  And you give me my phone call!`,
  'You have been living inside a dreamworld, Neo.',
  `Written and Directed by
  the Wachowski Sisters`,
  'Operator.',
  `We have the name of their next target.
  The name is Neo.`,
  "You're the One, Neo.",
  'Morpheus is fighting Neo!',
  'What does it mean?',
  'Everyone falls the first time',
]

// type Board = Selection<SVGGElement, any, HTMLElement, any>
// type Board = Selection<SVGGElement, any, HTMLElement, any>
type Board = any

class Char {
  board: Board
  self: any
  burndown: number
  hiddenChar: string

  constructor(opts: { board: Board; col: number; line: number }) {
    this.board = opts.board

    this.self = this.board.append('text').attrs({
      class: 'char',
      x: 2 + opts.col * 6,
      y: 10 * (opts.line + 1),
      fill: green,
    })
  }

  setChar(char: string) {
    this.hiddenChar = char
    this.burndown = 10
  }

  drawChar() {
    if (this.burndown) {
      this.self.text(this.hiddenChar)
      this.burndown--
    } else {
      this.self.text(_.sample(charset))
    }
    this.self
      .attrs({
        'font-weight': 900,
        fill: 'white',
      })
      .classed('fadeout', false)
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
  fadeout() {
    this.self.classed('fadeout', true)
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
    for (let i = 0; i < this.lines; i++) {
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
      if (!this.eraseLine) {
        this.chars[this.curLine].drawChar()
      } else {
        this.chars[this.curLine].fadeout()
      }
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

  /**
   * Set a hidden character, so that it will appear next time it is drawn.
   * Will also stick around for a set number of ticks
   */
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

    for (let i = 0; i < opts.cols; i++) {
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
    _.sample(this.columns).start()
  }

  animate() {
    this.columns.forEach((col) => {
      col.step()
    })
  }

  write(string: string, noTrim?: boolean) {
    const lines = string.split('\n')
    let line = Math.floor(Math.random() * this.nLines),
      col = Math.floor(Math.random() * this.columns.length)
    if (line + lines.length > this.nLines) {
      line = this.nLines - lines.length - 1
    }

    lines.forEach((string, j) => {
      if (!noTrim) {
        string = string.trim()
      }
      const array = string.split('')
      if (col + array.length > this.columns.length) {
        col = this.columns.length - array.length - 1
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

if (window.location.hash === '#screensaver') {
  console.log('ok we should do a screensaver mode')
  d3.select('header').remove()
  d3.select('footer').remove()
  d3.select('#mobile_nav').remove()
  d3.select('.sidebar').remove()
  d3.selectAll('p').remove()
  d3.select("div.col-xs-12.col-sm-9.col-md-10")
    .style("width", "100%")
    .style("padding", "0px")
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

  const lines = Math.floor(chart.innerHeight / 10), // 60
    cols = Math.floor(chart.innerWidth / 6), // 160
    board: Board = chart.svg.append('g'),
    matrix = new Matrix({
      lines: lines,
      cols: cols,
      board: board,
    })

  globalThis.matrix = matrix

  setInterval(function () {
    matrix.animate()
    matrix.addRandomDrop()
    if (Math.random() < 0.01) {
      matrix.write(_.sample(quotes))
    }
  }, speed)
})
