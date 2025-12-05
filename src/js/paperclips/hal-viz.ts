import { d3 } from '../chart'

console.log("Running hal-viz.ts")

// Game state globals
declare const clipRate: number
declare const clips: number
declare const funds: number
declare const wire: number
declare const unsoldClips: number
declare const demand: number
declare const margin: number
declare const trust: number
declare const processors: number
declare const memory: number
declare const operations: number
declare const creativity: number
declare const avgRev: number
declare const marketing: number
declare const marketingLvl: number
declare const yomi: number
declare const strategyEngineFlag: number
declare const qChipCost: number

class HalViz {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  private compSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
  private phaseSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
  private marketSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
  private clipHistory: number[] = []
  private fundsHistory: number[] = []
  private wireHistory: number[] = []
  private inventoryHistory: number[] = []
  private revenueHistory: number[] = []
  private priceHistory: number[] = []
  private demandHistory: number[] = []
  private opsHistory: number[] = []
  private creatHistory: number[] = []
  private maxHistory = 100
  private worldData: any = null
  private lastMarketingLvl = 0
  private flashingCountries: number[] = []
  private flashTimer = 0
  
  private matrixSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
  private phaseIndicatorSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
  private quantumSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
  private strategySvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
  
  private colors = {
    background: '#1a1a2e',      // Dark blue-grey (like 2001 screens)
    primary: '#ff6b6b',         // Bold coral/red
    secondary: '#4ecdc4',       // Bold cyan/turquoise
    tertiary: '#ffe66d',        // Bold yellow
    text: '#ffffff',            // White text
    grid: '#2d3561',            // Subtle grid
    
    // Authentic HAL colors
    matrixBlue: '#0d2c55',      // Numeric matrix background
    navy: '#143962',            // Phase indicator background
    labelGrey: '#cfe8ff'        // Section labels
  }
  
  constructor() {
    this.svg = d3.select('#hal-dashboard')
      .append('svg')
      .attr('width', 800)
      .attr('height', 600)
      .style('background', this.colors.background)
    
    this.createLayout()
    
    // Load world map data
    d3.json('/world-50.geo.json').then((data) => {
      this.worldData = data
    })
    
    // Use requestAnimationFrame for smoother updates
    const animate = () => {
      this.update()
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }
  
  createLayout() {
    // Grid lines - vertical
    for (let i = 0; i <= 10; i++) {
      this.svg.append('line')
        .attr('x1', 20 + i * 76)
        .attr('x2', 20 + i * 76)
        .attr('y1', 60)
        .attr('y2', 380)
        .attr('stroke', this.colors.grid)
        .attr('stroke-width', 1)
    }
    
    // Grid lines - horizontal
    for (let i = 0; i < 6; i++) {
      this.svg.append('line')
        .attr('x1', 20)
        .attr('x2', 780)
        .attr('y1', 80 + i * 60)
        .attr('y2', 80 + i * 60)
        .attr('stroke', this.colors.grid)
        .attr('stroke-width', 1)
    }
    
    // Title
    this.svg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('PRODUCTION MONITOR')
  }
  
  update() {
    if (typeof clipRate === 'undefined') return
    
    this.clipHistory.push(clipRate)
    this.fundsHistory.push(funds || 0)
    this.wireHistory.push(wire || 0)
    this.inventoryHistory.push(unsoldClips || 0)
    
    // Track revenue if RevTracker is unlocked
    if (typeof avgRev !== 'undefined' && avgRev > 0) {
      this.revenueHistory.push(avgRev)
      this.priceHistory.push(margin || 0)
      this.demandHistory.push(demand || 0)
      if (this.revenueHistory.length > this.maxHistory) {
        this.revenueHistory.shift()
        this.priceHistory.shift()
        this.demandHistory.shift()
      }
    }
    
    // Track computational resources
    if (typeof operations !== 'undefined') {
      this.opsHistory.push(operations)
      if (this.opsHistory.length > this.maxHistory) {
        this.opsHistory.shift()
      }
    }
    
    if (typeof creativity !== 'undefined' && creativity > 0) {
      this.creatHistory.push(creativity)
      if (this.creatHistory.length > this.maxHistory) {
        this.creatHistory.shift()
      }
    }
    
    if (this.clipHistory.length > this.maxHistory) {
      this.clipHistory.shift()
      this.fundsHistory.shift()
      this.wireHistory.shift()
      this.inventoryHistory.shift()
    }
    
    this.drawProductionGraph()
    this.drawFundsGraph()
    this.drawWireGraph()
    this.drawInventoryGraph()
    
    // Show computational resources if trust exists
    if (typeof trust !== 'undefined' && trust > 0) {
      this.drawComputationalResources()
      this.drawNumericMatrix()
    }
    
    // Show quantum computing if operations exist
    if (typeof operations !== 'undefined' && operations > 0) {
      this.drawQuantumComputing()
    }
    
    // Show strategic modeling if yomi exists
    if (typeof yomi !== 'undefined' && yomi > 0) {
      this.drawStrategicModeling()
    }
    
    // Always show phase indicator
    this.drawPhaseIndicator()
    
    // Show revenue chart if RevTracker unlocked
    if (typeof avgRev !== 'undefined' && avgRev > 0 && this.revenueHistory.length > 5) {
      this.drawRevenueChart()
    }
    
    // Show market penetration map if marketing exists
    if (typeof marketingLvl !== 'undefined' && marketingLvl > 0 && this.worldData) {
      // Trigger animation when marketing level increases
      if (marketingLvl > this.lastMarketingLvl) {
        const newCountries = marketingLvl - this.lastMarketingLvl
        this.startFlashAnimation(newCountries)
        this.lastMarketingLvl = marketingLvl
      }
      this.drawMarketMap()
    }
    
    this.drawStats()
  }
  
  drawProductionGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.clipHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.clipHistory) || 1])
      .range([140, 80])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal)
    
    this.svg.selectAll('.production-line').remove()
    this.svg.append('path')
      .datum(this.clipHistory)
      .attr('class', 'production-line')
      .attr('fill', 'none')
      .attr('stroke', this.colors.primary)
      .attr('stroke-width', 3)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.production-label').remove()
    this.svg.append('text')
      .attr('class', 'production-label')
      .attr('x', 20)
      .attr('y', 70)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text('CLIPS/SEC')
  }
  
  drawFundsGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.fundsHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.fundsHistory) || 1])
      .range([200, 160])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal)
    
    this.svg.selectAll('.funds-line').remove()
    this.svg.append('path')
      .datum(this.fundsHistory)
      .attr('class', 'funds-line')
      .attr('fill', 'none')
      .attr('stroke', this.colors.secondary)
      .attr('stroke-width', 3)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.funds-label').remove()
    this.svg.append('text')
      .attr('class', 'funds-label')
      .attr('x', 20)
      .attr('y', 155)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text('FUNDS ($)')
  }
  
  drawWireGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.wireHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.wireHistory) || 1])
      .range([260, 220])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal)
    
    this.svg.selectAll('.wire-line').remove()
    this.svg.append('path')
      .datum(this.wireHistory)
      .attr('class', 'wire-line')
      .attr('fill', 'none')
      .attr('stroke', this.colors.tertiary)
      .attr('stroke-width', 3)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.wire-label').remove()
    this.svg.append('text')
      .attr('class', 'wire-label')
      .attr('x', 20)
      .attr('y', 215)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text('WIRE (inches)')
  }
  
  drawInventoryGraph() {
    const xScale = d3.scaleLinear()
      .domain([0, this.inventoryHistory.length])
      .range([20, 780])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.inventoryHistory) || 1])
      .range([320, 280])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal)
    
    this.svg.selectAll('.inventory-line').remove()
    this.svg.append('path')
      .datum(this.inventoryHistory)
      .attr('class', 'inventory-line')
      .attr('fill', 'none')
      .attr('stroke', '#a29bfe')
      .attr('stroke-width', 3)
      .attr('d', line)
    
    // Label
    this.svg.selectAll('.inventory-label').remove()
    this.svg.append('text')
      .attr('class', 'inventory-label')
      .attr('x', 20)
      .attr('y', 275)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text('INVENTORY')
  }
  
  drawComputationalResources() {
    // Create SVG if it doesn't exist
    if (!this.compSvg) {
      this.compSvg = d3.select('#hal-dashboard')
        .append('svg')
        .attr('width', 800)
        .attr('height', 300)
        .style('background', this.colors.background)
        .style('margin-top', '10px')
    }
    
    // Clear previous
    this.compSvg.selectAll('*').remove()
    
    // Title
    this.compSvg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('COMPUTATIONAL TELEMETRY')
    
    // Trust/Processor/Memory static display
    const staticY = 60
    this.compSvg.append('text')
      .attr('x', 20)
      .attr('y', staticY)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 12)
      .text(`TRUST: ${trust || 0}  |  PROC: ${processors || 0}  |  MEM: ${memory || 0}`)
    
    // Operations waveform
    if (this.opsHistory.length > 1) {
      const opsY = 120
      const opsHeight = 60
      
      this.compSvg.append('text')
        .attr('x', 20)
        .attr('y', opsY - 10)
        .attr('fill', this.colors.primary)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 11)
        .attr('font-weight', 'bold')
        .text(`OPERATIONS: ${operations.toLocaleString()}`)
      
      const xScale = d3.scaleLinear()
        .domain([0, this.opsHistory.length])
        .range([20, 780])
      
      const yScale = d3.scaleLinear()
        .domain([d3.min(this.opsHistory) || 0, d3.max(this.opsHistory) || 1])
        .range([opsY + opsHeight, opsY])
      
      const line = d3.line<number>()
        .x((d, i) => xScale(i))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX)
      
      // Oscilloscope-style waveform
      this.compSvg.append('path')
        .datum(this.opsHistory)
        .attr('fill', 'none')
        .attr('stroke', this.colors.primary)
        .attr('stroke-width', 2)
        .attr('d', line)
      
      // Glow effect
      this.compSvg.append('path')
        .datum(this.opsHistory)
        .attr('fill', 'none')
        .attr('stroke', this.colors.primary)
        .attr('stroke-width', 4)
        .attr('opacity', 0.3)
        .attr('d', line)
    }
    
    // Creativity waveform
    if (this.creatHistory.length > 1) {
      const creatY = 220
      const creatHeight = 60
      
      this.compSvg.append('text')
        .attr('x', 20)
        .attr('y', creatY - 10)
        .attr('fill', this.colors.tertiary)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 11)
        .attr('font-weight', 'bold')
        .text(`CREATIVITY: ${creativity.toLocaleString()}`)
      
      const xScale = d3.scaleLinear()
        .domain([0, this.creatHistory.length])
        .range([20, 780])
      
      const yScale = d3.scaleLinear()
        .domain([d3.min(this.creatHistory) || 0, d3.max(this.creatHistory) || 1])
        .range([creatY + creatHeight, creatY])
      
      const line = d3.line<number>()
        .x((d, i) => xScale(i))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX)
      
      // Oscilloscope-style waveform
      this.compSvg.append('path')
        .datum(this.creatHistory)
        .attr('fill', 'none')
        .attr('stroke', this.colors.tertiary)
        .attr('stroke-width', 2)
        .attr('d', line)
      
      // Glow effect
      this.compSvg.append('path')
        .datum(this.creatHistory)
        .attr('fill', 'none')
        .attr('stroke', this.colors.tertiary)
        .attr('stroke-width', 4)
        .attr('opacity', 0.3)
        .attr('d', line)
    }
  }
  
  drawRevenueChart() {
    // Create SVG if it doesn't exist
    if (!this.phaseSvg) {
      this.phaseSvg = d3.select('#hal-dashboard')
        .append('svg')
        .attr('width', 800)
        .attr('height', 280)
        .style('background', this.colors.background)
        .style('margin-top', '10px')
    }
    
    const startX = 20
    const startY = 60
    const width = 760
    const height = 60
    
    // Clear previous
    this.phaseSvg.selectAll('*').remove()
    
    // Title
    this.phaseSvg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('MARKET DYNAMICS')
    
    // Current values
    this.phaseSvg.append('text')
      .attr('x', 400)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .text(`MARKETING LVL: ${marketingLvl || 1}  |  PRICE: $${margin.toFixed(2)}  |  DEMAND: ${demand.toFixed(1)}%`)
    
    const xScale = d3.scaleLinear()
      .domain([0, this.revenueHistory.length])
      .range([startX, startX + width])
    
    // Revenue area chart
    const revenueY = startY
    const revenueScale = d3.scaleLinear()
      .domain([0, d3.max(this.revenueHistory) || 1])
      .range([revenueY + height, revenueY])
    
    const revenueArea = d3.area<number>()
      .x((d, i) => xScale(i))
      .y0(revenueY + height)
      .y1(d => revenueScale(d))
      .curve(d3.curveMonotoneX)
    
    const revenueLine = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => revenueScale(d))
      .curve(d3.curveMonotoneX)
    
    this.phaseSvg.append('text')
      .attr('x', startX)
      .attr('y', revenueY - 5)
      .attr('fill', this.colors.secondary)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
      .text(`REVENUE: ${avgRev.toFixed(2)} $/sec`)
    
    this.phaseSvg.append('path')
      .datum(this.revenueHistory)
      .attr('fill', this.colors.secondary)
      .attr('opacity', 0.3)
      .attr('d', revenueArea)
    
    this.phaseSvg.append('path')
      .datum(this.revenueHistory)
      .attr('fill', 'none')
      .attr('stroke', this.colors.secondary)
      .attr('stroke-width', 2)
      .attr('d', revenueLine)
    
    // Price line
    const priceY = startY + 90
    const priceScale = d3.scaleLinear()
      .domain([0, d3.max(this.priceHistory) || 1])
      .range([priceY + height, priceY])
    
    const priceLine = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => priceScale(d))
      .curve(d3.curveMonotoneX)
    
    this.phaseSvg.append('text')
      .attr('x', startX)
      .attr('y', priceY - 5)
      .attr('fill', this.colors.tertiary)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
      .text('PRICE ($)')
    
    this.phaseSvg.append('path')
      .datum(this.priceHistory)
      .attr('fill', 'none')
      .attr('stroke', this.colors.tertiary)
      .attr('stroke-width', 2)
      .attr('d', priceLine)
    
    // Demand line
    const demandY = startY + 180
    const demandScale = d3.scaleLinear()
      .domain([0, 100])
      .range([demandY + height, demandY])
    
    const demandLine = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => demandScale(d))
      .curve(d3.curveMonotoneX)
    
    this.phaseSvg.append('text')
      .attr('x', startX)
      .attr('y', demandY - 5)
      .attr('fill', this.colors.primary)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
      .text('DEMAND (%)')
    
    this.phaseSvg.append('path')
      .datum(this.demandHistory)
      .attr('fill', 'none')
      .attr('stroke', this.colors.primary)
      .attr('stroke-width', 2)
      .attr('d', demandLine)
    
    // Baselines
    ;[revenueY, priceY, demandY].forEach(y => {
      this.phaseSvg!.append('line')
        .attr('x1', startX)
        .attr('x2', startX + width)
        .attr('y1', y + height)
        .attr('y2', y + height)
        .attr('stroke', this.colors.grid)
        .attr('stroke-width', 1)
    })
  }
  
  startFlashAnimation(newCountries: number) {
    // Add new countries to flash queue
    const features = this.worldData.features
    const totalCountries = features.length
    const currentFilled = Math.floor((this.lastMarketingLvl / 100) * totalCountries)
    
    // Add indices of new countries to flash
    for (let i = 0; i < newCountries; i++) {
      const index = currentFilled + i
      if (index < totalCountries) {
        this.flashingCountries.push(index)
      }
    }
    
    this.flashTimer = 0
  }
  
  drawMarketMap() {
    // Create SVG if it doesn't exist
    if (!this.marketSvg) {
      this.marketSvg = d3.select('#hal-dashboard')
        .append('svg')
        .attr('width', 800)
        .attr('height', 400)
        .style('background', this.colors.background)
        .style('margin-top', '10px')
    }
    
    // Clear previous
    this.marketSvg.selectAll('*').remove()
    
    // Title
    this.marketSvg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('GLOBAL MARKET PENETRATION')
    
    this.marketSvg.append('text')
      .attr('x', 500)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 12)
      .text(`MARKETING LEVEL: ${marketingLvl}`)
    
    // Create projection
    const projection = d3.geoEquirectangular()
      .scale(120)
      .translate([400, 200])
    
    const path = d3.geoPath().projection(projection)
    
    // Calculate how many countries to fill based on marketing level
    const features = this.worldData.features
    const totalCountries = features.length
    const fillCount = Math.floor((marketingLvl / 100) * totalCountries)
    
    // Shuffle countries for random fill pattern (use consistent seed)
    const shuffled = [...features].sort(() => Math.random() - 0.5)
    
    // Increment flash timer
    this.flashTimer++
    
    // Flash pattern: fast (every 8 frames) then slow (every 40 frames)
    const flashSpeed = this.flashTimer < 80 ? 8 : 40
    const showFlash = Math.floor(this.flashTimer / flashSpeed) % 2 === 0
    
    // Remove finished flashing countries after 15 seconds (150 frames)
    if (this.flashTimer > 150) {
      this.flashingCountries = []
      this.flashTimer = 0
    }
    
    // Draw countries
    shuffled.forEach((feature: any, i: number) => {
      const isPermanentlyFilled = i < fillCount && !this.flashingCountries.includes(i)
      const isFlashing = this.flashingCountries.includes(i) && showFlash
      const isFilled = isPermanentlyFilled || isFlashing
      
      this.marketSvg!.append('path')
        .datum(feature)
        .attr('d', path)
        .attr('fill', isFilled ? this.colors.primary : 'none')
        .attr('stroke', this.colors.grid)
        .attr('stroke-width', 0.5)
        .attr('opacity', isFilled ? 0.7 : 1)
    })
    
    // Stats
    const coverage = (fillCount / totalCountries * 100).toFixed(1)
    this.marketSvg.append('text')
      .attr('x', 20)
      .attr('y', 380)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 11)
      .text(`MARKETS REACHED: ${fillCount}/${totalCountries} (${coverage}%)`)
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
        .attr('y', 360 + i * 20)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
        .attr('font-size', 12)
        .attr('font-weight', '500')
        .text(stat)
    })
  }
  
  drawNumericMatrix() {
    // Create SVG if it doesn't exist
    if (!this.matrixSvg) {
      this.matrixSvg = d3.select('#hal-dashboard')
        .append('svg')
        .attr('width', 400)
        .attr('height', 300)
        .style('background', this.colors.matrixBlue)
        .style('margin-top', '10px')
    }
    
    // Clear previous
    this.matrixSvg.selectAll('*').remove()
    
    // Section label
    this.matrixSvg.append('text')
      .attr('x', 20)
      .attr('y', 25)
      .attr('fill', this.colors.labelGrey)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 12)
      .attr('opacity', 0.65)
      .attr('letter-spacing', '1px')
      .text('COMPUTATIONAL RESOURCES')
    
    // Data rows
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
      
      // Label
      this.matrixSvg!.append('text')
        .attr('x', 30)
        .attr('y', y)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 16)
        .attr('opacity', 0.92)
        .text(row[0])
      
      // Value
      this.matrixSvg!.append('text')
        .attr('x', 250)
        .attr('y', y)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 16)
        .attr('opacity', 0.92)
        .text(typeof row[1] === 'number' ? row[1].toLocaleString() : row[1])
    })
  }
  
  drawPhaseIndicator() {
    // Create SVG if it doesn't exist
    if (!this.phaseIndicatorSvg) {
      this.phaseIndicatorSvg = d3.select('#hal-dashboard')
        .insert('svg', ':first-child')
        .attr('width', 200)
        .attr('height', 200)
        .style('background', this.colors.navy)
        .style('margin-bottom', '10px')
    }
    
    // Clear previous
    this.phaseIndicatorSvg.selectAll('*').remove()
    
    // Small header
    this.phaseIndicatorSvg.append('text')
      .attr('x', 20)
      .attr('y', 25)
      .attr('fill', this.colors.labelGrey)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 11)
      .attr('opacity', 0.65)
      .text('PHASE: 01')
    
    // Determine phase based on game state
    let phaseText = 'BIZ'
    if (typeof trust !== 'undefined' && trust > 0) {
      phaseText = 'MFG'
    }
    
    // Large phase text
    this.phaseIndicatorSvg.append('text')
      .attr('x', 100)
      .attr('y', 100)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Inter, "Segoe UI", sans-serif')
      .attr('font-size', 64)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '8px')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(phaseText)
  }
  
  drawQuantumComputing() {
    // Create SVG if it doesn't exist
    if (!this.quantumSvg) {
      this.quantumSvg = d3.select('#hal-dashboard')
        .append('svg')
        .attr('width', 400)
        .attr('height', 300)
        .style('background', '#54336F') // Purple from 9-tiles waveform
        .style('margin-top', '10px')
    }
    
    // Clear previous
    this.quantumSvg.selectAll('*').remove()
    
    // Title
    this.quantumSvg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('QUANTUM COMPUTING')
    
    // Operations waveform (reuse existing oscilloscope style)
    const margin = {left: 34, right: 26, top: 60, bottom: 44}
    const w = 400 - margin.left - margin.right
    const h = 300 - margin.top - margin.bottom
    
    const g = this.quantumSvg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    
    // Baseline
    g.append('line')
      .attr('x1', 0)
      .attr('x2', w)
      .attr('y1', h/2)
      .attr('y2', h/2)
      .attr('stroke', 'rgba(255,255,255,0.06)')
    
    // Generate quantum noise waveform
    const points: [number, number][] = d3.range(0, 100).map(i => {
      const x = i / 99
      const noise = Math.sin(i * 0.5) * 0.3 + Math.sin(i * 0.17) * 0.2
      const y = 0.5 + noise * (operations / 10000) // Scale by operations
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
    
    // Stats
    this.quantumSvg.append('text')
      .attr('x', 20)
      .attr('y', 270)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 12)
      .text(`OPERATIONS: ${(operations || 0).toLocaleString()}`)
  }
  
  drawStrategicModeling() {
    // Create SVG if it doesn't exist
    if (!this.strategySvg) {
      this.strategySvg = d3.select('#hal-dashboard')
        .append('svg')
        .attr('width', 400)
        .attr('height', 300)
        .style('background', '#6B2424') // Burgundy from 9-tiles
        .style('margin-top', '10px')
    }
    
    // Clear previous
    this.strategySvg.selectAll('*').remove()
    
    // Title
    this.strategySvg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('STRATEGIC MODELING')
    
    // Grid
    const margin = {left: 44, right: 44, top: 60, bottom: 48}
    const w = 400 - margin.left - margin.right
    const h = 300 - margin.top - margin.bottom
    
    const g = this.strategySvg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    
    // Grid lines
    const cols = 10, rows = 10
    for (let i = 0; i <= cols; i++) {
      g.append('line')
        .attr('x1', i * w/cols)
        .attr('x2', i * w/cols)
        .attr('y1', 0)
        .attr('y2', h)
        .attr('stroke', 'rgba(255,230,230,0.07)')
    }
    for (let j = 0; j <= rows; j++) {
      g.append('line')
        .attr('y1', j * h/rows)
        .attr('y2', j * h/rows)
        .attr('x1', 0)
        .attr('x2', w)
        .attr('stroke', 'rgba(255,230,230,0.07)')
    }
    
    // Convex curve (strategic optimization landscape)
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, w])
    const yScale = d3.scaleLinear().domain([0, 1]).range([h, 0])
    const power = 2.4
    
    const curvePts: [number, number][] = d3.range(0, 81).map(t => {
      const xx = t / 80
      const yy = 0.02 + 0.96 * Math.pow(xx, power)
      return [xScale(xx), yScale(yy)] as [number, number]
    })
    
    g.append('path')
      .attr('d', d3.line<[number, number]>()(curvePts))
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.95)')
      .attr('stroke-width', 2.2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
    
    // Yomi display
    this.strategySvg.append('text')
      .attr('x', 20)
      .attr('y', 270)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 12)
      .text(`YOMI: ${(yomi || 0).toLocaleString()}`)
  }
}

new HalViz()
