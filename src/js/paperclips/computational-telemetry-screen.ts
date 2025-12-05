import { d3 } from '../chart'
import { HalScreen } from './hal-screen-base'
import './hal-screen-types'

export class ComputationalTelemetryScreen extends HalScreen {
  constructor(opts: { container: string; colors: any }) {
    super({
      id: 'hal-computational-telemetry',
      container: opts.container,
      width: 800,
      height: 300,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.navy)  // Navy for computational/memory
  }

  update(data: { trust: number; processors: number; memory: number; opsHistory: number[]; creatHistory: number[] }) {
    this.svg.selectAll('*').remove()
    
    // Title
    this.svg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('COMPUTATIONAL TELEMETRY')
    
    // Static display
    this.svg.append('text')
      .attr('x', 20)
      .attr('y', 60)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 12)
      .text(`TRUST: ${data.trust || 0}  |  PROC: ${data.processors || 0}  |  MEM: ${data.memory || 0}`)
    
    // Operations waveform
    if (data.opsHistory.length > 1) {
      this.drawWaveform({
        history: data.opsHistory,
        y: 120,
        height: 60,
        color: this.colors.primary,
        label: `OPERATIONS: ${data.opsHistory[data.opsHistory.length - 1]?.toLocaleString() || 0}`
      })
    }
    
    // Creativity waveform
    if (data.creatHistory.length > 1) {
      this.drawWaveform({
        history: data.creatHistory,
        y: 220,
        height: 60,
        color: this.colors.tertiary,
        label: `CREATIVITY: ${data.creatHistory[data.creatHistory.length - 1]?.toLocaleString() || 0}`
      })
    }
  }

  private drawWaveform(opts: { history: number[]; y: number; height: number; color: string; label: string }) {
    this.svg.append('text')
      .attr('x', 20)
      .attr('y', opts.y - 10)
      .attr('fill', opts.color)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .text(opts.label)
    
    const xScale = d3.scaleLinear()
      .domain([0, opts.history.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([d3.min(opts.history) || 0, d3.max(opts.history) || 1])
      .range([opts.y + opts.height, opts.y])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX)
    
    // Waveform
    this.svg.append('path')
      .datum(opts.history)
      .attr('fill', 'none')
      .attr('stroke', opts.color)
      .attr('stroke-width', 2)
      .attr('d', line)
    
    // Glow
    this.svg.append('path')
      .datum(opts.history)
      .attr('fill', 'none')
      .attr('stroke', opts.color)
      .attr('stroke-width', 4)
      .attr('opacity', 0.3)
      .attr('d', line)
  }
}

