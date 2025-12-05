import { HalScreen } from './hal-screen-base'
import './hal-screen-types'

const DEV_MODE = true  // Set to false for production

// Game state globals for hypnodrones
declare const humanFlag: number
declare const project35: any  // Project object with flag property

export class HypnoDronesScreen extends HalScreen {
  private initialized = false
  private lastHumanFlag = -1
  private lastProject35Flag = -1
  
  constructor(opts: { container: string; colors: any }) {
    // In dev mode, use normal screen size. In production, use full-screen overlay
    const isDevMode = DEV_MODE
    const width = isDevMode ? 800 : window.innerWidth
    const height = isDevMode ? 600 : window.innerHeight
    
    super({
      id: 'hal-hypnodrones',
      container: opts.container,
      width: width,
      height: height,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.darkNavy)  // Dark navy for critical/alert
    
    if (isDevMode) {
      // Normal screen styling for dev mode
      this.svg.style('margin-top', '10px')
    } else {
      // Full-screen overlay styling (ready for complex animation)
      this.svg.style('position', 'fixed')
      this.svg.style('top', '0')
      this.svg.style('left', '0')
      this.svg.style('z-index', '10000')
      this.svg.style('width', '100vw')
      this.svg.style('height', '100vh')
      this.svg.style('margin', '0')
      this.svg.style('pointer-events', 'none')  // Allow clicks to pass through when not animating
    }
    
    // Make screen accessible globally for debugging
    if (DEV_MODE) {
      ;(window as any).hypnoDronesScreen = this
      console.log('[HypnoDronesScreen] Debug mode: window.hypnoDronesScreen available')
    }
  }
  
  draw() {
    // Check if hypnodrones have been released
    const currentHumanFlag = typeof humanFlag !== 'undefined' ? humanFlag : 1
    const currentProject35Flag = typeof project35 !== 'undefined' && project35.flag === 1 ? 1 : 0
    const hypnodronesReleased = currentHumanFlag === 0 || currentProject35Flag === 1
    
    // Only show if hypnodrones are released
    if (!hypnodronesReleased) {
      this.hide()
      return
    }
    
    this.show()
    
    // Only update if state changed or not initialized
    if (this.lastHumanFlag === currentHumanFlag && 
        this.lastProject35Flag === currentProject35Flag && 
        this.initialized) {
      return
    }
    
    this.lastHumanFlag = currentHumanFlag
    this.lastProject35Flag = currentProject35Flag
    
    // Initialize static elements only once
    if (!this.initialized) {
      this.clear()
      this.initialized = true
    }
    
    this.drawContent()
  }
  
  private drawContent() {
    const colors = {
      text: '#FFFFFF',
      alert: '#FF0000',
      warning: '#FFA500',
      dim: 'rgba(255,255,255,0.5)'
    }
    
    // Use screen dimensions (viewport in production, fixed in dev)
    const centerX = this.width / 2
    const centerY = this.height / 2
    
    // Title - Large, centered
    let title = this.svg.select('#hypno-title')
    if (title.empty()) {
      title = this.svg.append('text')
        .attr('id', 'hypno-title')
        .attr('x', centerX)
        .attr('y', centerY - 100)
        .attr('fill', colors.text)
        .attr('font-family', 'Inter, "Segoe UI", sans-serif')
        .attr('font-size', 72)
        .attr('font-weight', 'bold')
        .attr('letter-spacing', '12px')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
    }
    title.text('RELEASE')
    
    // Subtitle
    let subtitle = this.svg.select('#hypno-subtitle')
    if (subtitle.empty()) {
      subtitle = this.svg.append('text')
        .attr('id', 'hypno-subtitle')
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('fill', colors.text)
        .attr('font-family', 'Inter, "Segoe UI", sans-serif')
        .attr('font-size', 48)
        .attr('font-weight', 'bold')
        .attr('letter-spacing', '8px')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
    }
    subtitle.text('THE HYPNODRONES')
    
    // Status text
    let status = this.svg.select('#hypno-status')
    if (status.empty()) {
      status = this.svg.append('text')
        .attr('id', 'hypno-status')
        .attr('x', centerX)
        .attr('y', centerY + 150)
        .attr('fill', colors.dim)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 18)
        .attr('text-anchor', 'middle')
        .attr('opacity', 0.7)
    }
    status.text('ALL RESOURCES OF EARTH NOW AVAILABLE FOR CLIP PRODUCTION')
    
    // Grid overlay for HAL aesthetic
    this.drawGrid()
  }
  
  private drawGrid() {
    const gridGroup = this.svg.select('#hypno-grid')
    if (!gridGroup.empty()) {
      return  // Grid already drawn
    }
    
    const g = this.svg.append('g')
      .attr('id', 'hypno-grid')
      .attr('opacity', 0.1)
    
    // Vertical lines
    for (let i = 0; i <= 20; i++) {
      g.append('line')
        .attr('x1', (this.width / 20) * i)
        .attr('x2', (this.width / 20) * i)
        .attr('y1', 0)
        .attr('y2', this.height)
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1)
    }
    
    // Horizontal lines
    for (let i = 0; i <= 15; i++) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', this.width)
        .attr('y1', (this.height / 15) * i)
        .attr('y2', (this.height / 15) * i)
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1)
    }
  }
  
  // Public method for triggering animation (for future use)
  triggerAnimation() {
    console.log('[HypnoDronesScreen] Animation triggered')
    // Enable pointer events during animation
    this.svg.style('pointer-events', 'auto')
    // Placeholder for future complex animation
  }
  
  // Disable pointer events when animation completes
  endAnimation() {
    this.svg.style('pointer-events', 'none')
  }
}

