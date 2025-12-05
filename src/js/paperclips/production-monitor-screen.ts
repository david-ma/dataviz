import { d3 } from '../chart'
import { HalScreen, HalColors } from './hal-screen-base'
import './hal-screen-types'

export class ProductionMonitorScreen extends HalScreen {
  private clipHistory: number[] = []
  private fundsHistory: number[] = []
  private wireHistory: number[] = []
  private inventoryHistory: number[] = []
  private maxHistory = 500
  private maxHistoryShort = 100
  
  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-production-monitor',
      container: opts.container,
      width: 800,
      height: 600,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.teal)  // Teal for production/engineering
  }
  
  update(): void {
    if (typeof clipRate === 'undefined') return
    
    this.clipHistory.push(clips || 0)
    this.fundsHistory.push(funds || 0)
    this.wireHistory.push(wire || 0)
    this.inventoryHistory.push(unsoldClips || 0)
    
    if (this.clipHistory.length > this.maxHistory) {
      this.clipHistory.shift()
      this.fundsHistory.shift()
    }
    
    if (this.wireHistory.length > this.maxHistoryShort) {
      this.wireHistory.shift()
    }
    
    if (this.inventoryHistory.length > this.maxHistoryShort) {
      this.inventoryHistory.shift()
    }
    
    this.draw()
  }
  
  draw(): void {
    this.clear()
    
    // Grid and title
    this.drawGrid()
    this.drawTitle()
    
    // Graphs
    this.drawGraph(this.clipHistory, 140, 80, this.colors.primary, 'TOTAL CLIPS', 70)
    this.drawGraph(this.fundsHistory, 200, 140, this.colors.secondary, 'FUNDS', 130)
    this.drawGraph(this.wireHistory, 260, 200, '#74b9ff', 'WIRE', 190)
    this.drawGraph(this.inventoryHistory, 320, 260, '#a29bfe', 'INVENTORY', 250)
    
    // Stats
    this.drawStats()
  }
  
  private drawGrid(): void {
    for (let i = 0; i <= 10; i++) {
      this.svg.append('line')
        .attr('x1', 20 + i * 76).attr('x2', 20 + i * 76)
        .attr('y1', 60).attr('y2', 380)
        .attr('stroke', this.colors.grid).attr('stroke-width', 1)
    }
    for (let i = 0; i < 6; i++) {
      this.svg.append('line')
        .attr('x1', 20).attr('x2', 780)
        .attr('y1', 80 + i * 60).attr('y2', 80 + i * 60)
        .attr('stroke', this.colors.grid).attr('stroke-width', 1)
    }
  }
  
  private drawTitle(): void {
    this.svg.append('text')
      .attr('x', 20).attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18).attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('PRODUCTION MONITOR')
  }
  
  private drawGraph(history: number[], yMax: number, yMin: number, color: string, label: string, labelY: number): void {
    if (history.length < 2) return
    
    const xScale = d3.scaleLinear().domain([0, history.length]).range([20, 780])
    const yScale = d3.scaleLinear().domain([0, d3.max(history) || 1]).range([yMax, yMin])
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal)
    
    this.svg.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line)
    
    this.svg.append('text')
      .attr('x', 20).attr('y', labelY)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11).attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text(label)
  }
  
  private drawStats(): void {
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
        .attr('x', 20).attr('y', 360 + i * 20)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 12).attr('font-weight', '500')
        .text(stat)
    })
  }
}

