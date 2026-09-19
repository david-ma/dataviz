/**
 * Ulam Spiral — integers on a square spiral; primes light up in diagonals.
 * Classic construction: start at 1 in the centre, then right, up, left, down…
 */
import { Chart, d3 } from './chart'
import {
  buildUlamSpiral,
  divisorCount,
  sievePrimes,
  type SpiralCell,
} from './ulam-spiral-math'

export type ColourMode = 'primes' | 'rainbow' | 'factors'

const SIZE = 720
const MARGIN = { top: 56, right: 24, bottom: 24, left: 24 }

type State = {
  side: number
  colourMode: ColourMode
  showComposites: boolean
}

const state: State = {
  side: 101,
  colourMode: 'primes',
  showComposites: true,
}

let chart: Chart | null = null
let cells: SpiralCell[] = []
let cellIndex = new Map<string, SpiralCell>()
let primes: boolean[] = []
let cellSize = 1
let originX = 0
let originY = 0
let half = 0

function readControls(): State {
  const sideEl = document.getElementById('ulam-side') as HTMLInputElement | null
  const colourEl = document.getElementById('ulam-colour') as HTMLSelectElement | null
  const compositesEl = document.getElementById(
    'ulam-composites',
  ) as HTMLInputElement | null

  const rawSide = sideEl ? Number.parseInt(sideEl.value, 10) : state.side
  const side = Number.isFinite(rawSide)
    ? Math.max(5, Math.min(301, rawSide % 2 === 1 ? rawSide : rawSide + 1))
    : state.side

  const colourMode = (colourEl?.value as ColourMode) || state.colourMode
  const showComposites = compositesEl ? compositesEl.checked : state.showComposites

  return { side, colourMode, showComposites }
}

function setStats(text: string) {
  const el = document.getElementById('ulam-stats')
  if (el) el.textContent = text
}

function setHover(text: string) {
  const el = document.getElementById('ulam-hover')
  if (el) el.textContent = text
}

function syncSideLabel(side: number) {
  const el = document.getElementById('ulam-side-value')
  if (el) el.textContent = String(side)
  const maxEl = document.getElementById('ulam-max-value')
  if (maxEl) maxEl.textContent = String(side * side)
}

function colourFor(n: number, mode: ColourMode, isPrime: boolean): string {
  if (mode === 'primes') {
    return isPrime ? '#1b9e77' : 'rgba(255,255,255,0.08)'
  }
  if (mode === 'rainbow') {
    if (!isPrime && !state.showComposites) return 'transparent'
    const t = (n - 1) / Math.max(1, state.side * state.side - 1)
    return d3.interpolateTurbo(t)
  }
  // factors
  if (!isPrime && !state.showComposites) return 'transparent'
  if (isPrime) return '#1b9e77'
  const d = divisorCount(n)
  const t = Math.min(1, (d - 1) / 12)
  return d3.interpolateYlOrRd(t)
}

function draw() {
  if (!chart) return
  Object.assign(state, readControls())
  syncSideLabel(state.side)

  cells = buildUlamSpiral(state.side)
  cellIndex = new Map(cells.map((c) => [`${c.x},${c.y}`, c]))
  const maxN = state.side * state.side
  primes = sievePrimes(maxN)
  half = (state.side - 1) / 2

  const plotW = chart.width - MARGIN.left - MARGIN.right
  const plotH = chart.height - MARGIN.top - MARGIN.bottom
  cellSize = Math.floor(Math.min(plotW, plotH) / state.side)
  const grid = cellSize * state.side
  originX = MARGIN.left + Math.floor((plotW - grid) / 2)
  originY = MARGIN.top + Math.floor((plotH - grid) / 2)

  chart.clear_canvas()
  const ctx = chart.context as CanvasRenderingContext2D
  ctx.fillStyle = '#0f1419'
  ctx.fillRect(0, 0, chart.width, chart.height)

  ctx.fillStyle = '#e8eef4'
  ctx.font = '700 22px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Ulam Spiral', chart.width / 2, 34)

  let primeCount = 0
  for (const cell of cells) {
    const isPrime = primes[cell.n]
    if (isPrime) primeCount++

    if (!isPrime && !state.showComposites) {
      continue
    }

    const px = originX + (cell.x + half) * cellSize
    const py = originY + (cell.y + half) * cellSize
    const fill = colourFor(cell.n, state.colourMode, isPrime)
    if (fill === 'transparent') continue

    ctx.fillStyle = fill
    if (cellSize <= 2) {
      ctx.fillRect(px, py, cellSize, cellSize)
    } else {
      ctx.fillRect(px, py, cellSize - 1, cellSize - 1)
    }
  }

  const density = ((100 * primeCount) / maxN).toFixed(1)
  setStats(
    `${state.side}×${state.side} = ${maxN.toLocaleString()} numbers · ${primeCount.toLocaleString()} primes (${density}%)`,
  )
}

function cellAtCanvas(cx: number, cy: number): SpiralCell | null {
  if (cellSize <= 0) return null
  const gx = Math.floor((cx - originX) / cellSize) - half
  const gy = Math.floor((cy - originY) / cellSize) - half
  return cellIndex.get(`${gx},${gy}`) ?? null
}

function wireControls() {
  ;['ulam-side', 'ulam-colour', 'ulam-composites'].forEach((id) => {
    const el = document.getElementById(id)
    if (!el) return
    el.addEventListener('input', () => draw())
    el.addEventListener('change', () => draw())
  })

  const canvas = chart?.canvas?.node() as HTMLCanvasElement | undefined
  if (!canvas) return

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (event.clientX - rect.left) * scaleX
    const cy = (event.clientY - rect.top) * scaleY
    const cell = cellAtCanvas(cx, cy)
    if (!cell) {
      setHover('Hover a cell to see its number.')
      return
    }
    const isPrime = primes[cell.n]
    const tag = isPrime ? 'prime' : cell.n === 1 ? 'unit' : 'composite'
    setHover(`${cell.n.toLocaleString()} · ${tag} · (${cell.x}, ${cell.y})`)
  })

  canvas.addEventListener('mouseleave', () => {
    setHover('Hover a cell to see its number.')
  })
}

const host = document.getElementById('ulam-chart')
if (!host) {
  setStats('Missing #ulam-chart container.')
} else {
  chart = new Chart({
    element: 'ulam-chart',
    title: '',
    width: SIZE,
    height: SIZE,
    margin: MARGIN,
    nav: false,
    renderer: 'canvas',
  })

  d3.select('#ulam-chart svg').style('display', 'none')
  d3.select('#ulam-chart canvas')
    .style('display', 'block')
    .style('max-width', '100%')
    .style('height', 'auto')
    .style('cursor', 'crosshair')

  wireControls()
  draw()
}
