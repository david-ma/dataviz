import { d3 } from '../chart'
import { HalScreen } from './hal-screen-base'
import './hal-screen-types'

export class QuantumComputingScreen extends HalScreen {
  constructor(opts: { container: string; colors: any }) {
    super({
      id: 'hal-quantum-computing',
      container: opts.container,
      width: 400,
      height: 300,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.violet)  // Violet for quantum/waveforms
  }
  
  draw() {
    this.clear()
    
    this.svg.append('text')
      .attr('x', 20).attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18).attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('QUANTUM COMPUTING')
    
    // Quantum noise waveform
    const margin = {left: 34, right: 26, top: 60, bottom: 44}
    const w = 400 - margin.left - margin.right
    const h = 300 - margin.top - margin.bottom
    
    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    
    g.append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', h/2).attr('y2', h/2)
      .attr('stroke', 'rgba(255,255,255,0.06)')
    
    const points: [number, number][] = d3.range(0, 100).map(i => {
      const x = i / 99
      const noise = Math.sin(i * 0.5) * 0.3 + Math.sin(i * 0.17) * 0.2
      const y = 0.5 + noise * (operations / 10000)
      return [x, Math.max(0, Math.min(1, y))] as [number, number]
    })
    
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, w])
    const yScale = d3.scaleLinear().domain([0, 1]).range([h, 0])
    const line = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveBasis)
    
    g.append('path')
      .datum(points)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.92)')
      .attr('stroke-width', 1.2)
    
    this.svg.append('text')
      .attr('x', 20).attr('y', 270)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 12)
      .text(`OPERATIONS: ${(operations || 0).toLocaleString()}`)
  }
}

