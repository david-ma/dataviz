/**
 * Matrix rain effect – D3.js + Canvas 2D.
 * Uses D3 for DOM (canvas creation, sizing) and animation loop (d3.timer),
 * and the Canvas 2D API for drawing. Same behaviour and blank start as matrix_canvas.ts.
 */

import { _ } from './chart'
import * as d3 from 'd3'

const green = '#00c200'
const brightgreen = '#5ff967'
const speed = 40
const haltChance = 0.025
const eraseChance = 0.05
const boldChance = 0.1
const charWidth = 6
const lineHeight = 10

const charset =
  'ﾘｸﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍﾘｸﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍﾘｸﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()'.split(
    '',
  )

const rabbit = (globalThis.rabbit = `                              __
 Neo                 /\\    .-" /
 Follow the         /  ; .'  .' 
 white rabbit      :   :/  .'   
                    \\  ;-.'     
       .--""""--..__/     \`.    
     .'           .'    \`o  \\   
    /                    \`   ;  
   :                  \\      :  
 .-;        -.         \`.__.-'  
:  ;          \\     ,   ;       
'._:           ;   :   (        
    \\/  .__    ;    \\   \`-.     
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

type CellStyle = 'white' | 'brightgreen' | 'green' | 'fade'

interface CellState {
  displayChar: string
  style: CellStyle
  bold?: boolean
  hiddenChar?: string
  burndown?: number
  fading?: boolean
  fadeFrames?: number
}

interface MatrixCanvasOptions {
  canvas: HTMLCanvasElement
  width: number
  height: number
}

class Column {
  col: number
  lines: number
  curLine: number | null = null
  eraseLine: boolean = false
  cells: CellState[] = []

  constructor(opts: { col: number; lines: number }) {
    this.col = opts.col
    this.lines = opts.lines
    for (let i = 0; i < this.lines; i++) {
      this.cells.push({
        displayChar: '',
        style: 'green',
      })
    }
  }

  step() {
    if (this.curLine !== null) {
      const cell = this.cells[this.curLine]
      if (!this.eraseLine) {
        if (cell.burndown != null && cell.burndown > 0 && cell.hiddenChar != null) {
          cell.displayChar = cell.hiddenChar
          cell.burndown--
        } else {
          cell.displayChar = _.sample(charset)
        }
        cell.style = 'white'
        cell.bold = true
        cell.fading = false
      } else {
        cell.fading = true
        cell.fadeFrames = cell.fadeFrames ?? 8
      }
      if (this.curLine - 1 >= 0) {
        const prev = this.cells[this.curLine - 1]
        prev.bold = Math.random() < boldChance
        prev.style = prev.bold ? 'brightgreen' : 'green'
      }
      this.curLine++
      if (this.curLine >= this.lines || Math.random() < haltChance) {
        if (this.curLine === this.lines) {
          const last = this.cells[this.curLine - 1]
          last.bold = Math.random() < boldChance
          last.style = last.bold ? 'brightgreen' : 'green'
        }
        this.curLine = null
      }
    }
    this.cells.forEach((c) => {
      if (c.fading && c.fadeFrames != null) {
        c.fadeFrames--
        if (c.fadeFrames <= 0) c.fading = false
      }
    })
  }

  setChar(opts: { line: number; char: string }) {
    const cell = this.cells[opts.line]
    cell.hiddenChar = opts.char
    cell.burndown = 10
  }

  start() {
    this.curLine = 0
    if (this.eraseLine === undefined || this.eraseLine === true) {
      this.eraseLine = false
    } else if (Math.random() < eraseChance) {
      this.eraseLine = true
    }
  }
}

class MatrixCanvas {
  columns: Column[] = []
  nLines: number
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private fontBold = '900 9px "Hack", "Menlo", "Fira Mono", "Courier New", Courier, monospace'
  private fontLight = '300 9px "Hack", "Menlo", "Fira Mono", "Courier New", Courier, monospace'

  constructor(opts: MatrixCanvasOptions) {
    this.width = opts.width
    this.height = opts.height
    this.nLines = Math.floor(opts.height / lineHeight)
    const cols = Math.floor(opts.width / charWidth)
    const ctx = opts.canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')
    this.ctx = ctx

    for (let i = 0; i < cols; i++) {
      this.columns.push(
        new Column({
          col: i,
          lines: this.nLines,
        }),
      )
    }
  }

  addRandomDrop() {
    _.sample(this.columns).start()
  }

  animate() {
    this.columns.forEach((col) => col.step())
  }

  draw() {
    const { ctx, width, height, columns } = this
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)
    ctx.textBaseline = 'top'

    for (const col of columns) {
      for (let line = 0; line < col.cells.length; line++) {
        const cell = col.cells[line]
        if (!cell.displayChar) continue
        ctx.font = cell.bold ? this.fontBold : this.fontLight
        let fill: string
        let alpha = 1
        if (cell.fading && cell.fadeFrames != null && cell.fadeFrames > 0) {
          alpha = cell.fadeFrames / 8
          fill = green
        } else {
          switch (cell.style) {
            case 'white':
              fill = 'white'
              break
            case 'brightgreen':
              fill = brightgreen
              break
            default:
              fill = green
          }
        }
        const x = 2 + col.col * charWidth
        const y = lineHeight * (line + 1)
        ctx.globalAlpha = alpha
        ctx.fillStyle = fill
        ctx.fillText(cell.displayChar, x, y)
        ctx.globalAlpha = 1
      }
    }
  }

  write(string: string, noTrim?: boolean) {
    const lines = string.split('\n')
    let line = Math.floor(Math.random() * this.nLines)
    let col = Math.floor(Math.random() * this.columns.length)
    if (line + lines.length > this.nLines) {
      line = this.nLines - lines.length - 1
    }
    lines.forEach((str, j) => {
      const s = noTrim ? str : str.trim()
      const array = s.split('')
      let c = col
      if (c + array.length > this.columns.length) {
        c = this.columns.length - array.length - 1
      }
      array.forEach((char, i) => {
        this.columns[c + i].setChar({ line: line + j, char: array[i] })
      })
    })
  }
}

function runMatrix(container: HTMLElement, fullScreen: boolean) {
  const viewportW = fullScreen ? window.innerWidth : Math.floor(window.screen.width * 0.5)
  const viewportH = fullScreen ? window.innerHeight : Math.floor(window.screen.height * 0.5)
  const width = Math.floor(viewportW / charWidth) * charWidth
  const height = Math.floor(viewportH / lineHeight) * lineHeight

  const canvas = d3
    .select(container)
    .append('canvas')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'matrix-canvas')
    .node() as HTMLCanvasElement

  const matrix = new MatrixCanvas({ canvas, width, height })
  globalThis.matrix = matrix

  let lastStep = 0
  d3.timer((elapsed) => {
    if (elapsed - lastStep >= speed) {
      matrix.animate()
      matrix.addRandomDrop()
      if (Math.random() < 0.01) {
        matrix.write(_.sample(quotes))
      }
      lastStep = elapsed
    }
    matrix.draw()
  })
}

if (typeof window !== 'undefined') {
  const isScreensaver = window.location.hash === '#screensaver'

  if (isScreensaver) {
    const header = document.querySelector('header')
    const footer = document.querySelector('footer')
    const mobileNav = document.getElementById('mobile_nav')
    const sidebar = document.querySelector('.sidebar')
    const paras = document.querySelectorAll('p')
    const main =
      document.getElementById('content_reactive_wrapper') ??
      document.querySelector('div.col-xs-12.col-sm-9')
    header?.remove()
    footer?.remove()
    mobileNav?.remove()
    sidebar?.remove()
    paras.forEach((p) => p.remove())
    if (main instanceof HTMLElement) {
      main.style.width = '100%'
      main.style.padding = '0'
      main.style.margin = '0'
      main.style.maxWidth = 'none'
    }
  }

  const container = document.getElementById('matrix')
  if (container instanceof HTMLElement) {
    if (isScreensaver) {
      container.style.position = 'fixed'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100vw'
      container.style.height = '100vh'
      container.style.margin = '0'
      container.style.padding = '0'
    }
    runMatrix(container, isScreensaver)
  }

  if (new URLSearchParams(window.location.search).get('benchmark') === '1') {
    import('./matrix_benchmark').then((m) => m.startMatrixBenchmark())
  }
}
