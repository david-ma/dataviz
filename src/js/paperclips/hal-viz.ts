import { d3 } from '../chart'

// Game state globals
declare const clipRate: number
declare const clips: number
declare const funds: number
declare const wire: number
declare const unsoldClips: number
declare const demand: number
declare const margin: number

class HalViz {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  private clipHistory: number[] = []
  private fundsHistory: number[] = []
  private maxHistory = 100
  
  private colors = {
    background: '#000000',
    primary: '#00ff00',
    secondary: '#ffffff',
    alert: '#ff0000',
    grid: '#1a1a1a'
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
    // Title
    this.svg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.primary)
      .attr('font-family', 'monospace')
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .text('HAL 9000 PRODUCTION MONITOR')
    
    // Grid lines
    for (let i = 0; i < 6; i++) {
      this.svg.append('line')
        .attr('x1', 20)
        .attr('x2', 780)
        .attr('y1', 80 + i * 60)
        .attr('y2', 80 + i * 60)
        .attr('stroke', this.colors.grid)
        .attr('stroke-width', 1)
    }
  }
  
  update() {
    if (typeof clipRate === 'undefined') return
    
    this.clipHistory.push(clipRate)
    this.fundsHistory.push(funds || 0)
    
    if (this.clipHistory.length > this.maxHistory) {
      this.clipHistory.shift()
      this.fundsHistory.shift()
    }
    
    this.drawProductionGraph()
    this.drawFundsGraph()
    this.drawStats()
  }
  
  drawProductionGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.clipHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.clipHistory) || 1])
      .range([200, 80])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
    
    this.svg.selectAll('.production-line').remove()
    this.svg.append('path')
      .datum(this.clipHistory)
      .attr('class', 'production-line')
      .attr('fill', 'none')
      .attr('stroke', this.colors.primary)
      .attr('stroke-width', 2)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.production-label').remove()
    this.svg.append('text')
      .attr('class', 'production-label')
      .attr('x', 20)
      .attr('y', 70)
      .attr('fill', this.colors.secondary)
      .attr('font-family', 'monospace')
      .attr('font-size', 12)
      .text('CLIPS/SEC')
  }
  
  drawFundsGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.fundsHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.fundsHistory) || 1])
      .range([350, 230])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
    
    this.svg.selectAll('.funds-line').remove()
    this.svg.append('path')
      .datum(this.fundsHistory)
      .attr('class', 'funds-line')
      .attr('fill', 'none')
      .attr('stroke', this.colors.secondary)
      .attr('stroke-width', 2)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.funds-label').remove()
    this.svg.append('text')
      .attr('class', 'funds-label')
      .attr('x', 20)
      .attr('y', 220)
      .attr('fill', this.colors.secondary)
      .attr('font-family', 'monospace')
      .attr('font-size', 12)
      .text('FUNDS ($)')
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
        .attr('y', 400 + i * 25)
        .attr('fill', this.colors.primary)
        .attr('font-family', 'monospace')
        .attr('font-size', 14)
        .text(stat)
    })
  }
}

new HalViz()
