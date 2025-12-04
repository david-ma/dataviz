import { d3 } from '../chart'

// Game state globals
declare const clipRate: number
declare const clips: number
declare const funds: number
declare const wire: number
declare const unsoldClips: number
declare const demand: number
declare const margin: number
declare const trust: number
declare const processors: number
declare const memory: number
declare const operations: number
declare const creativity: number
declare const avgRev: number

class HalViz {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  private compSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
  private phaseSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
  private clipHistory: number[] = []
  private fundsHistory: number[] = []
  private wireHistory: number[] = []
  private inventoryHistory: number[] = []
  private revenueHistory: Array<{rate: number, funds: number}> = []
  private maxHistory = 100
  
  private colors = {
    background: '#1a1a2e',      // Dark blue-grey (like 2001 screens)
    primary: '#ff6b6b',         // Bold coral/red
    secondary: '#4ecdc4',       // Bold cyan/turquoise
    tertiary: '#ffe66d',        // Bold yellow
    text: '#ffffff',            // White text
    grid: '#2d3561'             // Subtle grid
  }
  
  constructor() {
    this.svg = d3.select('#hal-dashboard')
      .append('svg')
      .attr('width', 800)
      .attr('height', 600)
      .style('background', this.colors.background)
    
    this.createLayout()
    setInterval(() => this.update(), 100)
  }
  
  createLayout() {
    // Grid lines - vertical
    for (let i = 0; i <= 10; i++) {
      this.svg.append('line')
        .attr('x1', 20 + i * 76)
        .attr('x2', 20 + i * 76)
        .attr('y1', 60)
        .attr('y2', 380)
        .attr('stroke', this.colors.grid)
        .attr('stroke-width', 1)
    }
    
    // Grid lines - horizontal
    for (let i = 0; i < 6; i++) {
      this.svg.append('line')
        .attr('x1', 20)
        .attr('x2', 780)
        .attr('y1', 80 + i * 60)
        .attr('y2', 80 + i * 60)
        .attr('stroke', this.colors.grid)
        .attr('stroke-width', 1)
    }
    
    // Title
    this.svg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('PRODUCTION MONITOR')
  }
  
  update() {
    if (typeof clipRate === 'undefined') return
    
    this.clipHistory.push(clipRate)
    this.fundsHistory.push(funds || 0)
    this.wireHistory.push(wire || 0)
    this.inventoryHistory.push(unsoldClips || 0)
    
    // Track revenue if RevTracker is unlocked
    if (typeof avgRev !== 'undefined' && avgRev > 0) {
      this.revenueHistory.push({rate: avgRev, funds: funds || 0})
      if (this.revenueHistory.length > this.maxHistory) {
        this.revenueHistory.shift()
      }
    }
    
    if (this.clipHistory.length > this.maxHistory) {
      this.clipHistory.shift()
      this.fundsHistory.shift()
      this.wireHistory.shift()
      this.inventoryHistory.shift()
    }
    
    this.drawProductionGraph()
    this.drawFundsGraph()
    this.drawWireGraph()
    this.drawInventoryGraph()
    
    // Show computational resources if trust exists
    if (typeof trust !== 'undefined' && trust > 0) {
      this.drawComputationalResources()
    }
    
    // Show experimental revenue visualization if RevTracker unlocked
    if (typeof avgRev !== 'undefined' && avgRev > 0 && this.revenueHistory.length > 10) {
      this.drawRevenuePhaseSpace()
    }
    
    this.drawStats()
  }
  
  drawProductionGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.clipHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.clipHistory) || 1])
      .range([140, 80])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal)
    
    this.svg.selectAll('.production-line').remove()
    this.svg.append('path')
      .datum(this.clipHistory)
      .attr('class', 'production-line')
      .attr('fill', 'none')
      .attr('stroke', this.colors.primary)
      .attr('stroke-width', 3)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.production-label').remove()
    this.svg.append('text')
      .attr('class', 'production-label')
      .attr('x', 20)
      .attr('y', 70)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text('CLIPS/SEC')
  }
  
  drawFundsGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.fundsHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.fundsHistory) || 1])
      .range([200, 160])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal)
    
    this.svg.selectAll('.funds-line').remove()
    this.svg.append('path')
      .datum(this.fundsHistory)
      .attr('class', 'funds-line')
      .attr('fill', 'none')
      .attr('stroke', this.colors.secondary)
      .attr('stroke-width', 3)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.funds-label').remove()
    this.svg.append('text')
      .attr('class', 'funds-label')
      .attr('x', 20)
      .attr('y', 155)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text('FUNDS ($)')
  }
  
  drawWireGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.wireHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.wireHistory) || 1])
      .range([260, 220])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal)
    
    this.svg.selectAll('.wire-line').remove()
    this.svg.append('path')
      .datum(this.wireHistory)
      .attr('class', 'wire-line')
      .attr('fill', 'none')
      .attr('stroke', this.colors.tertiary)
      .attr('stroke-width', 3)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.wire-label').remove()
    this.svg.append('text')
      .attr('class', 'wire-label')
      .attr('x', 20)
      .attr('y', 215)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text('WIRE (inches)')
  }
  
  drawInventoryGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.inventoryHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.inventoryHistory) || 1])
      .range([320, 280])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal)
    
    this.svg.selectAll('.inventory-line').remove()
    this.svg.append('path')
      .datum(this.inventoryHistory)
      .attr('class', 'inventory-line')
      .attr('fill', 'none')
      .attr('stroke', '#a29bfe')
      .attr('stroke-width', 3)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.inventory-label').remove()
    this.svg.append('text')
      .attr('class', 'inventory-label')
      .attr('x', 20)
      .attr('y', 275)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text('INVENTORY')
  }
  
  drawComputationalResources() {
    // Create SVG if it doesn't exist
    if (!this.compSvg) {
      this.compSvg = d3.select('#hal-dashboard')
        .append('svg')
        .attr('width', 400)
        .attr('height', 250)
        .style('background', this.colors.background)
        .style('margin-top', '10px')
    }
    
    const barWidth = 60
    const barSpacing = 80
    const startX = 20
    const startY = 80
    const maxBarHeight = 100
    
    // Clear previous
    this.compSvg.selectAll('*').remove()
    
    // Title
    this.compSvg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('COMPUTATIONAL')
    
    const resources = [
      {label: 'TRUST', value: trust || 0, max: 20, color: this.colors.primary},
      {label: 'PROC', value: processors || 0, max: trust || 1, color: this.colors.secondary},
      {label: 'MEM', value: memory || 0, max: trust || 1, color: this.colors.tertiary},
    ]
    
    resources.forEach((res, i) => {
      const x = startX + i * barSpacing
      const height = (res.value / res.max) * maxBarHeight
      
      // Bar
      this.compSvg!.append('rect')
        .attr('x', x)
        .attr('y', startY + maxBarHeight - height)
        .attr('width', barWidth)
        .attr('height', height)
        .attr('fill', res.color)
        .attr('opacity', 0.8)
      
      // Outline
      this.compSvg!.append('rect')
        .attr('x', x)
        .attr('y', startY)
        .attr('width', barWidth)
        .attr('height', maxBarHeight)
        .attr('fill', 'none')
        .attr('stroke', this.colors.grid)
        .attr('stroke-width', 1)
      
      // Label
      this.compSvg!.append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', startY + maxBarHeight + 15)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 10)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(res.label)
      
      // Value
      this.compSvg!.append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', startY + maxBarHeight + 28)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 9)
        .attr('text-anchor', 'middle')
        .text(`${res.value}/${res.max}`)
    })
    
    // Operations display
    if (typeof operations !== 'undefined') {
      this.compSvg.append('text')
        .attr('x', startX)
        .attr('y', startY + maxBarHeight + 50)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 11)
        .text(`OPS: ${operations.toLocaleString()}`)
    }
    
    if (typeof creativity !== 'undefined' && creativity > 0) {
      this.compSvg.append('text')
        .attr('x', startX + 150)
        .attr('y', startY + maxBarHeight + 50)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 11)
        .text(`CREAT: ${creativity.toLocaleString()}`)
    }
  }
  
  drawRevenuePhaseSpace() {
    // Create SVG if it doesn't exist
    if (!this.phaseSvg) {
      this.phaseSvg = d3.select('#hal-dashboard')
        .append('svg')
        .attr('width', 400)
        .attr('height', 200)
        .style('background', this.colors.background)
        .style('margin-top', '10px')
    }
    
    const startX = 20
    const startY = 50
    const width = 360
    const height = 130
    
    // Clear previous
    this.phaseSvg.selectAll('*').remove()
    
    // Title
    this.phaseSvg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('REVENUE PHASE SPACE')
    
    this.phaseSvg.append('text')
      .attr('x', 250)
      .attr('y', 30)
      .attr('fill', '#fd79a8')
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 10)
      .attr('font-style', 'italic')
      .text('(EXPERIMENTAL)')
    
    // Background
    this.phaseSvg.append('rect')
      .attr('x', startX)
      .attr('y', startY)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('stroke', this.colors.grid)
      .attr('stroke-width', 1)
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.revenueHistory, d => d.rate) || 1])
      .range([startX + 5, startX + width - 5])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.revenueHistory, d => d.funds) || 1])
      .range([startY + height - 5, startY + 5])
    
    // Draw trajectory
    const line = d3.line<{rate: number, funds: number}>()
      .x(d => xScale(d.rate))
      .y(d => yScale(d.funds))
      .curve(d3.curveCardinal)
    
    this.phaseSvg.append('path')
      .datum(this.revenueHistory)
      .attr('fill', 'none')
      .attr('stroke', '#fd79a8')
      .attr('stroke-width', 2)
      .attr('d', line)
    
    // Draw points
    this.phaseSvg.selectAll('.phase-point')
      .data(this.revenueHistory.slice(-20))
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.rate))
      .attr('cy', d => yScale(d.funds))
      .attr('r', 2)
      .attr('fill', '#fd79a8')
      .attr('opacity', 0.6)
    
    // Axis labels
    this.phaseSvg.append('text')
      .attr('x', startX + width / 2)
      .attr('y', startY + height + 15)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 9)
      .attr('text-anchor', 'middle')
      .text('$/sec →')
    
    this.phaseSvg.append('text')
      .attr('x', startX - 5)
      .attr('y', startY + height / 2)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 9)
      .attr('text-anchor', 'end')
      .text('↑ $')
  }
  
  drawStats() {
    this.svg.selectAll('.stats').remove()
    
    const stats = [
      `CLIPS: ${(clips || 0).toLocaleString()}`,
      `RATE: ${(clipRate || 0).toFixed(1)}/sec`,
      `FUNDS: $${(funds || 0).toFixed(2)}`,
      `WIRE: ${(wire || 0).toLocaleString()} inches`,
      `INVENTORY: ${(unsoldClips || 0).toLocaleString()}`,
      `DEMAND: ${(demand || 0).toFixed(1)}%`,
      `PRICE: $${(margin || 0).toFixed(2)}`
    ]
    
    stats.forEach((stat, i) => {
      this.svg.append('text')
        .attr('class', 'stats')
        .attr('x', 20)
        .attr('y', 360 + i * 20)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 12)
        .attr('font-weight', '500')
        .text(stat)
    })
  }
}

new HalViz()
