import { d3 } from '../chart'
import { HalScreenManager } from './hal-screen-base'
import { ComputationalTelemetryScreen } from './computational-telemetry-screen'
import { PhaseIndicatorScreen } from './phase-indicator-screen'
import { NumericMatrixScreen } from './numeric-matrix-screen'
import { QuantumComputingScreen } from './quantum-computing-screen'
import { StrategicModelingScreen } from './strategic-modeling-screen'
import { MarketDynamicsScreen } from './market-dynamics-screen'
import { StockMarketScreen } from './stock-market-screen'
import { DroneOperationsScreen } from './drone-operations-screen'
import { DroneGlobeScreen } from './drone-globe-screen'
import { HypnoDronesScreen } from './hypnodrones-screen'
import './hal-screen-types'

// Game state globals (also declared in hal-screen-types.ts for other files)
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
declare const currentRound: number
declare const rounds: number
declare const strats: any[]
declare const payoffGrid: any
declare const stocks: any[]
declare const bankroll: number
declare const portTotal: number
declare const investLevel: number
declare const qChips: { waveSeed: number; value: number; active: number }[]
declare const humanFlag: number
declare const project35: any
declare const harvesterLevel: number
declare const wireDroneLevel: number
declare const harvesterCost: number
declare const wireDroneCost: number
declare const harvesterFlag: number
declare const wireDroneFlag: number
declare const availableMatter: number
declare const unusedClips: number
declare const droneRatio: number
declare const spaceFlag: number

const HAL_VIZ_VERSION = 'v1.0.26-hypnodrones-20251205'
const DEV_MODE = true  // Set to false for production
console.log(`[HAL-VIZ] Version: ${HAL_VIZ_VERSION}`)
console.log(`[HAL-VIZ] Dev Mode: ${DEV_MODE}`)

class HalViz {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  private computationalTelemetryScreen: ComputationalTelemetryScreen | null = null
  private phaseIndicatorScreen: PhaseIndicatorScreen | null = null
  private numericMatrixScreen: NumericMatrixScreen | null = null
  private quantumComputingScreen: QuantumComputingScreen | null = null
  private marketDynamicsScreen: MarketDynamicsScreen | null = null
  private stockMarketScreen: StockMarketScreen | null = null
  private marketSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null  // World map
  private clipHistory: number[] = []
  private fundsHistory: number[] = []
  private wireHistory: number[] = []
  private inventoryHistory: number[] = []
  private revenueHistory: number[] = []
  private priceHistory: number[] = []
  private demandHistory: number[] = []
  private opsHistory: number[] = []
  private creatHistory: number[] = []
  private maxHistory = 500  // Show longer timeline (50 seconds at 10fps)
  private maxHistoryShort = 100  // Shorter timeline for wire/inventory
  private worldData: any = null
  private lastMarketingLvl = 0
  private flashingCountries: number[] = []
  private flashTimer = 0
  
  private strategicModelingScreen: StrategicModelingScreen | null = null
  private droneOperationsScreen: DroneOperationsScreen | null = null
  private droneGlobeScreen: DroneGlobeScreen | null = null
  private hypnoDronesScreen: HypnoDronesScreen | null = null
  private lastPhase: string | null = null
  
  private colors = {
    // Authentic HAL color palette from reference screens
    purple: '#532B78',        // Rich purple (Tile 1)
    teal: '#1C6B74',          // Teal-blue (Tile 2)
    navy: '#143962',          // Deep blue (Tile 4)
    grey: '#6C6C6C',          // Grey (Tile 5)
    midGrey: '#7B7B7B',       // Mid-grey (Tile 6)
    darkNavy: '#0A1130',      // Very dark navy (Tile 7)
    burgundy: '#6B2424',      // Brick red (Tile 9)
    violet: '#54336F',        // Violet-purple (Tile 10)
    matrixBlue: '#0d2c55',    // Matrix screen blue
    
    // Standard colors
    white: '#FFFFFF',
    text: '#FFFFFF',
    
    // Stock market colors
    green: '#00FF00',         // Profit/bullish
    red: '#FF0000',           // Loss/bearish
    
    // Legacy (for compatibility)
    background: '#1a1a2e',
    primary: '#1C6B74',       // Teal
    secondary: '#00FF00',     // Green
    tertiary: '#FF0000',      // Red
    grid: '#7B7B7B',          // Mid-grey
    labelGrey: '#7B7B7B'
  }
  
  constructor() {
    this.svg = d3.select('#hal-dashboard')
      .append('svg')
      .attr('id', 'hal-production-monitor')
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
    
    this.clipHistory.push(clips || 0)  // Track total clips instead of rate
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
    }
    
    if (this.wireHistory.length > this.maxHistoryShort) {
      this.wireHistory.shift()
    }
    
    if (this.inventoryHistory.length > this.maxHistoryShort) {
      this.inventoryHistory.shift()
    }
    
    this.drawProductionGraph()
    this.drawFundsGraph()
    this.drawWireGraph()
    this.drawInventoryGraph()
    
    // Show computational resources if trust exists OR dev mode
    if (DEV_MODE || (typeof trust !== 'undefined' && trust > 0)) {
      this.drawComputationalResources()
      this.drawNumericMatrix()
    }
    
    // Show quantum computing if operations exist OR dev mode
    if (DEV_MODE || (typeof operations !== 'undefined' && operations > 0)) {
      this.drawQuantumComputing()
    }
    
    // Show stock market if investment engine active OR dev mode
    if (DEV_MODE || (typeof stocks !== 'undefined' && stocks.length > 0)) {
      this.drawStockMarket()
    }

    // Show drone operations in phase 2 (harvester/wire drones active) OR dev mode
    if (
      DEV_MODE ||
      (typeof harvesterFlag !== 'undefined' && harvesterFlag === 1) ||
      (typeof wireDroneFlag !== 'undefined' && wireDroneFlag === 1)
    ) {
      this.drawDroneOperations()
      this.drawDroneGlobe()
    }
    
    // Show strategic modeling if yomi exists OR dev mode
    if (DEV_MODE || (typeof yomi !== 'undefined' && yomi > 0)) {
      if (!this.strategicModelingScreen) {
        this.strategicModelingScreen = new StrategicModelingScreen({
          container: '#hal-dashboard',
          colors: this.colors
        })
      }
      this.strategicModelingScreen.draw({
        yomi: typeof yomi !== 'undefined' ? yomi : 0,
        strats: typeof strats !== 'undefined' ? strats : [],
        rounds: typeof rounds !== 'undefined' ? rounds : 0,
        currentRound: typeof currentRound !== 'undefined' ? currentRound : 0
      })
    }
    
    // Always show phase indicator (only updates when phase changes)
    this.drawPhaseIndicator()
    
    // Show hypnodrones screen if released
    this.drawHypnoDrones()
    
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
      .text('TOTAL CLIPS')
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
    if (!this.computationalTelemetryScreen) {
      this.computationalTelemetryScreen = new ComputationalTelemetryScreen({
        container: '#hal-dashboard',
        colors: this.colors
      })
      HalScreenManager.getInstance().register(this.computationalTelemetryScreen)
    }
    
    this.computationalTelemetryScreen.update({
      trust,
      processors,
      memory,
      opsHistory: this.opsHistory,
      creatHistory: this.creatHistory
    })
  }
  
  drawRevenueChart() {
    if (!this.marketDynamicsScreen) {
      this.marketDynamicsScreen = new MarketDynamicsScreen({
        container: '#hal-dashboard',
        colors: this.colors
      })
    }
    
    this.marketDynamicsScreen.update({
      revenueHistory: this.revenueHistory,
      priceHistory: this.priceHistory,
      demandHistory: this.demandHistory,
      avgRev
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
        .attr('id', 'hal-market-penetration')
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
    if (!this.numericMatrixScreen) {
      this.numericMatrixScreen = new NumericMatrixScreen({
        container: '#hal-dashboard',
        colors: this.colors
      })
    }
    
    this.numericMatrixScreen.draw()
  }
  
  drawPhaseIndicator() {
    if (!this.phaseIndicatorScreen) {
      this.phaseIndicatorScreen = new PhaseIndicatorScreen({
        container: '#hal-dashboard',
        colors: this.colors
      })
    }
    
    let phaseText = 'BIZ'
    if (typeof trust !== 'undefined' && trust > 0) {
      phaseText = 'MFG'
    }
    
    // Only update if phase changed
    if (this.lastPhase !== phaseText) {
      this.lastPhase = phaseText
    this.phaseIndicatorScreen.draw(phaseText)
    }
  }
  
  drawQuantumComputing() {
    if (!this.quantumComputingScreen) {
      this.quantumComputingScreen = new QuantumComputingScreen({
        container: '#hal-dashboard',
        colors: this.colors
      })
    }
    
    this.quantumComputingScreen.draw()
  }
  
  drawStockMarket() {
    if (!this.stockMarketScreen) {
      this.stockMarketScreen = new StockMarketScreen({
        container: '#hal-dashboard',
        colors: this.colors
      })
      console.log('[HAL-VIZ] Stock market screen created')
    }
    
    const stocksData = typeof stocks !== 'undefined' ? stocks : []
    const bankrollData = typeof bankroll !== 'undefined' ? bankroll : 0
    const portTotalData = typeof portTotal !== 'undefined' ? portTotal : 0
    
    if (DEV_MODE && stocksData.length === 0) {
      console.log('[HAL-VIZ] Stock market: No stocks yet (showing empty state)')
    }
    
    this.stockMarketScreen.update({
      stocks: stocksData,
      bankroll: bankrollData,
      portTotal: portTotalData
    })
  }
  
  drawDroneOperations() {
    if (!this.droneOperationsScreen) {
      this.droneOperationsScreen = new DroneOperationsScreen({
        container: '#hal-dashboard',
        colors: this.colors
      })
      console.log('[HAL-VIZ] Drone operations screen created')
    }

    const data = {
      harvesterLevel: typeof harvesterLevel !== 'undefined' ? harvesterLevel : 0,
      wireDroneLevel: typeof wireDroneLevel !== 'undefined' ? wireDroneLevel : 0,
      harvesterCost: typeof harvesterCost !== 'undefined' ? harvesterCost : 0,
      wireDroneCost: typeof wireDroneCost !== 'undefined' ? wireDroneCost : 0,
      availableMatter: typeof availableMatter !== 'undefined' ? availableMatter : 0,
      unusedClips: typeof unusedClips !== 'undefined' ? unusedClips : 0,
      droneRatio: typeof droneRatio !== 'undefined' ? droneRatio : 0,
      factoryCount: Math.max(1, Math.floor((harvesterLevel || 0 + wireDroneLevel || 0) / 2) || 1)
    }

    this.droneOperationsScreen.update(data)
  }

  drawDroneGlobe() {
    if (!this.droneGlobeScreen) {
      this.droneGlobeScreen = new DroneGlobeScreen({
        container: '#hal-dashboard',
        colors: this.colors
      })
      console.log('[HAL-VIZ] Drone globe screen created')
    }

    const data = {
      harvesterLevel: typeof harvesterLevel !== 'undefined' ? harvesterLevel : 0,
      wireDroneLevel: typeof wireDroneLevel !== 'undefined' ? wireDroneLevel : 0,
      factoryCount: Math.max(1, Math.floor((harvesterLevel || 0 + wireDroneLevel || 0) / 2) || 1)
    }

    this.droneGlobeScreen.update(data)
  }

  drawHypnoDrones() {
    if (!this.hypnoDronesScreen) {
      this.hypnoDronesScreen = new HypnoDronesScreen({
        container: '#hal-dashboard',
        colors: this.colors
      })
      console.log('[HAL-VIZ] HypnoDrones screen created')
    }
    
    this.hypnoDronesScreen.draw()
  }
}

new HalViz()

// Show initial report card after a delay to let screens initialize
setTimeout(() => {
  window.halScreens.reportCard()
  console.log('[HAL-VIZ] Type window.halScreens.reportCard() to see screen status anytime')
}, 2000)
