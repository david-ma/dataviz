import { HalScreen, HalColors } from './hal-screen-base'
import './hal-screen-types'

export class NumericMatrixScreen extends HalScreen {
  private initialized = false
  private lastValues = {trust: -1, processors: -1, memory: -1, operations: -1, creativity: -1}
  
  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-numeric-matrix',
      container: opts.container,
      width: 400,
      height: 300,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.matrixBlue)  // Matrix blue for data
  }
  
  draw(): void {
    const currentValues = {
      trust: trust || 0,
      processors: processors || 0,
      memory: memory || 0,
      operations: operations || 0,
      creativity: creativity || 0
    }
    
    // Check if any values changed
    const valuesChanged = Object.keys(currentValues).some(
      key => this.lastValues[key as keyof typeof this.lastValues] !== currentValues[key as keyof typeof currentValues]
    )
    
    // Only update if values changed or not initialized
    if (!valuesChanged && this.initialized) {
      return
    }
    
    this.lastValues = currentValues
    
    // Initialize static elements only once
    if (!this.initialized) {
      this.clear()
      
      this.svg.append('text')
        .attr('id', 'matrix-title')
        .attr('x', 20).attr('y', 25)
        .attr('fill', this.colors.labelGrey)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 12).attr('opacity', 0.65)
        .attr('letter-spacing', '1px')
        .text('COMPUTATIONAL RESOURCES')
      
      this.initialized = true
    }
    
    const data = [
      ['TRUST', currentValues.trust],
      ['PROCESSORS', currentValues.processors],
      ['MEMORY', currentValues.memory],
      ['OPERATIONS', currentValues.operations],
      ['CREATIVITY', currentValues.creativity]
    ]
    
    const startY = 60
    const lineHeight = 35
    
    data.forEach((row, i) => {
      const y = startY + i * lineHeight
      const key = ['trust', 'processors', 'memory', 'operations', 'creativity'][i]
      
      // Update or create label
      let label = this.svg.select(`#matrix-label-${key}`)
      if (label.empty()) {
        label = this.svg.append('text')
          .attr('id', `matrix-label-${key}`)
          .attr('x', 30).attr('y', y)
          .attr('fill', this.colors.text)
          .attr('font-family', 'Consolas, "Fira Mono", monospace')
          .attr('font-size', 16).attr('opacity', 0.92)
      }
      label.text(row[0] as string)
      
      // Update or create value
      let value = this.svg.select(`#matrix-value-${key}`)
      if (value.empty()) {
        value = this.svg.append('text')
          .attr('id', `matrix-value-${key}`)
          .attr('x', 250).attr('y', y)
          .attr('fill', this.colors.text)
          .attr('font-family', 'Consolas, "Fira Mono", monospace')
          .attr('font-size', 16).attr('opacity', 0.92)
      }
      value.text(typeof row[1] === 'number' ? row[1].toLocaleString() : row[1])
    })
  }
}

