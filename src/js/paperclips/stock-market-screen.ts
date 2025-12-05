import { d3 } from '../chart'
import { HalScreen, HalColors } from './hal-screen-base'
import './hal-screen-types'

type StockDatum = {
  id: number
  symbol: string
  price: number
  profit: number
  amount?: number
}

type StockUpdatePayload = {
  stocks: StockDatum[]
  bankroll: number
  portTotal: number
}

type Candle = {
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export class StockMarketScreen extends HalScreen {
  private candleData: Map<number, Candle[]> = new Map()
  private currentCandle: Map<number, Candle> = new Map()
  private profitHistory: number[] = []
  private tickCount = 0
  private readonly CANDLE_SIZE = 20
  private readonly MAX_CANDLES = 30
  private readonly MAX_PROFIT_HISTORY = 100
  
  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-stock-market',
      container: opts.container,
      width: 800,
      height: 600,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.darkNavy)
  }

  update(data: StockUpdatePayload): void {
    this.tickCount++
    const shouldCloseCandle = this.tickCount % this.CANDLE_SIZE === 0
    
    // Track total profit history
    const totalProfit = data.stocks.reduce((sum, s) => sum + s.profit, 0)
    this.profitHistory.push(totalProfit)
    if (this.profitHistory.length > this.MAX_PROFIT_HISTORY) {
      this.profitHistory.shift()
    }
    
    data.stocks.forEach(stock => {
      if (!this.candleData.has(stock.id)) {
        this.candleData.set(stock.id, [])
      }
      if (!this.currentCandle.has(stock.id)) {
        this.currentCandle.set(stock.id, {
          open: stock.price,
          high: stock.price,
          low: stock.price,
          close: stock.price,
          volume: 0
        })
      }
      
      const candle = this.currentCandle.get(stock.id)!
      candle.high = Math.max(candle.high, stock.price)
      candle.low = Math.min(candle.low, stock.price)
      candle.close = stock.price
      candle.volume += Math.floor(stock.price * 0.1 + Math.random() * stock.amount * 0.01)
      
      if (shouldCloseCandle) {
        const candles = this.candleData.get(stock.id)!
        candles.push({ ...candle })
        if (candles.length > this.MAX_CANDLES) {
          candles.shift()
        }
        
        this.currentCandle.set(stock.id, {
          open: stock.price,
          high: stock.price,
          low: stock.price,
          close: stock.price,
          volume: 0
        })
      }
    })
    
    const activeIds = new Set(data.stocks.map(s => s.id))
    for (const id of this.candleData.keys()) {
      if (!activeIds.has(id)) {
        this.candleData.delete(id)
        this.currentCandle.delete(id)
      }
    }
    
    this.draw(data)
  }

  draw(data: StockUpdatePayload): void {
    this.svg.selectAll('*').remove()
    
    // Title
    this.svg.append('text')
      .attr('x', 20).attr('y', 30)
      .attr('fill', this.colors.white)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18).attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('INVESTMENT ENGINE')
    
    // Portfolio stats
    this.svg.append('text')
      .attr('x', 400).attr('y', 30)
      .attr('fill', this.colors.white)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 11)
      .text(`CASH: $${data.bankroll.toLocaleString()}  |  PORTFOLIO: $${data.portTotal.toLocaleString()}`)
    
    // 3x2 grid layout
    const cellWidth = 250
    const cellHeight = 270
    const startX = 20
    const startY = 60
    const gapX = 10
    const gapY = 10
    
    // Cell 0: Profit/Loss Summary (top-left)
    this.drawProfitSummary(startX, startY, cellWidth, cellHeight, data)
    
    // Cells 1-5: Stock candlestick charts
    data.stocks.slice(0, 5).forEach((stock, i) => {
      const col = (i + 1) % 3
      const row = Math.floor((i + 1) / 3)
      const x = startX + col * (cellWidth + gapX)
      const y = startY + row * (cellHeight + gapY)
      
      this.drawStockCell(x, y, cellWidth, cellHeight, stock)
    })
    
    if (data.stocks.length === 0) {
      this.svg.append('text')
        .attr('x', 400).attr('y', 300)
        .attr('fill', this.colors.white)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 14).attr('opacity', 0.5)
        .attr('text-anchor', 'middle')
        .text('NO ACTIVE POSITIONS')
    }
  }

  private drawProfitSummary(x: number, y: number, width: number, height: number, data: StockUpdatePayload): void {
    const totalProfit = data.stocks.reduce((sum: number, s: StockDatum) => sum + s.profit, 0)
    const profitColor = totalProfit >= 0 ? this.colors.green : this.colors.red
    
    // Header
    this.svg.append('text')
      .attr('x', x + 10).attr('y', y + 20)
      .attr('fill', this.colors.white)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 12).attr('font-weight', 'bold')
      .text('TOTAL P/L')
    
    // Profit value
    const profitSign = totalProfit >= 0 ? '+' : ''
    this.svg.append('text')
      .attr('x', x + 10).attr('y', y + 45)
      .attr('fill', profitColor)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 20).attr('font-weight', 'bold')
      .text(`${profitSign}$${totalProfit.toFixed(0)}`)
    
    // Profit history line chart
    if (this.profitHistory.length > 1) {
      const chartY = y + 60
      const chartHeight = height - 70
      const chartWidth = width - 20
      
      const xScale = d3.scaleLinear()
        .domain([0, this.profitHistory.length - 1])
        .range([x + 10, x + 10 + chartWidth])
      
      const minProfit = Math.min(...this.profitHistory, 0)
      const maxProfit = Math.max(...this.profitHistory, 0)
      const range = Math.max(Math.abs(minProfit), Math.abs(maxProfit), 1)
      
      const yScale = d3.scaleLinear()
        .domain([-range, range])
        .range([chartY + chartHeight, chartY])
      
      // Zero line
      this.svg.append('line')
        .attr('x1', x + 10).attr('x2', x + 10 + chartWidth)
        .attr('y1', yScale(0)).attr('y2', yScale(0))
        .attr('stroke', this.colors.white)
        .attr('stroke-width', 1).attr('opacity', 0.3)
      
      // Profit line
      const line = d3.line<number>()
        .x((d, i) => xScale(i))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX)
      
      this.svg.append('path')
        .datum(this.profitHistory)
        .attr('fill', 'none')
        .attr('stroke', profitColor)
        .attr('stroke-width', 2)
        .attr('d', line)
    }
  }

  private drawStockCell(x: number, y: number, width: number, height: number, stock: StockDatum): void {
    const profitColor = stock.profit >= 0 ? this.colors.green : this.colors.red
    
    // Header
    this.svg.append('text')
      .attr('x', x + 10).attr('y', y + 20)
      .attr('fill', this.colors.white)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 12).attr('font-weight', 'bold')
      .text(stock.symbol)
    
    this.svg.append('text')
      .attr('x', x + 60).attr('y', y + 20)
      .attr('fill', this.colors.white)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 11)
      .text(`$${stock.price.toFixed(2)}`)
    
    // Profit/loss
    const profitSign = stock.profit >= 0 ? '+' : ''
    this.svg.append('text')
      .attr('x', x + 140).attr('y', y + 20)
      .attr('fill', profitColor)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 10)
      .text(`${profitSign}$${stock.profit.toFixed(0)}`)
    
    // Candlestick chart
    const candles = this.candleData.get(stock.id) || []
    if (candles.length > 0) {
      const chartY = y + 30
      const chartHeight = height - 40
      const chartWidth = width - 20
      
      const allPrices = candles.flatMap(c => [c.high, c.low])
      const minPrice = Math.min(...allPrices)
      const maxPrice = Math.max(...allPrices)
      const priceRange = maxPrice - minPrice || 1
      
      const xScale = d3.scaleLinear()
        .domain([0, candles.length])
        .range([x + 10, x + 10 + chartWidth])
      
      const yScale = d3.scaleLinear()
        .domain([minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1])
        .range([chartY + chartHeight, chartY])
      
      const candleWidth = chartWidth / candles.length * 0.7
      
      candles.forEach((candle, idx) => {
        const cx = xScale(idx + 0.5)
        const isGreen = candle.close >= candle.open
        const color = isGreen ? this.colors.green : this.colors.red
        
        // Wick
        this.svg.append('line')
          .attr('x1', cx).attr('x2', cx)
          .attr('y1', yScale(candle.high))
          .attr('y2', yScale(candle.low))
          .attr('stroke', color)
          .attr('stroke-width', 1)
        
        // Body
        const bodyTop = Math.min(yScale(candle.open), yScale(candle.close))
        const bodyHeight = Math.abs(yScale(candle.open) - yScale(candle.close)) || 1
        
        this.svg.append('rect')
          .attr('x', cx - candleWidth / 2)
          .attr('y', bodyTop)
          .attr('width', candleWidth)
          .attr('height', bodyHeight)
          .attr('fill', isGreen ? color : 'none')
          .attr('stroke', color)
          .attr('stroke-width', 1)
      })
    }
  }
}

