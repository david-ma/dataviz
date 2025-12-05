import { d3 } from '../chart'
import { HalScreen, HalColors } from './hal-screen-base'
import './hal-screen-types'

type MarketDynamicsData = {
  revenueHistory: number[]
  priceHistory: number[]
  demandHistory: number[]
  avgRev: number
}

type ChartOptions = {
  history: number[]
  y: number
  height: number
  color: string
  label: string
  area: boolean
  xScale: d3.ScaleLinear<number, number, never>
}

export class MarketDynamicsScreen extends HalScreen {
  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-market-dynamics',
      container: opts.container,
      width: 800,
      height: 280,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.grey)  // Grey for market/engineering
  }

  update(data: MarketDynamicsData): void {
    this.svg.selectAll('*').remove()
    
    // Title
    this.svg.append('text')
      .attr('x', 20).attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18).attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('MARKET DYNAMICS')
    
    // Current values
    this.svg.append('text')
      .attr('x', 400).attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .text(`AVG REVENUE: ${data.avgRev.toFixed(2)} $/sec`)
    
    const startX = 20, width = 760, height = 60
    const xScale = d3.scaleLinear().domain([0, data.revenueHistory.length]).range([startX, startX + width])
    
    // Revenue area chart
    this.drawChart({ history: data.revenueHistory, y: 60, height, color: this.colors.secondary, label: `REVENUE: ${data.avgRev.toFixed(2)} $/sec`, area: true, xScale })
    
    // Price line chart
    this.drawChart({ history: data.priceHistory, y: 130, height, color: this.colors.tertiary, label: 'PRICE ($)', area: false, xScale })
    
    // Demand line chart
    this.drawChart({ history: data.demandHistory, y: 200, height, color: this.colors.primary, label: 'DEMAND (%)', area: false, xScale })
  }

  private drawChart(opts: ChartOptions): void {
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(opts.history) || 1])
      .range([opts.y + opts.height, opts.y])
    
    const line = d3.line<number>()
      .x((d, i) => opts.xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX)
    
    this.svg.append('text')
      .attr('x', 20).attr('y', opts.y - 5)
      .attr('fill', opts.color)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 10).attr('font-weight', 'bold')
      .text(opts.label)
    
    if (opts.area) {
      const area = d3.area<number>()
        .x((d, i) => opts.xScale(i))
        .y0(opts.y + opts.height)
        .y1(d => yScale(d))
        .curve(d3.curveMonotoneX)
      
      this.svg.append('path')
        .datum(opts.history)
        .attr('fill', opts.color)
        .attr('opacity', 0.3)
        .attr('d', area)
    }
    
    this.svg.append('path')
      .datum(opts.history)
      .attr('fill', 'none')
      .attr('stroke', opts.color)
      .attr('stroke-width', 2)
      .attr('d', line)
    
    // Baseline
    this.svg.append('line')
      .attr('x1', 20).attr('x2', 780)
      .attr('y1', opts.y + opts.height).attr('y2', opts.y + opts.height)
      .attr('stroke', this.colors.grid)
      .attr('stroke-width', 1)
      .attr('opacity', 0.3)
  }
}

