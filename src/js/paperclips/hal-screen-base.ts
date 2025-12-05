import { d3 } from '../chart'

// Global screen manager
export class HalScreenManager {
  private static instance: HalScreenManager
  private screens: Map<string, HalScreen> = new Map()
  
  static getInstance(): HalScreenManager {
    if (!HalScreenManager.instance) {
      HalScreenManager.instance = new HalScreenManager()
    }
    return HalScreenManager.instance
  }
  
  register(screen: HalScreen) {
    this.screens.set(screen.getId(), screen)
  }
  
  unregister(id: string) {
    this.screens.delete(id)
  }
  
  getScreen(id: string): HalScreen | undefined {
    return this.screens.get(id)
  }
  
  getAllScreens(): HalScreen[] {
    return Array.from(this.screens.values())
  }
  
  reportCard() {
    console.log('\n=== HAL SCREEN REPORT CARD ===')
    console.log(`Total Screens: ${this.screens.size}`)
    console.log('\nScreen Status:')
    this.screens.forEach((screen, id) => {
      const status = screen.isVisible() ? '✓ ACTIVE' : '✗ HIDDEN'
      console.log(`  ${status} | ${id}`)
    })
    console.log('=============================\n')
  }
}

// Make it globally accessible
declare global {
  interface Window {
    halScreens: HalScreenManager
  }
}

window.halScreens = HalScreenManager.getInstance()

// Base class for HAL screens
export abstract class HalScreen {
  protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  protected id: string
  protected width: number
  protected height: number
  protected background: string
  protected colors: any
  protected visible: boolean = true
  
  constructor(opts: { id: string; container: string; width: number; height: number; colors: any }) {
    this.id = opts.id
    this.width = opts.width
    this.height = opts.height
    this.colors = opts.colors
    this.background = opts.colors.background
    
    this.svg = d3.select(opts.container)
      .append('svg')
      .attr('id', opts.id)
      .attr('width', opts.width)
      .attr('height', opts.height)
      .style('background', this.background)
      .style('margin-top', '10px')
    
    // Register with global manager
    console.log(`[HalScreen] Registering screen: ${opts.id}`)
    HalScreenManager.getInstance().register(this)
  }
  
  draw(...args: any[]) {
    // Optional - override in subclass
  }
  
  getId(): string {
    return this.id
  }
  
  clear() {
    this.svg.selectAll('*').remove()
  }
  
  show() {
    this.visible = true
    this.svg.style('display', 'block')
  }
  
  hide() {
    this.visible = false
    this.svg.style('display', 'none')
  }
  
  isVisible(): boolean {
    return this.visible
  }
  
  destroy() {
    HalScreenManager.getInstance().unregister(this.id)
    this.svg.remove()
  }
}

