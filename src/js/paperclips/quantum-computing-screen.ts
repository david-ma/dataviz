import { d3 } from '../chart'
import { HalScreen, HalColors } from './hal-screen-base'
import './hal-screen-types'

export class QuantumComputingScreen extends HalScreen {
  private initialized = false
  private lastOperations = -1
  private phase = 0
  private lastTimestamp = 0
  private margin = { left: 34, right: 26, top: 60, bottom: 44 }
  private maxWaves = 10  // matches photonic chip count
  private rings: { id: number; r: number; max: number }[] = []
  private nextRingId = 0
  private ringSpawnTimer = 0
  private ringSpawnInterval = 1400  // ms between new rings
  private ringExpandRate = 26       // px per second
  private ringGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
  
  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-quantum-computing',
      container: opts.container,
      width: 400,
      height: 300,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.violet)  // Violet for quantum/waveforms
  }
  
  draw(): void {
    const now = Date.now()
    const deltaMs = this.lastTimestamp ? now - this.lastTimestamp : 16
    this.lastTimestamp = now
    this.phase += deltaMs * 0.004  // animation speed

    const currentOperations = operations || 0
    const amp = Math.min(1, currentOperations / 12000)
    const activeChips = Array.isArray(qChips)
      ? qChips.filter(c => c && c.active).length
      : 0
    const centerX = this.width / 2
    const centerY = this.height / 2

    if (!this.initialized) {
      this.clear()

      // Background gradient inspired by reference tiles
      const defs = this.svg.append('defs')
      const grad = defs.append('linearGradient')
        .attr('id', 'quantum-bg-grad')
        .attr('x1', '0%').attr('x2', '0%')
        .attr('y1', '0%').attr('y2', '100%')
      grad.append('stop').attr('offset', '0%').attr('stop-color', '#e3c3ff')
      grad.append('stop').attr('offset', '100%').attr('stop-color', '#54336F')

      this.svg.append('rect')
        .attr('id', 'quantum-bg')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('fill', 'url(#quantum-bg-grad)')

      // Title
      this.svg.append('text')
        .attr('id', 'quantum-title')
        .attr('x', 20).attr('y', 30)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 18).attr('font-weight', 'bold')
        .attr('letter-spacing', '2px')
        .text('QUANTUM COMPUTING')

      // Rings (circular diagram accent)
      this.ringGroup = this.svg.append('g')
        .attr('id', 'quantum-rings')
        .attr('opacity', 0.25)

      const w = this.width - this.margin.left - this.margin.right
      const h = this.height - this.margin.top - this.margin.bottom

      const g = this.svg.append('g')
        .attr('id', 'quantum-chart-group')
        .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

      g.append('line')
        .attr('id', 'quantum-center-line')
        .attr('x1', 0).attr('x2', w)
        .attr('y1', h / 2).attr('y2', h / 2)
        .attr('stroke', 'rgba(255,255,255,0.08)')

      // Layered wave paths
      for (let i = 0; i < this.maxWaves; i++) {
        const baseOpacity = i === 0 ? 0.95 : i === 1 ? 0.7 : 0.45
        const baseWidth = i === 0 ? 1.8 : 1.1
        g.append('path')
          .attr('id', `quantum-wave-${i}`)
          .attr('fill', 'none')
          .attr('stroke', `rgba(255,255,255,${baseOpacity})`)
          .attr('stroke-width', baseWidth)
          .attr('opacity', 0)  // will reveal as chips activate
      }

      // Operations readout
      this.svg.append('text')
        .attr('id', 'quantum-operations')
        .attr('x', 20).attr('y', this.height - 30)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 12)

      // Seed initial rings
      for (let i = 0; i < 4; i++) {
        this.spawnRing(centerX, centerY, i * -0.18)
      }

      this.initialized = true
    }

    // Ring spawn/update
    this.ringSpawnTimer += deltaMs
    if (this.ringSpawnTimer >= this.ringSpawnInterval) {
      this.spawnRing(centerX, centerY)
      this.ringSpawnTimer = 0
    }
    this.updateRings(deltaMs / 1000, centerX, centerY)

    // Wave computation
    const w = this.width - this.margin.left - this.margin.right
    const h = this.height - this.margin.top - this.margin.bottom
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, w])
    const yScale = d3.scaleLinear().domain([0, 1]).range([h, 0])
    const line = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveBasis)

    const makeWave = (freq: number, offset: number, jitter: number) => {
      return d3.range(0, 120).map(i => {
        const x = i / 119
        const base = Math.sin((i * freq + this.phase) * 0.08 + offset)
        const mod = Math.sin((i * 0.3 + this.phase * 0.6) + offset) * 0.35
        const noise = Math.sin(i * 0.15 + this.phase * 0.4 + jitter) * 0.15
        const combined = base * 0.35 + mod * 0.25 + noise * 0.15
        const ampScaled = 0.5 + combined * (0.4 + amp * 0.6)
        return [x, Math.max(0.05, Math.min(0.95, ampScaled))] as [number, number]
      })
    }

    const g = this.svg.select('#quantum-chart-group')
    const seedList = Array.isArray(qChips) && qChips.length > 0
      ? qChips.map(c => c?.waveSeed || 0.2)
      : d3.range(this.maxWaves).map(i => 0.2 + i * 0.1)

    for (let i = 0; i < this.maxWaves; i++) {
      const path = g.select(`#quantum-wave-${i}`)
      if (path.empty()) continue

      if (i < activeChips) {
        const freq = 1 + seedList[i] * 3
        const offset = seedList[i] * Math.PI * 2
        const jitter = seedList[i] * 1.5 + i * 0.1
        const data = makeWave(freq, offset, jitter)
        path
          .attr('opacity', 1)
          .datum(data)
          .attr('d', line)
      } else {
        path.attr('opacity', 0)
      }
    }

    // Update operations text (only when value changes)
    if (currentOperations !== this.lastOperations) {
      this.svg.select('#quantum-operations')
        .text(`OPERATIONS: ${currentOperations.toLocaleString()}`)
      this.lastOperations = currentOperations
    }
  }

  private spawnRing(cx: number, cy: number, initialOffsetFactor: number = 0) {
    if (!this.ringGroup) return
    const maxR = Math.min(this.width, this.height) * 0.95
    const base = maxR * 0.18
    const startR = Math.max(8, base + initialOffsetFactor * maxR)

    const ring = { id: this.nextRingId++, r: startR, max: maxR }
    this.rings.push(ring)

    this.ringGroup.append('circle')
      .attr('id', `quantum-ring-${ring.id}`)
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', ring.r)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.22)')
      .attr('stroke-width', 1.2)
      .attr('opacity', Math.max(0, 1 - ring.r / ring.max))
  }

  private updateRings(deltaSec: number, cx: number, cy: number) {
    if (!this.ringGroup) return
    const toKeep: typeof this.rings = []

    this.rings.forEach(ring => {
      ring.r += this.ringExpandRate * deltaSec
      const opacity = Math.max(0, 1 - ring.r / ring.max)
      const node = this.ringGroup?.select(`#quantum-ring-${ring.id}`)
      if (ring.r < ring.max && opacity > 0.01 && node && !node.empty()) {
        node
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', ring.r)
          .attr('opacity', opacity)
        toKeep.push(ring)
      } else {
        node?.remove()
      }
    })

    this.rings = toKeep
  }
}

