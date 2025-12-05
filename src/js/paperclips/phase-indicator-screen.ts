import { HalScreen } from './hal-screen-base'
import './hal-screen-types'

export class PhaseIndicatorScreen extends HalScreen {
  constructor(opts: { container: string; colors: any }) {
    super({
      id: 'hal-phase-indicator',
      container: opts.container,
      width: 200,
      height: 200,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.purple)  // Purple for navigation/phase
    this.svg.style('margin-bottom', '10px').style('margin-top', '0')
  }
  
  draw(phaseText: string) {
    this.clear()
    
    this.svg.append('text')
      .attr('x', 20).attr('y', 25)
      .attr('fill', this.colors.labelGrey)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 11).attr('opacity', 0.65)
      .text('PHASE: 01')
    
    this.svg.append('text')
      .attr('x', 100).attr('y', 100)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Inter, "Segoe UI", sans-serif')
      .attr('font-size', 64).attr('font-weight', 'bold')
      .attr('letter-spacing', '8px')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(phaseText)
  }
}

