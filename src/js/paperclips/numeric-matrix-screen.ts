import { HalScreen } from './hal-screen-base'
import './hal-screen-types'

export class NumericMatrixScreen extends HalScreen {
  constructor(opts: { container: string; colors: any }) {
    super({
      id: 'hal-numeric-matrix',
      container: opts.container,
      width: 400,
      height: 300,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.matrixBlue)  // Matrix blue for data
  }
  
  draw() {
    this.clear()
    
    this.svg.append('text')
      .attr('x', 20).attr('y', 25)
      .attr('fill', this.colors.labelGrey)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 12).attr('opacity', 0.65)
      .attr('letter-spacing', '1px')
      .text('COMPUTATIONAL RESOURCES')
    
    const data = [
      ['TRUST', trust || 0],
      ['PROCESSORS', processors || 0],
      ['MEMORY', memory || 0],
      ['OPERATIONS', operations || 0],
      ['CREATIVITY', creativity || 0]
    ]
    
    const startY = 60
    const lineHeight = 35
    
    data.forEach((row, i) => {
      const y = startY + i * lineHeight
      
      this.svg.append('text')
        .attr('x', 30).attr('y', y)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 16).attr('opacity', 0.92)
        .text(row[0] as string)
      
      this.svg.append('text')
        .attr('x', 250).attr('y', y)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 16).attr('opacity', 0.92)
        .text(typeof row[1] === 'number' ? row[1].toLocaleString() : row[1])
    })
  }
}

